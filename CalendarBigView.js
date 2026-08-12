import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Text,
  Modal,
  SafeAreaView,
  FlatList,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
  Pressable,
  TextInput,
  Linking,
} from 'react-native';
import { Calendar, Agenda } from 'react-native-calendars';
import {
  addDays,
  subDays,
  format,
  startOfWeek,
  endOfWeek,
  parseISO,
} from 'date-fns';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
// import moment from 'moment';
import { Icon, withTheme } from '@draftbit/ui';
const { width, height } = Dimensions.get('window');
import { Fetch } from 'react-request';
import moment from 'moment-timezone';
import * as GlobalVariables from './config/GlobalVariableContext';
import * as SunoApi from './apis/SunoApi.js';
import fetchProviders from './global-functions/fetchProviders';
import { DropDownBlock } from './custom-files/DropDownBlock';
import { toZonedTime } from 'date-fns-tz';
import { DeviceEventEmitter } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import palettes from './themes/palettes.js';
import * as GlobalStyles from './GlobalStyles.js';
import { logEvent } from './global-functions/analyticsService.js';
import remoteConfig from '@react-native-firebase/remote-config';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isUpdateRequired, openStore } from './App.js';
import { checkInternetAndProceed } from './custom-files/InternetConnection.js';

// import * as DeviceVariables from "./config/DeviceVariableContext";

// 🔧 Utility to build marked dates for a given month

// import EnumDataSource from "../utils/enum-data-source.util";

export const APPOINTMENT_STATUS_DRAFT = 0;
export const APPOINTMENT_STATUS_UNCONFIRMED = 1;
export const APPOINTMENT_STATUS_CONFIRMED = 2;
export const APPOINTMENT_STATUS_CANCELED = 3;
export const APPOINTMENT_STATUS_NO_SHOW = 4;
export const APPOINTMENT_STATUS_ARRIVED = 5;
export const APPOINTMENT_STATUS_READY = 6;
export const APPOINTMENT_STATUS_RESCHEDULED = 7;
export const APPOINTMENT_STATUS_COMPLETED = 99;

export const VISIBLE_STATUSES_CODES = [
  APPOINTMENT_STATUS_DRAFT,
  APPOINTMENT_STATUS_UNCONFIRMED,
  APPOINTMENT_STATUS_CONFIRMED,
  APPOINTMENT_STATUS_NO_SHOW,
  APPOINTMENT_STATUS_ARRIVED,
  APPOINTMENT_STATUS_COMPLETED,
];

export const NON_FINAL_STATUSES_CODES = [
  APPOINTMENT_STATUS_DRAFT,
  APPOINTMENT_STATUS_UNCONFIRMED,
  APPOINTMENT_STATUS_CONFIRMED,
  APPOINTMENT_STATUS_ARRIVED,
];

const status = {
  [APPOINTMENT_STATUS_DRAFT]: 'Draft',
  [APPOINTMENT_STATUS_UNCONFIRMED]: 'Unconfirmed',
  [APPOINTMENT_STATUS_CONFIRMED]: 'Confirmed',
  [APPOINTMENT_STATUS_CANCELED]: 'Canceled',
  [APPOINTMENT_STATUS_NO_SHOW]: 'No-Show',
  [APPOINTMENT_STATUS_ARRIVED]: 'Arrived',
  [APPOINTMENT_STATUS_READY]: 'Ready',
  [APPOINTMENT_STATUS_RESCHEDULED]: 'Rescheduled',
  [APPOINTMENT_STATUS_COMPLETED]: 'Completed',
};

// export const APPOINTMENT_STATUSES = new EnumDataSource(status);

const physicianReferral = {
  1: 'Not Required',
  2: 'Required - Requested',
  3: 'Required - Received',
};

// export const PHYSICIAN_REFERRAL = new EnumDataSource(physicianReferral);

export const QUICK_FILTER_DEFAULT_TYPE = '1';
export const QUICK_FILTER_UNCONFIRMED_APPOINTMENTS_TYPE = '2';
export const QUICK_FILTER_OPPORTUNITY_TYPE = '3';
export const QUICK_FILTER_INCOMPLETE_TYPE = '4';
export const QUICK_FILTER_DRAFT_APPOINTMENTS = '5';
export const QUICK_FILTER_CANCELED_APPOINTMENTS = '6';

const schedulingQuickFiltersType = {
  [QUICK_FILTER_DEFAULT_TYPE]: 'All Appointments',
  [QUICK_FILTER_UNCONFIRMED_APPOINTMENTS_TYPE]: 'Unconfirmed Appointments',
  [QUICK_FILTER_OPPORTUNITY_TYPE]: 'Opportunity Appointments',
  [QUICK_FILTER_INCOMPLETE_TYPE]: 'Incomplete Appointments',
  [QUICK_FILTER_DRAFT_APPOINTMENTS]: 'Web Scheduler Appointments',
  [QUICK_FILTER_CANCELED_APPOINTMENTS]: 'Canceled/Rescheduled Appointments',
};

// export const QUICK_FILTER_TYPES = new EnumDataSource(
//   schedulingQuickFiltersType
// );

export const EVENT_TYPE_APPOINTMENT = 'Appointment';
export const EVENT_TYPE_PERSONAL_EVENT = 'Personal';
export const EVENT_TYPE_APPOINTMENT_BLOCK = 'Block';
export const EVENT_TYPE_CLINIC_EVENT = 'Clinic';
export const EVENT_TYPE_PERSONAL_WORKSHIFT = 'WorkShift';
export const EVENT_TYPE_SCHEDULE_CODE = 'S';
export const EVENT_TYPE_WORK_SHIFT_CODE = 'W';
export const EVENT_TYPE_APPOINTMENT_CODE = 'A';

const eventTypes = {
  [EVENT_TYPE_APPOINTMENT]: 'Appointment',
  [EVENT_TYPE_PERSONAL_EVENT]: 'Personal Event',
  [EVENT_TYPE_APPOINTMENT_BLOCK]: 'Dedicated Appointment Slot',
  [EVENT_TYPE_CLINIC_EVENT]: 'Clinic Event',
  [EVENT_TYPE_PERSONAL_WORKSHIFT]: 'Work Shift',
};

// export const EVENT_TYPES = new EnumDataSource(eventTypes);
export const REOCCURRENCE_PERIOD_TYPE_WEEKLY = 'W';
export const REOCCURRENCE_PERIOD_TYPE_MONTHLY = 'M';
export const REOCCURRENCE_PERIOD_TYPE_DAILY = 'D';
export const REOCCURRENCE_PERIOD_TYPE_DAY_IN_WEEK_OF_MONTH = 'DWM';

const recurrencePeriods = {
  [REOCCURRENCE_PERIOD_TYPE_DAILY]: 'Daily',
  [REOCCURRENCE_PERIOD_TYPE_WEEKLY]: 'Every week',
  [REOCCURRENCE_PERIOD_TYPE_MONTHLY]: 'Every month',
  [REOCCURRENCE_PERIOD_TYPE_DAY_IN_WEEK_OF_MONTH]:
    'Every nth weekday of the month',
};

// export const REOCCURRENCE_PERIODS = new EnumDataSource(recurrencePeriods);

const recurrenceDays = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
  7: 'Sunday',
};

export const getRecurrenceText = ({
  rrule,
  recurrence_period,
  recurrence_day,
  recurrence_week,
  recurrence_interval = 1,
  end_date,
  is_recurring,
}, end_moment, start_date) => {
  // --- Helpers ---
  const getOrdinal = (n) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const formatEndDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const freqAdjective = {
    D: 'Daily',
    W: 'Weekly',
    M: 'Monthly',
    Y: 'Yearly',
  };

  const recurrenceDays = {
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday',
    7: 'Sunday',
  };

  // --- RRULE Mode ---
  if (rrule) {
    const [, ruleBody] = rrule.split(':');
    const parts = ruleBody.split(';').reduce((acc, part) => {
      const [key, value] = part.split('=');
      acc[key] = value;
      return acc;
    }, {});

    const daysMap = recurrenceDays;

    const interval = parseInt(parts.INTERVAL || '1', 10);
    const freq = parts.FREQ || 'DAILY';
    const adjective =
      interval > 1
        ? `Every ${interval} ${freqAdjective[freq[0]] || ''}`
        : freqAdjective[freq[0]] || 'Daily';

    // Handle multiple BYDAY (e.g. MO,WE,FR)
    if (parts.BYDAY) {
      const days = parts.BYDAY.split(',').map((d) => {
        const map = { MO: 'Monday', TU: 'Tuesday', WE: 'Wednesday', TH: 'Thursday', FR: 'Friday', SA: 'Saturday', SU: 'Sunday' };
        return map[d] || d;
      });
      const dayList =
        days.length > 1
          ? `${days.slice(0, -1).join(', ')} and ${days.slice(-1)}`
          : days[0];
      return `${adjective} on ${dayList}`;
    }

    return adjective;
  }

  // --- Legacy Mode ---
  if (is_recurring && recurrence_period) {
    const adjective = freqAdjective[recurrence_period] || 'Recurring';

    // Handle "Weekly on Wednesday"
    if (recurrence_period === 'W' && recurrence_day) {
      const dayText = recurrenceDays[recurrence_day];
      return `Every week on ${dayText}`;
    }

    // Handle "Daily on the 27th until Mon Oct 27"
    if (recurrence_period === 'D') {
      let datePart = '';
      if (start_date) {
        const d = new Date(start_date);
        datePart = ` on the ${getOrdinal(d.getDate())}`;
      }

      const untilDate = end_date || end_moment;
      let untilPart = '';
      if (untilDate) {
        untilPart = ` until ${formatEndDate(untilDate)}`;
      }

      return `Daily${datePart}${untilPart}`.trim();
    }

    // Handle monthly / yearly fallback
    return adjective;
  }

  return 'Does not repeat';
};





// export const RECURRENCE_DAYS = new EnumDataSource(recurrenceDays);

// export const RECURRENCE_WEEKS = new EnumDataSource({
//   1: "Every first week of the month",
//   2: "Every second week of the month",
//   3: "Every third week of the month",
//   4: "Every fourth week of the month",
//   5: "Every last week of the month",
// });

//   const backgroundColor =
//     isClassicView && !isUnconfirmed && !isCanceledOrNoShow
//       ? appointmentType.color
//       : "#fff";

//   const textColor =
//     isClassicView && !isUnconfirmed && !isCanceledOrNoShow
//       ? palette.getContrastText(appointmentType.color)
//       : undefined;

//  const isUnconfirmed = status === APPOINTMENT_STATUS_UNCONFIRMED;
//   const isCanceledOrNoShow =
//     status === APPOINTMENT_STATUS_CANCELED ||
//     status === APPOINTMENT_STATUS_NO_SHOW;

// export const WORK_WEEK_EXCLUDED_DAYS = [0, 6];
// export const APPOINTMENTS_LIST_KEY_DEFAULT = "appointmentsList";

