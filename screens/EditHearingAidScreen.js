import React, { useEffect, useMemo, useState } from 'react';
import {
  ScreenContainer,
  Icon,
  withTheme,
  SimpleStyleScrollView,
} from '@draftbit/ui';
import {
  Text,
  View,
  Platform,
  Modal,
  Alert,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';
import moment from 'moment';
import CustomChildHeaderBlock from '../components/CustomChildHeaderBlock';
import * as GlobalVariables from '../config/GlobalVariableContext';
import palettes from '../themes/palettes';
import useNavigation from '../utils/useNavigation';
import useParams from '../utils/useParams';
import * as SunoApi from '../apis/SunoApi.js';
import { checkInternetAndProceed } from '../custom-files/InternetConnection';
import { renderParam, renderQueryString } from '../utils/encodeQueryParam';
import {
  getProductStatusColor,
  getProductStatusName,
  getProductStatusTextColor,
} from './PatientDetailsScreen.js';
import {
  getOwnPatientProductDate,
  getManufacturerWarrantyDate,
  parsePatientProductDate,
} from '../utils/patientProductFields';

const defaultProps = { hearingAidsData: null, patientID: null };

const HEARING_AID_DETAIL_QUERY =
  '{id,patient{id},sale{id,service_date},inventory_product{id,serial_number,manufacturer_warranty_expiration_date,loss_damage_warranty_expiration_date,product{id,display_name,master_product{manufacturer{name},type,subtype,specification}},specification{color,battery,serial_number,additional_notes,manufacturer_instructions},cost,manufacturer_cost},status,service_plan_expiration_date,extended_warranty_expiration_date,purchase_date,due_date,description,is_active,is_in_use,is_outside_purchase,serial_number,notes,ear,type,subtype,cost,manufacturer_warranty_expiration_date,loss_damage_warranty_expiration_date,delivered_at,delivered_at_display,checked_in_at,statuses{value,created_at}}';

const EAR_OPTIONS = [
  { label: 'None', value: 'N' },
  { label: 'Left', value: 'L' },
  { label: 'Right', value: 'R' },
];

const TYPE_OPTIONS = [
  { label: 'None', value: '0' },
  { label: 'Service', value: '1' },
  { label: 'Hearing Aid', value: '2' },
  { label: 'Accessory', value: '3' },
  { label: 'Supply', value: '5' },
  { label: 'Cochlear Implant', value: '6' },
];

const SUBTYPE_OPTIONS = [
  { label: 'None', value: 'null' },
  { label: 'Receiver', value: '1' },
  { label: 'Earmold', value: '2' },
  { label: 'Tube', value: '3' },
  { label: 'Dome', value: '4' },
  { label: 'Battery', value: '5' },
  { label: 'Charger', value: '6' },
  // { label: 'Warranty', value: '7' },
  // { label: 'Repair', value: '8' },
  { label: 'Remote', value: '9' },
  // { label: 'Shipping Handling', value: '10' },
  // { label: 'Exam', value: '11' },
  // { label: 'Restocking', value: '12' },
  // { label: 'Service Plan', value: '13' },
  { label: 'Other', value: '999' },
];

const ACCESSORY_TYPE_VALUE = '3';

const YEAR_QUICK_ADDS = [
  { label: '+1YR', years: 1 },
  { label: '+2YR', years: 2 },
  { label: '+3YR', years: 3 },
  { label: '+4YR', years: 4 },
  { label: '+5YR', years: 5 },
];

const DUE_DATE_QUICK_ADDS = [
  { label: '+30D', days: 30 },
  { label: '+45D', days: 45 },
  { label: '+60D', days: 60 },
  { label: '+90D', days: 90 },
  { label: '+6MO', months: 6 },
  { label: '+1YR', years: 1 },
];

const DROPDOWN_LIST_MODE = Platform.OS === 'android' ? 'MODAL' : 'SCROLLVIEW';

const parseApiDate = value => parsePatientProductDate(value);

const formatDateForApi = date => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return null;
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDisplayDate = date => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return 'MM/DD/YYYY';
  }
  return moment(date).format('MM/DD/YYYY');
};

const addQuickDate = (baseDate, { days, months, years }) => {
  const source = baseDate instanceof Date && !Number.isNaN(baseDate.getTime())
    ? moment(baseDate)
    : moment();
  let next = source.clone();
  if (days) next = next.add(days, 'days');
  if (months) next = next.add(months, 'months');
  if (years) next = next.add(years, 'years');
  return next.toDate();
};

