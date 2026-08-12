import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Platform,
  Modal,
  Alert,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@draftbit/ui';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DropDownBlock } from '../custom-files/DropDownBlock';
import * as SunoApi from '../apis/SunoApi.js';
import useNavigation from '../utils/useNavigation';
import useWindowDimensions from '../utils/useWindowDimensions';
import * as GlobalVariables from '../config/GlobalVariableContext';
import palettes from '../themes/palettes';
import fetchProviders from '../global-functions/fetchProviders.js';
import DropDownPicker from 'react-native-dropdown-picker';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { renderParam, renderQueryString } from '../utils/encodeQueryParam';
import { logError } from '../index.js';
import * as DocumentPicker from 'expo-document-picker';
import { checkInternetAndProceed } from './InternetConnection.js';
import { isOkStatus } from '../utils/handleRestApiResponse.js';

const PRIORITY_OPTIONS = ['NOT SET', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const QUICK_DUE_DAYS = [1, 2, 3, 5, 7, 14, 30];
const DROPDOWN_LIST_MODE = Platform.OS === 'android' ? 'MODAL' : 'SCROLLVIEW';

const isPdfAsset = asset => {
  const name = (asset?.name || '').toLowerCase();
  const mime = (asset?.mimeType || '').toLowerCase();
  return mime === 'application/pdf' || name.endsWith('.pdf');
};

const formatFileSize = bytes => {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getPersonLabel = person =>
  person?.full_name ||
  [person?.first_name, person?.last_name].filter(Boolean).join(' ') ||
  'Unknown';

const buildAssigneeOption = user => {
  if (!user?.id) return null;
  return { label: getPersonLabel(user), value: String(user.id) };
};

const buildPatientOption = patient => {
  if (!patient?.id) return null;
  return { label: getPersonLabel(patient), value: String(patient.id) };
};

const mergeAssigneeOptions = (options, users = []) => {
  const merged = [...options];
  users.forEach(user => {
    const option = buildAssigneeOption(user);
    if (option && !merged.some(item => item.value === option.value)) {
      merged.push(option);
    }
  });
  return merged;
};

const mergePatientOptions = (options, patients = []) => {
  const merged = [...options];
  patients.forEach(patient => {
    const option = buildPatientOption(patient);
    if (option && !merged.some(item => item.value === option.value)) {
      merged.unshift(option);
    }
  });
  return merged;
};

const getPriorityLabel = (taskPriority, taskStatusList) => {
  const priorityValue =
    taskPriority === 0 || taskPriority == null ? '5' : String(taskPriority);
  const found = taskStatusList.find(s => s.value === priorityValue);
  return found ? found.label.toUpperCase() : 'NOT SET';
};

const getDefaultPatientSource = (props, taskData) => {
  if (props?.isEdit && taskData?.patient?.id) {
    return taskData.patient;
  }
  if (props?.patientId) {
    return {
      id: props.patientId,
      full_name: props.patientName,
      first_name: props.patientFirstName,
      last_name: props.patientLastName,
    };
  }
  return null;
};

const normalizeTaskId = value => {
  if (value == null || value === '') return null;
  const id = Number(value);
  return Number.isNaN(id) ? null : id;
};

const formatDueDateForApi = date => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return null;
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}T00:00:00`;
};

const getApiErrorMessage = (response, fallback) => {
  const json = response?.json;
  if (!json) {
    return fallback;
  }
  if (typeof json === 'string') {
    return json;
  }
  if (json.detail) {
    return String(json.detail);
  }
  if (json.error) {
    return String(json.error);
  }
  const firstFieldError = Object.values(json)
    .flatMap(value => (Array.isArray(value) ? value : [value]))
    .find(Boolean);
  return firstFieldError ? String(firstFieldError) : fallback;
};

const SectionCard = ({ title, subtitle, children, style }) => (
  <View style={[styles.sectionCard, style]}>
    {title ? (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
    ) : null}
    {children}
  </View>
);

const FieldLabel = ({ label, required }) => (
  <Text style={styles.fieldLabel}>
    {label}
    {required ? <Text style={styles.requiredMark}> *</Text> : null}
  </Text>
);

const PriorityChip = ({ label, selected, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.85}
    style={[styles.priorityChip, selected && styles.priorityChipSelected]}
  >
    <Text style={[styles.priorityChipText, selected && styles.priorityChipTextSelected]}>
      {label}
    </Text>
  </TouchableOpacity>
);

export const CustomTaskScreen = ({ theme, props }) => {
  const dimensions = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const Constants = GlobalVariables.useValues();
  const navigation = useNavigation();
  const dropdownWidth = dimensions.width - 72;
  const taskData = props?.taskData;
  const defaultPatientSource = getDefaultPatientSource(props, taskData);
  const defaultPatientOption = buildPatientOption(defaultPatientSource);

  const [loading, setLoading] = useState(false);
  const [priority, setPriority] = useState(() =>
    props?.isEdit ? getPriorityLabel(taskData?.priority, Constants.taskStatus) : 'NOT SET'
  );
  const [isEdit, setIsEdit] = useState(Boolean(props?.isEdit));
  const [titleName, setTitleName] = useState(() =>
    props?.isEdit ? taskData?.title ?? '' : ''
  );
  const [dueDate, setDuedate] = useState(() => {
    if (props?.isEdit && taskData?.due_at) {
      return new Date(taskData.due_at);
    }
    return null;
  });
  const [selectedDueDate, setSelectedDuedate] = useState(() => {
    if (props?.isEdit && taskData?.due_at) {
      return new Date(taskData.due_at);
    }
    return new Date();
  });
  const [showPicker, setShowPicker] = useState(false);
  const [assigneeType, setAssigneeType] = useState(() => {
    if (props?.isEdit && taskData?.assignee?.id) {
      return String(taskData.assignee.id);
    }
    if (Constants['UserInfo']?.id) {
      return String(Constants['UserInfo'].id);
    }
    return '';
  });
  const [assigneeData, setAssigneeData] = useState(() => {
    if (!props?.isEdit) return [];
    const users = [
      taskData?.assignee,
      ...(taskData?.assignees ?? []).map(item => item?.user),
    ].filter(Boolean);
    return mergeAssigneeOptions([], users);
  });
  const [searchText, setSearchText] = useState(() => {
    if (defaultPatientSource) {
      return getPersonLabel(defaultPatientSource);
    }
    return '';
  });
  const [searchLoading, setSearchLoading] = useState(false);
  const [additionalAssigneeData, setAdditionalAssigneeData] = useState(() => {
    if (!props?.isEdit) return [];
    return (taskData?.assignees ?? [])
      .map(item => String(item?.user?.id))
      .filter(Boolean);
  });
  const [patientType, setPatientType] = useState(() =>
    defaultPatientOption ? defaultPatientOption.value : null
  );
  const [patientData, setPatientData] = useState(() =>
    defaultPatientOption ? [defaultPatientOption] : []
  );
  const [description, setDescription] = useState(() =>
    props?.isEdit ? taskData?.description ?? '' : ''
  );
  const [open, setOpen] = useState(false);
  const [openPatient, setPatientOpen] = useState(false);
  const [openAssignee, setAssigneeOpen] = useState(false);
  const [existingAttachments, setExistingAttachments] = useState(() =>
    props?.isEdit ? taskData?.attachments ?? [] : []
  );
  const [pendingAttachments, setPendingAttachments] = useState([]);
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState([]);
  const [pickingAttachment, setPickingAttachment] = useState(false);

  const descriptionRef = useRef(null);
  const assigneeDropdownRef = useRef(null);
  const abortControllerRef = React.useRef(null);
  const defaultPatientRef = useRef(defaultPatientOption);
  const patientTypeRef = useRef(defaultPatientOption?.value ?? null);
  const skipNextPatientSearchRef = useRef(Boolean(defaultPatientOption));

  const sunoNewStaffTasksPOST = SunoApi.useNewStaffTasksPOST();
  const sunoEditStaffTasksPOST = SunoApi.useEditStaffTasksPATCH();

  useEffect(() => {
    patientTypeRef.current = patientType;
  }, [patientType]);

  useEffect(() => {
    if (!props?.isEdit || !taskData) {
      return;
    }

    setIsEdit(true);
    setTitleName(taskData?.title ?? '');
    setDescription(taskData?.description ?? '');

    if (taskData?.due_at) {
      const parsedDueDate = new Date(taskData.due_at);
      setDuedate(parsedDueDate);
      setSelectedDuedate(parsedDueDate);
    }

    setPriority(getPriorityLabel(taskData?.priority, Constants.taskStatus));

    if (taskData?.assignee?.id) {
      setAssigneeType(String(taskData.assignee.id));
    }

    const assigneeIds = (taskData?.assignees ?? [])
      .map(item => String(item?.user?.id))
      .filter(Boolean);
    setAdditionalAssigneeData(assigneeIds);

    const patient = taskData?.patient;
    if (patient?.id) {
      const patientOption = buildPatientOption(patient);
      console.log("==== patientOption", patientOption);
      defaultPatientRef.current = patientOption;
      patientTypeRef.current = patientOption?.value ?? null;
      setPatientType(patientOption?.value ?? null);
      if (patientOption) {
        setPatientData([patientOption]);
      }
      setSearchText(getPersonLabel(patient));
      skipNextPatientSearchRef.current = true;
    }

    setExistingAttachments(taskData?.attachments ?? []);
  }, [props?.isEdit, taskData?.id]);

  useEffect(() => {
    if (!props?.patientId || props?.isEdit) {
      return;
    }

    const patientSource = {
      id: props.patientId,
      full_name: props.patientName,
    };
    const patientOption = buildPatientOption(patientSource);
    if (!patientOption) {
      return;
    }

    defaultPatientRef.current = patientOption;
    patientTypeRef.current = patientOption.value;
    setPatientType(patientOption.value);
    setPatientData([patientOption]);
    if (props.patientName) {
      setSearchText(props.patientName);
    }
    skipNextPatientSearchRef.current = true;
  }, [props?.patientId, props?.patientName, props?.isEdit]);

  useEffect(() => {
    if (skipNextPatientSearchRef.current) {
      skipNextPatientSearchRef.current = false;
      return;
    }

    const delayDebounce = setTimeout(() => {
      if (searchText.length > 0) {
        fetchSearchData();
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchText]);

  const fetchSearchData = async () => {
    try {
      const isConnected = await checkInternetAndProceed();
      if (!isConnected) {
        return;
      }
      setSearchLoading(true);

      const paramsDict = {
        offset: '0',
        is_active: true,
        limit: 30,
        query: '{id,first_name,last_name,full_name,birthdate,age_years,phone,}',
        search: renderParam(searchText),
      };

      const url = `${Constants.API_BASE_URL}/patients/${renderQueryString(paramsDict)}`;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: Constants.AUTH_HEADER,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      if (!res.ok) {
        logError('API Error :', res);
        throw new Error('Network error');
      }

      const json = await res.json();
      const mapped = json.results.map(item => ({
        label: item.full_name,
        value: String(item.id),
      }));

      const selectedId = patientTypeRef.current;
      const optionsToKeep = [defaultPatientRef.current].filter(Boolean);
      if (
        selectedId &&
        !optionsToKeep.some(option => option.value === String(selectedId))
      ) {
        optionsToKeep.unshift({
          label: `Patient #${selectedId}`,
          value: String(selectedId),
        });
      }

      let merged = [...mapped];
      optionsToKeep.forEach(option => {
        if (!merged.some(item => item.value === option.value)) {
          merged.unshift(option);
        }
      });

      setPatientData(merged);
      setSearchLoading(false);
    } catch (error) {
      setSearchLoading(false);
      logError('Search API Error:', error);
    }
  };

  useEffect(() => {
    const handler = async () => {
      try {
        const allProviderData = (
          await SunoApi.getProvidersGET(Constants, {
            is_active: true,
            limit: 300,
            query:
              '{id,touchpoint_notifications_enabled,scheduler_select_all_staff,scheduler_persist_per_clinic,last_name,non_npi_id_qualifier,npi,role,patient_arrived_sound_enabled,user_preferences,first_name,task_is_assigned_notifications_enabled,signature,photo,title,suffix,license_number,user_reminder_notifications_enabled,suno_comms_id,date_joined,payment_request_notifications_enabled,is_active,fax_phone,full_name,last_login,user_permissions,non_npi_id,onboarding_form_notifications_enabled,name,color,noah_username,groups{id,name,permissions},email,clinics{id,name,timezone,noah_provider,noah_alias,noah_tenant_id},default_clinic{id,name,timezone},can_see_manufacturer_cost}',
          })
        )?.json;
        const providersData = fetchProviders(allProviderData);
        const taskUsers = props?.isEdit
          ? [
              props?.taskData?.assignee,
              ...(props?.taskData?.assignees ?? []).map(item => item?.user),
            ].filter(Boolean)
          : [];
        setAssigneeData(mergeAssigneeOptions(providersData, taskUsers));

        if (props?.isEdit) {
          if (props?.taskData?.assignee?.id) {
            setAssigneeType(String(props.taskData.assignee.id));
          }

          const assigneeIds = (props?.taskData?.assignees ?? [])
            .map(item => String(item?.user?.id))
            .filter(Boolean);
          setAdditionalAssigneeData(assigneeIds);
        } else if (Constants['UserInfo']?.id) {
          setAssigneeType(String(Constants['UserInfo'].id));
        }
      } catch (err) {
        logError(err);
      }
    };
    handler();
  }, []);

  const onPressSavePatient = async () => {
    try {
      if (!titleName.trim()) {
        Alert.alert('', 'Please enter title');
        return;
      }

      const assigneeId = normalizeTaskId(assigneeType);
      if (!assigneeId) {
        Alert.alert('', 'Please select assignee');
        return;
      }

      const isConnected = await checkInternetAndProceed();
      if (!isConnected) {
        return;
      }

      setLoading(true);

      const found = Constants.taskStatus.find(
        s => s.label.toLowerCase() === String(priority).toLowerCase()
      );
      const priorityType = found ? found.value : 0;
      const assignees = additionalAssigneeData
        .map(id => normalizeTaskId(id))
        .filter(id => id != null && id !== assigneeId)
        .map(user => ({ user }));

      const param = {
        title: titleName.trim(),
        description: description.trim(),
        due_at: formatDueDateForApi(dueDate),
        priority: Number(priorityType) === 5 ? 0 : Number(priorityType),
        assignee: assigneeId,
        assignees,
        patient: normalizeTaskId(patientType),
      };

      let taskId;
      let response;

      if (isEdit) {
        param.task_id = props?.taskData?.id;
        if (props?.taskData?.status != null && props?.taskData?.status !== '') {
          param.status = Number(props.taskData.status);
        }
        response = await sunoEditStaffTasksPOST.mutateAsync(param);
        taskId = props?.taskData?.id;
      } else {
        response = await sunoNewStaffTasksPOST.mutateAsync(param);
        taskId = response?.json?.id;
      }

      if (!isOkStatus(response?.status)) {
        throw new Error(
          getApiErrorMessage(response, 'Unable to save task. Please try again.')
        );
      }

      try {
        await syncAttachments(taskId);
      } catch (attachmentError) {
        logError('Attachment sync error:', attachmentError);
        setLoading(false);
        Alert.alert(
          'Task saved',
          'The task was saved, but one or more attachments could not be updated.',
          [{ text: 'OK', onPress: () => navigation.goBack() }],
          { cancelable: false }
        );
        return;
      }

      setLoading(false);
      Alert.alert(
        'Success',
        isEdit ? 'Task Updated Successfully!' : 'Task Saved Successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
        { cancelable: false }
      );
    } catch (error) {
      setLoading(false);
      logError('Save task error:', error);
      Alert.alert(
        'Error',
        error?.message || 'Unable to save task. Please try again.'
      );
    }
  };

  const syncAttachments = async taskId => {
    if (!taskId) return;

    for (const attachmentId of removedAttachmentIds) {
      const response = await SunoApi.deleteTaskAttachmentDELETE(Constants, {
        task_id: taskId,
        attachment_id: attachmentId,
      });
      if (!isOkStatus(response?.status)) {
        throw new Error('Failed to remove attachment');
      }
    }

    for (const attachment of pendingAttachments) {
      const response = await SunoApi.uploadTaskAttachmentPOST(Constants, {
        task_id: taskId,
        uri: attachment.uri,
        name: attachment.name,
      });
      if (!isOkStatus(response?.status)) {
        throw new Error('Failed to upload attachment');
      }
    }
  };

  const pickPdfAttachments = async () => {
    try {
      const isConnected = await checkInternetAndProceed();
      if (!isConnected) {
        return;
      }

      setPickingAttachment(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (result.canceled) {
        return;
      }

      const pdfAssets = result.assets.filter(isPdfAsset);
      if (!pdfAssets.length) {
        Alert.alert('Invalid file', 'Only PDF files can be attached.');
        return;
      }

      if (pdfAssets.length !== result.assets.length) {
        Alert.alert('Some files skipped', 'Only PDF files were added.');
      }

      setPendingAttachments(prev => [
        ...prev,
        ...pdfAssets.map(asset => ({
          id: `${Date.now()}-${asset.name}`,
          uri: asset.uri,
          name: asset.name || 'attachment.pdf',
          size: asset.size,
        })),
      ]);
    } catch (error) {
      logError('Pick PDF attachment error:', error);
      Alert.alert('Error', 'Unable to pick PDF file.');
    } finally {
      setPickingAttachment(false);
    }
  };

  const removePendingAttachment = attachmentId => {
    setPendingAttachments(prev => prev.filter(item => item.id !== attachmentId));
  };

  const removeExistingAttachment = attachment => {
    Alert.alert(
      'Remove attachment',
      `Remove ${attachment?.original_filename || 'this file'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setExistingAttachments(prev =>
              prev.filter(item => item.id !== attachment.id)
            );
            setRemovedAttachmentIds(prev => [...prev, attachment.id]);
          },
        },
      ]
    );
  };

  const CustomBadge = ({ label, value, onPress, badgeStyle, badgeTextStyle }) => (
    <TouchableOpacity
      onPress={() => onPress(value)}
      style={[styles.assigneeBadge, badgeStyle]}
    >
      <Text style={[styles.assigneeBadgeText, badgeTextStyle]}>{label}</Text>
      <TouchableOpacity onPress={() => onPress(value)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <AntDesign name="closecircle" color="#090a0a42" size={18} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const setDateByDays = days => {
    const base = dueDate ? new Date(dueDate) : new Date();
    base.setDate(base.getDate() + days);
    setDuedate(base);
    setSelectedDuedate(base);
  };

  const formatDueDate = date => {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const closeDropdowns = () => {
    setOpen(false);
    setPatientOpen(false);
    assigneeDropdownRef.current?.close();
  };

  const closeOtherDropdowns = except => {
    if (except !== 'additional') setOpen(false);
    if (except !== 'patient') setPatientOpen(false);
    if (except !== 'assignee') assigneeDropdownRef.current?.close();
  };
  console.log("==== patientType", patientType, patientData);

  return (
    <View style={styles.container}>
      <Modal transparent visible={loading} animationType="fade">
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#066858" />
        </View>
      </Modal>

      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: insets.bottom + 100,
        }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        enableAutomaticScroll={Platform.OS === 'ios'}
        extraScrollHeight={80}
        nestedScrollEnabled={Platform.OS === 'android'}
        onScrollBeginDrag={closeDropdowns}
      >
        <SectionCard title="Priority" subtitle="How urgent is this task?">
          <View style={styles.priorityRow}>
            {PRIORITY_OPTIONS.map(option => (
              <PriorityChip
                key={option}
                label={option}
                selected={priority === option}
                onPress={() => setPriority(option)}
              />
            ))}
          </View>
        </SectionCard>

        <SectionCard title="Task Details">
          <FieldLabel label="Title" required />
          <TextInput
            value={titleName}
            onChangeText={setTitleName}
            placeholder="Enter task title"
            placeholderTextColor={palettes.App.TextPlaceholder}
            style={styles.textInput}
            returnKeyType="next"
            onSubmitEditing={() => descriptionRef.current?.focus()}
          />

          <FieldLabel label="Description" />
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Add task details"
            placeholderTextColor={palettes.App.TextPlaceholder}
            style={[styles.textInput, styles.textArea]}
            ref={descriptionRef}
            multiline
            textAlignVertical="top"
          />
        </SectionCard>

        <SectionCard title="Assignment" style={{ zIndex: 1000 }}>
          <FieldLabel label="Assignee" required />
          <View style={{ zIndex: 1000 }}>
            {/* <DropDownBlock
            ref={assigneeDropdownRef}
            dropdownData={assigneeData}
            value={assigneeType}
            setValue={setAssigneeType}
            placeholderText="Select assignee"
            // listMode="MODAL"
            modalTitle="Select assignee"
            onOpen={() => closeOtherDropdowns('assignee')}
          /> */}

            <DropDownPicker
              open={openAssignee}
              value={assigneeType}
              items={assigneeData}
              setOpen={setAssigneeOpen}
              setValue={value => {
                const nextValue = typeof value === 'function' ? value(assigneeType) : value;
                setAssigneeType(
                  nextValue == null || nextValue === '' ? '' : String(nextValue)
                );
              }}
              setItems={setAssigneeData}
              placeholder="Select assignee"
              zIndex={1000}
              zIndexInverse={6000}
              listMode={DROPDOWN_LIST_MODE}
              dropDownContainerStyle={styles.dropdownContainer}
              style={styles.dropdown}
              modalTitle="Select assignee"
              onOpen={() => closeOtherDropdowns('assignee')}
              dropDownDirection="BOTTOM"
              ListEmptyComponent={() => (
                <View style={{ padding: 15, alignItems: 'center' }}>
                  <Text style={{ color: '#6B7280' }}>No options</Text>
                </View>
              )}
            />

          </View>
          <View style={{ marginTop: 16, zIndex: 800 }}>
            <FieldLabel label="Additional Assignees" />
            <DropDownPicker
              multiple
              mode="BADGE"
              open={open}
              value={additionalAssigneeData}
              items={assigneeData}
              setOpen={setOpen}
              setValue={value => {
                setAdditionalAssigneeData(prev => {
                  const nextValue =
                    typeof value === 'function' ? value(prev) : value;
                  return Array.isArray(nextValue)
                    ? nextValue.map(id => String(id))
                    : [];
                });
              }}
              setItems={setAssigneeData}
              placeholder="Select additional assignees"
              listMode={DROPDOWN_LIST_MODE}
              dropDownContainerStyle={[styles.dropdownContainer, { width: dropdownWidth }]}
              style={[styles.dropdown, { width: dropdownWidth }]}
              modalTitle="Additional assignees"
              onOpen={() => closeOtherDropdowns('additional')}
              dropDownDirection="AUTO"
              badgeStyle={styles.dropdownBadge}
              badgeTextStyle={styles.dropdownBadgeText}
              renderBadgeItem={badgeProps => (
                <CustomBadge
                  label={badgeProps.label}
                  value={badgeProps.value}
                  onPress={badgeProps.onPress}
                  badgeStyle={badgeProps.badgeStyle}
                  badgeTextStyle={badgeProps.badgeTextStyle}
                />
              )}
              showBadgeDot={false}
              badgeColors="#c79aeb80"
              badgeDotColors="#090a0a42"
            />
          </View>
        </SectionCard>

        <SectionCard title="Patient" style={{ zIndex: 100 }}>
          <FieldLabel label="Link to patient" />
          <DropDownPicker
            searchable
            searchPlaceholder="Search patients..."
            open={openPatient}
            value={patientType}
            items={patientData}
            setOpen={setPatientOpen}
            setValue={value => {
              const nextValue = typeof value === 'function' ? value(patientType) : value;
              const normalized =
                nextValue == null || nextValue === '' ? null : String(nextValue);
              patientTypeRef.current = normalized;
              setPatientType(normalized);
            }}
            setItems={setPatientData}
            placeholder="Select patient"
            listMode={DROPDOWN_LIST_MODE}
            modalTitle="Select patient"
            onOpen={() => closeOtherDropdowns('patient')}
            dropDownDirection="AUTO"
            dropDownContainerStyle={[styles.dropdownContainer, { width: dropdownWidth, maxHeight: 280 }]}
            style={[styles.dropdown, { width: dropdownWidth }]}
            searchText={searchText}
            onChangeSearchText={text => setSearchText(text)}
            onSelectItem={item => {
              if (item?.value == null) {
                return;
              }
              const option = {
                label: item.label,
                value: String(item.value),
              };
              defaultPatientRef.current = option;
              patientTypeRef.current = option.value;
              setPatientType(option.value);
              setPatientData(current =>
                current.some(entry => entry.value === option.value)
                  ? current
                  : [option, ...current]
              );
            }}
            loading={searchLoading}
            ActivityIndicatorComponent={() => (
              <ActivityIndicator size="small" color="#066858" />
            )}
            activityIndicatorSize={18}
            activityIndicatorColor="#066858"
            searchContainerStyle={styles.dropdownSearchContainer}
            searchTextInputStyle={styles.dropdownSearchInput}
            ListEmptyComponent={() => (
              <View style={styles.dropdownEmpty}>
                {searchLoading ? (
                  <ActivityIndicator size="small" color="#066858" />
                ) : (
                  <Text style={styles.dropdownEmptyText}> {searchText ? 'No patients found' : 'Search for patients'}</Text>
                )}
              </View>
            )}
          />
        </SectionCard>

        <SectionCard title="Due Date" subtitle="When should this task be completed?">
          <TouchableOpacity
            onPress={() => setShowPicker(true)}
            activeOpacity={0.85}
            style={styles.dateField}
          >
            <View style={styles.dateFieldIcon}>
              <Icon name="Feather/calendar" size={18} color={theme.colors.branding.secondary} />
            </View>
            <Text style={[styles.dateFieldText, !dueDate && styles.dateFieldPlaceholder]}>
              {dueDate ? formatDueDate(dueDate) : 'Select due date'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.quickAddLabel}>Quick add</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickAddRow}
          >
            {QUICK_DUE_DAYS.map(d => (
              <TouchableOpacity
                key={d}
                onPress={() => setDateByDays(d)}
                style={styles.quickAddChip}
                activeOpacity={0.85}
              >
                <Text style={styles.quickAddChipText}>+{d}d</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {Platform.OS === 'ios' ? (
            <Modal
              visible={showPicker}
              transparent
              animationType="slide"
              onRequestClose={() => setShowPicker(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHandle} />
                  <Text style={styles.modalTitle}>Select due date</Text>
                  <DateTimePicker
                    value={dueDate || selectedDueDate}
                    mode="date"
                    display="spinner"
                    onChange={(event, selectedDate) => {
                      if (event.type === 'set' && selectedDate) {
                        setDuedate(selectedDate);
                        setSelectedDuedate(selectedDate);
                      }
                    }}
                  />
                  <TouchableOpacity
                    style={styles.modalDoneButton}
                    onPress={() => setShowPicker(false)}
                  >
                    <Text style={styles.modalDoneButtonText}>Done</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          ) : (
            showPicker && (
              <DateTimePicker
                value={dueDate || selectedDueDate}
                mode="date"
                display="calendar"
                onChange={(event, selectedDate) => {
                  setShowPicker(false);
                  if (event.type === 'set' && selectedDate) {
                    setDuedate(selectedDate);
                    setSelectedDuedate(selectedDate);
                  }
                }}
              />
            )
          )}
        </SectionCard>

        <SectionCard title="Attachments" subtitle="Upload PDF files only">
          <TouchableOpacity
            onPress={pickPdfAttachments}
            activeOpacity={0.85}
            disabled={pickingAttachment}
            style={styles.uploadButton}
          >
            {pickingAttachment ? (
              <ActivityIndicator size="small" color="#066858" />
            ) : (
              <Icon
                name="MaterialCommunityIcons/file-upload-outline"
                size={20}
                color="#066858"
              />
            )}
            <Text style={styles.uploadButtonText}>
              {pickingAttachment ? 'Opening files...' : 'Upload PDF'}
            </Text>
          </TouchableOpacity>

          {existingAttachments.length === 0 && pendingAttachments.length === 0 ? (
            <Text style={styles.attachmentEmptyText}>No attachments added yet.</Text>
          ) : null}

          {existingAttachments.map(attachment => (
            <View key={`existing-${attachment.id}`} style={styles.attachmentRow}>
              <View style={styles.attachmentIconWrap}>
                <Icon
                  name="MaterialCommunityIcons/file-pdf-box"
                  size={22}
                  color="#DC2626"
                />
              </View>
              <View style={styles.attachmentInfo}>
                <Text numberOfLines={2} style={styles.attachmentName}>
                  {attachment.original_filename || 'Attachment.pdf'}
                </Text>
                <Text style={styles.attachmentMeta}>Existing file</Text>
              </View>
              <TouchableOpacity
                onPress={() => removeExistingAttachment(attachment)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.attachmentRemoveButton}
              >
                <Icon name="MaterialCommunityIcons/close" size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>
          ))}

          {pendingAttachments.map(attachment => (
            <View key={attachment.id} style={styles.attachmentRow}>
              <View style={styles.attachmentIconWrap}>
                <Icon
                  name="MaterialCommunityIcons/file-pdf-box"
                  size={22}
                  color="#DC2626"
                />
              </View>
              <View style={styles.attachmentInfo}>
                <Text numberOfLines={2} style={styles.attachmentName}>
                  {attachment.name}
                </Text>
                <Text style={styles.attachmentMeta}>
                  {formatFileSize(attachment.size) || 'Ready to upload'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => removePendingAttachment(attachment.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.attachmentRemoveButton}
              >
                <Icon name="MaterialCommunityIcons/close" size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>
          ))}
        </SectionCard>
      </KeyboardAwareScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingBottom: Math.max(insets.bottom, 16),
          },
        ]}
      >
        <TouchableOpacity
          onPress={onPressSavePatient}
          activeOpacity={0.9}
          style={styles.saveButton}
        >
          <Text style={styles.saveButtonText}>{isEdit ? 'Update Task' : 'Save Task'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6F5',
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8EEEC',
    padding: 16,
    marginBottom: 12,
    overflow: 'visible',
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: palettes.App.FilterTextColor,
  },
  sectionSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: palettes.App.TextPlaceholder,
    marginTop: 4,
  },
  fieldLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: palettes.App.TextPlaceholder,
    marginBottom: 8,
    marginTop: 4,
  },
  requiredMark: {
    color: '#DC2626',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: palettes.App.FilterTextColor,
    marginBottom: 12,
  },
  textArea: {
    minHeight: 110,
    paddingTop: 14,
  },
  priorityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priorityChip: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  priorityChipSelected: {
    backgroundColor: '#066858',
    borderColor: '#066858',
  },
  priorityChipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#374151',
  },
  priorityChipTextSelected: {
    color: '#fff',
  },
  dropdown: {
    backgroundColor: '#fff',
    borderColor: '#E5E7EB',
    borderRadius: 12,
    minHeight: 48,
  },
  dropdownContainer: {
    backgroundColor: '#fff',
    borderColor: '#E5E7EB',
    borderRadius: 12,
  },
  dropdownBadge: {
    backgroundColor: '#c79aeb80',
    borderColor: '#c79aeb80',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  dropdownBadgeText: {
    color: '#111827',
    fontWeight: '400',
  },
  dropdownSearchContainer: {
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  dropdownSearchInput: {
    paddingVertical: 10,
    borderColor: '#E5E7EB',
  },
  dropdownEmpty: {
    padding: 16,
    alignItems: 'center',
  },
  dropdownEmptyText: {
    color: '#6B7280',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
  },
  assigneeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F3FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 6,
  },
  assigneeBadgeText: {
    color: '#0369A1',
  },
  dateField: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: '#fff',
  },
  dateFieldIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E8EFED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dateFieldText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: palettes.App.FilterTextColor,
  },
  dateFieldPlaceholder: {
    color: palettes.App.TextPlaceholder,
    fontFamily: 'Inter_400Regular',
  },
  quickAddLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: palettes.App.TextPlaceholder,
    marginTop: 14,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  quickAddRow: {
    gap: 8,
    paddingRight: 8,
  },
  quickAddChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#E8EFED',
    borderWidth: 1,
    borderColor: '#D1E5E1',
  },
  quickAddChipText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#066858',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: palettes.App.FilterTextColor,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalDoneButton: {
    marginTop: 12,
    backgroundColor: '#066858',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalDoneButtonText: {
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E8EEEC',
  },
  saveButton: {
    backgroundColor: '#066858',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#D1E5E1',
    borderRadius: 12,
    backgroundColor: '#E8EFED',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  uploadButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#066858',
  },
  attachmentEmptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: palettes.App.TextPlaceholder,
    textAlign: 'center',
    paddingVertical: 8,
  },
  attachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8EEEC',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    padding: 12,
    marginBottom: 8,
  },
  attachmentIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  attachmentInfo: {
    flex: 1,
    paddingRight: 8,
  },
  attachmentName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: palettes.App.FilterTextColor,
  },
  attachmentMeta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: palettes.App.TextPlaceholder,
    marginTop: 2,
  },
  attachmentRemoveButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
});