// export const NOTIFICATION_METHOD_SMS = 1;
// export const NOTIFICATION_METHOD_EMAIL = 2;

// const notificationMethods = {
//   [NOTIFICATION_METHOD_SMS]: "SMS",
//   [NOTIFICATION_METHOD_EMAIL]: "Email",
// };

// export const NOTIFICATION_METHODS = new EnumDataSource(notificationMethods);

export const buildMarkedDates = (items, selectedDate) => {
  const marked = {};
  const fallbackDate = selectedDate || format(new Date(), 'yyyy-MM-dd');

  // const selectedMonth = fallbackDate.slice(0, 7); // 'YYYY-MM'

  Object.keys(items).forEach(date => {
    // if (date.startsWith(selectedMonth)) {
    marked[date] = {
      marked: true,
      dotColor: '#611B61FF',
      selected: date === fallbackDate,
      selectedColor: '#066858',
      // selectedDayBackgroundColor: '#066858',
      //         todayTextColor: '#066858',
      //         agendaDayTextColor: '#333',
      //         agendaDayNumColor: '#333',
      //         dayTextColor: '#066858',
      //         dotColor: '#066858',
      //         selectedDotColor: '#ffffff',
      //         agendaTodayColor: '#00adf5',
    };
    // }
  });

  // Ensure selected date is marked even if it has no tasks
  if (!marked[fallbackDate]) {
    marked[fallbackDate] = {
      selected: true,
      selectedColor: '#066858',
      dotColor: '#611B61FF',
      // selectedDayBackgroundColor: '#066858',
      //   todayTextColor: '#066858',
      //   agendaDayTextColor: '#333',
      //   agendaDayNumColor: '#333',
      //   dayTextColor: '#066858',
      //   dotColor: '#066858',
      //   selectedDotColor: '#ffffff',
      //   agendaTodayColor: '#00adf5',
    };
  }

  return marked;
};