const getApiErrorMessage = (response, fallback) => {
  const json = response?.json;
  if (!json) return fallback;
  if (typeof json === 'string') return json;
  if (json.detail) return String(json.detail);
  if (json.error) return String(json.error);
  const firstFieldError = Object.values(json)
    .flatMap(value => (Array.isArray(value) ? value : [value]))
    .find(Boolean);
  if (!firstFieldError) return fallback;
  if (typeof firstFieldError === 'string') return firstFieldError;
  if (firstFieldError?.message) return String(firstFieldError.message);
  return fallback;
};

const getSpecValue = (data, key) =>
  data?.inventory_product?.specification?.[key] ??
  data?.specification?.[key] ??
  '';

const SectionCard = ({ title, children, style }) => (
  <View style={[styles.sectionCard, style]}>
    {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
    {children}
  </View>
);

const FieldLabel = ({ label, required }) => (
  <Text style={styles.fieldLabel}>
    {label}
    {required ? <Text style={styles.requiredMark}> *</Text> : null}
  </Text>
);

const CheckboxRow = ({ label, checked, onToggle }) => (
  <TouchableOpacity
    activeOpacity={0.85}
    onPress={onToggle}
    style={styles.checkboxRow}
  >
    <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
      {checked ? <Icon color="#FFFFFF" name="Feather/check" size={14} /> : null}
    </View>
    <Text style={styles.checkboxLabel}>{label}</Text>
  </TouchableOpacity>
);

const QuickAddChips = ({ options, onSelect }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.quickAddRow}
  >
    {options.map(option => (
      <TouchableOpacity
        key={option.label}
        activeOpacity={0.85}
        onPress={() => onSelect(option)}
        style={styles.quickAddChip}
      >
        <Text style={styles.quickAddChipText}>{option.label}</Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

const DateField = ({ label, value, onChange, quickAdds }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [draftDate, setDraftDate] = useState(value || new Date());

  useEffect(() => {
    if (value) {
      setDraftDate(value);
    }
  }, [value]);

  const handleDone = () => {
    onChange(draftDate);
    setShowPicker(false);
  };

  return (
    <View style={styles.fieldBlock}>
      <FieldLabel label={label} />
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => {
          setDraftDate(value || new Date());
          setShowPicker(true);
        }}
        style={styles.dateInput}
      >
        <Text
          style={[
            styles.dateInputText,
            !value && styles.dateInputPlaceholder,
          ]}
        >
          {formatDisplayDate(value)}
        </Text>
        <Icon color="#066858" name="Feather/calendar" size={18} />
      </TouchableOpacity>
      {value ? (
        <TouchableOpacity onPress={() => onChange(null)} style={styles.clearDateBtn}>
          <Text style={styles.clearDateText}>Clear</Text>
        </TouchableOpacity>
      ) : null}
      {quickAdds?.length ? (
        <QuickAddChips
          options={quickAdds}
          onSelect={option => onChange(addQuickDate(value, option))}
        />
      ) : null}

      {Platform.OS === 'ios' ? (
        <Modal
          visible={showPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <Text style={styles.modalAction}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>{label}</Text>
                <TouchableOpacity onPress={handleDone}>
                  <Text style={[styles.modalAction, styles.modalActionPrimary]}>
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={draftDate}
                mode="date"
                display="spinner"
                onChange={(_, selectedDate) => {
                  if (selectedDate) {
                    setDraftDate(selectedDate);
                  }
                }}
              />
            </View>
          </View>
        </Modal>
      ) : (
        showPicker && (
          <DateTimePicker
            value={draftDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowPicker(false);
              if (event.type === 'set' && selectedDate) {
                onChange(selectedDate);
              }
            }}
          />
        )
      )}
    </View>
  );
};

const FormDropdown = ({
  label,
  required,
  open,
  setOpen,
  value,
  onChangeValue,
  items,
  setItems,
  placeholder,
  zIndex,
  searchable,
}) => (
  <View style={[styles.fieldBlock, { zIndex }]}>
    <FieldLabel label={label} required={required} />
    <DropDownPicker
      open={open}
      value={value}
      items={items}
      setOpen={setOpen}
      setValue={cb => {
        const nextValue = typeof cb === 'function' ? cb(value) : cb;
        onChangeValue(nextValue);
      }}
      setItems={setItems}
      placeholder={placeholder}
      listMode={DROPDOWN_LIST_MODE}
      searchable={searchable}
      searchPlaceholder="Search..."
      zIndex={zIndex}
      zIndexInverse={zIndex + 1000}
      style={styles.dropdown}
      dropDownContainerStyle={styles.dropDownContainer}
      placeholderStyle={styles.dropdownPlaceholder}
      textStyle={styles.dropdownText}
      ListEmptyComponent={() => (
        <View style={{ padding: 15, alignItems: 'center' }}>
          <Text style={{ color: '#6B7280' }}>No options</Text>
        </View>
      )}
    />
  </View>
);

const EditHearingAidScreen = props => {
  const navigation = useNavigation();
  const params = useParams();
  const insets = useSafeAreaInsets();
  const Constants = GlobalVariables.useValues();
  const Variables = Constants;

  const initialData = params?.hearingAidsData ?? defaultProps.hearingAidsData;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hearingAid, setHearingAid] = useState(initialData);
  const [showCost, setShowCost] = useState(false);

  const [ear, setEar] = useState(initialData?.ear || 'N');
  const [status, setStatus] = useState(
    initialData?.status != null ? String(initialData.status) : ''
  );
  const [isActive, setIsActive] = useState(initialData?.is_active !== false);
  const [showInHeader, setShowInHeader] = useState(!!initialData?.is_in_use);
  const [isOutsidePurchase, setIsOutsidePurchase] = useState(
    !!initialData?.is_outside_purchase
  );
  const [productId, setProductId] = useState(
    initialData?.inventory_product?.product?.id
      ? String(initialData.inventory_product.product.id)
      : null
  );
  const [productType, setProductType] = useState(
    String(
      initialData?.type ??
        initialData?.inventory_product?.product?.master_product?.type ??
        '2'
    )
  );
  const [productSubtype, setProductSubtype] = useState(() => {
    const raw =
      initialData?.subtype ??
      initialData?.inventory_product?.product?.master_product?.subtype;
    return raw != null && raw !== '' ? String(raw) : null;
  });
  const [serialNumber, setSerialNumber] = useState(
    initialData?.serial_number ?? ''
  );
  const [cost, setCost] = useState(
    initialData?.cost != null
      ? String(initialData.cost)
      : initialData?.inventory_product?.cost != null
        ? String(initialData.inventory_product.cost)
        : ''
  );
  const [color, setColor] = useState(getSpecValue(initialData, 'color'));
  const [battery, setBattery] = useState(getSpecValue(initialData, 'battery'));
  const [manufacturerInstructions, setManufacturerInstructions] = useState(
    getSpecValue(initialData, 'manufacturer_instructions')
  );
  const [notes, setNotes] = useState(initialData?.notes ?? '');
  const [description, setDescription] = useState(
    initialData?.description ||
      initialData?.inventory_product?.product?.display_name ||
      ''
  );

  const [mfrWarranty, setMfrWarranty] = useState(
    parseApiDate(getManufacturerWarrantyDate(initialData))
  );
  const [ldWarranty, setLdWarranty] = useState(
    parseApiDate(
      initialData?.loss_damage_warranty_expiration_date ||
        initialData?.inventory_product?.loss_damage_warranty_expiration_date
    )
  );
  const [servicePlan, setServicePlan] = useState(
    parseApiDate(initialData?.service_plan_expiration_date)
  );
  const [extendedWarranty, setExtendedWarranty] = useState(
    parseApiDate(initialData?.extended_warranty_expiration_date)
  );
  const [dueDate, setDueDate] = useState(parseApiDate(initialData?.due_date));
  const [purchaseDate, setPurchaseDate] = useState(
    parseApiDate(initialData?.purchase_date)
  );
  const [deliveryDate, setDeliveryDate] = useState(
    parseApiDate(getOwnPatientProductDate(initialData, 'delivery'))
  );
  const [checkInDate, setCheckInDate] = useState(
    parseApiDate(initialData?.checked_in_at)
  );

  const [earOpen, setEarOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [subtypeOpen, setSubtypeOpen] = useState(false);

  const [earItems, setEarItems] = useState(EAR_OPTIONS);
  const [statusItems, setStatusItems] = useState([]);
  const [productItems, setProductItems] = useState([]);
  const [typeItems, setTypeItems] = useState(TYPE_OPTIONS);
  const [subtypeItems, setSubtypeItems] = useState(SUBTYPE_OPTIONS);

  const statusOptions = useMemo(
    () =>
      (Variables.productStatus || []).map(item => ({
        label: item.label,
        value: item.value,
      })),
    [Variables.productStatus]
  );

  useEffect(() => {
    setStatusItems(statusOptions);
  }, [statusOptions]);

  useEffect(() => {
    if (productType !== ACCESSORY_TYPE_VALUE) {
      setProductSubtype(null);
      setSubtypeOpen(false);
    }
  }, [productType]);

  const handleTypeChange = value => {
    setProductType(value);
    if (value !== ACCESSORY_TYPE_VALUE) {
      setProductSubtype(null);
      setSubtypeOpen(false);
    }
  };

  const applyDetailToForm = detail => {
    setHearingAid(detail);
    setEar(detail?.ear || 'N');
    setStatus(detail?.status != null ? String(detail.status) : '');
    setIsActive(detail?.is_active !== false);
    setShowInHeader(!!detail?.is_in_use);
    setIsOutsidePurchase(!!detail?.is_outside_purchase);
    setProductId(
      detail?.inventory_product?.product?.id
        ? String(detail.inventory_product.product.id)
        : null
    );
    setProductType(
      String(
        detail?.type ??
          detail?.inventory_product?.product?.master_product?.type ??
          '2'
      )
    );
    const subtypeRaw =
      detail?.subtype ??
      detail?.inventory_product?.product?.master_product?.subtype;
    setProductSubtype(
      subtypeRaw != null && subtypeRaw !== '' ? String(subtypeRaw) : null
    );
    setSerialNumber(detail?.serial_number ?? '');
    setCost(
      detail?.cost != null
        ? String(detail.cost)
        : detail?.inventory_product?.cost != null
          ? String(detail.inventory_product.cost)
          : ''
    );
    setColor(getSpecValue(detail, 'color'));
    setBattery(getSpecValue(detail, 'battery'));
    setManufacturerInstructions(getSpecValue(detail, 'manufacturer_instructions'));
    setNotes(detail?.notes ?? '');
    setDescription(
      detail?.description ||
        detail?.inventory_product?.product?.display_name ||
        ''
    );
    setMfrWarranty(parseApiDate(getManufacturerWarrantyDate(detail)));
    setLdWarranty(
      parseApiDate(
        detail?.loss_damage_warranty_expiration_date ||
          detail?.inventory_product?.loss_damage_warranty_expiration_date
      )
    );
    setServicePlan(parseApiDate(detail?.service_plan_expiration_date));
    setExtendedWarranty(parseApiDate(detail?.extended_warranty_expiration_date));
    setDueDate(parseApiDate(detail?.due_date));
    setPurchaseDate(parseApiDate(detail?.purchase_date));
    setDeliveryDate(parseApiDate(getOwnPatientProductDate(detail, 'delivery')));
    setCheckInDate(parseApiDate(detail?.checked_in_at));

    const currentProduct = detail?.inventory_product?.product;
    if (currentProduct?.id) {
      setProductItems(prev => {
        const option = {
          label: currentProduct.display_name || `Product #${currentProduct.id}`,
          value: String(currentProduct.id),
        };
        if (prev.some(item => item.value === option.value)) {
          return prev;
        }
        return [option, ...prev];
      });
    }
  };

  useEffect(() => {
    const loadDetails = async () => {
      if (!initialData?.id) return;
      try {
        setLoading(true);
        const response = await SunoApi.getPatientProductByIdGET(Constants, {
          id: initialData.id,
          query: HEARING_AID_DETAIL_QUERY,
        });
        if (response?.status >= 200 && response?.status < 300) {
          applyDetailToForm(response.json);
        } else if (initialData) {
          applyDetailToForm(initialData);
        }
      } catch (error) {
        console.log('Failed to load hearing aid details:', error);
        if (initialData) {
          applyDetailToForm(initialData);
        }
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [Constants, initialData?.id]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const paramsDict = {
          query: renderParam('{id,display_name,master_product{type}}'),
          limit: renderParam(200),
          type: renderParam(2),
        };
        const url = `${Constants.API_BASE_URL}/products/${renderQueryString(
          paramsDict
        )}`;
        const response = await fetch(url, {
          headers: {
            Accept: 'application/json',
            Authorization: Constants.AUTH_HEADER,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) return;
        const json = await response.json();
        const results = json?.results || json || [];
        if (!Array.isArray(results)) return;

        const options = results
          .filter(item => item?.id)
          .map(item => ({
            label: item.display_name || `Product #${item.id}`,
            value: String(item.id),
          }));

        setProductItems(prev => {
          const merged = [...options];
          prev.forEach(item => {
            if (!merged.some(opt => opt.value === item.value)) {
              merged.unshift(item);
            }
          });
          return merged;
        });
      } catch (error) {
        console.log('Failed to load products list:', error);
      }
    };

    loadProducts();
  }, [Constants.API_BASE_URL, Constants.AUTH_HEADER]);

  const closeOtherDropdowns = except => {
    if (except !== 'ear') setEarOpen(false);
    if (except !== 'status') setStatusOpen(false);
    if (except !== 'product') setProductOpen(false);
    if (except !== 'type') setTypeOpen(false);
    if (except !== 'subtype') setSubtypeOpen(false);
  };

  const handleSave = async () => {
    if (!hearingAid?.id) {
      Alert.alert('Error', 'Hearing aid record is missing.');
      return;
    }

    const selectedProductName =
      productItems.find(item => item.value === productId)?.label ||
      hearingAid?.inventory_product?.product?.display_name ||
      '';
    const descriptionValue = (description || selectedProductName || '').trim();

    if (!descriptionValue) {
      Alert.alert('Missing Description', 'Description is required.');
      return;
    }

    const isConnected = await checkInternetAndProceed();
    if (!isConnected) return;

    const isAccessory = productType === ACCESSORY_TYPE_VALUE;
    const subtypeValue =
      isAccessory && productSubtype ? Number(productSubtype) : null;

    const payload = {
      status: status ? Number(status) : hearingAid.status,
      is_active: isActive,
      is_in_use: showInHeader,
      is_outside_purchase: isOutsidePurchase,
      description: descriptionValue,
      purchase_date: formatDateForApi(purchaseDate),
      due_date: formatDateForApi(dueDate),
      delivered_at: formatDateForApi(deliveryDate),
      extended_warranty_expiration_date: formatDateForApi(extendedWarranty),
      service_plan_expiration_date: formatDateForApi(servicePlan),
      serial_number: serialNumber.trim() || '',
      manufacturer_warranty_expiration_date: formatDateForApi(mfrWarranty),
      loss_damage_warranty_expiration_date: formatDateForApi(ldWarranty),
      notes: notes ?? '',
      type: productType ? Number(productType) : null,
      subtype: subtypeValue,
    };

    if (ear && ear !== 'N') {
      payload.ear = ear;
    }

    try {
      setSaving(true);
      const response = await SunoApi.updatePatientProductPATCH(Constants, {
        id: hearingAid.id,
        body: payload,
      });
      if (response?.status < 200 || response?.status >= 300) {
        throw new Error(
          getApiErrorMessage(response, 'Unable to save hearing aid details.')
        );
      }

      Alert.alert('Saved', 'Hearing aid updated successfully.', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert(
        'Save Failed',
        error.message || 'Unable to save hearing aid details.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (!hearingAid) {
    return (
      <ScreenContainer scrollable={false} hasSafeArea={false} hasTopSafeArea={true}>
        <CustomChildHeaderBlock name="Edit Hearing Aid" />
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Hearing aid data not found.</Text>
        </View>
      </ScreenContainer>
    );
  }

  const selectedStatusColor = getProductStatusColor(Variables, status);
  const selectedStatusTextColor = getProductStatusTextColor(Variables, status);
  return (
    <ScreenContainer scrollable={false} hasSafeArea={false} hasTopSafeArea={true}>
      <Modal transparent visible={loading || saving} animationType="fade">
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#066858" />
        </View>
      </Modal>

      <CustomChildHeaderBlock name="Edit Hearing Aid" />

      <SimpleStyleScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: insets.bottom + 110,
        }}
      >
        <SectionCard title="Overview" style={{zIndex: 1000}}>
          <FormDropdown
            label="Ear"
            open={earOpen}
            setOpen={open => {
              closeOtherDropdowns('ear');
              setEarOpen(open);
            }}
            value={ear}
            onChangeValue={setEar}
            items={earItems}
            setItems={setEarItems}
            placeholder="Select ear"
            zIndex={6000}
          />

          <FormDropdown
            label="Status"
            open={statusOpen}
            setOpen={open => {
              closeOtherDropdowns('status');
              setStatusOpen(open);
            }}
            value={status}
            onChangeValue={setStatus}
            items={statusItems}
            setItems={setStatusItems}
            placeholder="Select status"
            zIndex={5000}
          />

          {status ? (
            <View
              style={[
                styles.statusPreview,
                { backgroundColor: selectedStatusColor },
              ]}
            >
              <Text
                style={{
                  color: selectedStatusTextColor,
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 12,
                  textTransform: 'uppercase',
                }}
              >
                {getProductStatusName(Variables, status)}
              </Text>
            </View>
          ) : null}

          <View style={styles.checkboxGroup}>
            <CheckboxRow
              label="Active"
              checked={isActive}
              onToggle={() => setIsActive(prev => !prev)}
            />
            <CheckboxRow
              label="Show in patient header"
              checked={showInHeader}
              onToggle={() => setShowInHeader(prev => !prev)}
            />
            <CheckboxRow
              label="Outside purchase"
              checked={isOutsidePurchase}
              onToggle={() => setIsOutsidePurchase(prev => !prev)}
            />
          </View>
        </SectionCard>

        <SectionCard title="Product" style={{zIndex: 900}}>
          <FormDropdown
            label="Product"
            required
            open={productOpen}
            setOpen={open => {
              closeOtherDropdowns('product');
              setProductOpen(open);
            }}
            value={productId}
            onChangeValue={setProductId}
            items={productItems}
            setItems={setProductItems}
            placeholder="Select product"
            zIndex={4000}
            searchable
          />

          <FormDropdown
            label="Type"
            required
            open={typeOpen}
            setOpen={open => {
              closeOtherDropdowns('type');
              setTypeOpen(open);
            }}
            value={productType}
            onChangeValue={handleTypeChange}
            items={typeItems}
            setItems={setTypeItems}
            placeholder="Select type"
            zIndex={3000}
          />

          {productType === ACCESSORY_TYPE_VALUE ? (
            <FormDropdown
              label="Subtype"
              required
              open={subtypeOpen}
              setOpen={open => {
                closeOtherDropdowns('subtype');
                setSubtypeOpen(open);
              }}
              value={productSubtype}
              onChangeValue={setProductSubtype}
              items={subtypeItems}
              setItems={setSubtypeItems}
              placeholder="Select subtype"
              zIndex={2500}
            />
          ) : null}

          <View style={styles.fieldBlock}>
            <FieldLabel label="Description" required />
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Enter description"
              multiline
              style={[styles.textInput, styles.textArea]}
            />
          </View>
        </SectionCard>

        <SectionCard title="Serial & Cost">
          <View style={styles.fieldBlock}>
            <FieldLabel label="Serial Number" />
            <TextInput
              value={serialNumber}
              onChangeText={setSerialNumber}
              placeholder="Serial number"
              autoCapitalize="characters"
              style={styles.textInput}
            />
          </View>

          <View style={styles.fieldBlock}>
            <FieldLabel label="Cost" />
            <View style={styles.costRow}>
              <Text style={styles.costPrefix}>$</Text>
              <TextInput
                value={showCost ? cost : cost ? '••••••' : ''}
                onChangeText={text => {
                  if (!showCost) return;
                  setCost(text.replace(/[^0-9.]/g, ''));
                }}
                placeholder="0.00"
                keyboardType="decimal-pad"
                editable={showCost}
                style={[styles.textInput, styles.costInput]}
              />
              <TouchableOpacity
                onPress={() => setShowCost(prev => !prev)}
                style={styles.eyeButton}
              >
                <Icon
                  color="#667085"
                  name={showCost ? 'Feather/eye' : 'Feather/eye-off'}
                  size={18}
                />
              </TouchableOpacity>
            </View>
          </View>

          <DateField
            label="Invoice Date"
            value={purchaseDate}
            onChange={setPurchaseDate}
          />
          <DateField
            label="Delivery Date"
            value={deliveryDate}
            onChange={setDeliveryDate}
          />
        </SectionCard>

        <SectionCard title="Warranties & Dates">
          <DateField
            label="MFR Repair Warranty"
            value={mfrWarranty}
            onChange={setMfrWarranty}
            quickAdds={YEAR_QUICK_ADDS}
          />
          <DateField
            label="Loss and Damages Warranty"
            value={ldWarranty}
            onChange={setLdWarranty}
            quickAdds={YEAR_QUICK_ADDS}
          />
          <DateField
            label="Due Date"
            value={dueDate}
            onChange={setDueDate}
            quickAdds={DUE_DATE_QUICK_ADDS}
          />
          <DateField
            label="Service Plan"
            value={servicePlan}
            onChange={setServicePlan}
            quickAdds={YEAR_QUICK_ADDS}
          />
          <DateField
            label="Extended Warranty"
            value={extendedWarranty}
            onChange={setExtendedWarranty}
            quickAdds={YEAR_QUICK_ADDS}
          />
          <DateField
            label="Check In"
            value={checkInDate}
            onChange={setCheckInDate}
          />
        </SectionCard>

        {params?.sectionTitle === 'Accessories' ? null : (
          <SectionCard title="Specifications">
            <View style={styles.fieldBlock}>
              <FieldLabel label="Color" />
              <TextInput
                value={color}
                onChangeText={setColor}
                placeholder="Color"
                style={styles.textInput}
              />
            </View>
            <View style={styles.fieldBlock}>
              <FieldLabel label="Battery" />
              <TextInput
                value={battery}
                onChangeText={setBattery}
                placeholder="Battery"
                style={styles.textInput}
              />
            </View>
            <View style={styles.fieldBlock}>
              <FieldLabel label="Manufacturer Instructions" />
              <TextInput
                value={manufacturerInstructions}
                onChangeText={setManufacturerInstructions}
                placeholder="Enter Manufacturer Instructions"
                multiline
                style={[styles.textInput, styles.textArea]}
              />
            </View>
          </SectionCard>
        )}

        <SectionCard title="Additional Notes">
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Additional notes"
            multiline
            style={[styles.textInput, styles.textArea]}
          />
        </SectionCard>
      </SimpleStyleScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          activeOpacity={0.9}
          disabled={saving}
          onPress={handleSave}
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    color: '#667085',
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
  },
  loaderOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E8EEEC',
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
    padding: 16,
    overflow: 'visible',
  },
  sectionTitle: {
    color: '#101828',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    marginBottom: 14,
  },
  fieldBlock: {
    marginBottom: 14,
  },
  fieldLabel: {
    color: '#667085',
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  requiredMark: {
    color: '#D92D20',
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderColor: '#D0D5DD',
    borderRadius: 10,
    borderWidth: 1,
    color: '#101828',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dropdown: {
    backgroundColor: '#F9FAFB',
    borderColor: '#D0D5DD',
    borderRadius: 10,
    minHeight: 48,
  },
  dropDownContainer: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D0D5DD',
    borderRadius: 10,
  },
  dropdownPlaceholder: {
    color: '#98A2B3',
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
  },
  dropdownText: {
    color: '#101828',
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
  },
  checkboxGroup: {
    gap: 12,
    marginTop: 4,
  },
  checkboxRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  checkbox: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D0D5DD',
    borderRadius: 6,
    borderWidth: 1.5,
    height: 22,
    justifyContent: 'center',
    marginRight: 10,
    width: 22,
  },
  checkboxChecked: {
    backgroundColor: '#066858',
    borderColor: '#066858',
  },
  checkboxLabel: {
    color: '#344054',
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
  },
  statusPreview: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    marginBottom: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  costRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  costPrefix: {
    color: '#667085',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    marginRight: 8,
  },
  costInput: {
    flex: 1,
    marginRight: 8,
  },
  eyeButton: {
    alignItems: 'center',
    backgroundColor: '#F2F4F7',
    borderRadius: 8,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  dateInput: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderColor: '#D0D5DD',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  dateInputText: {
    color: '#101828',
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
  },
  dateInputPlaceholder: {
    color: '#98A2B3',
  },
  clearDateBtn: {
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  clearDateText: {
    color: '#066858',
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
  },
  quickAddRow: {
    gap: 8,
    marginTop: 10,
    paddingRight: 8,
  },
  quickAddChip: {
    backgroundColor: '#E8F5F3',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  quickAddChipText: {
    color: '#066858',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  modalOverlay: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 20,
  },
  modalHeader: {
    alignItems: 'center',
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalTitle: {
    color: '#101828',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
  modalAction: {
    color: '#667085',
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
  },
  modalActionPrimary: {
    color: '#066858',
  },
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E8EEEC',
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: '#066858',
    borderRadius: 12,
    paddingVertical: 14,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
});

export default withTheme(EditHearingAidScreen);
