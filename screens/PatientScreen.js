import React, { useCallback } from 'react';
import {
  Button,
  ExpoImage,
  Icon,
  KeyboardAvoidingView,
  NumberInput,
  Pressable,
  ScreenContainer,
  SimpleStyleFlatList,
  Surface,
  TextInput,
  Touchable,
  withTheme,
} from '@draftbit/ui';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Fetch } from 'react-request';
import * as GlobalStyles from '../GlobalStyles.js';
import * as SunoApi from '../apis/SunoApi.js';
import CustomHeaderBlock from '../components/CustomHeaderBlock.js';
import EmptyListBlock from '../components/EmptyListBlock.js';
import * as GlobalVariables from '../config/GlobalVariableContext.js';
import * as CustomCode from '../custom-files/CustomCode.js';
import * as DropDownBlock from '../custom-files/DropDownBlock.js';
import callPhoneNumber from '../global-functions/callPhoneNumber.js';
import checkExpiredTags from '../global-functions/checkExpiredTags.js';
import dueAmount from '../global-functions/dueAmount.js';
import fetchClinic from '../global-functions/fetchClinic.js';
import fetchInsurance from '../global-functions/fetchInsurance.js';
import fetchManageCarePlan from '../global-functions/fetchManageCarePlan.js';
import fetchProviders from '../global-functions/fetchProviders.js';
import fetchReferenceSource from '../global-functions/fetchReferenceSource.js';
import fetchSelectedTags from '../global-functions/fetchSelectedTags.js';
import getSelectedTagColor from '../global-functions/getSelectedTagColor.js';
import patientPagination from '../global-functions/patientPagination.js';
import setPatientApplyFilter from '../global-functions/setPatientApplyFilter.js';
import setPatientResetFilter from '../global-functions/setPatientResetFilter.js';
import palettes from '../themes/palettes.js';
import * as Utils from '../utils/index.js';
import Breakpoints from '../utils/Breakpoints.js';
import * as DateUtils from '../utils/DateUtils.js';
import * as StyleSheet from '../utils/StyleSheet.js';
import imageSource from '../utils/imageSource.js';
import useIsFocused from '../utils/useIsFocused.js';
import useNavigation from '../utils/useNavigation.js';
import useParams from '../utils/useParams.js';
import useWindowDimensions from '../utils/useWindowDimensions.js';
import debounce from 'lodash.debounce';
import { DeviceEventEmitter } from 'react-native';
import * as Clipboard from "expo-clipboard";
import analytics from '@react-native-firebase/analytics';

// import crashlytics from '@react-native-firebase/crashlytics';
// import { initializeApp, getApps, getApp } from '@react-native-firebase/app';
// import {
//   getCrashlytics,
//   log,
//   crash,
//   recordError,
//   setUserId,
// } from '@react-native-firebase/crashlytics';


// // 🔹 Get Crashlytics instance safely
// const crashlytics = getCrashlytics(getApp());
// console.log('=== crashlytics ===',crashlytics);

