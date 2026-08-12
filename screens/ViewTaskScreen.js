import React, { useMemo } from 'react';
import {
  Icon,
  ScreenContainer,
  Touchable,
  TextInput,
  withTheme,
} from '@draftbit/ui';
import {
  Text,
  View,
  Platform,
  Modal,
  Alert,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Linking,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import DropDownPicker from 'react-native-dropdown-picker';
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';
import * as SunoApi from '../apis/SunoApi.js';
import CustomChildHeaderBlock from '../components/CustomChildHeaderBlock';
import * as GlobalVariables from '../config/GlobalVariableContext';
import getTaskPriority from '../global-functions/getTaskPriority';
import getTaskPriorityColor from '../global-functions/getTaskPriorityColor';
import getTaskStatus from '../global-functions/getTaskStatus';
import getTaskStatusColor from '../global-functions/getTaskStatusColor';
import palettes from '../themes/palettes';
import * as DateUtils from '../utils/DateUtils';
import imageSource from '../utils/imageSource.js';
import useNavigation from '../utils/useNavigation';
import useParams from '../utils/useParams';
import { logError } from '../index.js';
import { checkInternetAndProceed } from '../custom-files/InternetConnection.js';

const defaultProps = { taskData: null };
const DEFAULT_AVATAR = 'https://master-app.suno.tech/assets/user-CXthF0zB.png';

const TASK_DETAILS_QUERY =
  '{id,title,priority,status,description,due_at,completed_at,updated_at,created_at,patient{id,first_name,middle_name,last_name,title,suffix,preferred_name,photo,preferred_clinic{id},full_name},comments{id,text,user{id,full_name,photo},created_at,created_by},assignees{user{id,first_name,last_name,full_name,suffix,title,is_active,photo}},assignee{id,first_name,last_name,full_name,suffix,title,is_active,photo},created_by,attachments{id,file,original_filename,created_at,created_by,updated_by}}';

const STATUS_ITEMS = [
  { label: 'TO DO', value: '1', color: '#B48CF4' },
  { label: 'IN PROGRESS', value: '2', color: '#F4C542' },
  { label: 'COMPLETED', value: '3', color: '#0D5C54' },
  { label: 'CANCELLED', value: '4', color: '#8C8C8C' },
];

const isPdfAsset = asset => {
  const name = (asset?.name || '').toLowerCase();
  const mime = (asset?.mimeType || '').toLowerCase();
  return mime === 'application/pdf' || name.endsWith('.pdf');
};

const getAttachmentUrl = (file, apiBaseUrl) => {
  if (!file) return null;
  if (file.startsWith('http')) return file;
  return `${apiBaseUrl}${file.startsWith('/') ? '' : '/'}${file}`;
};

const getOverdueDays = dueDate => {
  if (!dueDate) return 0;
  const diffDays = Math.floor((new Date() - new Date(dueDate)) / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

const getAssigneeNames = assigneeData =>
  Array.isArray(assigneeData) && assigneeData.length > 0
    ? assigneeData
        .map(item => item?.user?.full_name || [item?.user?.first_name, item?.user?.last_name].filter(Boolean).join(' '))
        .filter(Boolean)
        .join(', ')
    : '';

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

const MetaRow = ({ label, children }) => (
  <View style={styles.metaRow}>
    <Text style={styles.metaLabel}>{label}</Text>
    {children}
  </View>
);

const PriorityBadge = ({ Variables, priority }) => {
  const color = getTaskPriorityColor(Variables, priority);
  return (
    <View style={[styles.badge, { backgroundColor: `${color}22` }]}>
      <Icon name="Foundation/flag" size={14} color={color} />
      <Text style={[styles.badgeText, { color }]}>
        {getTaskPriority(Variables, priority)}
      </Text>
    </View>
  );
};

const StatusBadge = ({ Variables, status }) => {
  const color = getTaskStatusColor(Variables, status);
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={[styles.badgeText, { color: palettes.App['Custom Color_18'] }]}>
        {getTaskStatus(Variables, status)}
      </Text>
    </View>
  );
};

const PersonRow = ({ photo, name }) => (
  <View style={styles.personRow}>
    {photo ? (
      <Image source={{ uri: photo }} style={styles.personAvatar} />
    ) : (
      <Image source={imageSource(DEFAULT_AVATAR)} style={styles.personAvatar} />
    )}
    <Text style={styles.personName}>{name || '—'}</Text>
  </View>
);

const ViewTaskScreen = props => {
  const { theme } = props;
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const params = useParams();
  const Constants = GlobalVariables.useValues();
  const Variables = Constants;

  const [taskData, setTaskData] = React.useState({});
  const [textInputValue, setTextInputValue] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState('1');
  const [pickingAttachment, setPickingAttachment] = React.useState(false);

  const taskId = (params?.taskData ?? defaultProps.taskData)?.id;
  const displayTask = taskData?.id ? taskData : (params?.taskData ?? defaultProps.taskData);
  const attachments = taskData?.attachments ?? displayTask?.attachments ?? [];

  const [items, setItems] = React.useState(
    STATUS_ITEMS.map(item => ({
      label: item.label,
      value: item.value,
      icon: () => <View style={[styles.statusDot, { backgroundColor: item.color }]} />,
    }))
  );

  const sunoAddTaskCommentsPOST = SunoApi.useAddTaskCommentsPOST();
  const sunoDeleteTaskCommentsDELETE = SunoApi.useDeleteTaskCommentsDELETE();
  const sunoEditStaffTasksPATCH = SunoApi.useEditStaffTasksPATCH();

  const refreshTaskData = React.useCallback(async () => {
    if (!taskId) return null;
    const alltaskData = (
      await SunoApi.getTaskDetailsGET(Constants, {
        query: TASK_DETAILS_QUERY,
        task_id: taskId,
      })
    )?.json;
    setTaskData(alltaskData);
    setValue(String(alltaskData?.status ?? ''));
    return alltaskData;
  }, [Constants, taskId]);

  React.useEffect(() => {
    const handler = async () => {
      try {
        const isConnected = await checkInternetAndProceed();
        if (!isConnected) return;
        setLoading(true);
        await refreshTaskData();
      } catch (err) {
        logError('API Error :getTaskDetailsGET :', err);
      } finally {
        setLoading(false);
      }
    };
    handler();
  }, []);

  const pickAndUploadPdf = async () => {
    try {
      const isConnected = await checkInternetAndProceed();
      if (!isConnected) return;

      setPickingAttachment(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (result.canceled) return;

      const pdfAssets = result.assets.filter(isPdfAsset);
      if (!pdfAssets.length) {
        Alert.alert('Invalid file', 'Only PDF files can be attached.');
        return;
      }

      if (pdfAssets.length !== result.assets.length) {
        Alert.alert('Some files skipped', 'Only PDF files were uploaded.');
      }

      setLoading(true);
      for (const asset of pdfAssets) {
        await SunoApi.uploadTaskAttachmentPOST(Constants, {
          task_id: taskId,
          uri: asset.uri,
          name: asset.name || 'attachment.pdf',
        });
      }
      await refreshTaskData();
    } catch (err) {
      logError('Upload attachment error:', err);
      Alert.alert('Error', 'Unable to upload attachment.');
    } finally {
      setPickingAttachment(false);
      setLoading(false);
    }
  };

  const deleteAttachment = attachment => {
    Alert.alert(
      'Remove attachment',
      `Remove ${attachment?.original_filename || 'this file'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const isConnected = await checkInternetAndProceed();
              if (!isConnected) return;
              setLoading(true);
              await SunoApi.deleteTaskAttachmentDELETE(Constants, {
                task_id: taskId,
                attachment_id: attachment.id,
              });
              await refreshTaskData();
            } catch (err) {
              logError('Delete attachment error:', err);
              Alert.alert('Error', 'Unable to remove attachment.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const openAttachment = async attachment => {
    const url = getAttachmentUrl(attachment?.file, Constants.API_BASE_URL);
    if (!url) {
      Alert.alert('Unavailable', 'Attachment file is not available.');
      return;
    }
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        Alert.alert('Unavailable', 'Unable to open this attachment.');
        return;
      }
      await Linking.openURL(url);
    } catch (err) {
      logError('Open attachment error:', err);
      Alert.alert('Error', 'Unable to open attachment.');
    }
  };

  const handleStatusChange = async callback => {
    const newValue = callback(value);
    setValue(newValue);
    try {
      const isConnected = await checkInternetAndProceed();
      if (!isConnected) return;
      setLoading(true);
      await sunoEditStaffTasksPATCH.mutateAsync({
        task_id: taskId,
        status: newValue,
      });
      await refreshTaskData();
    } catch (err) {
      logError('Update status error:', err);
      Alert.alert('Error', 'Unable to update status.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!textInputValue.trim()) {
      Alert.alert('', 'Please enter comment');
      return;
    }
    try {
      const isConnected = await checkInternetAndProceed();
      if (!isConnected) return;
      setLoading(true);
      await sunoAddTaskCommentsPOST.mutateAsync({
        id: taskId,
        text: textInputValue,
        user_id: Constants['UserInfo']?.id,
      });
      setTextInputValue('');
      await refreshTaskData();
    } catch (err) {
      logError(err);
      Alert.alert('Error', 'Unable to add comment.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = item => {
    Alert.alert(
      'Delete comment?',
      `Delete "${item?.text}"`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              const isConnected = await checkInternetAndProceed();
              if (!isConnected) return;
              setLoading(true);
              await sunoDeleteTaskCommentsDELETE.mutateAsync({
                comment_id: item?.id,
                task_id: taskId,
              });
              await refreshTaskData();
            } catch (err) {
              logError('API Error DeleteTaskComments : ', err);
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const overdueDays = getOverdueDays(displayTask?.due_at);
  const statusStyle = STATUS_ITEMS.find(item => item.value === value);

  const CommentItem = ({ item }) => (
    <View style={styles.commentCard}>
      {item?.created_by?.photo ? (
        <Image source={{ uri: item.created_by.photo }} style={styles.commentAvatar} />
      ) : (
        <Image source={imageSource(DEFAULT_AVATAR)} style={styles.commentAvatar} />
      )}
      <View style={styles.commentBody}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentUser}>{item?.created_by?.full_name ?? 'Unknown'}</Text>
          <Text style={styles.commentTime}>
            {DateUtils.format(item?.created_at, 'MMM DD, YYYY hh:mm a')}
          </Text>
        </View>
        <View style={styles.commentContentRow}>
          <Text style={styles.commentText}>{item?.text ?? ''}</Text>
          <TouchableOpacity
            onPress={() => handleDeleteComment(item)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.commentDeleteButton}
          >
            <Icon name="MaterialCommunityIcons/delete-outline" size={18} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <SectionCard>
        <Text style={styles.taskTitle}>{displayTask?.title}</Text>
        {displayTask?.description ? (
          <Text style={styles.taskDescription}>{displayTask.description}</Text>
        ) : null}
        <View style={styles.badgeRow}>
          <PriorityBadge Variables={Variables} priority={displayTask?.priority} />
          {overdueDays > 0 ? (
            <View style={styles.overdueBadge}>
              <Text style={styles.overdueBadgeText}>{overdueDays} days overdue</Text>
            </View>
          ) : null}
        </View>
        <MetaRow label="Due Date">
          <Text style={styles.metaValue}>
            {displayTask?.due_at
              ? DateUtils.format(displayTask.due_at, 'MMM DD, YYYY')
              : '—'}
          </Text>
        </MetaRow>
      </SectionCard>

      <SectionCard title="Status" subtitle="Update task progress" style={{ zIndex: 1000 }}>
        <DropDownPicker
          open={open}
          value={value}
          items={items}
          setOpen={setOpen}
          setValue={handleStatusChange}
          setItems={setItems}
          // listMode="MODAL"
          modalTitle="Update status"
          style={[
            styles.statusPicker,
            {
              backgroundColor: `${statusStyle?.color || '#839e93'}1a`,
              borderColor: `${statusStyle?.color || '#839e93'}44`,
            },
          ]}
          dropDownContainerStyle={styles.statusPickerDropdown}
          placeholder="Status"
        />
      </SectionCard>

      <SectionCard title="">
        <MetaRow label="Assignee">
          <PersonRow
            photo={displayTask?.assignee?.photo}
            name={displayTask?.assignee?.full_name}
          />
        </MetaRow>

        {displayTask?.assignees?.length > 0 ? (
          <MetaRow label="Additional Assignees">
            <Text style={styles.metaValue}>{getAssigneeNames(displayTask.assignees)}</Text>
          </MetaRow>
        ) : null}

        {displayTask?.patient && Object.keys(displayTask.patient).length > 0 ? (
          <MetaRow label="Patient">
            <Touchable
              onPress={() => {
                try {
                  navigation.navigate(
                    'PatientDetailsScreen',
                    {
                      id: displayTask.patient.id,
                      clientID: displayTask.patient?.preferred_clinic?.id,
                    },
                    { pop: true }
                  );
                } catch (err) {
                  logError('Navigation Error PatientDetailsScreen : ', err);
                }
              }}
            >
              <Text style={styles.linkValue}>
                {displayTask.patient.full_name ||
                  [displayTask.patient.first_name, displayTask.patient.last_name]
                    .filter(Boolean)
                    .join(' ')}
              </Text>
            </Touchable>
          </MetaRow>
        ) : null}
      </SectionCard>

      <SectionCard title="">
        <MetaRow label="Created By">
          <Text style={styles.metaValue}>
            {displayTask?.created_by?.full_name || '—'}
            {displayTask?.created_at
              ? ` · ${DateUtils.format(displayTask.created_at, 'MMM DD, YYYY hh:mm a')}`
              : ''}
          </Text>
        </MetaRow>
        <MetaRow label="Updated At">
          <Text style={styles.metaValue}>
            {displayTask?.updated_at
              ? DateUtils.format(displayTask.updated_at, 'MMM DD, YYYY hh:mm a')
              : '—'}
          </Text>
        </MetaRow>
        <View style={{ marginTop: 8 , alignSelf: 'flex-start'}}>
          <StatusBadge Variables={Variables} status={displayTask?.status} />
        </View>
      </SectionCard>

      <SectionCard title="Attachments" subtitle="PDF files only">
        <TouchableOpacity
          onPress={pickAndUploadPdf}
          activeOpacity={0.85}
          disabled={pickingAttachment}
          style={styles.uploadButton}
        >
          {pickingAttachment ? (
            <ActivityIndicator size="small" color="#066858" />
          ) : (
            <Icon name="MaterialCommunityIcons/file-upload-outline" size={20} color="#066858" />
          )}
          <Text style={styles.uploadButtonText}>
            {pickingAttachment ? 'Opening files...' : 'Upload PDF'}
          </Text>
        </TouchableOpacity>

        {attachments.length === 0 ? (
          <Text style={styles.emptyText}>No attachments yet.</Text>
        ) : (
          attachments.map(attachment => (
            <View key={attachment.id} style={styles.attachmentRow}>
              <TouchableOpacity
                onPress={() => openAttachment(attachment)}
                activeOpacity={0.85}
                style={styles.attachmentMain}
              >
                <View style={styles.attachmentIconWrap}>
                  <Icon name="MaterialCommunityIcons/file-pdf-box" size={22} color="#DC2626" />
                </View>
                <View style={styles.attachmentInfo}>
                  <Text numberOfLines={2} style={styles.attachmentName}>
                    {attachment.original_filename || 'Attachment.pdf'}
                  </Text>
                  <Text style={styles.attachmentMeta}>
                    {attachment.created_at
                      ? DateUtils.format(attachment.created_at, 'MMM DD, YYYY')
                      : 'PDF file'}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => deleteAttachment(attachment)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.attachmentRemoveButton}
              >
                <Icon name="MaterialCommunityIcons/delete-outline" size={20} color="#DC2626" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </SectionCard>

      <Text style={styles.listSectionTitle}>Comments</Text>
    </View>
  );

  const renderFooter = useMemo(
    () => (
      <View style={[styles.footerSection, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TextInput
          multiline
          numberOfLines={4}
          onChangeText={setTextInputValue}
          placeholder="Write a comment..."
          placeholderTextColor={palettes.App.TextPlaceholder}
          style={styles.commentInput}
          value={textInputValue}
        />
        <TouchableOpacity
          onPress={handleAddComment}
          activeOpacity={0.9}
          style={styles.addCommentButton}
        >
          <Text style={styles.addCommentButtonText}>Add Comment</Text>
        </TouchableOpacity>
      </View>
    ),
    [textInputValue, insets.bottom]
  );

  return (
    <ScreenContainer scrollable={false} hasSafeArea={true} hasTopSafeArea={false}>
      <Modal transparent visible={loading} animationType="fade">
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#066858" />
        </View>
      </Modal>

      <CustomChildHeaderBlock name="View Task" />

      <View style={styles.screenBody}>
        <View style={styles.contentPanel}>
          <KeyboardAwareFlatList
            data={taskData?.comments ?? []}
            renderItem={({ item }) => <CommentItem item={item} />}
            keyExtractor={(item, index) => item?.id?.toString() ?? index.toString()}
            ListHeaderComponent={renderHeader}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No comments yet.</Text>
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            enableAutomaticScroll
            extraData={`${taskData?.comments?.length ?? 0}-${attachments.length}`}
            enableOnAndroid
            extraScrollHeight={Platform.OS === 'ios' ? 100 : 180}
          />
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  screenBody: {
    flex: 1,
    backgroundColor: palettes.App['Custom Color_15'],
  },
  contentPanel: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 5,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  listContent: {
    paddingBottom: 24,
    backgroundColor: '#F3F6F5',
  },
  headerContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8EEEC',
    padding: 16,
    marginBottom: 12,
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
  taskTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 22,
    lineHeight: 28,
    color: palettes.App.FilterTextColor,
    marginBottom: 8,
  },
  taskDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: palettes.App.TextPlaceholder,
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
  },
  overdueBadge: {
    backgroundColor: '#FEE2E2',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  overdueBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: '#DC2626',
  },
  metaRow: {
    marginBottom: 12,
  },
  metaLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: palettes.App.TextPlaceholder,
    marginBottom: 6,
  },
  metaValue: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: palettes.App.FilterTextColor,
    lineHeight: 20,
  },
  linkValue: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#066858',
    textDecorationLine: 'underline',
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  personAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  personName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: palettes.App.FilterTextColor,
    flex: 1,
  },
  statusPicker: {
    borderRadius: 12,
    minHeight: 48,
  },
  statusPickerDropdown: {
    borderColor: '#E8EEEC',
    borderRadius: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 3,
    marginRight: 8,
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  uploadButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#066858',
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
  attachmentMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
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
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listSectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: palettes.App.FilterTextColor,
    marginBottom: 12,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  commentCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8EEEC',
    padding: 14,
    marginBottom: 10,
    marginHorizontal: 16,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  commentBody: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
    gap: 8,
  },
  commentUser: {
    flex: 1,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: palettes.App.FilterTextColor,
  },
  commentTime: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: palettes.App.TextPlaceholder,
  },
  commentContentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  commentText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: palettes.App.FilterTextColor,
  },
  commentDeleteButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: '#F3F6F5',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 96,
    textAlignVertical: 'top',
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: palettes.App.FilterTextColor,
    marginBottom: 12,
  },
  addCommentButton: {
    backgroundColor: '#066858',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  addCommentButtonText: {
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: palettes.App.TextPlaceholder,
    textAlign: 'center',
    paddingVertical: 8,
    marginHorizontal: 16,
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
});

export default withTheme(ViewTaskScreen);