// const appointmentTypes = [
//   { label: 'Dr. Smith', value: 'dr-smith' },
//   { label: 'Dr. Johnson', value: 'dr-johnson' },
//   { label: 'Dr. Williams', value: 'dr-williams' },
// ];
export const TIMEZONE_MAP = {
  // ---------------- US ----------------
  'us/eastern': 'America/New_York',
  'us/central': 'America/Chicago',
  'us/mountain': 'America/Denver',
  'us/pacific': 'America/Los_Angeles',
  'us/arizona': 'America/Phoenix', // no DST
  'us/alaska': 'America/Anchorage',
  'us/hawaii': 'Pacific/Honolulu',
  'us/indiana-east': 'America/Indiana/Indianapolis',
  'us/samoa': 'Pacific/Pago_Pago',
  'us/guam': 'Pacific/Guam',
  'us/puerto-rico': 'America/Puerto_Rico',
  'us/virgin': 'America/St_Thomas',

  // ---------------- Europe ----------------
  'eu/london': 'Europe/London',
  'eu/berlin': 'Europe/Berlin',
  'eu/paris': 'Europe/Paris',
  'eu/madrid': 'Europe/Madrid',
  'eu/rome': 'Europe/Rome',
  'eu/athens': 'Europe/Athens',
  'eu/moscow': 'Europe/Moscow',

  // ---------------- Asia ----------------
  'asia/kolkata': 'Asia/Kolkata', // India
  'asia/dubai': 'Asia/Dubai', // UAE
  'asia/shanghai': 'Asia/Shanghai', // China
  'asia/tokyo': 'Asia/Tokyo', // Japan
  'asia/seoul': 'Asia/Seoul', // Korea
  'asia/bangkok': 'Asia/Bangkok', // Thailand
  'asia/singapore': 'Asia/Singapore',

  // ---------------- Australia ----------------
  'au/sydney': 'Australia/Sydney',
  'au/melbourne': 'Australia/Melbourne',
  'au/perth': 'Australia/Perth',
  'au/brisbane': 'Australia/Brisbane',

  // ---------------- Default ----------------
  utc: 'UTC',
};
export const CalendarBigView = () => {
  const screenHeight = Dimensions.get('window').height;
  const [agendaItems, setAgendaItems] = useState({});
  const [providerData, setProviderData] = useState([]);
  const [provider, setProvider] = useState('');
  const navigation = useNavigation();
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const Constants = GlobalVariables.useValues();
  const [reloadData, setReloadData] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteType, setShowDeleteType] = useState(1);
  const [open, setOpen] = useState(false);
  const [noshowModal, setNoShowModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showOptionalModal, setShowOptionalModal] = useState(false);

  const closeProviderDropdown = useCallback(() => {
    setOpen(false);
    setShowTypeDropdown(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      return () => {
        closeProviderDropdown();
      };
    }, [closeProviderDropdown])
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', closeProviderDropdown);
    return unsubscribe;
  }, [navigation, closeProviderDropdown]);

  // const deviceVars = DeviceVariables.useValues();
  // console.log('=GlobalVariables.useValues(); :', Constants);
  const sunoUpdateAppointmentsStatusPATCH =
    SunoApi.useUpdateAppointmentsStatusPATCH();
  const handleTypeSelect = type => {
    // console.log('===== type : ', type);
    setSelectedType(type.label);
    setProvider(type.value);
    setShowTypeDropdown(false);
  };

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), 'yyyy-MM-dd')
  );

  useEffect(() => {
    const checkVersion = async () => {
      try {
        await remoteConfig().setConfigSettings({
          minimumFetchIntervalMillis: 0, // important
        });

        await remoteConfig().setDefaults({
          latest_version_ios: '1.0.0',
          latest_version_android: '1.0.0',
        });

        await remoteConfig().fetchAndActivate();

        const latestVersion = remoteConfig()
          .getValue(Platform.OS === 'ios' ? 'latest_version_ios' : 'latest_version_android')
          .asString();

        const currentVersion = DeviceInfo.getVersion();
        const forceUpdate = remoteConfig().getValue(Platform.OS === 'ios' ? 'force_update_ios' : 'force_update_android').asBoolean();
        // console.log("===== currentVersion dashboard:", currentVersion, latestVersion, forceUpdate)
        if (isUpdateRequired(currentVersion, latestVersion)) {
          if (forceUpdate) {
            setShowUpdateModal(true);   // no cancel
          } else {
            const skippedVersion = await AsyncStorage.getItem('skip_update_version');
            if (skippedVersion !== latestVersion) {
              // setShowOptionalModal(true); // update + cancel
              Alert.alert(
                'Update Available',
                'A new version of the app is available. Please update for the best experience.',
                [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: async () => {
                      await AsyncStorage.setItem('skip_update_version', latestVersion);
                    },
                  },
                  {
                    text: 'Update',
                    onPress: async () => {
                      await AsyncStorage.setItem('skip_update_version', latestVersion);
                      openStore()
                    },
                  },
                ],
                { cancelable: true }
              );
            }
          }
        }
      } catch (e) {
        console.log('Remote config error', e);
      }
    };

    checkVersion();
  }, []);

  const deleteScheduleAppointment = async (
    appointment_id,
    instance_start_date,
    instance_end_date
  ) => {
    try {
      const response = await fetch(
        `${Constants.API_BASE_URL}/schedules/${appointment_id}/`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: Constants.AUTH_HEADER,
          },
          body: JSON.stringify(
            instance_start_date == ''
              ? {}
              : instance_end_date == ''
                ? {
                  instance_start_date: instance_start_date,
                }
                : {
                  instance_start_date: instance_start_date,
                  instance_end_date: instance_end_date,
                }
          ),
        }
      );
      if (response.ok) {
        setReloadData(true);
      }
    } catch (error) {
      console.log(' Failed to update appointment:', error.message);
    }
    setShowDeleteModal(false);
    setModalVisible(false);
  };
  const deletePatientAppointment = async (
    appointment_id,
    start_recurrence_id
  ) => {
    // console.log('Selected delete option:', appointment_id, start_recurrence_id);
    const isConnected = await checkInternetAndProceed();
    if (!isConnected) {
      return;
    }

    try {
      if (start_recurrence_id == '') {
        const response = await fetch(
          `${Constants.API_BASE_URL}/appointments/${appointment_id}/`,
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Authorization: Constants.AUTH_HEADER,
            },
          }
        );

        // console.log('Appointment response:', response.ok);
        setReloadData(true);
        return data;
      } else {
        const response = await fetch(
          `${Constants.API_BASE_URL}/appointments/${appointment_id}/`,
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Authorization: Constants.AUTH_HEADER,
            },
            body: JSON.stringify({
              start_recurrence_id: start_recurrence_id,
            }),
          }
        );

        if (response.ok) {
          setReloadData(true);
        }
      }
    } catch (error) {
      console.log(' Failed to update appointment:', error.message);
    }
    setShowDeleteModal(false);
    setModalVisible(false);
  };
  const handlerPatientNoShowStatusChange = async (
    outcomeText,
    appointment_id,
    status,
    isCancel = false
  ) => {
    console.log("=== ", outcomeText, appointment_id)
    const isConnected = await checkInternetAndProceed();
    if (!isConnected) {
      return;
    }

    await logEvent('appointment_status_changed', {
      old_status: getStatusName(status),
      new_status: 'No_Show'
    });

    try {
      const response = await fetch(
        `${Constants.API_BASE_URL}/appointments/${appointment_id}/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: Constants.AUTH_HEADER,
          },
          body: JSON.stringify({

            "status": 4,
            "companion_name": "",
            "companion_type": null,
            "outcome_notes": outcomeText,
            "intake_form_request": {
              "intake_form_request_submissions": {
                "create": [

                ]
              }
            },
            "diagnosis": {
              "hearing_loss_left": null,
              "hearing_loss_right": null,
              "hearing_loss_type_left": null,
              "hearing_loss_type_right": null,
              "hearing_loss_shape_left": null,
              "hearing_loss_shape_right": null,
              "icd10_codes": [

              ],
              "patient": selectedItem?.extra?.patient?.id
            },
            "hearing_test_conducted": false,
            "companion_present": false,
            "telehealth_provider": ""
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        console.log(`Request failed: ${response.status} ${errText}`);
      }

      const data = await response.json();
      console.log('Appointment updated:', data);
      setReloadData(true);
      return data;
    } catch (error) {
      console.log(' Failed to update appointment:', error.message);
    }
  };
  const handlerPatientStatusChange = async (
    status,
    appointment_id,
    isCancel = false
  ) => {
    const updated_status = isCancel
      ? 3
      : status == 1
        ? 2
        : status == 4
          ? 5 : status == 2
            ? 5
            : status == 5
              ? 99
              : 3;
    // console.log("=== ",status, updated_status, appointment_id,sunoUpdateAppointmentsStatusPATCH)

    await logEvent('appointment_status_changed', {
      old_status: getStatusName(status),
      new_status: getStatusName(updated_status)
    });
    const isConnected = await checkInternetAndProceed();
    if (!isConnected) {
      return;
    }
    try {
      const response = await fetch(
        `${Constants.API_BASE_URL}/appointments/${appointment_id}/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: Constants.AUTH_HEADER,
          },
          body: JSON.stringify({
            status: updated_status,
            intake_form_request: {
              intake_form_request_submissions: {
                create: [],
              },
            },
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        console.log(`Request failed: ${response.status} ${errText}`);
      }

      const data = await response.json();
      // console.log('Appointment updated:', data);
      setReloadData(true);
      return data;
    } catch (error) {
      console.log(' Failed to update appointment:', error.message);
    }
  };

  // const handleNextWeek = () => {
  //   setSelectedDate(format(addDays(new Date(selectedDate), 7), 'yyyy-MM-dd'));
  //   setSelectedWeekDay(addDays(new Date(selectedDate), 7));
  //   const range = getWeekRange(selectedWeekDay);
  //   setFromDate(range.start);
  //   setToDate(range.end);

  //   console.log('==== ', range);
  // };

  const handleNextWeek = () => {
    // base = selectedWeekDay if you keep it as a Date; otherwise convert selectedDate
    const base = selectedWeekDay ?? toDate(selectedDate);
    const next = addDays(base, 7);

    // compute range from "next" immediately (don’t wait for state)
    const range = getWeekRange(next);

    // now update state
    setSelectedWeekDay(next); // Date
    setSelectedDate(format(next, 'yyyy-MM-dd')); // string
    setFromDate(range.start);
    setToDate(range.end);
  };

  const handlePrevWeek = () => {
    const base = selectedWeekDay ?? toDate(selectedDate);
    const prev = addDays(base, -7);
    const range = getWeekRange(prev);

    setSelectedWeekDay(prev);
    setSelectedDate(format(prev, 'yyyy-MM-dd'));
    setFromDate(range.start);
    setToDate(range.end);
  };

  const handleToday = () => {
    const today = new Date();

    // 1. Select today's date
    setSelectedDate(format(today, 'yyyy-MM-dd'));


    setSelectedWeekDay(today);

    const range = getWeekRange(today);

    // 4. Update from/to dates
    setFromDate(range.start);
    setToDate(range.end);

  };



  const [clickedDate, setClickedDate] = useState(null);

  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [selectedWeekDay, setSelectedWeekDay] = useState(new Date());
  const [staff_id, setStaff_id] = useState(Constants.UserInfo?.id);

  // const getWeekRange = (date = new Date()) => {
  //   // Clone the date
  //   const today = new Date(date);

  //   // Get day index (0 = Sunday, 1 = Monday, ... 6 = Saturday)
  //   const day = today.getDay();

  //   // Calculate Monday (start of week)
  //   const monday = new Date(today);
  //   monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));

  //   // Calculate Sunday (end of week)
  //   const sunday = new Date(monday);
  //   sunday.setDate(monday.getDate() + 6);

  //   // Format helper
  //   const formatDate = d => {
  //     const year = d.getFullYear();
  //     const month = String(d.getMonth() + 1).padStart(2, '0');
  //     const day = String(d.getDate()).padStart(2, '0');
  //     return `${year}-${month}-${day}`;
  //   };

  //   return {
  //     start: formatDate(monday),
  //     end: formatDate(sunday),
  //   };
  // };
  const getWeekRange = (date = new Date()) => {
    const start = startOfWeek(date, { weekStartsOn: 0 }); // Sunday
    const end = endOfWeek(date, { weekStartsOn: 0 }); // Saturday

    return {
      start: format(start, 'yyyy-MM-dd'),
      end: format(end, 'yyyy-MM-dd'),
    };
  };
  const range = getWeekRange(selectedWeekDay);

  const [fromDate, setFromDate] = useState(range.start);
  const [toDate, setToDate] = useState(range.end);

  useEffect(() => {
    const fetchData = async () => {
      // console.log('=========PRovider Constants : ', Constants);
      const isConnected = await checkInternetAndProceed();
      if (!isConnected) {
        return;
      }
      const allProviderData = (
        await SunoApi.getProvidersGET(Constants, {
          is_active: true,
          limit: 300,
          query: '{id,full_name,role,photo}',

          // '{id,touchpoint_notifications_enabled,scheduler_select_all_staff,scheduler_persist_per_clinic,last_name,non_npi_id_qualifier,npi,role,patient_arrived_sound_enabled,user_preferences,first_name,task_is_assigned_notifications_enabled,signature,photo,title,suffix,license_number,user_reminder_notifications_enabled,suno_comms_id,date_joined,payment_request_notifications_enabled,is_active,fax_phone,full_name,last_login,user_permissions,non_npi_id,onboarding_form_notifications_enabled,name,color,noah_username,groups{id,name,permissions},email,clinics{id,name,timezone,noah_provider,noah_alias,noah_tenant_id},default_clinic{id,name,timezone},can_see_manufacturer_cost}',
        })
      )?.json;

      const providersData = fetchProviders(allProviderData);
      setProviderData(providersData);
      if (providersData.length > 0) {
        const matchedProvider = providersData.find(
          p => String(p.value) === String(staff_id)
        );
        if (matchedProvider) {
          setProvider(matchedProvider.value);
          setSelectedType(matchedProvider.label);
        } else {
          setProvider(providersData[0].value);
          setSelectedType(providersData[0].label);
        }
      }
    };

    fetchData();
  }, []);
  // useEffect(() => {
  //   if (providerData.length > 0) {
  //     const matchedProvider = providerData.find(
  //       p => String(p.value) === String(staff_id)
  //     );
  //     if (matchedProvider) {
  //       setProvider(matchedProvider.value);
  //       setSelectedType(matchedProvider.label);
  //     } else {
  //       setProvider(providerData[0].value);
  //       setSelectedType(providerData[0].label);
  //     }
  //     console.log(
  //       '=========PRovider : ',
  //       provider,staff_id
  //     );
  //   }
  // }, [provider, providerData]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const isConnected = await checkInternetAndProceed();
        if (!isConnected) {
          return;
        }
        // setProviders(providersData);
        setLoading(true);
        setReloadData(false);
        // ,
        const res = await fetch(
          `${Constants.API_BASE_URL}/events-optimized/?status=0,1,2,4,5,99&from_date=${fromDate}&to_date=${toDate}&query={*}&staff_member=${provider}&type=A,S`, // provider
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: Constants.AUTH_HEADER,
            },
          }
        );
        const json = await res.json();

        const filteredEvents = json.results.filter(e => !(e.type === "S" && e.extra.is_available === true && e.extra.appointment_types.length > 0))
        setEvents(filteredEvents);
        // console.log(
        //   '======= Json :',
        //   `${Constants.API_BASE_URL}/events-optimized/?status=0,1,2,4,5,99&clinic=2,1&from_date=${fromDate}&to_date=${toDate}&query={*}&staff_member=${provider}&type=A,S`,
        //   json.results
        // );
        setTimeout(() => {
          setLoading(false);
        }, 200);

      } catch (err) {
        console.log(err);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };
    if (provider != '') {
      fetchData();
    }
    const subscription = DeviceEventEmitter.addListener(
      'reloadScheduleData',
      () => {
        // console.log("======= subscription : ")
        fetchData(); // call your reload function here
      }
    );

    return () => subscription.remove();
  }, [selectedWeekDay, provider, reloadData]);
  // console.log("======= setShowOptionalModal : ", showOptionalModal)

  const formatTime = (date, zone) => {
    const options = { hour: 'numeric', minute: 'numeric', hour12: true };
    // return date.toLocaleTimeString([], options);
    if (!date) return null;
    // return moment(date).format('hh:mm A'); // e.g., 01:00 PM
    return moment.tz(date, zone).format('hh:mm A');
  };

  const formatTimeRangeDisplay = (startISO, endISO, zone) => {
    if (!startISO || !endISO) return '—';
    const validZone = TIMEZONE_MAP[zone?.toLowerCase()] || zone || 'UTC';

    const dateFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: validZone || 'UTC',
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

    const timeFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: validZone || 'UTC',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const datePart = dateFormatter.format(new Date(startISO));
    const startTime = timeFormatter.format(new Date(startISO));
    const endTime = timeFormatter.format(new Date(endISO));

    return `${datePart} / ${startTime} - ${endTime}`;
  };

  const formatTimeDisplay = (isoString, zone) => {
    if (!isoString) return '—';
    const validZone = TIMEZONE_MAP[zone?.toLowerCase()] || zone || 'UTC';

    return new Intl.DateTimeFormat('en-US', {
      timeZone: validZone || 'UTC',
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
      .format(new Date(isoString))
      .replace(',', '');
  };

  useEffect(() => {
    const formatted = convertEventsToAgendaItems(events);
    setAgendaItems(formatted);
  }, [events]);

  const convertEventsToAgendaItems = events => {
    const agendaItems = {};

    events.forEach(event => {
      // const dateKey = moment(event.start_moment).format('YYYY-MM-DD');

      const zone = event.clinic?.timezone || 'UTC';

      // Format date key using clinic's timezone
      const dateKey = moment.tz(event.start_moment, zone).format('YYYY-MM-DD');

      if (!agendaItems[dateKey]) {
        agendaItems[dateKey] = [];
      }
      const isDuplicate = agendaItems[dateKey].some(item =>
        item.fullData.type === 'A'
          ? item.fullData.extra.appointment_id === event.extra.appointment_id
          : item.fullData.extra.schedule_id === event.extra.schedule_id
      );

      if (!isDuplicate) {
        agendaItems[dateKey].push({
          // name: event.title,
          // appointmentType: event.appointmentType,
          // status: event.status,
          // provider: event.provider,
          // isTelephonic: event.isTelephonic,
          // start_moment: event.start_moment,
          // end_moment: event.end_moment,
          // start: new Date(event.start_moment),
          // end: new Date(event.end_moment),
          // staff: event.staff_member,
          // clinic: event.clinic,
          // note: event.extra?.notes || '',
          fullData: event, // Optional: to pass all event data
        });
      }
    });
    return agendaItems;
  };
  const getStatusBGStyles = (status, startTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const isPast = start < now;

    let baseColor = '#3498db'; // Default appointment color
    let textColor = '#fff'; // Default text color

    if (isPast) {
      // Completed/past appointment: solid fill
      // return {
      //   backgroundColor: baseColor,
      //   borderWidth: 0,
      //   color: textColor,
      //               borderColor: baseColor,

      // };

      switch (status) {
        case 1:
          return {
            backgroundColor: '#1e40afCC',
            color: textColor,
            borderWidth: 0,
            borderColor: baseColor,
          };
        case 'cancelled':
          return {
            backgroundColor: '#991b1bCC',
            color: textColor,
            borderWidth: 0,
            borderColor: baseColor,
          };
        case 'in-progress':
          return {
            backgroundColor: '#166534CC',
            color: textColor,
            borderWidth: 0,
            borderColor: baseColor,
          };
        case 1:
          return {
            backgroundColor: '#92400eCC',
            color: textColor,
            borderWidth: 0,
            borderColor: baseColor,
          };
        default:
          return {
            backgroundColor: '#1f2937CC',
            color: textColor,
            borderWidth: 0,
            borderColor: baseColor,
          };
      }
    } else {
      // Future appointment: border and 50% shaded background
      //   return {
      //     backgroundColor: `${baseColor}80`, // 80 = 50% opacity in hex
      //     borderColor: baseColor,
      //     borderWidth: 2,
      //     color: baseColor,
      //   };
      // }
      const borderWidth = 1;
      switch (status) {
        case 2:
          return {
            color: '#1e40af',
            backgroundColor: '#c79aeb80',
            borderWidth: borderWidth,
            borderColor: baseColor,
          };
        case 'cancelled':
          return {
            color: '#991b1b',
            backgroundColor: '#fee2e2',
            borderWidth: borderWidth,
            borderColor: baseColor,
          };
        case 'in-progress':
          return {
            color: '#166534',
            backgroundColor: '#dcfce7',
            borderWidth: borderWidth,
            borderColor: baseColor,
          };
        case 1:
          return {
            color: '#92400e',
            backgroundColor: '#fef3c7',
            borderWidth: borderWidth,
            borderColor: baseColor,
          };
        default:
          return {
            color: '#1f2937',
            backgroundColor: '#e5e7eb',
            borderWidth: borderWidth,
            borderColor: baseColor,
          };
      }
    }
  };

  const getStatusStyles = status => {
    switch (status) {
      case 'confirmed':
        return { color: '#1e40af', backgroundColor: '#dbeafe' };
      case 'cancelled':
        return { color: '#991b1b', backgroundColor: '#fee2e2' };
      case 'in-progress':
        return { color: '#166534', backgroundColor: '#dcfce7' };
      case 1:
        return { color: '#92400e', backgroundColor: '#fef3c7' };
      default:
        return { color: '#1f2937', backgroundColor: '#e5e7eb' };
    }
  };

  const getStatusName = status => {
    switch (status) {
      case 4:
        return 'No-Show';
      case 2:
        return 'Confirmed';
      case 'cancelled':
        return 'Cancelled';
      case 5:
        return 'Arrived';
      case 1:
        return 'Unconfirmed';
      case 3:
        return 'Cancelled';
      default:
        return 'Completed';
    }
  };

  const getStatusNameForAction = status => {
    switch (status) {
      case 4:
        return 'Patient Arrived';
      case 2:
        return 'Patient Arrived';
      case 'cancelled':
        return 'Cancelled';
      case 5:
        return 'Complete';
      case 1:
        return 'Patient Confirmed';
      default:
        return 'Completed';
    }
  };

  const filterFutureAgendaItems = items => {
    const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"

    const filtered = Object.fromEntries(
      Object.entries(items).filter(([date]) => date >= today)
    );

    return filtered;
  };
  const filteredItems = useMemo(() => {
    if (!selectedDate) return {};

    const tasksForDate = agendaItems[selectedDate] || [];

    const filteredTasks =
      // provider
      //   ? tasksForDate.filter(task => task.provider === provider)
      //   :
      tasksForDate;

    // Always return at least an empty array for the selected date
    // return {
    //   [selectedDate]: filteredTasks.length > 0 ? filteredTasks : [],
    // };

    const newItems = {
      [selectedDate]: filteredTasks.map((ev, index) => ({
        ...ev,
        key: `${selectedDate}-${ev.fullData?.id ||
          ev.fullData?.extra.appointment_id ||
          ev.fullData?.extra?.schedule_id ||
          index
          }`,
      })),
    };
    // console.log("===== new item : ",newItems )

    return newItems;
  }, [agendaItems, provider, selectedDate]);

  // markedDates: show all tasks, but highlight selected date
  const markedDates = useMemo(() => {
    const marks = {};

    Object.entries(agendaItems).forEach(([date, tasks]) => {
      // Filter tasks based on selected provider (if any)
      const filteredTasks =
        // provider
        //   ? tasks.filter(task => task.provider === provider)
        //   :
        tasks;

      if (filteredTasks.length > 0) {
        marks[date] = { marked: true };
      }
    });

    // Highlight selected date
    if (selectedDate) {
      marks[selectedDate] = {
        ...(marks[selectedDate] || {}),
        selected: true,
        dotColor: '#611B61FF',
        selectedColor: '#066858',
      };
    }

    return marks;
  }, [agendaItems, provider, selectedDate]);
  // const filteredItems = useMemo(() => {
  //   if (!provider) return agendaItems;

  //   const filtered = {};

  //   Object.entries(agendaItems).forEach(([date, tasks]) => {
  //     console.log('===date :', date, selectedDate);
  //     // Skip this date if a specific date is selected and it doesn't match
  //     // if (selectedDate && date !== selectedDate) return;

  //     const filteredTasks = provider
  //       ? tasks.filter(task => task.provider === provider)
  //       : tasks;

  //     if (filteredTasks.length > 0) {
  //       filtered[date] = filteredTasks;
  //     }
  //   });

  //   return filtered;
  // }, [agendaItems, provider]);

  // const markedDates = useMemo(() => {
  //   return buildMarkedDates(filteredItems, selectedDate);
  // }, [filteredItems, selectedDate]);

  const handleMonthChange = monthObj => {
    const newMonthDate = `${monthObj.year}-${String(monthObj.month).padStart(
      2,
      '0'
    )}-01`;
    setSelectedDate(newMonthDate); // will trigger re-marking
  };

  const getAppointmentColor = appointment_types => {
    if (!appointment_types || appointment_types.length === 0) {
      return '#f7f7f7'; // default black if no types
    }

    return appointment_types[0].color || '#f7f7f7';
  };

  const getTextColor = bgColor => {
    // Remove "#" if present
    const color = bgColor.replace('#', '');

    // Convert hex to RGB
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);

    // Calculate luminance (brightness)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    // Return black text for light backgrounds, white for dark
    return brightness > 128 ? '#000000' : '#FFFFFF';
  };

  const addOpacity = (hexColor, opacity = 0.5) => {
    if (!hexColor) return 'transparent';

    // Remove '#' if present
    const color = hexColor.replace('#', '');

    // Parse the hex into RGB
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };
  const isValidTimeZone = tz => {
    if (!tz || typeof tz !== 'string') return false;
    try {
      // This will throw a RangeError for invalid timeZone values
      new Date().toLocaleString('en-US', { timeZone: tz });
      return true;
    } catch (e) {
      return false;
    }
  };
  const isNotFutureDate = (date, timeZone = 'UTC') => {
    if (!date) return false;

    try {
      // Parse the input date (works for string or Date)
      const inputDate = typeof date === 'string' ? parseISO(date) : date;
      if (isNaN(inputDate)) return false;

      const validZone =
        TIMEZONE_MAP[timeZone?.toLowerCase()] || timeZone || 'UTC';

      // Convert both input and current date to the specified timezone
      const zonedNow = toZonedTime(new Date(), validZone);
      const zonedInput = toZonedTime(inputDate, validZone);

      // Reset time to midnight for accurate date-only comparison
      zonedNow.setHours(0, 0, 0, 0);
      zonedInput.setHours(0, 0, 0, 0);
      return zonedInput > zonedNow;
    } catch (e) {
      console.log('Error in isNotFutureDate:', e);
      return false;
    }
  };
  const renderItem = ({ item }) => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 10,
        margin: 4,
        backgroundColor: item.tag.color,
      }}
    >
      <Text style={{ color: getTextColor(item.tag.color), marginRight: 6 }}>{item.tag.name}</Text>
      {/* <TouchableOpacity
        style={{
          height: 20,
          width: 20,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon
          name={'Ionicons/close-circle'}
          size={18}
          color="#fff" // customize arrow color
        />
      </TouchableOpacity> */}
    </View>
  );
  // console.log('======= filteredItems :', filteredItems);

  const renderAgendaItem = selectedData => {
    const item = selectedData?.item;
    let textColor =
      item.fullData.type == 'S'
        ? item?.fullData?.extra?.is_clinic_event == true
          ? '#fff'
          : getTextColor(
            getAppointmentColor(item?.fullData?.extra?.appointment_types)
          )
        : getTextColor(item?.fullData?.extra?.appointment_type?.color);

    // ?.key ,selectedDate, item?.fullData.type == 'S' ? item.fullData.title : item?.fullData.extra.appointment_type.name);
    return (
      <View>
        {item?.fullData?.type == 'S' && (
          <TouchableOpacity
            style={styles.agendaItem}
            onPress={async () => {
              setSelectedItem(item?.fullData);
              // console.log('Appointment response:', item.fullData);

              await logEvent('appointment_viewed', {
                appt_type: item?.fullData?.type,
                // days_until_appt: 
              });
              setModalVisible(true);
            }}
          >
            <View
              style={[
                // getStatusBGStyles(
                //   item?.fullData.status,
                //   item?.fullData.start_moment
                // ),
                {
                  padding: 16,
                  marginHorizontal: 16,
                  marginTop: 17,
                  borderRadius: 8,
                  shadowColor: getStatusBGStyles(
                    item?.fullData.status,
                    item?.fullData.start_moment
                  ).color,
                  // shadowOpacity: 0.2,
                  // shadowOffset: { width: 0, height: 6 },
                  // shadowRadius: 6,
                  // elevation: 2,
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.15,
                  shadowRadius: 6,
                  borderWidth: 1,
                  // Elevation for Android
                  borderColor:
                    item?.fullData?.extra?.is_clinic_event == true
                      ? 'rgb(80, 95, 122)'
                      : '#bfc2c1',
                  backgroundColor:
                    item?.fullData?.extra?.is_clinic_event == true
                      ? '#000'
                      : getAppointmentColor(
                        item?.fullData.extra.appointment_types
                      ),
                },
              ]}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: 5,
                  // paddingRight : 10,
                  marginRight: 10,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingTop: 5,
                    flex: 1,
                    paddingRight: 40,
                    flexWrap: 'wrap',
                  }}
                >
                  <Text
                    style={{
                      color: textColor,
                      flexShrink: 1,
                      paddingRight: 3,
                      fontWeight: '600',
                    }}
                    numberOfLines={3}
                  >
                    {item?.fullData?.extra?.is_available ? `${item?.fullData?.extra?.appointment_types?.[0]?.name}` : `${item?.fullData?.title ?? ''}`}
                  </Text>
                  {item?.fullData?.extra?.appointment_types.length > 0 && (
                    <Text
                      style={{
                        fontSize: 13,

                        color: textColor,

                        flexShrink: 1,
                      }}
                      numberOfLines={3}
                    >
                      {/* ({item?.fullData?.extra?.appointment_types[0].name}) */}
                      {item?.fullData?.extra?.is_available
                        ? `appointment slot for ${item?.fullData?.staff_member?.first_name || ''} ${item?.fullData?.staff_member?.last_name || ''}`
                        : item?.fullData?.extra?.appointment_types?.[0]?.name || ''}

                    </Text>
                  )}

                  {item?.fullData?.extra?.is_clinic_event && (
                    <Icon
                      size={15}
                      name={'Entypo/globe'}
                      color={textColor}
                      style={{ marginLeft: 15 }}
                    />
                  )}
                </View>

                {item?.fullData?.extra?.is_recurring && (
                  <Icon
                    size={15}
                    name={'Feather/refresh-ccw'}
                    color={textColor}
                  />
                )}
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingTop: 5,
                  alignItems: 'center'
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: textColor,
                  }}
                >
                  {formatTime(
                    item?.fullData?.start_moment,
                    item?.fullData?.clinic?.timezone || 'UTC'
                  )}{' '}
                  -{' '}
                  {formatTime(
                    item?.fullData?.end_moment,
                    item?.fullData?.clinic?.timezone || 'UTC'
                  )}
                </Text>
                {item?.fullData?.extra?.is_available &&
                  <Text style={[styles.modalTitle, { color: textColor, fontWeight: '500', fontSize: 11, flexShrink: 1, paddingLeft: 5, textAlign: 'right', flex: 1 }]} numberOfLines={3}>
                    ({'Web-Scheduled'})
                  </Text>
                }
              </View>
            </View>
          </TouchableOpacity>
        )}
        {item?.fullData?.type === 'A' && (
          <TouchableOpacity
            style={styles.agendaItem}
            onPress={async () => {
              setSelectedItem(item?.fullData);
              await logEvent('appointment_viewed', {
                appt_type: item?.fullData?.type,
                // days_until_appt: 
              });
              setModalVisible(true);
            }}
          >
            <View
              style={[
                getStatusBGStyles(item?.status, item?.start_moment),

                {
                  padding: 16,
                  marginHorizontal: 16,
                  marginTop: 17,
                  borderRadius: 8,
                  shadowColor: getStatusBGStyles(
                    item?.status,
                    item?.start_moment
                  ).color,
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.15,
                  shadowRadius: 6,
                  // Elevation for Android
                  borderColor: addOpacity(
                    item?.fullData?.extra?.appointment_type?.color,
                    1
                  ),
                  backgroundColor: addOpacity(
                    item?.fullData?.extra?.appointment_type?.color,
                    0.6
                  ),
                  borderWidth: 1,
                  // backgroundColor: getStatusBGStyles(
                  //   item?.status,
                  //   item?.start_moment
                  // ).backgroundColor,
                  // borderStyle: 'dashed',
                },
              ]}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: 5,
                }}
              >
                <Text
                  style={{
                    color: textColor,
                    fontSize: 13,
                    fontWeight: '600',
                  }}
                >
                  {`${item?.fullData?.extra?.patient?.first_name ?? ''} ${item?.fullData?.extra?.patient?.last_name ?? ''}`}
                </Text>
                {item?.fullData?.isTelephonic && (
                  <Icon
                    size={15}
                    name={'Octicons/device-camera-video'}
                    color={textColor}
                  />
                )}
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingTop: 7,
                }}
              >
                <Text
                  style={{
                    color: textColor,
                    flex: 1,
                    fontSize: 12,
                  }}
                >
                  {item?.fullData?.extra?.appointment_type.name}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  // paddingTop: 5,
                  alignItems: 'center',
                }}
              >
                {/* <Text
                  style={{
                    color: getStatusBGStyles(item?.status, item?.start_moment)
                      .color,
                  }}
                >
                  Room : {item?.fullData.extra?.room?.name || 'No Room'}
                </Text> */}
                {/* <Text
                  style={{
                    color: getStatusBGStyles(item?.status, item?.start_moment)
                      .color,
                  }}
                >
                  {getStatusName(item?.fullData.extra.status)}
                </Text> */}
                <Text
                  style={{
                    color: textColor,
                    fontSize: 12,
                  }}
                >
                  {formatTime(
                    item.fullData.start_moment,
                    item.fullData.clinic?.timezone || 'UTC'
                  )}{' '}
                  -{' '}
                  {formatTime(
                    item?.fullData?.end_moment,
                    item?.fullData?.clinic?.timezone || 'UTC'
                  )}
                </Text>
                <View
                  style={{
                    // alignSelf: 'flex-end',
                    alignItems: 'center',
                    flexDirection: 'row',
                    // marginTop: 10,
                    padding: 8,
                    borderRadius: 15,
                    backgroundColor: 'rgba(199, 154, 235, 0.8)',
                  }}
                >
                  <Icon
                    size={18}
                    name={
                      item?.fullData?.extra?.status == 4 ?
                        'Ionicons/eye-off'
                        : item?.fullData?.extra?.status == 1
                          ? 'FontAwesome/question-circle'
                          : item?.fullData?.extra?.status == 2
                            ? 'MaterialCommunityIcons/calendar-check'
                            : item?.fullData?.extra?.status == 99
                              ? 'Feather/check-circle'
                              : 'MaterialIcons/person-pin-circle'
                    }
                    color={'#0000008a'}
                    style={{}}
                  />
                  <Text
                    style={[
                      {
                        alignSelf: 'flex-start',
                        paddingLeft: 5,
                        fontSize: 14,
                        fontWeight: '600',
                        // backgroundColor: getStatusBGStyles(
                        //   selectedItem?.extra.status
                        // ).backgroundColor,
                      },
                    ]}
                  >
                    {getStatusName(item?.fullData?.extra?.status)}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  };
  const RadioButton = ({ label, value, selected, onPress }) => {
    return (
      <Pressable style={styles.optionRow} onPress={() => onPress(value)}>
        <View style={styles.radioOuter}>
          {selected === value && <View style={styles.radioInner} />}
        </View>
        <Text style={styles.optionText}>{label}</Text>
      </Pressable>
    );
  };

  const DeleteAppointmentModal = ({ visible, onClose, onDelete }) => {
    const [selected, setSelected] = useState('this');

    return (
      <Modal
        transparent
        visible={visible}
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <View style={styles.container}>
            <Text style={styles.title}>
              {showDeleteType == 1
                ? 'Are you sure you want to delete this Appointment?'
                : 'Are you sure you want to delete this Personal Event?'}
            </Text>

            <RadioButton
              label={
                showDeleteType == 1 ? 'This appointment' : 'This Personal Event'
              }
              value="this"
              selected={selected}
              onPress={setSelected}
            />
            <RadioButton
              label={
                showDeleteType == 1
                  ? 'This and following appointments'
                  : 'This and following personal events'
              }
              value="this_following"
              selected={selected}
              onPress={setSelected}
            />
            <RadioButton
              label={
                showDeleteType == 1 ? 'All appointments' : 'All personal events'
              }
              value="all"
              selected={selected}
              onPress={setSelected}
            />

            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => onDelete(selected)}
              >
                <Text style={styles.deleteText}>DELETE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };
  const NoShowAppointmentModal = ({ visible, onClose, onDelete }) => {
    const [outcomeText, setOutcomeText] = useState('');

    return (
      <Modal
        transparent
        visible={visible}
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <View style={styles.container}>
            <Text style={styles.title}>
              {'Appointment Outcome'}
            </Text>


            <Text style={styles.optionText}>{'Outcome notes'}</Text>

            <TextInput
              autoCorrect={true}
              changeTextDelay={500}
              multiline={true}
              numberOfLines={4}
              onChangeText={setOutcomeText}
              webShowOutline={true}
              // enablesReturnKeyAutomatically={true}
              placeholder={'Enter Outcome notes...'}
              placeholderTextColor={palettes.App.TextPlaceholder}
              style={{
                marginTop: 3,
                borderBottomWidth: 1,
                borderColor: palettes.App.TextPlaceholder,
                borderLeftWidth: 1,
                borderRadius: 8,
                borderRightWidth: 1,
                borderTopWidth: 1,
                paddingBottom: 8,
                paddingLeft: 8,
                paddingRight: 8,
                paddingTop: 8,
                color: palettes.App.FilterTextColor,
                fontFamily: 'Inter_400Regular',
                marginBottom: 15,
                height: 90
              }}
              value={outcomeText}
            />


            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: '#00695c',
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 4,
                }}
                onPress={() => {
                  console.log("=== Outcome :", outcomeText)
                  onDelete(outcomeText)
                }
                }
              >
                <Text style={styles.deleteText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };
  const { groups } = Constants;
  const exists_chicagoland = groups.some(
    item => item.name?.toLowerCase() === "chicagoland audiologists".toLowerCase()
  );

  return (
    <SafeAreaView
      style={{ flex: 1, padding: 0, paddingTop: 10, marginTop: 10 }}
    >


      <Modal transparent visible={loading} animationType="fade">
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.7)',
          }}
        >
          <ActivityIndicator size="large" color="#066858" />
        </View>
      </Modal>

      <View
        style={{
          paddingHorizontal: 16,
          zIndex: Platform.OS === 'android' ? undefined : 1600,
        }}
      >
        {/* <DropDownBlock
          dropdownData={providerData}
          value={provider}
          setValue={setProvider}
          placeholderText="Select Provider"
          zIndex={5000}
          disabled={exists_chicagoland}
        /> */}

        <DropDownPicker
          disabled={exists_chicagoland}
          open={open}
          value={provider}
          items={providerData}
          setOpen={setOpen}
          setValue={setProvider}
          setItems={setProviderData}
          placeholder={'Select Provider'}
          zIndex={5000} // Important for Android stacking
          zIndexInverse={5000} // Needed if multiple dropdowns
          closeOnBackPressed={true}
          onClose={closeProviderDropdown}
          dropDownContainerStyle={{
            backgroundColor: 'white',
            borderColor: '#D1D5DB',
            borderRadius: 8,
            width: width - 40,
            // maxHeight: 225, // scrollable dropdown
          }}
          style={{
            backgroundColor: 'white',
            borderColor: '#D1D5DB',
            borderRadius: 8,
            width: width - 40,
          }}
          listMode="SCROLLVIEW" // Use scrollable list to avoid VirtualizedList warning
          dropDownDirection="BOTTOM"
          ListEmptyComponent={() => (
            <View style={{ padding: 15, alignItems: "center" }}>
              <Text style={{ color: "#6B7280" }}>No options</Text>
            </View>
          )}
        />

      </View>



      <View style={{ flex: 1 }}>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 20
          }}
        >
          <TouchableOpacity onPress={handleToday} style={{ borderColor: '#054743', borderWidth: 1, borderRadius: 7 }}>

            <Text style={{ fontSize: 16, fontWeight: '400', paddingHorizontal: 15, paddingVertical: 5, color: '#054743' }}>
              {'Today'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setReloadData(true)}>
            <Icon
              name={'Ionicons/reload-circle'}
              size={35}
              color="#066858" // customize arrow color
            />
          </TouchableOpacity>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingTop: 10,
          }}
        >
          <TouchableOpacity onPress={handlePrevWeek}>
            <Icon
              name={'MaterialIcons/arrow-back-ios'}
              size={24}
              color="#066858" // customize arrow color
            />
          </TouchableOpacity>
          <Text style={{ fontSize: 16, fontWeight: '200' }}>
            {format(new Date(selectedDate), 'MMMM yyyy')}
          </Text>
          <TouchableOpacity onPress={handleNextWeek}>
            <Icon
              name={'MaterialIcons/arrow-forward-ios'}
              size={24}
              color="#066858" // customize arrow color
            />
          </TouchableOpacity>
        </View>
        <Agenda
          // key={selectedDate}
          showClosingKnob={true}
          hideKnob={false}
          markedDates={markedDates}
          items={filteredItems}
          selected={selectedDate}
          onDayPress={day => {
            const clickedDate = day.dateString; // e.g. "2025-07-28"
            setClickedDate(clickedDate);
            setSelectedDate(day.dateString);
            // setFilteredItems(getUpcomingItems(agendaItems, clickedDate));
          }}
          renderEmptyData={() => (
            <View style={styles.emptyDate}>
              <Text styles={{ flex: 1, alignText: 'center' }}>No events</Text>
            </View>
          )}
          renderList={listProps => {
            const date = selectedDate; // or listProps.selectedDay if available
            const data = listProps.items?.[date] ?? [];

            // console.log("renderList data length:", data.length, date);

            return (
              <FlatList
                data={data}
                renderItem={renderAgendaItem}
                keyExtractor={(item, index) => item?.key ?? index.toString()}
                ListEmptyComponent={
                  <View style={styles.emptyDate}>
                    <Text styles={{ flex: 1, alignText: 'center' }}>
                      {!loading ? 'There are no appointments for this day' : ''}
                    </Text>
                  </View>
                }
              />
            );
          }}
          renderDay={() => {
            return null;
          }} // disables the day view
          // disable default Agenda item rendering
          // renderDay={(day, item) => {
          //   if (!day) return <View style={{ width: 60 }} />;

          //   const date = new Date(day);

          //   const dayName = date.toLocaleDateString('en-US', {
          //     weekday: 'short',
          //   });
          //   const dayNumber = date.getDate();
          //   return (
          //     <View
          //       style={{
          //         width: 60,
          //         alignItems: 'center',
          //         justifyContent: 'center',
          //         marginTop: 10,
          //       }}
          //     >
          //       <Text style={{ color: '#066858', fontSize: 26 }}>
          //         {dayNumber}
          //       </Text>

          //       <Text style={{ color: '#066858', fontSize: 10 }}>
          //         {dayName}
          //       </Text>
          //     </View>
          //   );
          // }}
          // disable default day label
          // renderItem={() =>
          //   items[selectedDate] ? (
          //     renderGrid(items[selectedDate])
          //   ) : (
          //     <Text style={{ padding: 16 }}>No events</Text>
          //   )
          // }
          renderEmptyDate={() => (
            <View style={{ padding: 20, flex: 1, alignSelf: 'center' }}>
              <Text>
                {!loading ? 'There are no appointments for this day' : ''}
              </Text>
            </View>
          )}
          // renderItem={renderAgendaItem}
          theme={{
            selectedDayBackgroundColor: '#066858',
            todayTextColor: '#066858',
            agendaDayTextColor: '#333',
            agendaDayNumColor: '#333',
            // dayTextColor: '#066858',
            dotColor: '#066858',
            selectedDotColor: '#ffffff',
            // agendaTodayColor: '#00adf5',
          }}
        />
      </View>

      {/* Optional: Add button to go back to Calendar view 
      {selectedDate && (
        <View style={{ padding: 16 }}>
          <Button
            title="Back to Calendar"
            onPress={() => setSelectedDate(null)}
          />
        </View>
           <Text style={styles.modalIno}>{'Appointment Details'}</Text> 

      )}*/}

      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>

          <NoShowAppointmentModal
            visible={noshowModal}
            onClose={() => {
              setNoShowModal(false)
              setModalVisible(false)
            }}
            onDelete={outcomeText => {
              setNoShowModal(false)
              setModalVisible(false)
              handlerPatientNoShowStatusChange(
                outcomeText,
                selectedItem?.extra?.appointment_id,
                selectedItem?.extra?.status
              );
            }}
          />

          <DeleteAppointmentModal
            visible={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onDelete={option => {
              if (showDeleteType == 1) {
                const start_recurrence_id =
                  option === 'this_following'
                    ? selectedItem?.extra?.appointment_id
                    : option === 'all'
                      ? selectedItem?.extra?.schedule?.appointment
                      : '';
                deletePatientAppointment(
                  selectedItem?.extra?.appointment_id,
                  start_recurrence_id
                );
              } else {
                const zone = selectedItem?.clinic?.timezone || 'UTC';

                // Format date key using clinic's timezone
                const dateStart = moment
                  .tz(selectedItem?.start_moment, zone)
                  .format('YYYY-MM-DD');
                const dateEnd = moment
                  .tz(selectedItem?.end_moment, zone)
                  .format('YYYY-MM-DD');

                const instance_start_date = option === 'all' ? '' : dateStart;

                const instance_end_date = option === 'this' ? dateEnd : '';

                deleteScheduleAppointment(
                  selectedItem?.extra?.schedule_id,
                  instance_start_date,
                  instance_end_date
                );
              }
            }}
          />
          <View style={styles.modalContent}>
            {selectedItem?.type === 'S' && (
              <ScrollView contentContainerStyle={{ padding: 20 }}>
                {selectedItem?.extra?.is_available &&
                  <Text style={[styles.modalTitle, { fontSize: 14, flexShrink: 1, paddingRight: 5, textAlign: 'center', flex: 1 }]} numberOfLines={3}>
                    {'Web-Scheduled'}
                  </Text>
                }
                <Text style={{ fontSize: 11, paddingTop: 20, color: '#666' }}>
                  {'Created:'} {selectedItem?.created_by?.first_name ?? ''}{' '}
                  {selectedItem?.created_by?.last_name ?? ''} at{' '}
                  {formatTimeDisplay(
                    selectedItem?.created_at,
                    selectedItem?.clinic?.timezone
                  )}
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    paddingTop: 2,
                    color: '#666',
                    paddingBottom: 10,
                  }}
                >
                  {'Last Updated:'} {selectedItem?.updated_by?.first_name || selectedItem?.updated_by?.last_name
                    ? `${selectedItem?.updated_by?.first_name ?? ''} ${selectedItem?.updated_by?.last_name ?? ''} at `
                    : ''
                  }
                  {formatTimeDisplay(
                    selectedItem?.created_at,
                    selectedItem?.clinic?.timezone
                  )}
                </Text>

                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', paddingTop: 10 }}>
                  <Text style={[styles.modalTitle, { flexShrink: 1, paddingRight: 5 }]} numberOfLines={3}>
                    {selectedItem?.title}</Text>

                  {selectedItem?.extra?.appointment_types.length > 0 && (
                    <Text
                      style={{ fontSize: 13, flexShrink: 1 }}
                      numberOfLines={3}
                    >
                      {selectedItem?.extra?.is_available
                        ? `appointment slot for ${selectedItem?.staff_member?.first_name || ''} ${selectedItem?.staff_member?.last_name || ''}`
                        : selectedItem?.extra?.appointment_types?.[0]?.name || ''}
                    </Text>
                  )}
                  {selectedItem?.extra?.is_clinic_event && (
                    <Icon
                      size={15}
                      name={'Entypo/globe'}
                      color="#000"
                      style={{ marginTop: 10, marginLeft: 5 }}
                    />
                  )}
                </View>
                <View
                  style={{
                    paddingTop: 20,
                    borderRadius: 10,
                  }}
                >
                  <View style={{ flexDirection: 'row' }}>
                    <Icon
                      size={18}
                      name={'MaterialCommunityIcons/folder-star'}
                      color={'#0000008a'}
                    />

                    <View style={{ paddingLeft: 10, flex: 1 }} numberOfLines={2} ellipsizeMode="tail">
                      <Text style={{ fontSize: 13 }}>
                        {formatTimeRangeDisplay(
                          selectedItem?.start_moment,
                          selectedItem?.end_moment,
                          selectedItem?.clinic?.timezone || 'UTC'
                        )}
                      </Text>
                      {selectedItem?.extra.is_recurring && (
                        <Text style={{ fontSize: 13, paddingTop: 5, flex: 1 }} numberOfLines={2} ellipsizeMode="tail">
                          {getRecurrenceText(selectedItem?.extra, selectedItem?.end_moment, selectedItem?.start_moment)}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>

                <View
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 10,
                    paddingTop: 15,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Icon
                      size={18}
                      name={'Entypo/location-pin'}
                      color={'#0000008a'}
                    />
                    <Text style={{ fontSize: 13, paddingLeft: 10, flex: 1 }} numberOfLines={1} ellipsizeMode="tail">
                      {selectedItem?.clinic?.name}
                    </Text>
                  </View>
                  {!selectedItem?.extra?.is_available &&
                    <View style={{ flexDirection: 'row', paddingTop: 15 }}>
                      <Icon
                        size={18}
                        name={'Feather/clipboard'}
                        color={'#0000008a'}
                      />

                      <Text style={{ paddingLeft: 10 }}>
                        {selectedItem?.extra?.notes || 'No additional notes.'}
                      </Text>
                    </View>
                  }
                </View>
                {!selectedItem?.extra?.is_available &&
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      paddingTop: 15,
                    }}
                  >
                    <TouchableOpacity
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        // justifyContent: 'space-between',
                        marginLeft: 5,
                        flex: 1,
                        borderRadius: 5,
                        borderWidth: 1,
                        borderColor: '#e5e7eb',
                        height: 40,
                        paddingHorizontal: 7,
                      }}
                      onPress={() => {
                        setModalVisible(false);
                        navigation.navigate('PersonalClinicEventScreen', {
                          // full_name: selectedItem?.staff.first_name,
                          eventData: selectedItem,
                          isEditing: true,
                        });
                      }}
                    >
                      <Icon size={16} name={'Feather/calendar'} color={'#000'} />
                      <Text
                        style={[{ paddingLeft: 7, color: '#000', fontSize: 13 }]} numberOfLines={1} ellipsizeMode="tail"
                      >
                        {'Reschedule'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                }
                {!selectedItem?.extra?.is_available &&
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      paddingTop: 15,
                    }}
                  >
                    {selectedItem?.isTelephonic && (
                      <TouchableOpacity
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'center',
                          alignItems: 'center',
                          // justifyContent: 'space-between',
                          borderRadius: 5,
                          borderWidth: 1,
                          borderColor: '#3b82f6',
                          height: 40,
                          marginRight: 5,
                          flex: 1,
                          backgroundColor: '#3b82f6',
                          paddingHorizontal: 7,
                        }}
                        onPress={() => {
                          setModalVisible(false);
                          navigation.navigate('TeleHealthScreen', {
                            // full_name: selectedItem?.staff.first_name,
                          });
                        }}
                      >
                        <Icon
                          size={16}
                          name={'Octicons/device-camera-video'}
                          color={'#fff'}
                        />
                        <Text
                          style={[
                            { paddingLeft: 7, color: '#fff', fontSize: 13 },
                          ]}
                        >
                          {'Start Telehealth'}
                        </Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        // justifyContent: 'space-between',
                        borderRadius: 5,
                        borderWidth: 1,
                        borderColor: 'red',
                        height: 40,
                        marginLeft: 5,
                        flex: 1,
                        paddingHorizontal: 7,
                      }}
                      onPress={() => {
                        setShowDeleteType(2);
                        setShowDeleteModal(true);
                        // setModalVisible(false);
                        // navigation.navigate('CaptureVisitScreen', {
                        //   // full_name: selectedItem?.staff.first_name,
                        // });
                      }}
                    >
                      <Icon
                        size={16}
                        name={'MaterialIcons/delete'}
                        color={'red'}
                      />
                      <Text
                        style={[{ paddingLeft: 7, color: 'red', fontSize: 13 }]}
                      >
                        {'Delete'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                }
              </ScrollView>
            )}
            {selectedItem?.type === 'A' && (
              <ScrollView contentContainerStyle={{ padding: 20 }}>
                <Text style={{ fontSize: 11, paddingTop: 20, color: '#666' }}>
                  {'Created:'} {selectedItem?.created_by?.first_name ?? ''}{' '}
                  {selectedItem?.created_by?.last_name ?? ''} at{' '}
                  {formatTimeDisplay(
                    selectedItem?.created_at,
                    selectedItem?.clinic?.timezone
                  )}
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    paddingTop: 2,
                    color: '#666',
                    paddingBottom: 10,
                  }}
                >
                  {'Last Updated:'} {selectedItem?.updated_by?.first_name || selectedItem?.updated_by?.last_name
                    ? `${selectedItem?.updated_by?.first_name ?? ''} ${selectedItem?.updated_by?.last_name ?? ''} at `
                    : ''
                  }
                  {formatTimeDisplay(
                    selectedItem?.created_at,
                    selectedItem?.clinic?.timezone
                  )}
                </Text>
                <Text style={[styles.modalTitle, { paddingTop: 10 }]}>
                  {selectedItem?.extra?.appointment_type?.name ?? ''} with{' '}
                  {selectedItem?.extra?.patient?.first_name ?? ''}{' '}
                  {selectedItem?.extra?.patient?.last_name ?? ''}
                </Text>
                <Text style={styles.modalTime}>
                  {formatTimeRangeDisplay(
                    selectedItem?.start_moment,
                    selectedItem?.end_moment,
                    selectedItem?.clinic?.timezone || 'UTC'
                  )}
                </Text>
                <View>
                  <View
                    style={{
                      alignSelf: 'flex-start',
                      alignItems: 'center',
                      flexDirection: 'row',
                      marginTop: 10,
                      padding: 8,
                      borderRadius: 15,
                      backgroundColor: '#c79aeb80',
                    }}
                  >
                    <Icon
                      size={18}
                      name={
                        selectedItem?.extra?.status == 4
                          ? 'Ionicons/eye-off'
                          : selectedItem?.extra?.status == 1
                            ? 'FontAwesome/question-circle'
                            : selectedItem?.extra?.status == 2
                              ? 'MaterialCommunityIcons/calendar-check'
                              : selectedItem?.extra?.status == 99
                                ? 'Feather/check-circle'
                                : 'MaterialIcons/person-pin-circle'
                      }
                      color={'#0000008a'}
                      style={{}}
                    />
                    <Text
                      style={[
                        {
                          alignSelf: 'flex-start',
                          paddingLeft: 5,
                          // backgroundColor: getStatusBGStyles(
                          //   selectedItem?.extra.status
                          // ).backgroundColor,
                        },
                      ]}
                    >
                      {getStatusName(selectedItem?.extra.status)}
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    backgroundColor: 'rgb(240, 242, 255)',
                    borderRadius: 10,
                    padding: 16,
                    marginVertical: 8,
                    // Shadow for iOS
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 4,
                    // Elevation for Android
                    elevation: 3,
                  }}
                >
                  <View style={{ flexDirection: 'row' }}>
                    <Icon
                      size={18}
                      name={'AntDesign/contacts'}
                      color={'#0000008a'}
                      style={{ marginTop: 3 }}
                    />

                    <View style={{ paddingLeft: 20 }}>
                      <Text style={{ fontSize: 16, fontWeight: 'medium' }}>
                        {selectedItem?.extra?.patient?.first_name ?? ''}{' '}
                        {selectedItem?.extra?.patient?.last_name ?? ''}
                      </Text>
                      <Text style={styles.modalTime}>
                        DOB : {selectedItem?.extra?.patient?.birthdate}
                      </Text>

                      <Text style={styles.modalTime}>
                        Phone : {selectedItem?.extra?.patient?.phone}
                      </Text>

                      <Text style={styles.modalTime}>
                        Suno ID : {selectedItem?.extra?.patient.id}
                      </Text>

                      <Text style={styles.modalTime}>
                        Noah ID : {selectedItem?.extra?.patient?.noah_id}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text
                  style={{ paddingTop: 15, color: '#555', paddingBottom: 5 }}
                >
                  Appointment Tags:
                </Text>
                <FlatList
                  data={selectedItem?.extra?.assigned_tags}
                  keyExtractor={item => item.id}
                  renderItem={renderItem}
                  horizontal={false}
                  numColumns={2}
                  columnWrapperStyle={{ flexWrap: 'wrap' }}
                />
                <View
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 10,
                    padding: 16,
                    marginVertical: 15,
                    // Shadow for iOS
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 4,
                    // Elevation for Android
                    elevation: 3,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon
                      size={18}
                      name={'Entypo/location-pin'}
                      color={'#0000008a'}
                    />
                    <Text style={{ paddingLeft: 20, color: '#555' }}>
                      {selectedItem?.clinic.name}
                    </Text>
                  </View>
                  {selectedItem?.extra?.referral_source?.name &&
                    <View style={{ flexDirection: 'row', paddingTop: 10 }}>
                      <Icon
                        size={18}
                        name={'FontAwesome/user-circle-o'}
                        color={'#0000008a'}
                      />

                      <Text style={{ paddingLeft: 20, color: '#555' }}>
                        {selectedItem?.extra?.referral_source?.name ?? ''}
                      </Text>
                    </View>
                  }
                  <View style={{ flexDirection: 'row', paddingTop: 10 }}>
                    <Icon
                      size={18}
                      name={'MaterialIcons/group'}
                      color={'#0000008a'}
                    />

                    <Text style={{ paddingLeft: 20, color: '#555' }}>
                      {selectedItem?.staff_member?.first_name ?? ''}{' '}
                      {selectedItem?.staff_member?.last_name ?? ''}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', paddingTop: 10 }}>
                    <Icon
                      size={18}
                      name={'Feather/plus-square'}
                      color={'#0000008a'}
                    />

                    <Text style={{ paddingLeft: 20, color: '#555' }}>
                      {selectedItem?.extra?.room?.name || 'No Room'}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', paddingTop: 10 }}>
                    <Icon
                      size={18}
                      name={'MaterialCommunityIcons/message-processing-outline'}
                      color={'#0000008a'}
                    />

                    <Text style={{ paddingLeft: 20, color: '#555' }}>
                      {selectedItem?.extra.should_notify
                        ? 'SMS Notifications Enabled'
                        : 'SMS Notifications Disabled'}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', paddingTop: 10 }}>
                    <Icon
                      size={18}
                      name={'Feather/clipboard'}
                      color={'#0000008a'}
                    />

                    <Text style={{ paddingLeft: 20, color: '#555' }}>
                      {selectedItem?.extra?.notes || 'No additional notes.'}
                    </Text>
                  </View>
                </View>
                {selectedItem?.isTelephonic && (
                  <View
                    style={{
                      flexDirection: 'row',
                      // justifyContent: 'space-between',
                      paddingTop: 10,
                    }}
                  >
                    <Icon
                      size={15}
                      name={'Octicons/device-camera-video'}
                      color={'#2563eb'}
                    />
                    <Text style={[{ paddingLeft: 7, color: '#2563eb' }]}>
                      {'Telehealth'}
                    </Text>
                  </View>
                )}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingTop: 15,
                  }}
                >
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                      // justifyContent: 'space-between',
                      borderRadius: 5,
                      borderWidth: 1,
                      borderColor: '#e5e7eb',
                      height: 40,
                      marginRight: 5,
                      flex: 1,
                      paddingHorizontal: 7,
                    }}
                    onPress={() => {
                      setModalVisible(false);
                      console.log("===== : ", selectedItem)
                      navigation.push('PatientDetailsScreen', {
                        id: selectedItem?.extra?.patient?.id,
                        clientID: selectedItem?.clinic?.id ? selectedItem?.clinic?.id : selectedItem?.extra?.clinics?.length > 0 ? selectedItem?.extra?.clinics[0] : "",
                        // box_folder_id : 
                      });
                    }} // use your route name
                  >
                    <Icon size={16} name={'AntDesign/user'} color={'#000'} />
                    <Text
                      style={[{ paddingLeft: 7, color: '#000', fontSize: 13 }]}
                    >
                      {'Patient Details'}
                    </Text>
                  </TouchableOpacity>
                  {selectedItem?.extra?.status != 99 && (
                    <TouchableOpacity
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        // justifyContent: 'space-between',
                        marginLeft: 5,
                        flex: 1,
                        borderRadius: 5,
                        borderWidth: 1,
                        borderColor: '#e5e7eb',
                        height: 40,
                        paddingHorizontal: 7,
                      }}
                      onPress={() => {
                        setModalVisible(false);
                        navigation.navigate('WizardViewScreen', {
                          // full_name: selectedItem?.staff.first_name,
                          appointmentData: selectedItem,
                          isEditing: true,
                        });
                      }}
                    >
                      <Icon
                        size={16}
                        name={'Feather/calendar'}
                        color={'#000'}
                      />
                      <Text
                        style={[
                          { paddingLeft: 7, color: '#000', fontSize: 13 },
                        ]}
                      >
                        {'Reschedule'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
                {selectedItem?.extra?.status != 99 && (
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      paddingTop: 15,
                    }}
                  >
                    <TouchableOpacity
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        // justifyContent: 'space-between',
                        borderRadius: 5,
                        borderWidth: 1,
                        borderColor: '#e5e7eb',
                        height: 40,
                        marginRight: 5,
                        flex: 1,
                        paddingHorizontal: 7,
                        backgroundColor:
                          selectedItem?.extra?.status == 2 &&
                            isNotFutureDate(
                              selectedItem?.start_moment,
                              selectedItem?.clinic?.timezone || 'UTC'
                            ) == true
                            ? '#f7f5f5'
                            : 'transparent',
                      }}
                      disabled={
                        selectedItem?.extra?.status == 2 &&
                        isNotFutureDate(
                          selectedItem?.start_moment,
                          selectedItem?.clinic?.timezone || 'UTC'
                        )
                      }
                      onPress={() => {
                        Alert.alert(
                          `Are you sure you want mark this appointment ${getStatusNameForAction(
                            selectedItem?.extra?.status
                          )}?`,
                          'This change can not be undone. Do you still want to proceed?',
                          [
                            {
                              text: 'Cancel',
                              onPress: () => console.log('Cancel Pressed'),
                              style: 'cancel', // iOS bolds "Cancel"
                            },
                            {
                              text: 'Yes',
                              onPress: () => {
                                setModalVisible(false);
                                handlerPatientStatusChange(
                                  selectedItem?.extra?.status,
                                  selectedItem?.extra?.appointment_id
                                );
                              },
                            },
                          ],
                          { cancelable: true } // ✅ Android back button closes alert
                        );

                        // setModalVisible(false);
                        // navigation.navigate('CaptureVisitScreen', {
                        //   // full_name: selectedItem?.staff.first_name,
                        // });
                      }}
                    >
                      <Icon
                        size={16}
                        name={
                          selectedItem?.extra?.status == 4
                            ? 'MaterialCommunityIcons/calendar-check'
                            : selectedItem?.extra?.status == 1
                              ? 'MaterialCommunityIcons/calendar-check'
                              : selectedItem?.extra?.status == 2
                                ? 'MaterialIcons/person-pin-circle'
                                : 'MaterialIcons/done-all'
                        }
                        color={'#000'}
                      />
                      <Text
                        style={[
                          { paddingLeft: 7, color: '#000', fontSize: 13 },
                        ]}
                      >
                        {getStatusNameForAction(selectedItem?.extra?.status)}
                      </Text>
                    </TouchableOpacity>
                    {selectedItem?.extra?.status != 4 && !isNotFutureDate(
                      selectedItem?.start_moment,
                      selectedItem?.clinic?.timezone || 'UTC'
                    ) &&
                      <TouchableOpacity
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'center',
                          alignItems: 'center',
                          // justifyContent: 'space-between',
                          borderRadius: 5,
                          borderWidth: 1,
                          borderColor: '#e5e7eb',
                          height: 40,
                          marginLeft: 5,
                          flex: 1,
                          paddingHorizontal: 7,
                          // backgroundColor:
                          //   selectedItem?.extra?.status == 2 &&
                          //     isNotFutureDate(
                          //       selectedItem?.start_moment,
                          //       selectedItem?.clinic?.timezone || 'UTC'
                          //     ) == true
                          //     ? '#f7f5f5'
                          //     : 'transparent',
                        }}

                        onPress={() => {
                          Alert.alert(
                            `Are you sure you want mark this appointment no-show?`,
                            'This change can not be undone. Do you still want to proceed?',
                            [
                              {
                                text: 'Cancel',
                                onPress: () => console.log('Cancel Pressed'),
                                style: 'cancel', // iOS bolds "Cancel"
                              },
                              {
                                text: 'Yes',
                                onPress: () => {
                                  // setModalVisible(false);
                                  setNoShowModal(true)
                                  // handlerPatientStatusChange(
                                  //   selectedItem?.extra?.status,
                                  //   selectedItem?.extra?.appointment_id
                                  // );
                                },
                              },
                            ],
                            { cancelable: true } // ✅ Android back button closes alert
                          );

                          // setModalVisible(false);
                          // navigation.navigate('CaptureVisitScreen', {
                          //   // full_name: selectedItem?.staff.first_name,
                          // });
                        }}
                      >
                        <Icon
                          size={16}
                          name={'Ionicons/eye-off'}
                          color={'#000'}
                        />
                        <Text
                          style={[
                            { paddingLeft: 7, color: '#000', fontSize: 13 },
                          ]}
                        >
                          {'Patient No-Show'}
                        </Text>
                      </TouchableOpacity>
                    }
                    {/* {selectedItem?.isTelephonic && (
                      <TouchableOpacity
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'center',
                          alignItems: 'center',
                          // justifyContent: 'space-between',
                          borderRadius: 5,
                          borderWidth: 1,
                          borderColor: '#3b82f6',
                          height: 40,
                          marginLeft: 5,
                          flex: 1,
                          backgroundColor: '#3b82f6',
                          paddingHorizontal: 7,
                        }}
                        onPress={() => {
                          setModalVisible(false);
                          navigation.navigate('TeleHealthScreen', {
                            // full_name: selectedItem?.staff.first_name,
                          });
                        }}
                      >
                        <Icon
                          size={16}
                          name={'Octicons/device-camera-video'}
                          color={'#fff'}
                        />
                        <Text
                          style={[
                            { paddingLeft: 7, color: '#fff', fontSize: 13 },
                          ]}
                        >
                          {'Start Telehealth'}
                        </Text>
                      </TouchableOpacity>
                    )} */}
                  </View>
                )}
                {selectedItem?.extra?.status != 99 && (
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      paddingTop: 15,
                    }}
                  >
                    <TouchableOpacity
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        // justifyContent: 'space-between',
                        borderRadius: 5,
                        borderWidth: 1,
                        borderColor: 'red',
                        height: 40,
                        marginRight: 5,
                        flex: 1,
                        paddingHorizontal: 7,
                      }}
                      onPress={() => {
                        Alert.alert(
                          `Are you sure you want to cancel this appointment?`, // Title
                          'This change can not be undone. Do you still want to proceed?',
                          [
                            {
                              text: 'Cancel',
                              onPress: () => console.log('Cancel Pressed'),
                              style: 'cancel', // iOS bolds "Cancel"
                            },
                            {
                              text: 'Yes',
                              onPress: () => {
                                setModalVisible(false);
                                handlerPatientStatusChange(
                                  selectedItem?.extra?.status,
                                  selectedItem?.extra?.appointment_id,
                                  true
                                );
                              },
                            },
                          ],
                          { cancelable: true } // ✅ Android back button closes alert
                        );

                        // setModalVisible(false);
                        // navigation.navigate('CaptureVisitScreen', {
                        //   // full_name: selectedItem?.staff.first_name,
                        // });
                      }}
                    >
                      <Icon
                        size={16}
                        name={'MaterialIcons/cancel'}
                        color={'red'}
                      />
                      <Text
                        style={[{ paddingLeft: 7, color: 'red', fontSize: 13 }]}
                      >
                        {'Cancel'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        // justifyContent: 'space-between',
                        borderRadius: 5,
                        borderWidth: 1,
                        borderColor: 'red',
                        height: 40,
                        marginLeft: 5,
                        flex: 1,
                        paddingHorizontal: 7,
                      }}
                      onPress={() => {
                        setShowDeleteType(1);
                        setShowDeleteModal(true);
                        // setModalVisible(false);
                        // navigation.navigate('CaptureVisitScreen', {
                        //   // full_name: selectedItem?.staff.first_name,
                        // });
                      }}
                    >
                      <Icon
                        size={16}
                        name={'MaterialIcons/delete'}
                        color={'red'}
                      />
                      <Text
                        style={[{ paddingLeft: 7, color: 'red', fontSize: 13 }]}
                      >
                        {'Delete'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            )}
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.modalClose}
            >
              <Text style={{ color: '#000' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {showOptionalModal &&
        <Modal visible={true} transparent animationType="fade">
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <View style={{
              width: '85%',
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 20
            }}>

              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                Update Available
              </Text>

              <Text style={{ marginBottom: 20 }}>
                A new version of the app is available. Please update for the best experience.
              </Text>

              <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>

                {/* Cancel Button */}
                <TouchableOpacity
                  onPress={async () => {
                    await AsyncStorage.setItem(
                      'skip_update_version',
                      latestVersion
                    );
                    setShowOptionalModal(false)
                  }}
                  style={{ marginRight: 15 }}
                >
                  <Text style={{ color: '#666', fontSize: 16 }}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                {/* Update Button */}
                <TouchableOpacity
                  onPress={openStore}
                  style={{
                    backgroundColor: '#066858',
                    paddingVertical: 8,
                    paddingHorizontal: 18,
                    borderRadius: 6
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                    Update
                  </Text>
                </TouchableOpacity>

              </View>
            </View>
          </View>
        </Modal>
      }
      <Modal visible={showUpdateModal} transparent animationType="fade">
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <View style={{
            width: '80%',
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 20,
            alignItems: 'center'
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
              Update Required
            </Text>

            <Text style={{ textAlign: 'center', marginBottom: 20 }}>
              A new version of the app is available. Please update to continue.
            </Text>

            <TouchableOpacity
              onPress={openStore}
              style={{
                backgroundColor: '#066858',
                paddingVertical: 12,
                paddingHorizontal: 25,
                borderRadius: 8
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                Update Now
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  item: {
    backgroundColor: '#e0f2ff',
    padding: 16,
    marginRight: 10,
    marginTop: 17,
    borderRadius: 8,
  },
  emptyDate: {
    // height: 50,
    alignItems: 'center',
    flex: 1,
    paddingTop: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    // maxHeight: '85%',
    width: '85%',
    // maxHeight: '85%',
    elevation: 5,
    flexShrink: 1,
    maxHeight: height * 0.85,

    // overflow: 'hidden',
    // backgroundColor : 'red'
  },
  modalIno: {
    fontSize: 16,
    alignText: 'center',
    flex: 1,
    // fontWeight: 'bold',
  },
  modalTitle: {
    // paddingTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalTime: {
    marginTop: 8,
    fontSize: 13,
    color: '#555',
  },
  modalNote: {
    marginTop: 12,
    color: '#777',
  },
  modalClose: {
    margin: 20,
    backgroundColor: '#e5e7eb',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  containerAndroid: {
    backgroundColor: '#F9FAFB',
    elevation: 5,
  },
  container: {
    // flex: 1,
    backgroundColor: '#F9FAFB',
    zIndex: 100, // base layer
  },
  formGroupAndroid: {
    marginBottom: 10,
    position: 'relative',
    paddingHorizontal: 10,
    elevation: 5,
  },
  formGroup: {
    marginBottom: 10,
    zIndex: 10,
    position: 'relative',
    paddingHorizontal: 10,
  },
  dropdown: {
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 12,
    paddingVertical: 12,
    width: width - 20,
  },
  dropdownOptionsWrapper: {
    position: 'absolute',
    top: 52, // adjust this depending on spacing
    left: 0,
    right: 0,
    zIndex: 999,
    elevation: 5,
    paddingHorizontal: 10,
    maxHeight: 230,
  },
  dropdownOptions: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    overflow: 'hidden',
  },
  dropdownOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dropdownOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  dropdownText: {
    fontSize: 14,
    color: '#111827',
  },
  placeholderText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    elevation: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#444',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#444',
  },
  optionText: {
    fontSize: 15,
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  cancelBtn: {
    marginRight: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelText: {
    color: '#00695c',
    fontWeight: '600',
  },
  deleteBtn: {
    backgroundColor: '#c62828',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  deleteText: {
    color: '#fff',
    fontWeight: '600',
  },
});

// export default CalendarBigView;