import {
  encodeQueryParam,
  renderParam,
  renderQueryString,
} from '../utils/encodeQueryParam.js';
import getTextColor from '../global-functions/getColor.js';
import { showToast } from '../global-functions/showToast.js';
import { logEvent } from '../global-functions/analyticsService.js';
import { logError } from '../index.js';
import { checkInternetAndProceed } from '../custom-files/InternetConnection.js';
const PatientScreen = props => {
  const { theme } = props;
  const dimensions = useWindowDimensions();
  const navigation = useNavigation();
  const Constants = GlobalVariables.useValues();
  const Variables = Constants;
  const setGlobalVariableValue = GlobalVariables.useSetValue();
  const [clinic, setClinic] = React.useState([]);
  const [globalTags, setGlobalTags] = React.useState([]);
  const [insuranceTypes, setInsuranceTypes] = React.useState([]);
  const [manageCarePlan, setManageCarePlan] = React.useState([]);
  const [numberInputValue, setNumberInputValue] = React.useState('');
  const [patientFilterData, setPatientFilterData] = React.useState({
    insurer: '',
    crm_segment: '',
    last_outcome: '',
    assigned_tags: '',
    preferred_clinic: '',
    is_active_patient: true,
    managed_care_plan: '',
    preferred_provider: '',
    payment_source_type: '',
    latest_referral_source: '',
    latest_sub_referral_source: '',
    preferred_communication_method: '',
    manufacturer_warranty_is_expiring_in_less_than_days: '',
  });
  const [patientLimit, setPatientLimit] = React.useState(10);
  const [patientListData, setPatientListData] = React.useState([]);
  const [patientOffset, setPatientOffset] = React.useState(0);
  const [providers, setProviders] = React.useState([]);
  const [radioButtonFilterValue, setRadioButtonFilterValue] = React.useState(0);
  const [referenceSource, setReferenceSource] = React.useState([]);
  const [searchBarValue, setSearchBarValue] = React.useState('');
  const [selectedAppointmentTypes, setSelectedAppointmentTypes] =
    React.useState('');
  const [selectedClinic, setSelectedClinic] = React.useState('');
  const [selectedCommunication_method, setSelectedCommunication_method] =
    React.useState('');
  const [selectedCrm_segment, setSelectedCrm_segment] = React.useState('');
  const [selectedID, setSelectedID] = React.useState('');
  const [selectedInsuranceTypes, setSelectedInsuranceTypes] =
    React.useState('');
  const [selectedLast_outcome, setSelectedLast_outcome] = React.useState('');
  const [selectedManageCarePlan, setSelectedManageCarePlan] =
    React.useState('');
  const [selectedPayment_source_type, setSelectedPayment_source_type] =
    React.useState('');
  const [selectedProvider, setSelectedProvider] = React.useState('');
  const [selectedReferenceSource, setSelectedReferenceSource] =
    React.useState('');
  const [selectedSubReferenceSource, setSelectedSubReferenceSource] =
    React.useState('');
  const [selectedTab, setSelectedTab] = React.useState('tab1');
  const [selectedTags, setSelectedTags] = React.useState([]);
  const [selectedWarranty, setSelectedWarranty] = React.useState('');
  const [starRatingValue, setStarRatingValue] = React.useState(0);
  const [subReferenceSource, setSubReferenceSource] = React.useState([]);
  const [textInputValue, setTextInputValue] = React.useState('');
  const [toggleFilter, setToggleFilter] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isFetching, setIsFetching] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [isApiCalling, setIsApiCalling] = React.useState(false);

  const requestIdRef = React.useRef(0);
  const abortControllerRef = React.useRef(null);

  const formatPhoneNumber = phoneNumber => {
    // Type the code for the body of your function or hook here.
    // Functions can be triggered via Button/Touchable actions.
    // Hooks are run per ReactJS rules.

    /* String line breaks are accomplished with backticks ( example: `line one
line two` ) and will not work with special characters inside of quotes ( example: "line one line two" ) */

    if (phoneNumber.length === 10) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(
        3,
        6
      )}-${phoneNumber.slice(6)}`;
    }
    return phoneNumber; // Or handle other lengths as needed
  };
  React.useEffect(() => {
    const handler = async () => {
      try {
        setRadioButtonFilterValue(true);
        const isConnected = await checkInternetAndProceed();
        if (!isConnected) {
          return;
        }

        const AllGlobalTags = (
          await SunoApi.getGlobalTagsGET(Constants, {
            limit: 300,
            type: 'Patient',
          })
        )?.json;
        setGlobalTags(AllGlobalTags);
        const allProviderData = (
          await SunoApi.getProvidersGET(Constants, {
            is_active: true,
            limit: 300,
            query:
              '{id,touchpoint_notifications_enabled,scheduler_select_all_staff,scheduler_persist_per_clinic,last_name,non_npi_id_qualifier,npi,role,patient_arrived_sound_enabled,user_preferences,first_name,task_is_assigned_notifications_enabled,signature,photo,title,suffix,license_number,user_reminder_notifications_enabled,suno_comms_id,date_joined,payment_request_notifications_enabled,is_active,fax_phone,full_name,last_login,user_permissions,non_npi_id,onboarding_form_notifications_enabled,name,color,noah_username,groups{id,name,permissions},email,clinics{id,name,timezone,noah_provider,noah_alias,noah_tenant_id},default_clinic{id,name,timezone},can_see_manufacturer_cost}',
          })
        )?.json;
        const providersData = fetchProviders(allProviderData);
        setProviders(providersData);
        const allInsurenceData = (
          await SunoApi.getInsurersGET(Constants, {
            country: 'United States of America',
            is_active: true,
            limit: 300,
            offset: 0,
            query: '{*}',
          })
        )?.json;
        const insurenceData = fetchInsurance(allInsurenceData);
        setInsuranceTypes(insurenceData);
        const AllClinicData = (
          await SunoApi.getClinicGET(Constants, {
            ordering: 'name',
            query:
              '{id,name,logo,display_name,extra{billng_street_address_1,billng_street_address_2,billng_city,billng_state,billng_zip,billng_phone},street_address_1,street_address_2,city,state,zip_code,phone,region{id},practice{id,logo,name}}',
            region: Constants['UserInfo']?.default_clinic?.region?.id,
            user: Constants['UserInfo']?.id,
          })
        )?.json;
        const ClinicData = fetchClinic(AllClinicData);
        setClinic(ClinicData);
        const AllReferernceData = (
          await SunoApi.getReferenceSourceGET(Constants, {
            parent__isnull: true,
            query: '{-children}',
          })
        )?.json;
        const referernceData = fetchReferenceSource(AllReferernceData, 1);
        const AllSubReferernceData = (
          await SunoApi.getReferenceSourceGET(Constants, {
            parent__isnull: false,
            query: '{-children}',
          })
        )?.json;
        const subReferernceData = fetchReferenceSource(AllSubReferernceData, 2);
        const AllManageCarePlanData = (
          await SunoApi.getManageCarePlanGET(Constants, {
            is_active: true,
            limit: 300,
          })
        )?.json;
        const manageCarePlanData = fetchManageCarePlan(AllManageCarePlanData);
        setManageCarePlan(manageCarePlanData);
        setReferenceSource(referernceData);
        setSubReferenceSource(subReferernceData);
      } catch (err) {
        console.log(err);
      }
    };
    handler();
  }, []);

  const debouncedSearch = useCallback(
    debounce((value) => {
      // setPatientListData([]);
      setSearchValue(value.toLowerCase());

    }, 600), // delay 600ms
    []
  );

  const handleTextChange = (text) => {
    setTextInputValue(text);
    debouncedSearch(text.toLowerCase());
  };

  React.useEffect(() => {
    if (searchValue === undefined) return;
    // console.log("====== searchValue: ", searchValue, textInputValue)
    setIsLoading(true);
  }, [searchValue]);

  React.useEffect(() => {
    let timer;

    if (isLoading) {
      timer = setTimeout(() => {
        if (!isApiCalling);
        setIsLoading(false);
        // console.log("Loader hidden after 4 seconds");
      }, Platform.OS == 'android' ? 6000 : 6000);
    }

    return () => clearTimeout(timer);
  }, [isLoading]);

  React.useEffect(() => {

    const fetchPatients = async () => {
      try {
        // Cancel old request if still pending
        //   if (abortControllerRef.current) {
        //     abortControllerRef.current.abort();
        //   }

        //   const controller = new AbortController();
        //   abortControllerRef.current = controller;

        //   setIsLoading(true);

        //   const patientData = (
        //     await SunoApi.getPatientsGET(Constants, {
        //     limit: patientLimit.toString(),
        //     offset: '0',
        //     ordering: 'next_appointment,last_name,first_name,id',
        //     assigned_tags : patientFilterData?.assigned_tags,
        //     crm_segment: patientFilterData?.crm_segment,

        //     insurer:patientFilterData?.insurer,
        //     is_active : patientFilterData?.is_active_patient,
        //     last_outcome : patientFilterData?.last_outcome,
        //     latest_referral_source : 
        //       patientFilterData?.latest_referral_source,
        //     latest_sub_referral_source : 
        //       patientFilterData?.latest_sub_referral_source
        //     ,
        //     managed_care_plan: patientFilterData?.managed_care_plan,
        //     manufacturer_warranty_is_expiring_in_less_than_days :
        //       patientFilterData?.manufacturer_warranty_is_expiring_in_less_than_days
        //     ,
        //     payment_source_type : patientFilterData?.payment_source_type,
        //     preferred_clinic : patientFilterData?.preferred_clinic,
        //     preferred_communication_method :
        //       patientFilterData?.preferred_communication_method,
        //     preferred_provider: patientFilterData?.preferred_provider,
        //     query:
        //       '{id,first_name,middle_name,last_name,box_folder_id,preferred_clinic{id,name},patient_responsibility_balance,balance,available_credit,insurer_responsibility_balance,managed_care_responsibility_balance,full_name,photo,birthdate,age_years,phone,assigned_tags{id,tag,description,expires_at},previous_appointment{id,type{name},status,start_moment,clinic{timezone},staff_member{first_name,last_name}},next_appointment{id,type{name},status,start_moment,clinic{name,timezone},staff_member{first_name,last_name}}}',
        //     search : searchValue
        //   })
        // )?.json;

        //   console.log("==patientData : ",patientData.length)

        // const res = await fetch(`${Constants.API_BASE_URL}/patients?${params.toString()}`, {
        //   method: 'GET', 
        //   headers: {
        //     Accept: 'application/json',
        //     Authorization: Constants['AUTH_HEADER'],
        //     'Content-Type': 'application/json',
        //   },
        //   signal: controller.signal,
        // });
        // console.log("== : ",res)

        // if (!res.ok) throw new Error('Network error');
        // const json = await res.json();
        const isConnected = await checkInternetAndProceed();
        if (!isConnected) {
          return;
        }
        setIsApiCalling(true)
        const paramsDict = {};

        // 🔹 Required base params
        paramsDict['offset'] = '0';
        paramsDict['ordering'] = 'next_appointment,last_name,first_name,id';
        paramsDict['limit'] = patientLimit;
        paramsDict['query'] =
          '{id,first_name,middle_name,last_name,box_folder_id,preferred_clinic{id,name},patient_responsibility_balance,balance,available_credit,insurer_responsibility_balance,managed_care_responsibility_balance,full_name,photo,birthdate,age_years,phone,assigned_tags{id,tag,description,expires_at},previous_appointment{id,type{name},status,start_moment,clinic{timezone},staff_member{first_name,last_name}},next_appointment{id,type{name},status,start_moment,clinic{name,timezone},staff_member{first_name,last_name}}}';

        // 🔹 Optional filters (only append if defined)
        if (patientFilterData?.assigned_tags !== undefined) {
          paramsDict['assigned_tags'] = renderParam(patientFilterData.assigned_tags);
        }
        if (patientFilterData?.crm_segment !== undefined) {
          paramsDict['crm_segment'] = renderParam(patientFilterData.crm_segment);
        }
        if (patientFilterData?.insurer !== undefined) {
          paramsDict['insurer'] = renderParam(patientFilterData.insurer);
        }
        if (patientFilterData?.is_active_patient !== undefined) {
          paramsDict['is_active'] = renderParam(patientFilterData.is_active_patient);
        }
        if (patientFilterData?.last_outcome !== undefined) {
          paramsDict['last_outcome'] = renderParam(patientFilterData.last_outcome);
        }
        if (patientFilterData?.latest_referral_source !== undefined) {
          paramsDict['latest_referral_source'] = renderParam(
            patientFilterData.latest_referral_source
          );
        }
        if (patientFilterData?.latest_sub_referral_source !== undefined) {
          paramsDict['latest_sub_referral_source'] = renderParam(
            patientFilterData.latest_sub_referral_source
          );
        }
        if (patientFilterData?.managed_care_plan !== undefined) {
          paramsDict['managed_care_plan'] = renderParam(patientFilterData.managed_care_plan);
        }
        if (
          patientFilterData?.manufacturer_warranty_is_expiring_in_less_than_days !== undefined
        ) {
          paramsDict['manufacturer_warranty_is_expiring_in_less_than_days'] = renderParam(
            patientFilterData.manufacturer_warranty_is_expiring_in_less_than_days
          );
        }
        if (patientFilterData?.payment_source_type !== undefined) {
          paramsDict['payment_source_type'] = renderParam(
            patientFilterData.payment_source_type
          );
        }
        if (patientFilterData?.preferred_clinic !== undefined) {
          paramsDict['preferred_clinic'] = renderParam(patientFilterData.preferred_clinic);
        }
        if (patientFilterData?.preferred_communication_method !== undefined) {
          paramsDict['preferred_communication_method'] = renderParam(
            patientFilterData.preferred_communication_method
          );
        }
        if (patientFilterData?.preferred_provider !== undefined) {
          paramsDict['preferred_provider'] = renderParam(patientFilterData.preferred_provider);
        }

        // 🔹 Search term (if blank, fetch all)
        if (textInputValue !== undefined && textInputValue !== null) {
          paramsDict['search'] = renderParam(textInputValue);
        }

        // console.log("====paramsDict['search']  : ",paramsDict['search'] = renderParam(textInputValue))
        // const params = new URLSearchParams({
        //   offset: '0',
        //   ordering: 'next_appointment,last_name,first_name,id',
        //   limit: patientLimit,
        //   assigned_tags : patientFilterData?.assigned_tags,
        //   crm_segment: patientFilterData?.crm_segment,

        //   insurer:patientFilterData?.insurer,
        //   is_active : patientFilterData?.is_active_patient,
        //   last_outcome : patientFilterData?.last_outcome,
        //   latest_referral_source : 
        //     patientFilterData?.latest_referral_source,
        //   latest_sub_referral_source : 
        //     patientFilterData?.latest_sub_referral_source
        //   ,
        //   managed_care_plan: patientFilterData?.managed_care_plan,
        //   manufacturer_warranty_is_expiring_in_less_than_days :
        //     patientFilterData?.manufacturer_warranty_is_expiring_in_less_than_days
        //   ,
        //   payment_source_type : patientFilterData?.payment_source_type,
        //   preferred_clinic : patientFilterData?.preferred_clinic,
        //   preferred_communication_method :
        //     patientFilterData?.preferred_communication_method,
        //   preferred_provider: patientFilterData?.preferred_provider,
        //   query:
        //     '{id,first_name,middle_name,last_name,box_folder_id,preferred_clinic{id,name},patient_responsibility_balance,balance,available_credit,insurer_responsibility_balance,managed_care_responsibility_balance,full_name,photo,birthdate,age_years,phone,assigned_tags{id,tag,description,expires_at},previous_appointment{id,type{name},status,start_moment,clinic{timezone},staff_member{first_name,last_name}},next_appointment{id,type{name},status,start_moment,clinic{name,timezone},staff_member{first_name,last_name}}}',
        //   search : textInputValue
        // });

        // optional filters — add them only if they exist
        //   params.append('assigned_tags', patientFilterData.assigned_tags);
        //   params.append('crm_segment', patientFilterData.crm_segment);
        //   params.append('insurer', patientFilterData.insurer);
        //   params.append('is_active', patientFilterData.is_active_patient);
        //   params.append('last_outcome', patientFilterData.last_outcome);
        //   params.append(
        //     'latest_referral_source',
        //     patientFilterData.latest_referral_source
        //   );
        //   params.append(
        //     'latest_sub_referral_source',
        //     patientFilterData.latest_sub_referral_source
        //   );
        //   params.append('managed_care_plan', patientFilterData.managed_care_plan);

        //   params.append(
        //     'manufacturer_warranty_is_expiring_in_less_than_days',
        //     patientFilterData.manufacturer_warranty_is_expiring_in_less_than_days
        //   );
        //   params.append(
        //     'payment_source_type',
        //     patientFilterData.payment_source_type
        //   );
        //   params.append('preferred_clinic', patientFilterData.preferred_clinic);
        //   params.append(
        //     'preferred_communication_method',
        //     patientFilterData.preferred_communication_method
        //   );
        //   params.append('preferred_provider', patientFilterData.preferred_provider);

        // // GraphQL-like query param (as in your original code)
        // params.append(
        //   'query',
        //   '{id,first_name,middle_name,last_name,box_folder_id,preferred_clinic{id,name},patient_responsibility_balance,balance,available_credit,insurer_responsibility_balance,managed_care_responsibility_balance,full_name,photo,birthdate,age_years,phone,assigned_tags{id,tag,description,expires_at},previous_appointment{id,type{name},status,start_moment,clinic{timezone},staff_member{first_name,last_name}},next_appointment{id,type{name},status,start_moment,clinic{name,timezone},staff_member{first_name,last_name}}}'
        // );

        // 🧠 if search is blank, fetch all; otherwise filter
        // if (searchValue?.trim()) {
        //   params.append('search', searchValue.trim());
        // }

        // ✅ Build URL
        // const url = `${Constants.API_BASE_URL}/patients?${params.toString()}`;

        const url = `${Constants.API_BASE_URL}/patients/${renderQueryString(
          paramsDict
        )}`;
        // console.log('📡 Fetching:', paramsDict);

        // ✅ Abort old request if still running
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

        // ✅ Log detailed response if not OK
        if (!res.ok) {
          const text = await res.text();
          // logError('❌ API Error:', res.status, text);
          throw new Error('Network error');
        }

        const json = await res.json();
        // console.log("===== json :", json?.results?.length)
        const patientData = json?.results ?? [];
        if (textInputValue !== undefined && textInputValue !== null) {
          await logEvent('patient_search', {
            search_type: textInputValue || '',
            results_count: json?.results?.length ?? 0
          });
          // await analytics().logEvent('patient_search', {

          // });
        }

        // console.log("===== json :", json?.results?.length)

        setPatientListData(patientData);
        setIsLoading(false);
        setIsFetching(false);
        setIsApiCalling(false);
        await setGlobalVariableValue({
          key: 'patientOffsetFilter',
          value:
            Constants['patientOffsetFilter'] + patientLimit,
        });
        // setPatientListData(patientData.results ?? []);
        // console.log("===== patientData json :", patientData?.length)

      } catch (err) {
        if (err.name === 'AbortError') {
          // console.log('❌ Request cancelled:', textInputValue);
        } else {
          // logError('Error fetching patients:', err);
        }
      } finally {
        setIsLoading(false);
        setIsFetching(false);
        setRefreshing(false);
        setIsApiCalling(false);
        // console.log("===== finally :")

      }
    };
    fetchPatients();

    const subscription = DeviceEventEmitter.addListener(
      'reloadPatientData',
      () => {
        // console.log("======= subscription : ")
        fetchPatients();
      }
    );

    return () => subscription.remove();

  }, [textInputValue, refreshing, patientFilterData]);


  const fetchPatientsFilter = async (patientFilterData) => {
    try {

      const paramsDict = {};

      // 🔹 Required base params
      paramsDict['offset'] = '0';
      paramsDict['ordering'] = 'next_appointment,last_name,first_name,id';
      paramsDict['limit'] = patientLimit;
      paramsDict['query'] =
        '{id,first_name,middle_name,last_name,box_folder_id,preferred_clinic{id,name},patient_responsibility_balance,balance,available_credit,insurer_responsibility_balance,managed_care_responsibility_balance,full_name,photo,birthdate,age_years,phone,assigned_tags{id,tag,description,expires_at},previous_appointment{id,type{name},status,start_moment,clinic{timezone},staff_member{first_name,last_name}},next_appointment{id,type{name},status,start_moment,clinic{name,timezone},staff_member{first_name,last_name}}}';

      // 🔹 Optional filters (only append if defined)
      if (patientFilterData?.assigned_tags !== undefined) {
        paramsDict['assigned_tags'] = renderParam(patientFilterData.assigned_tags);
      }
      if (patientFilterData?.crm_segment !== undefined) {
        paramsDict['crm_segment'] = renderParam(patientFilterData.crm_segment);
      }
      if (patientFilterData?.insurer !== undefined) {
        paramsDict['insurer'] = renderParam(patientFilterData.insurer);
      }
      if (patientFilterData?.is_active_patient !== undefined) {
        paramsDict['is_active'] = renderParam(patientFilterData.is_active_patient);
      }
      if (patientFilterData?.last_outcome !== undefined) {
        paramsDict['last_outcome'] = renderParam(patientFilterData.last_outcome);
      }
      if (patientFilterData?.latest_referral_source !== undefined) {
        paramsDict['latest_referral_source'] = renderParam(
          patientFilterData.latest_referral_source
        );
      }
      if (patientFilterData?.latest_sub_referral_source !== undefined) {
        paramsDict['latest_sub_referral_source'] = renderParam(
          patientFilterData.latest_sub_referral_source
        );
      }
      if (patientFilterData?.managed_care_plan !== undefined) {
        paramsDict['managed_care_plan'] = renderParam(patientFilterData.managed_care_plan);
      }
      if (
        patientFilterData?.manufacturer_warranty_is_expiring_in_less_than_days !== undefined
      ) {
        paramsDict['manufacturer_warranty_is_expiring_in_less_than_days'] = renderParam(
          patientFilterData.manufacturer_warranty_is_expiring_in_less_than_days
        );
      }
      if (patientFilterData?.payment_source_type !== undefined) {
        paramsDict['payment_source_type'] = renderParam(
          patientFilterData.payment_source_type
        );
      }
      if (patientFilterData?.preferred_clinic !== undefined) {
        paramsDict['preferred_clinic'] = renderParam(patientFilterData.preferred_clinic);
      }
      if (patientFilterData?.preferred_communication_method !== undefined) {
        paramsDict['preferred_communication_method'] = renderParam(
          patientFilterData.preferred_communication_method
        );
      }
      if (patientFilterData?.preferred_provider !== undefined) {
        paramsDict['preferred_provider'] = renderParam(patientFilterData.preferred_provider);
      }

      // 🔹 Search term (if blank, fetch all)
      if (textInputValue !== undefined && textInputValue !== null) {
        paramsDict['search'] = renderParam(textInputValue);
      }
      // ✅ Build URL
      // const url = `${Constants.API_BASE_URL}/patients?${params.toString()}`;
      const url = `${Constants.API_BASE_URL}/patients/${renderQueryString(
        paramsDict
      )}`;
      console.log('📡 Fetching:', url);


      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: Constants.AUTH_HEADER,
          'Content-Type': 'application/json',
        },
        // signal: controller.signal,
      });

      // ✅ Log detailed response if not OK
      if (!res.ok) {
        const text = await res.text();
        logError('❌ API Error:', res.status, text);
        throw new Error('Network error');
      }

      const json = await res.json();
      const patientData = json?.results ?? [];
      // console.log("===== Data : ",patientData )
      setPatientListData(patientData);
      setIsLoading(false);
      setIsFetching(false);
      await setGlobalVariableValue({
        key: 'patientOffsetFilter',
        value:
          Constants['patientOffsetFilter'] + patientLimit,
      });
      // setPatientListData(patientData.results ?? []);

    } catch (err) {
      console.log('❌ err:', err);
      if (err.name === 'AbortError') {
        // console.log('❌ Request cancelled:', textInputValue);
      } else {
        // logError('Error fetching patients:', err);
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false)
    }
  };

  return (
    <ScreenContainer
      scrollable={false}
      hasBottomSafeArea={false}
      hasSafeArea={false}
      hasTopSafeArea={true}
      style={StyleSheet.applyWidth(
        {
          backgroundColor: palettes.App['Custom Color_15'],
          justifyContent: 'space-between',
        },
        dimensions.width
      )}
    >
      {/* Patient */}
      <>
        {toggleFilter === true ? null : (
          <View
            style={StyleSheet.applyWidth(
              { backgroundColor: palettes.App['Custom Color_15'], flex: 1 },
              dimensions.width
            )}
          >
            <CustomHeaderBlock />
            <View
              style={StyleSheet.applyWidth(
                { backgroundColor: palettes.App.White, flex: 1, marginTop: 5 },
                dimensions.width
              )}
            >
              {/* Search And Filter */}
              <View
                style={StyleSheet.applyWidth(
                  {
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginTop: 10,
                    paddingBottom: 16,
                    paddingLeft: 16,
                    paddingRight: 16,
                    paddingTop: 16,
                    width: '100%',
                  },
                  dimensions.width
                )}
              >
                <View
                  style={StyleSheet.applyWidth({ flex: 1 }, dimensions.width)}
                >
                  <Surface
                    elevation={3}
                    style={StyleSheet.applyWidth(
                      {
                        alignItems: 'center',
                        backgroundColor: palettes.Brand.Surface,
                        borderRadius: 12,
                        flex: 1,
                        flexDirection: 'row',
                        height: 48,
                        justifyContent: 'space-between',
                        minHeight: 48,
                        paddingRight: 16,
                      },
                      dimensions.width
                    )}
                  >
                    <Icon
                      size={20}
                      color={palettes.App.TextPlaceholder}
                      name={'Feather/search'}
                      style={StyleSheet.applyWidth(
                        { left: 12 },
                        dimensions.width
                      )}
                    />
                    <TextInput
                      autoCapitalize={'none'}
                      // autoCorrect={true}
                      // changeTextDelay={500}
                      onChangeText={handleTextChange}

                      // onChangeText={newTextInputValue => {
                      //   try {
                      //     setTextInputValue(newTextInputValue);
                      //   } catch (err) {
                      //     console.log(err);
                      //   }
                      // }}
                      webShowOutline={true}
                      placeholder={'Search patients by name, phone...'}
                      placeholderTextColor={palettes.App.TextPlaceholder}
                      style={StyleSheet.applyWidth(
                        {
                          borderRadius: 8,
                          color: theme.colors.text.medium,
                          fontFamily: 'Inter_400Regular',
                          fontSize: 14,
                          height: 48,
                          paddingBottom: 8,
                          paddingLeft: 12,
                          paddingRight: 0,
                          paddingTop: 8,
                          width: '90%',
                        },
                        dimensions.width
                      )}
                      value={textInputValue}
                    />
                  </Surface>
                </View>
                {/* View 2 */}
                <View
                  style={StyleSheet.applyWidth(
                    { marginLeft: 12 },
                    dimensions.width
                  )}
                >
                  <Surface
                    {...GlobalStyles.SurfaceStyles(theme)['Surface'].props}
                    elevation={3}
                    style={StyleSheet.applyWidth(
                      StyleSheet.compose(
                        GlobalStyles.SurfaceStyles(theme)['Surface'].style,
                        {
                          alignItems: 'center',
                          borderRadius: 8,
                          justifyContent: 'center',
                          minHeight: 48,
                          paddingLeft: 9,
                          paddingRight: 9,
                        }
                      ),
                      dimensions.width
                    )}
                  >
                    <Touchable
                      onPress={() => {
                        try {
                          setToggleFilter(true);
                        } catch (err) {
                          console.log(err);
                        }
                      }}
                    >
                      <Icon
                        color={palettes.App.TextPlaceholder}
                        name={'AntDesign/filter'}
                        size={26}
                      />
                    </Touchable>
                  </Surface>
                </View>
              </View>

              <Pressable
                onPress={() => {
                  try {
                    navigation.navigate('NewPatientScreen', {}, { pop: true });
                  } catch (err) {
                    console.log(err);

                  }
                }}
              >
                <View
                  style={StyleSheet.applyWidth(
                    {
                      alignItems: 'center',
                      backgroundColor: theme.colors.branding.secondary,
                      borderRadius: 7,
                      flexDirection: 'row',
                      height: 40,
                      justifyContent: 'center',
                      margin: 16,
                      paddingLeft: 16,
                      paddingRight: 16,
                    },
                    dimensions.width
                  )}
                >
                  <Icon
                    color={theme.colors.background.base}
                    name={'Feather/plus'}
                    size={20}
                    style={StyleSheet.applyWidth(
                      { marginRight: 7 },
                      dimensions.width
                    )}
                  />
                  <Text
                    accessible={true}
                    selectable={false}
                    {...GlobalStyles.TextStyles(theme)['Text 2'].props}
                    style={StyleSheet.applyWidth(
                      StyleSheet.compose(
                        GlobalStyles.TextStyles(theme)['Text 2'].style,
                        theme.typography.body1,
                        {
                          color: theme.colors.background.base,
                          fontFamily: 'Inter_500Medium',
                          fontSize: 15,
                        }
                      ),
                      dimensions.width
                    )}
                  >
                    {'New Patient'}
                  </Text>
                </View>
              </Pressable>
              {/* Patient */}
              <View
                style={StyleSheet.applyWidth(
                  {
                    backgroundColor: palettes.App['Custom Color_15'],
                    flex: 1,
                    paddingLeft: 16,
                    paddingRight: 16,
                    paddingTop: 16,
                    width: '100%',
                  },
                  dimensions.width
                )}
              >
                <SunoApi.FetchGetPatientsGET
                  assigned_tags={patientFilterData?.assigned_tags}
                  crm_segment={patientFilterData?.crm_segment}
                  // handlers={{
                  //   onData: fetchData => {
                  //     const handler = async () => {
                  //       try {

                  //         if (abortControllerRef.current) {
                  //           abortControllerRef.current.abort();
                  //         }
                  //         const controller = new AbortController();
                  //         abortControllerRef.current = controller;

                  //         const currentRequest = ++requestIdRef.current;
                  //         console.log("Request start:", currentRequest, "=> latest so far:", requestIdRef.current, "=> search:", textInputValue);

                  //         const patientData = fetchData?.results ?? [];
                  //         // Optional: simulate slow network
                  //         // await new Promise(resolve => setTimeout(resolve, 1500));

                  //         if (controller.signal.aborted) return; // if canceled, skip update

                  //         if (currentRequest === requestIdRef.current) {
                  //           setPatientListData(patientData);
                  //           setIsLoading(false);
                  //           setIsFetching(false);
                  //         }

                  //         await setGlobalVariableValue({
                  //           key: 'patientOffsetFilter',
                  //           value:
                  //             Constants['patientOffsetFilter'] + patientLimit,
                  //         });
                  //       } catch (err) {
                  //         console.log(err);
                  //       }
                  //     };
                  //     handler();
                  //   },
                  // }}
                  insurer={patientFilterData?.insurer}
                  is_active={patientFilterData?.is_active_patient}
                  last_outcome={patientFilterData?.last_outcome}
                  latest_referral_source={
                    patientFilterData?.latest_referral_source
                  }
                  latest_sub_referral_source={
                    patientFilterData?.latest_sub_referral_source
                  }
                  limit={patientLimit}
                  managed_care_plan={patientFilterData?.managed_care_plan}
                  manufacturer_warranty_is_expiring_in_less_than_days={
                    patientFilterData?.manufacturer_warranty_is_expiring_in_less_than_days
                  }
                  offset={0}
                  ordering={'next_appointment,last_name,first_name,id'}
                  payment_source_type={patientFilterData?.payment_source_type}
                  preferred_clinic={patientFilterData?.preferred_clinic}
                  preferred_communication_method={
                    patientFilterData?.preferred_communication_method
                  }
                  preferred_provider={patientFilterData?.preferred_provider}
                  query={
                    '{id,first_name,middle_name,last_name,box_folder_id,preferred_clinic{id,name},patient_responsibility_balance,balance,available_credit,insurer_responsibility_balance,managed_care_responsibility_balance,full_name,photo,birthdate,age_years,phone,assigned_tags{id,tag,description,expires_at},previous_appointment{id,type{name},status,start_moment,clinic{timezone},staff_member{first_name,last_name}},next_appointment{id,type{name},status,start_moment,clinic{name,timezone},staff_member{first_name,last_name}}}'
                  }
                  search={searchValue}
                >
                  {({ loading, error, data, refetchGetPatients }) => {
                    const fetchData = data?.json;
                    // console.log("==== loading :", isLoading && patientListData.length === 0)
                    if (loading) {
                      return <ActivityIndicator size="large" color={theme.colors.branding.secondary} />;
                    }

                    if (error || data?.status < 200 || data?.status >= 300) {
                      return <ActivityIndicator size="large" color={theme.colors.branding.secondary} />;
                    }
                    if (isLoading) {
                      return <ActivityIndicator size="large" color={theme.colors.branding.secondary} />;
                    }
                    const showLoader = loading && patientListData.length === 0;
                    if (loading && patientListData.length > 0 && !isFetching) {
                      setIsFetching(true);
                    }
                    return (

                      <>
                        {showLoader ? (
                          <ActivityIndicator size="large" />
                        ) : (
                          <FlatList
                            data={patientListData}
                            horizontal={false}
                            inverted={false}
                            keyExtractor={(listData, index) =>
                              listData?.id ??
                              listData?.uuid ??
                              index?.toString() ??
                              JSON.stringify(listData)
                            }
                            onRefresh={() => setRefreshing(true)}
                            refreshing={refreshing}
                            keyboardShouldPersistTaps={'never'}
                            listKey={'Patient->View->Patient->Fetch->List'}
                            numColumns={1}
                            ListEmptyComponent={
                              !isFetching && !isLoading ? (
                                <View
                                  style={{
                                    flex: 1,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    paddingVertical: 40,
                                  }}
                                >
                                  <Text style={{ fontSize: 16, color: '#6B7280' }}>No patients found</Text>
                                </View>) : null
                            }
                            onEndReached={() => {
                              const handler = async () => {
                                try {
                                  const patientData = (
                                    await SunoApi.getPatientsGET(Constants, {
                                      assigned_tags:
                                        patientFilterData?.assigned_tags,
                                      crm_segment: patientFilterData?.crm_segment,
                                      insurer: patientFilterData?.insurer,
                                      is_active:
                                        patientFilterData?.is_active_patient,
                                      last_outcome:
                                        patientFilterData?.last_outcome,
                                      latest_referral_source:
                                        patientFilterData?.latest_referral_source,
                                      latest_sub_referral_source:
                                        patientFilterData?.latest_sub_referral_source,
                                      limit: patientLimit,
                                      managed_care_plan:
                                        patientFilterData?.managed_care_plan,
                                      manufacturer_warranty_is_expiring_in_less_than_days:
                                        patientFilterData?.manufacturer_warranty_is_expiring_in_less_than_days,
                                      offset: Constants['patientOffsetFilter'],
                                      ordering:
                                        'next_appointment,last_name,first_name,id',
                                      payment_source_type:
                                        patientFilterData?.payment_source_type,
                                      preferred_clinic:
                                        patientFilterData?.preferred_clinic,
                                      preferred_communication_method:
                                        patientFilterData?.preferred_communication_method,
                                      preferred_provider:
                                        patientFilterData?.preferred_provider,
                                      query:
                                        '{id,first_name,middle_name,last_name,box_folder_id,preferred_clinic{id,name},patient_responsibility_balance,balance,available_credit,insurer_responsibility_balance,managed_care_responsibility_balance,full_name,photo,birthdate,age_years,phone,assigned_tags{id,tag,description,expires_at},previous_appointment{id,type{name},status,start_moment,clinic{timezone},staff_member{first_name,last_name}},next_appointment{id,type{name},status,start_moment,clinic{name,timezone},staff_member{first_name,last_name}}}',
                                      search: textInputValue,
                                    })
                                  )?.json;
                                  // console.log("====== patientData?.results : ",patientData?.results)
                                  const patientPagingData = patientData?.results;
                                  const allPatientData = patientPagination(
                                    patientPagingData,
                                    patientListData
                                  );
                                  setPatientListData(allPatientData);
                                  await setGlobalVariableValue({
                                    key: 'patientOffsetFilter',
                                    value:
                                      patientLimit +
                                      Constants['patientOffsetFilter'],
                                  });
                                } catch (err) {
                                  console.log(err);
                                }
                              };
                              handler();
                            }}
                            renderItem={({ item, index }) => {
                              const listData = item;
                              return (
                                <>
                                  {/* Record */}
                                  <Touchable
                                    style={StyleSheet.applyWidth(
                                      { width: '100%' },
                                      dimensions.width
                                    )}
                                  />
                                  <Surface
                                    elevation={3}
                                    style={StyleSheet.applyWidth(
                                      {
                                        borderColor: palettes.App.ViewBG,
                                        borderLeftWidth: 1,
                                        borderRadius: 12,
                                        borderRightWidth: 1,
                                        flex: 1,
                                        marginBottom: 20,
                                        marginTop: 10,
                                        minHeight: 40,
                                        paddingBottom: 10,
                                        paddingTop: 10,
                                        width: '100%',
                                      },
                                      dimensions.width
                                    )}
                                  >
                                    <Touchable
                                      onPress={() => {
                                        try {
                                          navigation.push(
                                            'PatientDetailsScreen',
                                            {
                                              id: listData?.id,
                                              clientID: listData?.preferred_clinic?.id,
                                              box_folder_id:
                                                listData?.box_folder_id,
                                            }
                                          );
                                        } catch (err) {
                                          console.log(err);
                                        }
                                      }}
                                    >
                                      <View
                                        style={StyleSheet.applyWidth(
                                          {
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            paddingLeft: 16,
                                            paddingRight: 16,
                                          },
                                          dimensions.width
                                        )}
                                      >
                                        {/* View 3 */}
                                        <View
                                          style={StyleSheet.applyWidth(
                                            { flexDirection: 'row' },
                                            dimensions.width
                                          )}
                                        >
                                          <ExpoImage
                                            allowDownscaling={true}
                                            cachePolicy={'disk'}
                                            contentPosition={'center'}
                                            resizeMode={'cover'}
                                            transitionDuration={300}
                                            transitionEffect={'cross-dissolve'}
                                            transitionTiming={'ease-in-out'}
                                            {...GlobalStyles.ExpoImageStyles(
                                              theme
                                            )['Image'].props}
                                            source={imageSource(
                                              `${listData?.photo === null
                                                ? 'https://master-app.suno.tech/assets/user-CXthF0zB.png'
                                                : listData?.photo
                                              }`
                                            )}
                                            style={StyleSheet.applyWidth(
                                              StyleSheet.compose(
                                                GlobalStyles.ExpoImageStyles(
                                                  theme
                                                )['Image'].style,
                                                {
                                                  height: 60,
                                                  marginRight: 10,
                                                  width: 60,
                                                }
                                              ),
                                              dimensions.width
                                            )}
                                          />
                                          <View
                                            style={StyleSheet.applyWidth(
                                              { flex: 1 },
                                              dimensions.width
                                            )}
                                          >
                                            {/* View 2 */}
                                            <View
                                              style={StyleSheet.applyWidth(
                                                {
                                                  alignItems: 'center',
                                                  flexDirection: 'row',
                                                  justifyContent: 'space-between',
                                                },
                                                dimensions.width
                                              )}
                                            >
                                              <View style={StyleSheet.applyWidth(
                                                {
                                                  alignItems: 'center',
                                                  flexDirection: 'row',
                                                },
                                                dimensions.width
                                              )}>
                                                <Text
                                                  accessible={true}
                                                  selectable={false}
                                                  style={StyleSheet.applyWidth(
                                                    {
                                                      color:
                                                        theme.colors.text.medium,
                                                      fontFamily: 'Inter_500Medium',
                                                      fontSize: 16,
                                                    },
                                                    dimensions.width
                                                  )}
                                                >
                                                  {listData?.full_name}
                                                </Text>
                                                {/* <Touchable
                                                  onPress={async () => {
                                                    try {
                                                      navigation.navigate('EditPatientScreen', { patientInfo: listData }, { pop: true });
                                                    } catch (err) {
                                                      console.log(err);
                                                    }
                                                  }}
                                                >
                                                  <Icon
                                                    color={theme.colors.text.strong}
                                                    name={'MaterialIcons/mode-edit'}
                                                    size={20}
                                                    style={{ marginLeft: 10 }}
                                                  />
                                                </Touchable> */}
                                              </View>
                                              <>
                                                {!dueAmount(
                                                  listData?.patient_responsibility_balance,
                                                  listData?.available_credit
                                                ) ? null : (
                                                  <View
                                                    style={StyleSheet.applyWidth(
                                                      {
                                                        backgroundColor:
                                                          palettes.Amber[200],
                                                        borderRadius: 13,
                                                        opacity: 0.7,
                                                        padding: 7,
                                                      },
                                                      dimensions.width
                                                    )}
                                                  >
                                                    <Text
                                                      accessible={true}
                                                      selectable={false}
                                                      style={StyleSheet.applyWidth(
                                                        {
                                                          color:
                                                            theme.colors.text
                                                              .strong,
                                                          fontFamily:
                                                            'Inter_500Medium',
                                                          fontSize: 11,
                                                        },
                                                        dimensions.width
                                                      )}
                                                    >
                                                      {'$ '}
                                                      {(dueAmount(
                                                        listData?.patient_responsibility_balance,
                                                        listData?.available_credit
                                                      ) || 0).toFixed(2)}
                                                      {' due'}
                                                    </Text>
                                                  </View>
                                                )}
                                              </>
                                            </View>

                                            <View
                                              style={StyleSheet.applyWidth(
                                                { justifyContent: 'flex-start' },
                                                dimensions.width
                                              )}
                                            >
                                              <Text
                                                accessible={true}
                                                selectable={false}
                                                style={StyleSheet.applyWidth(
                                                  {
                                                    color:
                                                      palettes.App
                                                        .TextPlaceholder,
                                                    fontFamily: 'Inter_500Medium',
                                                    fontSize: 13,
                                                    textTransform: 'capitalize',
                                                  },
                                                  dimensions.width
                                                )}
                                              >
                                                {listData?.age_years}
                                                {' yrs • DOB: '}
                                                {listData?.birthdate}
                                                {/* {'\n'} */}
                                              </Text>
                                              {/* Text 2 */}
                                              {/* <Text
                                                accessible={true}
                                                selectable={false}
                                                style={StyleSheet.applyWidth(
                                                  {
                                                    color:
                                                      palettes.App
                                                        .TextPlaceholder,
                                                    fontFamily: 'Inter_500Medium',
                                                    fontSize: 13,
                                                    marginTop: 2,
                                                    textTransform: 'capitalize',
                                                  },
                                                  dimensions.width
                                                )}
                                              >
                                                {formatPhoneNumber(
                                                  listData?.phone
                                                )}
                                              </Text> */}
                                              <View
                                                style={StyleSheet.applyWidth(
                                                  { alignItems: 'center', flexDirection: 'row', marginTop: 2 },
                                                  dimensions.width
                                                )}
                                              >


                                                <Touchable
                                                  onPress={async () => {
                                                    try {
                                                      await callPhoneNumber(listData?.phone);
                                                    } catch (err) {
                                                      console.log(err);
                                                    }
                                                  }}
                                                >
                                                  <Text
                                                    accessible={true}
                                                    selectable={false}
                                                    style={StyleSheet.applyWidth(
                                                      {
                                                        color: palettes.App['Custom Color_18'],
                                                        fontFamily: 'Inter_400Regular',
                                                        fontSize: 13,
                                                      },
                                                      dimensions.width
                                                    )}
                                                  >
                                                    {formatPhoneNumber(listData?.phone)}
                                                  </Text>
                                                </Touchable>

                                                <Touchable
                                                  onPress={async () => {
                                                    try {
                                                      await Clipboard.setStringAsync(formatPhoneNumber(listData?.phone));
                                                      showToast("Copied!");

                                                    } catch (err) {
                                                      console.log(err);
                                                    }
                                                  }}
                                                >
                                                  <Icon
                                                    color={theme.colors.text.strong}
                                                    name={'MaterialIcons/content-copy'}
                                                    size={20}
                                                    style={{ marginLeft: 10 }}
                                                  />
                                                </Touchable>
                                              </View>
                                            </View>
                                            {/* List 2 */}
                                            <SimpleStyleFlatList
                                              data={listData?.assigned_tags}
                                              decelerationRate={'normal'}
                                              inverted={false}
                                              keyExtractor={(list2Data, index) =>
                                                index
                                              }
                                              keyboardShouldPersistTaps={'never'}
                                              listKey={JSON.stringify(
                                                listData?.assigned_tags
                                              )}
                                              nestedScrollEnabled={false}
                                              numColumns={1}
                                              onEndReachedThreshold={0.5}
                                              renderItem={({ item, index }) => {
                                                const list2Data = item;
                                                return (
                                                  <>
                                                    {/* View 2 */}
                                                    <View
                                                      style={StyleSheet.applyWidth(
                                                        {
                                                          alignItems: 'center',
                                                          backgroundColor: [
                                                            {
                                                              minWidth:
                                                                Breakpoints.Mobile,
                                                              value:
                                                                palettes.App
                                                                  .CustomLightGreenColor,
                                                            },
                                                            {
                                                              minWidth:
                                                                Breakpoints.Mobile,
                                                              value:
                                                                list2Data?.tag
                                                                  ?.color,
                                                            },
                                                          ],
                                                          borderRadius: 13,
                                                          flexDirection: 'row',
                                                          gap: 5,
                                                          opacity: 1,
                                                          padding: 7,
                                                        },
                                                        dimensions.width
                                                      )}
                                                    >
                                                      <Text
                                                        accessible={true}
                                                        selectable={false}
                                                        style={StyleSheet.applyWidth(
                                                          {
                                                            color: getTextColor(list2Data?.tag
                                                              ?.color)
                                                            ,
                                                            fontFamily:
                                                              'Inter_400Regular',
                                                            fontSize: 10,
                                                            marginLeft: 5,
                                                            textDecorationColor: [
                                                              {
                                                                minWidth:
                                                                  Breakpoints.Mobile,
                                                                value:
                                                                  palettes.App[
                                                                  'Custom #ffffff'
                                                                  ],
                                                              },
                                                              {
                                                                minWidth:
                                                                  Breakpoints.Mobile,
                                                                value:
                                                                  checkExpiredTags(
                                                                    list2Data?.expires_at
                                                                  )
                                                                    ? palettes
                                                                      .App[
                                                                    'Custom #ffffff'
                                                                    ]
                                                                    : 'rgba(0,0,0,0)',
                                                              },
                                                            ],
                                                            textDecorationLine: [
                                                              {
                                                                minWidth:
                                                                  Breakpoints.Mobile,
                                                                value: 'none',
                                                              },
                                                              {
                                                                minWidth:
                                                                  Breakpoints.Mobile,
                                                                value:
                                                                  checkExpiredTags(
                                                                    list2Data?.expires_at
                                                                  )
                                                                    ? 'line-through'
                                                                    : 'none',
                                                              },
                                                            ],
                                                          },
                                                          dimensions.width
                                                        )}
                                                      >
                                                        {list2Data?.tag?.name}
                                                      </Text>
                                                      {/* <>
                                                      {!list2Data?.tag
                                                        ?.is_active ? null : (
                                                        <Icon
                                                          color={
                                                            palettes.App[
                                                              'Custom #ffffff'
                                                            ]
                                                          }
                                                          name={
                                                            'Entypo/circle-with-cross'
                                                          }
                                                          size={14}
                                                        />
                                                      )}
                                                    </> */}
                                                    </View>
                                                  </>
                                                );
                                              }}
                                              showsHorizontalScrollIndicator={
                                                true
                                              }
                                              showsVerticalScrollIndicator={true}
                                              snapToAlignment={'start'}
                                              horizontal={true}
                                              pagingEnabled={false}
                                              style={StyleSheet.applyWidth(
                                                {
                                                  alignItems: 'center',
                                                  flexDirection: 'row',
                                                  gap: 15,
                                                  marginTop: 7,
                                                  paddingBottom: 2,
                                                },
                                                dimensions.width
                                              )}
                                            />
                                          </View>
                                        </View>
                                        {/* View 4 */}
                                        <View
                                          style={StyleSheet.applyWidth(
                                            {
                                              flexDirection: 'row',
                                              justifyContent: 'space-between',
                                              marginTop: 8,
                                              paddingBottom: 10,
                                            },
                                            dimensions.width
                                          )}
                                        >
                                          {/* View 3 */}
                                          <View
                                            style={StyleSheet.applyWidth(
                                              { flex: 1 },
                                              dimensions.width
                                            )}
                                          >
                                            {/* Text 2 */}
                                            <Text
                                              accessible={true}
                                              selectable={false}
                                              style={StyleSheet.applyWidth(
                                                {
                                                  color:
                                                    palettes.App.TextPlaceholder,
                                                  fontFamily: 'Inter_400Regular',
                                                  fontSize: 11,
                                                  opacity: 0.8,
                                                },
                                                dimensions.width
                                              )}
                                            >
                                              {'Last Visit:'}
                                            </Text>

                                            <Text
                                              accessible={true}
                                              selectable={false}
                                              style={StyleSheet.applyWidth(
                                                {
                                                  color:
                                                    palettes.App[
                                                    'Custom Color_18'
                                                    ],
                                                  fontFamily: 'Inter_400Regular',
                                                  fontSize: 12,
                                                  opacity: 0.8,
                                                },
                                                dimensions.width
                                              )}
                                            >
                                              {listData?.previous_appointment ===
                                                null
                                                ? 'No past appointments'
                                                : DateUtils.format(
                                                  listData?.previous_appointment
                                                    ?.start_moment,
                                                  'MM/DD/YYYY'
                                                )}
                                            </Text>

                                            <Text
                                              accessible={true}
                                              selectable={false}
                                              style={StyleSheet.applyWidth(
                                                {
                                                  color:
                                                    palettes.App.TextPlaceholder,
                                                  fontFamily: 'Inter_400Regular',
                                                  fontSize: 12,
                                                  marginTop: 2,
                                                },
                                                dimensions.width
                                              )}
                                            >
                                              {
                                                listData?.previous_appointment
                                                  ?.type?.name
                                              }
                                            </Text>
                                          </View>

                                          <View
                                            style={StyleSheet.applyWidth(
                                              { alignItems: 'flex-end', flex: 1 },
                                              dimensions.width
                                            )}
                                          >
                                            <Text
                                              accessible={true}
                                              selectable={false}
                                              style={StyleSheet.applyWidth(
                                                {
                                                  color:
                                                    palettes.App.TextPlaceholder,
                                                  fontFamily: 'Inter_400Regular',
                                                  fontSize: 11,
                                                  opacity: 0.8,
                                                },
                                                dimensions.width
                                              )}
                                            >
                                              {'Next Appointment:'}
                                            </Text>

                                            <Text
                                              accessible={true}
                                              selectable={false}
                                              style={StyleSheet.applyWidth(
                                                {
                                                  color:
                                                    palettes.App[
                                                    'Custom Color_18'
                                                    ],
                                                  fontFamily: 'Inter_400Regular',
                                                  fontSize: 12,
                                                  marginTop: 2,
                                                },
                                                dimensions.width
                                              )}
                                            >
                                              {listData?.next_appointment
                                                ?.start_moment === null
                                                ? 'No future appointments'
                                                : DateUtils.format(
                                                  listData?.next_appointment
                                                    ?.start_moment,
                                                  'MM/DD/YYYY'
                                                )}
                                            </Text>
                                            {/* Text 3 */}
                                            <Text
                                              accessible={true}
                                              selectable={false}
                                              style={StyleSheet.applyWidth(
                                                {
                                                  color:
                                                    palettes.App.TextPlaceholder,
                                                  fontFamily: 'Inter_400Regular',
                                                  fontSize: 12,
                                                  opacity: 1,
                                                },
                                                dimensions.width
                                              )}
                                            >
                                              {
                                                listData?.next_appointment?.type
                                                  ?.name
                                              }
                                            </Text>
                                          </View>
                                        </View>
                                      </View>
                                    </Touchable>

                                    <View
                                      style={StyleSheet.applyWidth(
                                        {
                                          alignItems: 'center',
                                          borderColor: palettes.App.ViewBG,
                                          borderTopWidth: 1,
                                          flex: 1,
                                          flexDirection: 'row',
                                          justifyContent: 'space-between',
                                          paddingLeft: 16,
                                          paddingRight: 16,
                                          paddingTop: 12,
                                        },
                                        dimensions.width
                                      )}
                                    >
                                      <Touchable
                                        onPress={() => {
                                          const handler = async () => {
                                            try {
                                              await callPhoneNumber(
                                                listData?.phone
                                              );
                                            } catch (err) {
                                              console.log(err);
                                            }
                                          };
                                          handler();
                                        }}
                                      >
                                        <View
                                          style={StyleSheet.applyWidth(
                                            {
                                              alignItems: 'center',
                                              flexDirection: 'row',
                                              gap: 5,
                                            },
                                            dimensions.width
                                          )}
                                        >
                                          <Icon
                                            color={palettes.App.ButtonColor}
                                            name={'Ionicons/call-outline'}
                                            size={16}
                                          />
                                          {/* Price */}
                                          <Text
                                            accessible={true}
                                            selectable={false}
                                            style={StyleSheet.applyWidth(
                                              {
                                                color: palettes.App.ButtonColor,
                                                fontFamily: 'Inter_600SemiBold',
                                                fontSize: 13,
                                                textTransform: 'capitalize',
                                              },
                                              dimensions.width
                                            )}
                                          >
                                            {'Call'}
                                          </Text>
                                        </View>
                                      </Touchable>
                                      {/* Touchable 2 */}
                                      <Touchable
                                        onPress={() => {
                                          try {
                                            navigation.push('WizardViewScreen', {
                                              fullname: listData?.full_name ?? '',
                                              firstname: listData?.first_name ?? '',
                                              middlename: listData?.middle_name ?? '',
                                              lastname: listData?.last_name ?? '',
                                              inboxRoute: true,
                                            });
                                          } catch (err) {
                                            console.log(err);
                                          }
                                        }}
                                      >
                                        {/* View 3 */}
                                        <View
                                          style={StyleSheet.applyWidth(
                                            {
                                              alignItems: 'center',
                                              flexDirection: 'row',
                                              gap: 5,
                                            },
                                            dimensions.width
                                          )}
                                        >
                                          <Icon
                                            color={palettes.App.ButtonColor}
                                            name={
                                              'MaterialCommunityIcons/calendar-range-outline'
                                            }
                                            size={16}
                                          />
                                          {/* Price */}
                                          <Text
                                            accessible={true}
                                            selectable={false}
                                            style={StyleSheet.applyWidth(
                                              {
                                                color: palettes.App.ButtonColor,
                                                fontFamily: 'Inter_600SemiBold',
                                                fontSize: 13,
                                                textTransform: 'capitalize',
                                              },
                                              dimensions.width
                                            )}
                                          >
                                            {'Schedule'}
                                          </Text>
                                        </View>
                                      </Touchable>
                                      {/* Touchable 2 */}
                                      <Touchable
                                        onPress={() => {
                                          const handler = async () => {
                                            try {
                                              navigation.navigate(
                                                'InboxThreadsScreen',
                                                {
                                                  FirstName: listData?.first_name,
                                                  LastName: listData?.last_name,
                                                  Age: listData?.age_years,
                                                  PhoneNumber: listData?.phone,
                                                  MessageId: listData?.id,
                                                  fullName: listData?.full_name,
                                                },
                                                { pop: true }
                                              );
                                              await setGlobalVariableValue({
                                                key: 'MessageId',
                                                value: listData?.id,
                                              });
                                            } catch (err) {
                                              console.log(err);
                                            }
                                          };
                                          handler();
                                        }}
                                      >
                                        {/* View 2 */}
                                        <View
                                          style={StyleSheet.applyWidth(
                                            {
                                              alignItems: 'center',
                                              flexDirection: 'row',
                                              gap: 5,
                                            },
                                            dimensions.width
                                          )}
                                        >
                                          <Icon
                                            color={palettes.App.ButtonColor}
                                            name={'Feather/message-circle'}
                                            size={16}
                                          />
                                          {/* Price */}
                                          <Text
                                            accessible={true}
                                            selectable={false}
                                            style={StyleSheet.applyWidth(
                                              {
                                                color: palettes.App.ButtonColor,
                                                fontFamily: 'Inter_600SemiBold',
                                                fontSize: 13,
                                                textTransform: 'capitalize',
                                              },
                                              dimensions.width
                                            )}
                                          >
                                            {'Message'}
                                          </Text>
                                        </View>
                                      </Touchable>
                                    </View>
                                  </Surface>
                                </>
                              );
                            }}
                            showsVerticalScrollIndicator={true}
                            initialNumToRender={patientLimit ?? 10}
                            nestedScrollEnabled={false}
                            onEndReachedThreshold={0.7}
                            showsHorizontalScrollIndicator={true}
                          />
                        )
                        }
                        <>
                          {!(patientListData?.length === 0) ? null : (
                            <View
                              style={StyleSheet.applyWidth(
                                { flex: 1 },
                                dimensions.width
                              )}
                            >
                              {/* <>
                                {!(patientListData?.length === 0) ? null : (
                                  <EmptyListBlock
                                    message={'No patients found'}
                                  />
                                )}
                              </> */}
                            </View>
                          )}
                        </>
                      </>
                    );
                  }}
                </SunoApi.FetchGetPatientsGET>
              </View>
            </View>
          </View>
        )}
      </>
      <Modal
        animationType={'none'}
        supportedOrientations={['portrait', 'landscape']}
        presentationStyle={'pageSheet'}
        transparent={false}
        visible={Boolean(toggleFilter)}
      >
        {/* Header */}
        <View
          style={StyleSheet.applyWidth(
            {
              alignItems: 'center',
              flexDirection: 'row',
              height: 48,
              marginTop: 12,
              paddingLeft: 10,
              paddingRight: 16,
            },
            dimensions.width
          )}
        >
          {/* Back Click */}
          <View
            style={StyleSheet.applyWidth(
              {
                alignItems: 'center',
                height: 48,
                justifyContent: 'center',
                width: 48,
              },
              dimensions.width
            )}
          >
            <Touchable
              onPress={() => {
                try {
                  setToggleFilter(false);
                } catch (err) {
                  console.log(err);
                }
              }}
            >
              <Icon
                size={24}
                color={theme.colors.text.normal}
                name={'Ionicons/close'}
              />
            </Touchable>
          </View>
          {/* Screen Heading */}
          <Text
            accessible={true}
            selectable={false}
            style={StyleSheet.applyWidth(
              {
                color: palettes.App.FilterTextColor,
                fontFamily: 'Inter_600SemiBold',
                fontSize: 20,
                marginLeft: 16,
              },
              dimensions.width
            )}
          >
            {'Filter & Patient'}
          </Text>
        </View>

        <KeyboardAvoidingView
          behavior={'padding'}
          enabled={true}
          androidBehavior={'padding'}
          iosBehavior={'height'}
          keyboardVerticalOffset={80}
          style={StyleSheet.applyWidth({ flex: 1 }, dimensions.width)}
        >
          <ScrollView
            bounces={true}
            horizontal={false}
            keyboardShouldPersistTaps={'never'}
            nestedScrollEnabled={false}
            showsHorizontalScrollIndicator={true}
            showsVerticalScrollIndicator={true}
          >
            {/* Search */}
            <View
              style={StyleSheet.applyWidth(
                {
                  flex: 1,
                  paddingLeft: 20,
                  paddingRight: 20,
                  paddingTop: 20,
                  zIndex: 0,
                },
                dimensions.width
              )}
            >
              {/* Title */}
              <Text
                accessible={true}
                selectable={false}
                style={StyleSheet.applyWidth(
                  {
                    color: palettes.App.FilterTextColor,
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 15,
                  },
                  dimensions.width
                )}
              >
                {'Patient Status'}
              </Text>
              {/* RadioView */}
              <View>
                {/* Pressable 2 */}
                <Pressable
                  onPress={() => {
                    try {
                      setRadioButtonFilterValue(true);
                    } catch (err) {
                      console.log(err);
                    }
                  }}
                  style={StyleSheet.applyWidth(
                    { marginBottom: 10, marginTop: 10 },
                    dimensions.width
                  )}
                >
                  <View
                    style={StyleSheet.applyWidth(
                      { alignItems: 'center', flexDirection: 'row' },
                      dimensions.width
                    )}
                  >
                    {/* Icon 2 */}
                    <Icon
                      color={
                        radioButtonFilterValue === true
                          ? '#3b82f6'
                          : palettes.App.ButtonColor
                      }
                      name={
                        radioButtonFilterValue === true
                          ? 'MaterialIcons/radio-button-checked'
                          : 'MaterialIcons/radio-button-off'
                      }
                      size={22}
                    />
                    <Text
                      accessible={true}
                      selectable={false}
                      {...GlobalStyles.TextStyles(theme)['Text 2'].props}
                      style={StyleSheet.applyWidth(
                        StyleSheet.compose(
                          GlobalStyles.TextStyles(theme)['Text 2'].style,
                          theme.typography.body1,
                          { color: palettes.App.ButtonColor, marginLeft: 10 }
                        ),
                        dimensions.width
                      )}
                    >
                      {'Active Patients'}
                    </Text>
                  </View>
                </Pressable>
                {/* Pressable 3 */}
                <Pressable
                  onPress={() => {
                    try {
                      setRadioButtonFilterValue(false);
                    } catch (err) {
                      console.log(err);
                    }
                  }}
                >
                  <View
                    style={StyleSheet.applyWidth(
                      { alignItems: 'center', flexDirection: 'row' },
                      dimensions.width
                    )}
                  >
                    {/* Icon 2 */}
                    <Icon
                      color={
                        radioButtonFilterValue === false
                          ? '#3b82f6'
                          : palettes.App.ButtonColor
                      }
                      name={
                        radioButtonFilterValue === false
                          ? 'MaterialIcons/radio-button-checked'
                          : 'MaterialIcons/radio-button-off'
                      }
                      size={22}
                    />
                    <Text
                      accessible={true}
                      selectable={false}
                      {...GlobalStyles.TextStyles(theme)['Text 2'].props}
                      style={StyleSheet.applyWidth(
                        StyleSheet.compose(
                          GlobalStyles.TextStyles(theme)['Text 2'].style,
                          theme.typography.body1,
                          { color: palettes.App.ButtonColor, marginLeft: 10 }
                        ),
                        dimensions.width
                      )}
                    >
                      {'Inactive Patients'}
                    </Text>
                  </View>
                </Pressable>
              </View>
              {/* Title */}
              <Text
                accessible={true}
                selectable={false}
                style={StyleSheet.applyWidth(
                  {
                    color: palettes.App.FilterTextColor,
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 15,
                    marginBottom: 7,
                    marginTop: 30,
                  },
                  dimensions.width
                )}
              >
                {'Provider'}
              </Text>

              <View
                style={StyleSheet.applyWidth(
                  { zIndex: Platform.OS === 'android' ? undefined : 1600 },
                  dimensions.width
                )}
              >
                <>
                  {!(providers?.length > 0) ? null : (
                    <Utils.CustomCodeErrorBoundary>
                      <DropDownBlock.DropDownBlock
                        dropdownData={providers}
                        value={selectedProvider}
                        setValue={setSelectedProvider}
                        placeholderText={'Select Provider'}
                        zIndex={1600}
                      />
                    </Utils.CustomCodeErrorBoundary>
                  )}
                </>
              </View>
              {/* Appointment Type */}
              <Text
                accessible={true}
                selectable={false}
                style={StyleSheet.applyWidth(
                  {
                    color: palettes.App.FilterTextColor,
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 15,
                    marginBottom: 7,
                    marginTop: 20,
                  },
                  dimensions.width
                )}
              >
                {'Preferred Communication Method'}
              </Text>
              {/* View  */}
              <View
                style={StyleSheet.applyWidth(
                  { zIndex: Platform.OS === 'android' ? undefined : 1400 },
                  dimensions.width
                )}
              >
                {/* Custom Code 2 */}
                <Utils.CustomCodeErrorBoundary>
                  <DropDownBlock.DropDownBlock
                    dropdownData={Variables.communication_method}
                    value={selectedCommunication_method}
                    setValue={setSelectedCommunication_method}
                    placeholderText={'Select Communication Method'}
                    zIndex={1400}
                  />
                </Utils.CustomCodeErrorBoundary>
              </View>
              {/* Insurance */}
              <Text
                accessible={true}
                selectable={false}
                style={StyleSheet.applyWidth(
                  {
                    color: palettes.App.FilterTextColor,
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 15,
                    marginTop: 20,
                    paddingBottom: 7,
                  },
                  dimensions.width
                )}
              >
                {'Insurance'}
              </Text>
              {/* View  */}
              <View
                style={StyleSheet.applyWidth(
                  { zIndex: Platform.OS === 'android' ? undefined : 1300 },
                  dimensions.width
                )}
              >
                {/* Custom Code 2 */}
                <>
                  {!(insuranceTypes?.length > 0) ? null : (
                    <Utils.CustomCodeErrorBoundary>
                      <DropDownBlock.DropDownBlock
                        dropdownData={insuranceTypes}
                        value={selectedInsuranceTypes}
                        setValue={setSelectedInsuranceTypes}
                        placeholderText={'Select Insurance'}
                        zIndex={1300}
                      />
                    </Utils.CustomCodeErrorBoundary>
                  )}
                </>
              </View>
              {/* Clinic */}
              <Text
                accessible={true}
                selectable={false}
                style={StyleSheet.applyWidth(
                  {
                    color: palettes.App.FilterTextColor,
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 15,
                    marginBottom: 7,
                    marginTop: 20,
                  },
                  dimensions.width
                )}
              >
                {'Clinic'}
              </Text>
              {/* Clinic View  */}
              <View
                style={StyleSheet.applyWidth(
                  { zIndex: Platform.OS === 'android' ? undefined : 1200 },
                  dimensions.width
                )}
              >
                <>
                  {!(clinic?.length > 0) ? null : (
                    <Utils.CustomCodeErrorBoundary>
                      <DropDownBlock.DropDownBlock
                        dropdownData={clinic}
                        value={selectedClinic}
                        setValue={setSelectedClinic}
                        placeholderText={'Select Clinic'}
                        zIndex={1200}
                      />
                    </Utils.CustomCodeErrorBoundary>
                  )}
                </>
              </View>
              {/* Referral Source */}
              <Text
                accessible={true}
                selectable={false}
                style={StyleSheet.applyWidth(
                  {
                    color: palettes.App.FilterTextColor,
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 15,
                    marginBottom: 7,
                    marginTop: 20,
                  },
                  dimensions.width
                )}
              >
                {'Referral Source'}
              </Text>
              {/* Referral Source View  */}
              <View
                style={StyleSheet.applyWidth(
                  { zIndex: Platform.OS === 'android' ? undefined : 1000 },
                  dimensions.width
                )}
              >
                <>
                  {!(referenceSource?.length > 0) ? null : (
                    <Utils.CustomCodeErrorBoundary>
                      <DropDownBlock.DropDownBlock
                        dropdownData={referenceSource}
                        value={selectedReferenceSource}
                        setValue={setSelectedReferenceSource}
                        placeholderText={'Select Reference Source'}
                        zIndex={1000}
                      />
                    </Utils.CustomCodeErrorBoundary>
                  )}
                </>
              </View>
              {/* Sub Referral Source */}
              <Text
                accessible={true}
                selectable={false}
                style={StyleSheet.applyWidth(
                  {
                    color: palettes.App.FilterTextColor,
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 15,
                    marginBottom: 7,
                    marginTop: 20,
                  },
                  dimensions.width
                )}
              >
                {'Sub Referral Source'}
              </Text>
              {/* Sub Referral Source View  */}
              <View
                style={StyleSheet.applyWidth(
                  { zIndex: Platform.OS === 'android' ? undefined : 900 },
                  dimensions.width
                )}
              >
                <>
                  {!(subReferenceSource?.length > 0) ? null : (
                    <Utils.CustomCodeErrorBoundary>
                      <DropDownBlock.DropDownBlock
                        dropdownData={subReferenceSource}
                        value={selectedSubReferenceSource}
                        setValue={setSelectedSubReferenceSource}
                        placeholderText={'Select Sub Reference Source'}
                        zIndex={900}
                      />
                    </Utils.CustomCodeErrorBoundary>
                  )}
                </>
              </View>
              {/* CRM Segment */}
              <Text
                accessible={true}
                selectable={false}
                style={StyleSheet.applyWidth(
                  {
                    color: palettes.App.FilterTextColor,
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 15,
                    marginBottom: 7,
                    marginTop: 20,
                  },
                  dimensions.width
                )}
              >
                {'CRM Segment'}
              </Text>
              {/* CRM Segment View  */}
              <View
                style={StyleSheet.applyWidth(
                  { zIndex: Platform.OS === 'android' ? undefined : 800 },
                  dimensions.width
                )}
              >
                <Utils.CustomCodeErrorBoundary>
                  <DropDownBlock.DropDownBlock
                    dropdownData={Variables.crm_segment}
                    value={selectedCrm_segment}
                    setValue={setSelectedCrm_segment}
                    placeholderText={'Select CRM Segment'}
                    zIndex={800}
                  />
                </Utils.CustomCodeErrorBoundary>
              </View>
              {/* Payment Source */}
              <Text
                accessible={true}
                selectable={false}
                style={StyleSheet.applyWidth(
                  {
                    color: palettes.App.FilterTextColor,
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 15,
                    marginBottom: 7,
                    marginTop: 20,
                  },
                  dimensions.width
                )}
              >
                {'Payment Source'}
              </Text>
              {/* Payment Source View  */}
              <View
                style={StyleSheet.applyWidth(
                  { zIndex: Platform.OS === 'android' ? undefined : 700 },
                  dimensions.width
                )}
              >
                <Utils.CustomCodeErrorBoundary>
                  <DropDownBlock.DropDownBlock
                    dropdownData={Variables.payment_source_type}
                    value={selectedPayment_source_type}
                    setValue={setSelectedPayment_source_type}
                    placeholderText={'Select Payment Source Type'}
                    zIndex={700}
                  />
                </Utils.CustomCodeErrorBoundary>
              </View>
              {/* Managed Care Plan */}
              <Text
                accessible={true}
                selectable={false}
                style={StyleSheet.applyWidth(
                  {
                    color: palettes.App.FilterTextColor,
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 15,
                    marginBottom: 7,
                    marginTop: 20,
                  },
                  dimensions.width
                )}
              >
                {'Managed Care Plan'}
              </Text>
              {/* Managed Care Plan View  */}
              <View
                style={StyleSheet.applyWidth(
                  { zIndex: Platform.OS === 'android' ? undefined : 600 },
                  dimensions.width
                )}
              >
                <>
                  {!(manageCarePlan?.length > 0) ? null : (
                    <Utils.CustomCodeErrorBoundary>
                      <DropDownBlock.DropDownBlock
                        dropdownData={manageCarePlan}
                        value={selectedManageCarePlan}
                        setValue={setSelectedManageCarePlan}
                        placeholderText={'Select Manage Care Plan'}
                        zIndex={600}
                      />
                    </Utils.CustomCodeErrorBoundary>
                  )}
                </>
              </View>
              {/* Last Outcome */}
              <Text
                accessible={true}
                selectable={false}
                style={StyleSheet.applyWidth(
                  {
                    color: palettes.App.FilterTextColor,
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 15,
                    marginBottom: 7,
                    marginTop: 20,
                  },
                  dimensions.width
                )}
              >
                {'Last Outcome'}
              </Text>
              {/* Last Outcome View  */}
              <View
                style={StyleSheet.applyWidth(
                  { zIndex: Platform.OS === 'android' ? undefined : 500 },
                  dimensions.width
                )}
              >
                <Utils.CustomCodeErrorBoundary>
                  <DropDownBlock.DropDownBlock
                    dropdownData={Variables.last_outcome}
                    value={selectedLast_outcome}
                    setValue={setSelectedLast_outcome}
                    placeholderText={'Select Last Outcome'}
                    zIndex={500}
                  />
                </Utils.CustomCodeErrorBoundary>
              </View>
              {/* View 2 */}
              <View
                style={StyleSheet.applyWidth(
                  { alignItems: 'center', flexDirection: 'row', marginTop: 20 },
                  dimensions.width
                )}
              >
                {/* Warranty Expiration */}
                <Text
                  accessible={true}
                  selectable={false}
                  style={StyleSheet.applyWidth(
                    {
                      color: palettes.App.FilterTextColor,
                      fontFamily: 'Inter_600SemiBold',
                      fontSize: 15,
                      marginBottom: 7,
                    },
                    dimensions.width
                  )}
                >
                  {'Warranty Expiration'}
                </Text>
                <NumberInput
                  changeTextDelay={500}
                  onChangeText={newNumberInputValue => {
                    try {
                      setSelectedWarranty(newNumberInputValue);
                    } catch (err) {
                      console.log(err);
                    }
                  }}
                  webShowOutline={true}
                  {...GlobalStyles.NumberInputStyles(theme)['Number Input']
                    .props}
                  placeholder={'60'}
                  style={StyleSheet.applyWidth(
                    StyleSheet.compose(
                      GlobalStyles.NumberInputStyles(theme)['Number Input']
                        .style,
                      theme.typography.body2,
                      {
                        borderColor: palettes.App.TagBorder,
                        color: palettes.App.FilterTextColor,
                        fontSize: 15,
                        marginLeft: 10,
                        marginRight: 5,
                        textAlign: 'center',
                        width: 70,
                      }
                    ),
                    dimensions.width
                  )}
                  value={selectedWarranty}
                />
                {/* Title 5 */}
                <Text
                  accessible={true}
                  selectable={false}
                  style={StyleSheet.applyWidth(
                    {
                      color: palettes.App.FilterTextColor,
                      fontFamily: 'Inter_400Regular',
                      fontSize: 15,
                    },
                    dimensions.width
                  )}
                >
                  {'Days'}
                </Text>
              </View>
              {/* Title 4 */}
              <Text
                accessible={true}
                selectable={false}
                style={StyleSheet.applyWidth(
                  {
                    color: palettes.App.FilterTextColor,
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 15,
                    marginTop: 10,
                  },
                  dimensions.width
                )}
              >
                {'Tags'}
              </Text>
              {/* Tags Container */}
              <View
                style={StyleSheet.applyWidth(
                  { gap: 6, marginTop: 20 },
                  dimensions.width
                )}
              >
                <SimpleStyleFlatList
                  data={globalTags}
                  decelerationRate={'normal'}
                  horizontal={false}
                  inverted={false}
                  keyExtractor={(listData, index) =>
                    listData?.id ??
                    listData?.uuid ??
                    index?.toString() ??
                    JSON.stringify(listData)
                  }
                  keyboardShouldPersistTaps={'never'}
                  listKey={
                    'Modal->Keyboard Avoiding View->Scroll View->Search->Tags Container->List'
                  }
                  nestedScrollEnabled={false}
                  numColumns={1}
                  onEndReachedThreshold={0.5}
                  pagingEnabled={false}
                  renderItem={({ item, index }) => {
                    const listData = item;
                    return (
                      <Pressable
                        onPress={() => {
                          try {
                            const GetselectedTags = fetchSelectedTags(
                              selectedTags,
                              listData
                            );
                            setSelectedTags(GetselectedTags);
                          } catch (err) {
                            console.log(err);
                          }
                        }}
                        activeOpacity={0.3}
                      >
                        <Surface
                          {...GlobalStyles.SurfaceStyles(theme)['Surface']
                            .props}
                          elevation={0}
                          style={StyleSheet.applyWidth(
                            StyleSheet.compose(
                              GlobalStyles.SurfaceStyles(theme)['Surface']
                                .style,
                              {
                                backgroundColor: [
                                  {
                                    minWidth: Breakpoints.Mobile,
                                    value: theme.colors.branding.secondary,
                                  },
                                  {
                                    minWidth: Breakpoints.Mobile,
                                    value: getSelectedTagColor(
                                      selectedTags,
                                      listData
                                    ),
                                  },
                                ],
                                borderColor: [
                                  {
                                    minWidth: Breakpoints.Mobile,
                                    value: palettes.App.TagBorder,
                                  },
                                  {
                                    minWidth: Breakpoints.Mobile,
                                    value: listData,
                                  },
                                ],
                                borderRadius: 20,
                                borderWidth: 1,
                                justifyContent: 'center',
                                paddingBottom: 6,
                                paddingLeft: 12,
                                paddingRight: 12,
                                paddingTop: 6,
                              }
                            ),
                            dimensions.width
                          )}
                        >
                          <Text
                            accessible={true}
                            selectable={false}
                            {...GlobalStyles.TextStyles(theme)['Text'].props}
                            style={StyleSheet.applyWidth(
                              StyleSheet.compose(
                                GlobalStyles.TextStyles(theme)['Text'].style,
                                {
                                  color: [
                                    {
                                      minWidth: Breakpoints.Mobile,
                                      value: theme.colors.text.normal,
                                    },
                                    {
                                      minWidth: Breakpoints.Mobile,
                                      value:
                                        selectedID === listData?.id
                                          ? palettes.Slate[50]
                                          : theme.colors.text.normal,
                                    },
                                  ],
                                  fontFamily: 'Poppins_500Medium',
                                }
                              ),
                              dimensions.width
                            )}
                          >
                            {listData?.name}
                          </Text>
                        </Surface>
                      </Pressable>
                    );
                  }}
                  showsHorizontalScrollIndicator={true}
                  showsVerticalScrollIndicator={true}
                  snapToAlignment={'start'}
                  style={StyleSheet.applyWidth(
                    { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
                    dimensions.width
                  )}
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        {/* Actions */}
        <View
          style={StyleSheet.applyWidth(
            {
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingBottom: 20,
              paddingLeft: 20,
              paddingRight: 20,
              paddingTop: 20,
            },
            dimensions.width
          )}
        >
          {/* Reset */}
          <Button
            accessible={true}
            iconPosition={'left'}
            onPress={() => {
              try {
                setIsLoading(true);

                const resetFilterData = setPatientResetFilter(
                  Variables,
                  setGlobalVariableValue
                );
                setToggleFilter(false);
                setSelectedClinic('');
                setSelectedCommunication_method('');
                setSelectedCrm_segment('');
                setSelectedInsuranceTypes('');
                setSelectedLast_outcome('');
                setSelectedManageCarePlan('');
                setSelectedPayment_source_type('');
                setSelectedProvider('');
                setSelectedReferenceSource('');
                setSelectedSubReferenceSource('');
                setSelectedWarranty(60);
                setRadioButtonFilterValue(true);
                setPatientListData([])

                setPatientFilterData(resetFilterData);
                setSelectedTags([]);
              } catch (err) {
                console.log(err);
              }
            }}
            style={StyleSheet.applyWidth(
              {
                backgroundColor: palettes.App['Custom #ffffff'],
                borderColor: palettes.App.TagBorder,
                borderRadius: 8,
                borderWidth: 2,
                color: palettes.App.FilterTextColor,
                fontFamily: 'Inter_500Medium',
                fontSize: 15,
                height: 58,
                textAlign: 'center',
                width: '48%',
              },
              dimensions.width
            )}
            title={'Reset'}
          />
          {/* Apply */}
          <Button
            accessible={true}
            iconPosition={'left'}
            onPress={() => {
              const handler = async () => {
                try {
                  setIsLoading(true);
                  const applyFilterData = setPatientApplyFilter(
                    Variables,
                    setGlobalVariableValue,
                    radioButtonFilterValue,
                    selectedTags,
                    selectedClinic,
                    selectedCommunication_method,
                    selectedCrm_segment,
                    selectedInsuranceTypes,
                    selectedLast_outcome,
                    selectedManageCarePlan,
                    selectedPayment_source_type,
                    selectedProvider,
                    selectedReferenceSource,
                    selectedSubReferenceSource,
                    selectedWarranty == 60 ? '' : selectedWarranty
                  );
                  setToggleFilter(false);
                  // setPatientListData([])
                  setPatientFilterData(applyFilterData);

                  await setGlobalVariableValue({
                    key: 'patientOffsetFilter',
                    value: 0,
                  });
                  // fetchPatientsFilter(applyFilterData)
                } catch (err) {
                  console.log(err);
                }
              };
              handler();
            }}
            style={StyleSheet.applyWidth(
              {
                backgroundColor: theme.colors.branding.secondary,
                borderColor: theme.colors.branding.secondary,
                borderRadius: 8,
                borderWidth: 1,
                fontFamily: 'Inter_500Medium',
                fontSize: 15,
                height: 58,
                textAlign: 'center',
                width: '48%',
              },
              dimensions.width
            )}
            title={'Apply Filters'}
          />
        </View>
      </Modal>
    </ScreenContainer>
  );
};

export default withTheme(PatientScreen);
