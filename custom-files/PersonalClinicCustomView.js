import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
  Modal,
  Dimensions,
  ActivityIndicator,
  Alert,
  DeviceEventEmitter,
} from 'react-native';
import moment from 'moment-timezone';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as GlobalVariables from '../config/GlobalVariableContext';
import { IconButton } from '@draftbit/ui';
import { logError } from '..';
import { checkInternetAndProceed } from './InternetConnection';

// Constants
export const TIMEZONE_MAP = {
  'us/eastern': 'America/New_York',
  'us/central': 'America/Chicago',
  'us/mountain': 'America/Denver',
  'us/pacific': 'America/Los_Angeles',
  'us/arizona': 'America/Phoenix',
  'us/alaska': 'America/Anchorage',
  'us/hawaii': 'Pacific/Honolulu',
  'us/indiana-east': 'America/Indiana/Indianapolis',
  'eu/london': 'Europe/London',
  'eu/berlin': 'Europe/Berlin',
  'eu/paris': 'Europe/Paris',
  'asia/kolkata': 'Asia/Kolkata',
  'asia/dubai': 'Asia/Dubai',
  'asia/tokyo': 'Asia/Tokyo',
  'au/sydney': 'Australia/Sydney',
  utc: 'UTC',
};

const WEEKDAY_THREE_LETTER = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const WEEKDAY_KEY_LABELS = {
  MO: 'MON',
  TU: 'TUE',
  WE: 'WED',
  TH: 'THU',
  FR: 'FRI',
  SA: 'SAT',
  SU: 'SUN',
};

const getWeekdayLabel = date => WEEKDAY_THREE_LETTER[date.getDay()];

const throttle = (func, limit) => {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

const roundToNearest5Minutes = date => {
  const originalMinutes = date.getMinutes();
  const roundedMinutes = Math.ceil(originalMinutes / 5) * 5;

  const newDate = new Date(date);

  if (roundedMinutes === 60) {
    newDate.setHours(date.getHours() + 1);
    newDate.setMinutes(0);
  } else {
    newDate.setMinutes(roundedMinutes);
  }

  newDate.setSeconds(0);
  newDate.setMilliseconds(0);

  return newDate;
};

const getNextTenDays = (startFromDate = null) => {
  const days = [];

  let startDate;
  if (startFromDate) {
    startDate = new Date(startFromDate);
    startDate.setHours(0, 0, 0, 0);
  } else {
    startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
  }

  for (let i = 0; i < 10; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    const cleanDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    days.push({
      weekday: getWeekdayLabel(cleanDate),
      month: cleanDate
        .toLocaleDateString('en-US', { month: 'short' })
        .toUpperCase(),
      day: cleanDate.getDate(),
      fullDate: cleanDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      dateObj: cleanDate,
    });
  }

  return days;
};



const formatDateForAPI = date => {
  if (!date) return '';
  if (typeof date === 'string') {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      logError('Invalid date string:', date);
      logError('Invalid date string:', date)
      return '';
    }
    return dateObj.toISOString().split('T')[0];
  }

  if (isNaN(date.getTime())) {
    logError('Invalid date object:', date);
    logError('Invalid date object:', date)

    return '';
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const formatTimeForAPI = (date) => {
  if (!date) return '';

  if (typeof date === 'string') {
    if (/^\d{2}:\d{2}$/.test(date)) {
      return date;
    }
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      logError('Invalid date string:', date);
      logError('Invalid date string:', date)

      return '';
    }
    date = dateObj;
  }

  if (isNaN(date.getTime())) {
    logError('Invalid date in formatTimeForAPI:', date);
    logError('Invalid date in formatTimeForAPI:', date)

    return '';
  }

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
};

// const calculateEndTime = startTime => {
//   if (!startTime) return '';
//   const endTime = new Date(startTime.getTime());
//   endTime.setHours(endTime.getHours() + 30);
//   return formatTimeForAPI(endTime);
// };

const formatTime = (date, zone = 'us/eastern') => {
  if (!date) return null;
  const timezoneKey = TIMEZONE_MAP[zone?.toLowerCase()] || 'America/New_York';

  const momentDate =
    typeof date === 'string'
      ? moment.tz(date, timezoneKey)
      : moment(date).tz(timezoneKey);

  return momentDate.format('hh:mm A');
};

const formatDateTime = (date, zone = 'UTC') => {
  // const options = { hour: 'numeric', minute: 'numeric', hour12: true };
  // // return date.toLocaleTimeString([], options);
  // if (!date) return null;
  // // return moment(date).format('hh:mm A'); // e.g., 01:00 PM
  // return moment.tz(date, zone).format('hh:mm A');

  return new Date(date).toLocaleTimeString("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })

};


const getCurrentTimeInTimezone = (timezone = 'us/eastern') => {
  const timezoneKey = TIMEZONE_MAP[timezone?.toLowerCase()] || 'America/New_York';
  return moment().tz(timezoneKey).toDate();
};

const compareTimes = (time1, time2) => {
  if (!time1 || !time2) return false;
  const date1 = new Date(time1);
  const date2 = new Date(time2);
  return (
    date1.getHours() === date2.getHours() &&
    date1.getMinutes() === date2.getMinutes()
  );
};

const minuteOptions = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

const toComparableDate = value => {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value?.toDate === 'function') {
    const date = value.toDate();
    return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const compareDateTime = (date1, date2) => {
  const d1 = toComparableDate(date1);
  const d2 = toComparableDate(date2);
  if (!d1 || !d2) return false;
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate() &&
    d1.getHours() === d2.getHours() &&
    d1.getMinutes() === d2.getMinutes()
  );
};

export const PersonalClinicView = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { clinic_pk_id, typeId, AUTH_HEADER } = GlobalVariables.useValues();
  const globalValues = GlobalVariables.useValues();
  const TYPE_ID = typeId;
  const { personalEvent, clinicEvent, eventData, isEditing } =
    route.params || {};
  const isEditMode = isEditing === true;
  const [selectedDurationTime, setSelectedDurationTime] = useState(60);


  // State Management
  const [actualEventType, setActualEventType] = useState('personal');
  const [title, setTitle] = useState('');
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [selectedEventType, setSelectedEventType] = useState(null);
  const [showInAllClinics, setShowInAllClinics] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedProviders, setSelectedProviders] = useState([]);
  const [eventNotes, setEventNotes] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [displayedRecurrence, setDisplayedRecurrence] = useState(null);
  const [currentRecurrence, setCurrentRecurrence] = useState({
    type: 'Weekly',
    every: '1',
    days: [],
    recurOn: 'dayOfMonth',
    dayOfMonth: '1',
    weekday: 'Monday',
  });
  const [scheduleId, setScheduleId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  // Dropdown states
  const [showClinicDropdown, setShowClinicDropdown] = useState(false);
  const [showEventTypeDropdown, setShowEventTypeDropdown] = useState(false);
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  const [showRecurrenceForm, setShowRecurrenceForm] = useState(false);
  const [showRecurrenceDropdown, setShowRecurrenceDropdown] = useState(false);
  const [showWeekdayDropdown, setShowWeekdayDropdown] = useState(false);

  const [showDatePickerSelection, setShowDatePickerSelection] = useState(false);
  const [showDateSelection, setShowDateSelection] = useState(false);

  // Data states
  const [clinics, setClinics] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [providers, setProviders] = useState([]);
  const [hasAppointmentTypes, setHasAppointmentTypes] = useState(true);
  const [isLoadingAppointmentTypes, setIsLoadingAppointmentTypes] =
    useState(false);
  const [isLoadingClinics, setIsLoadingClinics] = useState(false);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);

  // Date/Time states
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slots, setSlots] = useState([]);

  // Date picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [datePickerMode, setDatePickerMode] = useState('date');

  // Time picker states
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempTime, setTempTime] = useState(new Date());
  const [isUsingCustomTime, setIsUsingCustomTime] = useState(false);
  const [customTimeError, setCustomTimeError] = useState('');
  const [selectedTimeMethod, setSelectedTimeMethod] = useState('grid');
  const [previousSelectedTime, setPreviousSelectedTime] = useState('');
  const [timeError, setTimeError] = useState('');
  const [isTimeChanged, setIsTimeChanged] = useState(false);
  const [isTimeChangedByUser, setIsTimeChangedByUser] = useState(false);
  const [originalEventDateTime, setOriginalEventDateTime] = useState(null);

  // Update your screen title logic
  const screenTitle = isEditMode
    ? `Edit ${actualEventType === 'clinic' ? 'Clinic Event' : 'Personal Event'}`
    : actualEventType === 'clinic'
      ? 'Clinic Event'
      : 'Personal Event';
  const titlePlaceholder =
    actualEventType === 'personal'
      ? 'Add personal event title'
      : 'Add clinic event title';
  const staffMemberLabel =
    actualEventType === 'personal' ? 'Staff Member' : 'Staff Members';

  const [isInitialized, setIsInitialized] = useState(false);

  const validateTimeSelection = timeDate => {
    if (!selectedDate) {
      const error = 'Please select a date first';
      setTimeError(error);
      return error;
    }

    if (!timeDate) {
      const error = 'Please select a time';
      setTimeError(error);
      return error;
    }

    const hour24 = timeDate.getHours();
    const minute = timeDate.getMinutes();

    const timezone = eventData?.clinic?.timezone || 'us/eastern';

    const timezoneKey =
      TIMEZONE_MAP[timezone?.toLowerCase()] || 'America/New_York';

    const selectedTime = moment
      .tz(selectedDate.dateObj, timezoneKey)
      .hour(hour24)
      .minute(minute)
      .second(0)
      .millisecond(0);
    const earliestTime = moment
      .tz(selectedDate.dateObj, timezoneKey)
      .hour(7)
      .minute(30)
      .second(0)
      .millisecond(0);

    // 9:30 PM in clinic timezone
    const latestTime = moment
      .tz(selectedDate.dateObj, timezoneKey)
      .hour(21)
      .minute(30)
      .second(0)
      .millisecond(0);

    if (selectedTime < earliestTime) {
      const error = 'Time must be after 7:30 AM';
      setTimeError(error);
      return error;
    }

    if (selectedTime > latestTime) {
      const error = 'Time must be before 9:30 PM';
      setTimeError(error);
      return error;
    }

    const todayMoment = moment().tz(timezoneKey).startOf('day');

    // Selected date in clinic timezone
    const selectedDateMoment = moment
      .tz(selectedDate.dateObj, timezoneKey)
      .startOf('day');

    const isToday = selectedDateMoment.isSame(todayMoment);

    if (isToday) {
      const currentMoment = moment().tz(timezoneKey);

      const selectedMoment = moment
        .tz(selectedTime, timezoneKey); // or moment.utc(...).tz(...) if UTC

      if (selectedMoment.isBefore(currentMoment)) {
        const error = 'Cannot select past time for today';
        setTimeError(error);
        return error;
      }
    }

    setTimeError('');
    return null;
  };

  // const isValidTimeSelection = () => {
  //   return validateTimeSelection();
  // };

  const convertDurationToMinutesSec = (duration) => {
    const [hours, minutes, seconds] = duration.split(":").map(Number);

    return hours * 60 + minutes + (seconds ? seconds / 60 : 0);
  };


  const generateTimeSlots = (
    selectedDate,
    currentTime,
    timezone = 'us/eastern',
    isEditMode = false,
    originalEventDate = null,
    originalEventTime = null
  ) => {
    const slots = [];
    const startHour = 7;
    const startMinute = 30;
    const endHour = 21;
    const endMinute = 30;
    const intervalMinutes = 30;
    const TZ = 'America/New_York';

    const selectedDateObj = new Date(selectedDate.dateObj);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDateStart = new Date(selectedDateObj);
    selectedDateStart.setHours(0, 0, 0, 0);

    const isToday = selectedDateStart.getTime() === today.getTime();

    const isOriginalEventDate = originalEventDate &&
      selectedDateStart.getTime() === new Date(originalEventDate).setHours(0, 0, 0, 0);

    if (isToday) {

      // const timezoneKey = TIMEZONE_MAP[timezone?.toLowerCase()] || 'America/New_York';
      // const localTime = moment().tz(timezoneKey);

      // const roundedCurrentTime = roundToNearest5Minutes(localTime.toDate());

      // let currentSlotTime = new Date(selectedDateObj);
      // const currentHours = roundedCurrentTime.getHours();
      // const currentMinutes = roundedCurrentTime.getMinutes();

      // if (
      //   currentHours > startHour ||
      //   (currentHours === startHour && currentMinutes >= startMinute)
      // ) {
      //   currentSlotTime.setHours(currentHours, currentMinutes, 0, 0);
      // } else {
      //   currentSlotTime.setHours(startHour, startMinute, 0, 0);
      // }

      // const endTime = new Date(selectedDateObj);
      // endTime.setHours(endHour, endMinute, 0, 0);

      // while (currentSlotTime <= endTime) {
      //   slots.push(new Date(currentSlotTime));
      //   currentSlotTime = new Date(currentSlotTime.getTime() + intervalMinutes * 60000);
      // }

      // if (isEditMode && isOriginalEventDate && originalEventTime) {
      //   const exactEventSlot = new Date(selectedDateObj);
      //   const eventTime = new Date(originalEventTime);
      //   exactEventSlot.setHours(eventTime.getHours(), eventTime.getMinutes(), 0, 0);

      //   const isEventTimeIncluded = slots.some(slot => slot.getTime() === exactEventSlot.getTime());

      //   if (!isEventTimeIncluded) {
      //     slots.push(exactEventSlot);
      //     slots.sort((a, b) => a.getTime() - b.getTime());
      //   }
      // }

      const timezoneKey = TIMEZONE_MAP[timezone?.toLowerCase()] || 'America/New_York';
      const localTime = moment().tz(timezoneKey);

      const selectedDateNY = moment.tz(selectedDateObj, TZ);
      const roundedCurrentTime = roundToNearest5Minutes(
        moment.tz(localTime, TZ).toDate()
      );

      const roundedMoment = moment.tz(roundedCurrentTime, TZ);

      let currentSlotTime;

      // Decide starting slot
      if (
        roundedMoment.hour() > startHour ||
        (roundedMoment.hour() === startHour &&
          roundedMoment.minute() >= startMinute)
      ) {
        currentSlotTime = selectedDateNY
          .clone()
          .hour(roundedMoment.hour())
          .minute(roundedMoment.minute())
          .second(0)
          .millisecond(0);
      } else {
        currentSlotTime = selectedDateNY
          .clone()
          .hour(startHour)
          .minute(startMinute)
          .second(0)
          .millisecond(0);
      }

      // End time in NY timezone
      const endTime = selectedDateNY
        .clone()
        .hour(endHour)
        .minute(endMinute)
        .second(0)
        .millisecond(0);

      // Generate slots
      while (currentSlotTime.isSameOrBefore(endTime)) {
        slots.push(currentSlotTime.clone().toDate());
        currentSlotTime.add(intervalMinutes, 'minutes');
      }

      // ✅ Edit Mode Fix (Timezone Safe)
      if (isEditMode && isOriginalEventDate && originalEventTime) {
        const eventTime = moment.tz(originalEventTime, TZ);

        const exactEventSlot = selectedDateNY
          .clone()
          .hour(eventTime.hour())
          .minute(eventTime.minute())
          .second(0)
          .millisecond(0);

        const isEventTimeIncluded = slots.some(slot =>
          moment.tz(slot, TZ).isSame(exactEventSlot)
        );

        if (!isEventTimeIncluded) {
          slots.push(exactEventSlot.toDate());
          slots.sort((a, b) => a.getTime() - b.getTime());
        }
      }
    } else {

      let currentSlotTime = moment.tz(selectedDateObj, TZ)
        .hour(startHour)
        .minute(startMinute)
        .second(0)
        .millisecond(0);

      // Create end time in NY timezone
      const endTime = moment.tz(selectedDateObj, TZ)
        .hour(endHour)
        .minute(endMinute)
        .second(0)
        .millisecond(0);

      while (currentSlotTime.isSameOrBefore(endTime)) {
        slots.push(currentSlotTime.clone().toDate()); // push JS Date if needed
        currentSlotTime.add(intervalMinutes, 'minutes');
      }

      if (isEditMode && isOriginalEventDate && originalEventTime) {

        const eventTime = moment.tz(originalEventTime, TZ);

        const exactEventSlot = moment.tz(selectedDateObj, TZ)
          .hour(eventTime.hour())
          .minute(eventTime.minute())
          .second(0)
          .millisecond(0);

        const isEventTimeIncluded = slots.some(slot =>
          moment(slot).tz(TZ).isSame(exactEventSlot)
        );

        if (!isEventTimeIncluded) {
          slots.push(exactEventSlot.toDate());
          slots.sort((a, b) => a.getTime() - b.getTime());
        }
      }

      // let currentSlotTime = new Date(selectedDateObj);
      // currentSlotTime.setHours(startHour, startMinute, 0, 0);

      // const endTime = new Date(selectedDateObj);
      // endTime.setHours(endHour, endMinute, 0, 0);

      // while (currentSlotTime <= endTime) {
      //   slots.push(new Date(currentSlotTime));
      //   currentSlotTime = new Date(currentSlotTime.getTime() + intervalMinutes * 60000);
      // }

      // if (isEditMode && isOriginalEventDate && originalEventTime) {
      //   const exactEventSlot = new Date(selectedDateObj);
      //   const eventTime = new Date(originalEventTime);
      //   exactEventSlot.setHours(eventTime.getHours(), eventTime.getMinutes(), 0, 0);

      //   const isEventTimeIncluded = slots.some(slot => slot.getTime() === exactEventSlot.getTime());

      //   if (!isEventTimeIncluded) {
      //     slots.push(exactEventSlot);
      //     slots.sort((a, b) => a.getTime() - b.getTime());
      //   }
      // }
    }
    return slots;
  };

  const openTimePicker = () => {
    const timezone =
      eventData?.clinic?.timezone || selectedClinic?.timezone || 'us/eastern';
    const initialTime = selectedSlot
      ? new Date(selectedSlot)
      : roundToNearest5Minutes(new Date());

    setTempTime(initialTime);
    if (selectedSlot) {
      setPreviousSelectedTime(formatTime(selectedSlot, timezone));
    }
    setTimeError('');
    setShowTimePicker(true);
  };

  const applySelectedTimeFromDate = timeDate => {
    const validationError = validateTimeSelection(timeDate);
    if (validationError) {
      Alert.alert('', validationError);
      return false;
    }

    const timezone = eventData?.clinic?.timezone || 'us/eastern';
    const timezoneKey =
      TIMEZONE_MAP[timezone?.toLowerCase()] || 'America/New_York';

    const newSelectedTime = moment
      .tz(selectedDate.dateObj, timezoneKey)
      .hour(timeDate.getHours())
      .minute(timeDate.getMinutes())
      .second(0)
      .millisecond(0)
      .toDate();

    if (isEditMode && originalEventDateTime) {
      const isDifferent = !compareDateTime(newSelectedTime, originalEventDateTime);

      if (isDifferent) {
        setIsTimeChangedByUser(true);
        setIsTimeChanged(true);
      } else {
        setIsTimeChangedByUser(false);
        setIsTimeChanged(false);
      }
    } else {
      setIsTimeChangedByUser(true);
      setIsTimeChanged(true);
    }

    setSelectedSlot(newSelectedTime);
    setIsUsingCustomTime(true);
    setCustomTimeError('');
    setSelectedTimeMethod('custom');
    setTimeError('');
    return true;
  };

  const handleTimePickerChange = (event, selectedTime) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);

      if (event.type === 'set' && selectedTime) {
        applySelectedTimeFromDate(selectedTime);
      }
      return;
    }

    if (selectedTime) {
      setTempTime(selectedTime);
      validateTimeSelection(selectedTime);
    }
  };

  const handleTimePickerDone = () => {
    if (applySelectedTimeFromDate(tempTime)) {
      setShowTimePicker(false);
    }
  };

  const handleTimePickerCancel = () => {
    setShowTimePicker(false);
    setTimeError('');
  };

  // Initialize all data
  useEffect(() => {
    const initializeEventType = () => {
      if (isEditMode && eventData) {
        // EDIT MODE
        let detectedType = 'personal';

        if (eventData.extra?.is_clinic_event !== undefined) {
          detectedType = eventData.extra.is_clinic_event ? 'clinic' : 'personal';
        } else if (eventData.is_clinic_event !== undefined) {
          detectedType = eventData.is_clinic_event ? 'clinic' : 'personal';
        } else if (eventData.staff_members && eventData.staff_members.length > 0) {
          detectedType = 'clinic';
        } else if (eventData.staff_member) {
          detectedType = 'personal';
        }

        setActualEventType(detectedType);
      } else {
        // NEW EVENT MODE
        const detectedType = clinicEvent ? 'clinic' : personalEvent ? 'personal' : 'personal';
        setActualEventType(detectedType);
      }
    };

    initializeEventType();
  }, [isEditMode, eventData, personalEvent, clinicEvent]);

  useEffect(() => {
    if (!isEditMode) {
      if (clinicEvent) {
        setActualEventType('clinic');
      } else if (personalEvent) {
        setActualEventType('personal');
      }
    }
  }, [isEditMode, clinicEvent, personalEvent]);

  useEffect(() => {
    const initializeAllData = async () => {
      if (isInitialized) return;

      try {
        if (isEditMode && eventData) {
          await initializeEditData();
        } else {
          await initializeNewEventData();
        }
      } catch (error) {
        logError('Error initializing event data:', error);
      }

      const isConnected = await checkInternetAndProceed();
      if (!isConnected) {
        return;
      }
      await fetchEventTypes();
      await fetchClinics();
      await fetchProviders();

      setIsInitialized(true);
    };

    initializeAllData();
  }, [isEditMode, eventData, isInitialized]);

  const initializeNewEventData = useCallback(async () => {
    const today = new Date();
    const todayDates = getNextTenDays(today);
    setAvailableDates(todayDates);

    const todayDate = todayDates.find(day => {
      const dayDate = new Date(day.dateObj);
      const todayDate = new Date();
      return (
        dayDate.getFullYear() === todayDate.getFullYear() &&
        dayDate.getMonth() === todayDate.getMonth() &&
        dayDate.getDate() === todayDate.getDate()
      );
    });

    if (todayDate) {
      setSelectedDate(todayDate);
    } else {
      setSelectedDate(todayDates[0]);
    }

    setTitle('');
    setEventNotes('');
    setSelectedSlot(null);
    setDateEnd('');
    setIsRecurring(false);
    setDisplayedRecurrence(null);
  }, []);

  const initializeEditData = useCallback(async () => {
    if (!eventData) return;

    // console.log('=== INITIALIZE EDIT DATA ===', eventData);
    setIsTimeChanged(false);
    setIsTimeChangedByUser(false);

    let detectedType = 'personal';
    if (eventData.extra?.is_clinic_event !== undefined) {
      detectedType = eventData.extra.is_clinic_event ? 'clinic' : 'personal';
    } else if (eventData.is_clinic_event !== undefined) {
      detectedType = eventData.is_clinic_event ? 'clinic' : 'personal';
    } else if (eventData.staff_members && eventData.staff_members.length > 0) {
      detectedType = 'clinic';
    } else if (eventData.staff_member) {
      detectedType = 'personal';
    }

    setActualEventType(detectedType);

    setTitle(eventData.title || '');
    setEventNotes(eventData.extra?.notes || eventData.notes || '');
    setShowInAllClinics(eventData.extra?.is_global_practice_event === true);
    setIsRecurring(eventData.extra?.is_recurring === true);

    if (eventData.extra?.schedule_id) {
      setScheduleId(eventData.extra.schedule_id);
    } else if (eventData.id) {
      setScheduleId(eventData.id);
    }

    if (eventData.extra?.is_recurring || eventData.rrule) {
      initializeRecurrenceData(eventData);
    }

    if (
      eventData.extra?.end_date ||
      eventData.end_date ||
      eventData.end_moment
    ) {
      const eventTimezone = eventData.clinic?.timezone || 'us/eastern';
      let endDateToSet = null;

      if (eventData.extra?.end_date) {
        endDateToSet = new Date(eventData.extra.end_date);
      } else if (eventData.end_date) {
        endDateToSet = new Date(eventData.end_date);
      } else if (eventData.end_moment) {
        const timezoneKey =
          TIMEZONE_MAP[eventTimezone.toLowerCase()] || 'America/New_York';
        endDateToSet = moment.tz(eventData.end_moment, timezoneKey).toDate();
      }

      if (endDateToSet && !isNaN(endDateToSet.getTime())) {
        // setDateEnd(
        //   endDateToSet.toLocaleDateString('en-US', {
        //     month: '2-digit',
        //     day: '2-digit',
        //     year: 'numeric',
        //   })
        // );
        const dayDate = new Date(endDateToSet);
        setDateEnd(dayDate)
      }
    }

    if (eventData.extra?.appointment_types && eventData.extra.appointment_types.length > 0) {
      const appointmentTypeData = eventData.extra.appointment_types[0];
      const appointmentTypeId =
        appointmentTypeData?.id ?? appointmentTypeData;
      setTimeout(() => {
        const matchedType = eventTypes.find(type => type.id === appointmentTypeId);
        if (matchedType) {
          setSelectedEventType(matchedType);
        }
      }, 500);
    }

    if (eventData.start_moment) {
      const eventTimezone = eventData.clinic?.timezone || 'us/eastern';

      const isoString = eventData.start_moment;
      const datePart = isoString.split('T')[0];
      const [year, month, day] = datePart.split('-').map(Number);
      const originalEventDate = new Date(year, month - 1, day);

      const availableDatesFromEvent = getNextTenDays(originalEventDate);
      setAvailableDates(availableDatesFromEvent);

      const targetDateStr = originalEventDate.toDateString();
      const matchingDate = availableDatesFromEvent.find(day => {
        const dayDateStr = new Date(day.dateObj).toDateString();
        return dayDateStr === targetDateStr;
      });

      if (matchingDate) {
        setSelectedDate(matchingDate);

        const timezoneKey = TIMEZONE_MAP[eventTimezone.toLowerCase()] || 'America/New_York';
        const startMoment = moment.tz(eventData.start_moment, timezoneKey);
        const exactTimeSlot = startMoment.toDate();

        setOriginalEventDateTime(exactTimeSlot);
        setSelectedSlot(exactTimeSlot);
        setIsTimeChanged(false);
      }
    }
  }, [eventData]);

  useEffect(() => {
    if (showInAllClinics && selectedClinic !== null) {
      setSelectedClinic(null);
    }
    return;
  }, [showInAllClinics, selectedClinic]);

  useEffect(() => {
    if (showInAllClinics) {
      if (selectedClinic !== null) {
        setSelectedClinic(null);
      }
      return;
    }

    if (!selectedClinic && clinics.length > 0) {
      if (isEditMode && eventData?.clinic) {
        const matchedClinic = clinics.find(
          c => c.id === eventData.clinic.id || c.id === eventData.clinic
        );
        if (matchedClinic) {
          setSelectedClinic(matchedClinic);
          return;
        }
      }

      if (clinic_pk_id) {
        const defaultClinic = clinics.find(c => c.id === clinic_pk_id);
        if (defaultClinic) setSelectedClinic(defaultClinic);
      }
    }
  }, [
    showInAllClinics,
    clinics,
    isEditMode,
    eventData,
    clinic_pk_id
  ]);

  // Generate time slots
  useEffect(() => {
    if (selectedDate) {
      const timezone = eventData?.clinic?.timezone || 'us/eastern';

      let availableSlots = [];
      let originalEventDate = null;
      let originalEventTime = null;

      if (isEditMode && eventData?.start_moment) {
        const timezoneKey = TIMEZONE_MAP[timezone.toLowerCase()] || 'America/New_York';
        originalEventTime = moment.tz(eventData.start_moment, timezoneKey).toDate();

        const isoString = eventData.start_moment;
        const datePart = isoString.split('T')[0];
        const [year, month, day] = datePart.split('-').map(Number);
        originalEventDate = new Date(year, month - 1, day);

      }

      availableSlots = generateTimeSlots(
        selectedDate,
        new Date(),
        timezone,
        isEditMode,
        originalEventDate,
        originalEventTime
      );

      setSlots(availableSlots);
      if (isEditMode && originalEventDate && originalEventTime) {
        const selectedDateObj = new Date(selectedDate.dateObj);
        selectedDateObj.setHours(0, 0, 0, 0);
        const originalDate = new Date(originalEventDate);
        originalDate.setHours(0, 0, 0, 0);

        const isOriginalDate = selectedDateObj.getTime() === originalDate.getTime();

        if (isOriginalDate) {
          const exactSlotForSelectedDate = new Date(selectedDate.dateObj);
          exactSlotForSelectedDate.setHours(
            originalEventTime.getHours(),
            originalEventTime.getMinutes(),
            0,
            0
          );

          const matchingSlot = availableSlots.find(slot =>
            slot.getTime() === exactSlotForSelectedDate.getTime()
          );

          if (matchingSlot) {
            setSelectedSlot(matchingSlot);
          }
        } else {
          if (availableSlots.length > 0 && !selectedSlot) {
            setSelectedSlot(availableSlots[0]);
          }
        }
      } else if (!isEditMode && availableSlots.length > 0 && !selectedSlot) {
        setSelectedSlot(availableSlots[0]);
      }
    }
  }, [selectedDate, isEditMode, eventData, isTimeChangedByUser]);

  // useEffect(() => {
  //   if (isEditMode && eventData?.start_moment && selectedDate && slots.length > 0) {
  //     const timezone = eventData.clinic?.timezone || 'us/eastern';
  //     const timezoneKey = TIMEZONE_MAP[timezone.toLowerCase()] || 'America/New_York';
  //     const originalEventTime = moment.tz(eventData.start_moment, timezoneKey).toDate();

  //     const isoString = eventData.start_moment;
  //     const datePart = isoString.split('T')[0];
  //     const [year, month, day] = datePart.split('-').map(Number);
  //     const originalEventDate = new Date(year, month - 1, day);

  //     const selectedDateObj = new Date(selectedDate.dateObj);
  //     selectedDateObj.setHours(0, 0, 0, 0);
  //     const originalDate = new Date(originalEventDate);
  //     originalDate.setHours(0, 0, 0, 0);

  //     const isOriginalDate = selectedDateObj.getTime() === originalDate.getTime();

  //     if (isOriginalDate) {
  //       const exactSlotForSelectedDate = new Date(selectedDate.dateObj);
  //       exactSlotForSelectedDate.setHours(
  //         originalEventTime.getHours(),
  //         originalEventTime.getMinutes(),
  //         0,
  //         0
  //       );

  //       const matchingSlot = slots.find(slot => 
  //         slot.getTime() === exactSlotForSelectedDate.getTime()
  //       );

  //       const isNotExactEventTime = !selectedSlot || 
  //         selectedSlot.getTime() !== exactSlotForSelectedDate.getTime();

  //       if (matchingSlot && isNotExactEventTime) {
  //         setSelectedSlot(matchingSlot);
  //       }
  //     }
  //   }
  // }, [selectedDate, slots, isEditMode, eventData, selectedSlot]);

  // handle the initialization timing
  useEffect(() => {
      if (isEditMode && eventData && eventTypes.length > 0 && providers.length > 0) {

      let shouldUpdate = false;

      const appointmentTypes =
        eventData.extra?.appointment_types || eventData.appointment_types || [];

      if (appointmentTypes.length > 0 && !selectedEventType) {
        const appointmentTypeId =
          appointmentTypes[0]?.id ?? appointmentTypes[0];
        const matchedType = eventTypes.find(type => type.id === appointmentTypeId);
        if (matchedType) {
          setSelectedEventType(matchedType);
          shouldUpdate = true;
        }
      }

      const shouldSetupStaff =
        (actualEventType === 'clinic' && selectedProviders.length === 0) ||
        (actualEventType === 'personal' && !selectedProvider);

      if (shouldSetupStaff) {
        const matchedStaff = matchExistingStaffMembers(providers);
        shouldUpdate = shouldUpdate || matchedStaff;
      }

    }
  }, [isEditMode, eventData, eventTypes, providers, actualEventType]);

  // Validation state
  useEffect(() => {
    const validateForm = () => {
      const isTitleValid = title && title.trim().length > 0;
      const isDateValid = selectedDate !== null;
      const isTimeValid = selectedSlot !== null;

      let isValid = isTitleValid && isDateValid && isTimeValid;

      if (hasAppointmentTypes) {
        const isClinicValid = showInAllClinics || selectedClinic !== null;
        isValid = isValid && isClinicValid;
      }

      if (actualEventType === 'personal') {
        const isStaffValid = selectedProvider !== null;
        isValid = isValid && isStaffValid;
      }

      setIsFormValid(isValid);
    };

    validateForm();
  }, [
    title,
    selectedProvider,
    selectedProviders.length,
    selectedDate,
    selectedSlot,
    actualEventType,
    selectedClinic,
    showInAllClinics,
    hasAppointmentTypes
  ]);

  // fetchEventTypes
  const fetchEventTypes = async () => {
    try {
      setIsLoadingAppointmentTypes(true);
      const typeIdParam = '4' // TYPE_ID || '4';
      const url = `${globalValues.API_BASE_URL}/appointment-types/?type=${typeIdParam}&is_active=true&query={id,name,color,default_chart_note,default_duration,general_type,is_opportunity,is_audiologists_only,is_active,default_products{product{id,cpt_code{id,code},display_name,price}},generate_sale,generate_chart_note,patient_notifications_enabled,intake_forms}`;

      console.log("======= url :", url)
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: AUTH_HEADER,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch event types');
      const data = await response.json();

      const eventTypesArray = Array.isArray(data.results)
        ? data.results
        : Array.isArray(data.items)
          ? data.items
          : Array.isArray(data)
            ? data
            : [data];

      setEventTypes(eventTypesArray);
      setHasAppointmentTypes(eventTypesArray.length > 0);

      if (
        isEditMode &&
        eventData?.extra?.appointment_types &&
        eventData.extra.appointment_types.length > 0 &&
        eventTypesArray.length > 0
      ) {
        const appointmentTypeId =
          eventData.extra.appointment_types[0]?.id ??
          eventData.extra.appointment_types[0];
        const matchedEventType = eventTypesArray.find(
          type => type.id === appointmentTypeId
        );
        if (matchedEventType) {
          setSelectedEventType(matchedEventType);
        }
      }
    } catch (error) {
      logError('Error fetching event types:', error);
      logError('Error fetching event types:', error)

      setHasAppointmentTypes(false);
    } finally {
      setIsLoadingAppointmentTypes(false);
    }
  };

  const fetchClinics = async () => {
    try {
      setIsLoadingClinics(true);
      const url = `${globalValues.API_BASE_URL}/clinics/?ordering=name&query={id,name,display_name,timezone,practice{id,name,timezone,ein,npi,non_npi_id,non_npi_id_qualifier,is_messaging_enabled,is_emailing_enabled,default_appointment_reminder_duration,tilled_account_id,justifi_account_id,logo,card_processing_provider,has_quickbooks_token,is_quickbooks_enabled,scheduling_allow_overlap,scheduling_should_create_schedule_for_staff,scheduling_should_notify,products_use_supplier_price,scheduling_staff_availability,product_requests_deactivate_existing,private_feedback_request_break,google_review_feedback_request_break,appointment_information_disabled,no_reply_email,country,private_feedback_request_disabled,is_hipaa_compliance_for_quickbooks_enabled,reschedule_disabled,patient_settings,billing_name,billing_street_address_1,billing_street_address_2,billing_city,billing_state,billing_country,billing_zip_code,billing_phone,direct_mail_enabled,sale_lock_days,unit_price_lock,product_lock,collect_outcome,no_show_disabled,limit_to_current_clinic,private_feedback_textual_request_disabled,appointment_cancelled_message_disabled,suno_comms_id,has_multiple_companies,message_auto_read_enabled,save_payment_card,products_use_barcode_scanner,go_live_at,billing_use_practice_insurers_only,create_all_sales_in_draft_status,billing_available_payment_methods,billing_claim_era_sync,use_room_traffic,quickbooks_refunds_account,allowed_ips,auto_create_patient_in_noah,use_unit_price_for_claims,allow_tilled_refund,enforce_delivery_before_ready_to_bill},ein,npi,non_npi_id,non_npi_id_qualifier,street_address_1,street_address_2,city,state,country,zip_code,phone,fax_phone,is_messaging_enabled,is_emailing_enabled,default_appointment_reminder_duration,tilled_account_id,google_place_id,review_link,justifi_account_id,card_processing_provider,noah_provider,noah_alias,noah_tenant_id,scheduling_staff_availability,web_scheduling_staff_selection,no_reply_email,type,external_id,dba,opened_date,closed_date,region{id,created_at,name,is_active,noah_location_id},is_active,sms_phone,quickbooks_token{id,name,description,quickbooks_company{id,realm_id,company_name},quickbooks_product_services_settings},logo,extra{id,billng_street_address_1,billng_street_address_2,billng_city,billng_state,billng_country,billng_zip,billng_phone},quickbooks_realm_id,suno_comms_id,quickbooks_company{id,realm_id,company_name},noah_auto_sync,web_scheduler_email_recipient,box_folder_id,place_of_service,default_assignee,caption_call_referral_code,business_name}`;

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: AUTH_HEADER,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch clinics');
      const data = await response.json();

      const clinicsArray = Array.isArray(data.results)
        ? data.results
        : Array.isArray(data.items)
          ? data.items
          : Array.isArray(data)
            ? data
            : [data];

      setClinics(clinicsArray);

      if (isEditMode && eventData?.clinic && !showInAllClinics && selectedClinic === null) {
        const matchedClinic = clinicsArray.find(
          clinic =>
            clinic.id === eventData.clinic.id || clinic.id === eventData.clinic
        );
        if (matchedClinic) {
          setSelectedClinic(matchedClinic);
        }
      } else if (
        !isEditMode &&
        clinic_pk_id &&
        clinicsArray.length > 0 &&
        !showInAllClinics
      ) {
        const defaultClinic = clinicsArray.find(
          clinic => clinic.id === clinic_pk_id
        );
        if (defaultClinic) {
          setSelectedClinic(defaultClinic);
        }
      }
    } catch (error) {
      logError('Error fetching clinics:', error);
    } finally {
      setIsLoadingClinics(false);
    }
  };

  const buildProvidersUrl = () => {
    const baseUrl = `${globalValues.API_BASE_URL}/staff/`;
    const params = new URLSearchParams();

    params.append('clinics', `${clinic_pk_id}`);
    params.append('groups__name', '');
    params.append('is_active', 'true');
    params.append('limit', '50');
    params.append(
      'query',
      '{id,touchpoint_notifications_enabled,scheduler_select_all_staff,scheduler_persist_per_clinic,last_name,non_npi_id_qualifier,npi,role,patient_arrived_sound_enabled,user_preferences,first_name,task_is_assigned_notifications_enabled,signature,photo,title,suffix,license_number,user_reminder_notifications_enabled,suno_comms_id,date_joined,payment_request_notifications_enabled,is_active,fax_phone,full_name,last_login,user_permissions,non_npi_id,onboarding_form_notifications_enabled,name,color,noah_username,groups{id,name,permissions},email,clinics{id,name,timezone,noah_provider,noah_alias,noah_tenant_id},default_clinic{id,name,timezone},can_see_manufacturer_cost}'
    );

    return `${baseUrl}?${params.toString()}`;
  };

  const fetchProviders = async () => {
    try {
      setIsLoadingProviders(true);
      const url = buildProvidersUrl();

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: AUTH_HEADER,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch providers');

      const data = await response.json();
      const providersArray = Array.isArray(data.results)
        ? data.results
        : Array.isArray(data.items)
          ? data.items
          : Array.isArray(data)
            ? data
            : [data];

      setProviders(providersArray);

      if (isEditMode && eventData) {
        setTimeout(() => {
          matchExistingStaffMembers(providersArray);
        }, 1000);
      }

      return providersArray;
    } catch (error) {
      logError('Error fetching providers:', error);
    } finally {
      setIsLoadingProviders(false);
    }
  };

  const formatDateTime = (date, zone = 'UTC') => {
    // const options = { hour: 'numeric', minute: 'numeric', hour12: true };
    // // return date.toLocaleTimeString([], options);
    // if (!date) return null;
    // // return moment(date).format('hh:mm A'); // e.g., 01:00 PM
    // return moment.tz(date, zone).format('hh:mm A');

    return new Date(date).toLocaleTimeString("en-US", {
      timeZone: "America/New_York",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })

  };

  const getTitleText = titleValue => {
    if (!titleValue) return '';
    const titleMap = {
      1: 'Dr.',
      2: 'Mr.',
      3: 'Mrs.',
      4: 'Ms.',
      5: 'Prof.',
    };
    return titleMap[titleValue] || '';
  };

  const getProviderName = provider => {
    if (!provider) return '';

    if (provider.full_name) {
      return provider.full_name;
    }
    const title = provider.title ? getTitleText(provider.title) : '';
    const firstName = provider.first_name || '';
    const lastName = provider.last_name || '';
    const suffix = provider.suffix || '';

    return `${title} ${firstName} ${lastName}${suffix ? ', ' + suffix : ''
      }`.trim();
  };

  // Format provider details
  const getProviderDetails = provider => {
    if (!provider) return '';
    return provider.role;
  };

  // Handle clinic selection
  const handleClinicSelect = clinic => {
    setSelectedClinic(clinic);
    setShowClinicDropdown(false);
  };

  // Handle event type selection 
  const handleEventTypeSelect = eventType => {
    console.log("==== eventType :", eventType)
    const durationInMinutes = convertDurationToMinutesSec(
      eventType.default_duration
    );
    // console.log("===== durationInMinutes : ", durationInMinutes, appointmentData.extra.appointment_type.default_duration)
    setSelectedDurationTime(durationInMinutes)

    setSelectedEventType(eventType);
    setShowEventTypeDropdown(false);
  };

  // Handle provider selection
  const handleProviderSelect = async provider => {
    if (actualEventType === 'clinic') {
      setSelectedProviders(prev => {
        const isAlreadySelected = prev.some(p => p.id === provider.id);
        if (isAlreadySelected) {
          return prev.filter(p => p.id !== provider.id);
        } else {
          return [...prev, provider];
        }
      });
    } else {
      setSelectedProvider(provider);
      setShowProviderDropdown(false);
    }
  };

  // handle removing providers
  const handleRemoveProvider = providerId => {
    setSelectedProviders(prev => prev.filter(p => p.id !== providerId));
  };

  const handleDateSelect = async day => {
    const isSameDate = selectedDate?.dateObj?.getTime() === day.dateObj.getTime();

    if (isSameDate) {
      setSelectedDate(day);
      return;
    }

    setSelectedDate(day);

    const timezone = eventData?.clinic?.timezone || 'us/eastern';

    const availableSlots = generateTimeSlots(
      day,
      new Date(),
      timezone,
      isEditMode,
      null,
      null
    );

    setSlots(availableSlots);

    if (isEditMode && originalEventDateTime && !isTimeChangedByUser) {
      const originalTimeOnNewDate = new Date(day.dateObj);
      originalTimeOnNewDate.setHours(
        originalEventDateTime.getHours(),
        originalEventDateTime.getMinutes(),
        0,
        0
      );

      const earliestTime = new Date(day.dateObj);
      earliestTime.setHours(7, 30, 0, 0);
      const latestTime = new Date(day.dateObj);
      latestTime.setHours(21, 30, 0, 0);

      if (originalTimeOnNewDate >= earliestTime && originalTimeOnNewDate <= latestTime) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDateObj = new Date(day.dateObj);
        selectedDateObj.setHours(0, 0, 0, 0);

        if (selectedDateObj.getTime() === today.getTime()) {
          const currentTime = getCurrentTimeInTimezone(timezone);
          if (originalTimeOnNewDate >= currentTime) {
            setSelectedSlot(originalTimeOnNewDate);
            return;
          }
        } else {
          setSelectedSlot(originalTimeOnNewDate);
          return;
        }
      }
    }

    if (availableSlots.length > 0) {
      setSelectedSlot(availableSlots[0]);
    } else {
      setSelectedSlot(null);
    }
  };

  const handleDatePickerChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);

      if (event.type === 'set' && selectedDate) {
        const formattedDate = selectedDate.toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
        });
        setDateEnd(formattedDate);
      }
      setShowDatePicker(false);

    } else {
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const showDatePickerModal = () => {
    if (dateEnd) {
      setTempDate(new Date(dateEnd));
    } else {
      setTempDate(new Date());
    }
    setDatePickerMode('date');
    setShowDatePicker(true);
  };

  const handleDatePickerDone = () => {
    setShowDatePicker(false);
    console.log("==== tempDate :", tempDate)
    const formattedDate = tempDate.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });

    if (isValidDate(tempDate)) {
      setDateEnd(formattedDate);
    } else {
      logError('Invalid date selected');
      setDateEnd('');
    }
  };

  const handleDatePickerCancel = () => {
    setShowDatePicker(false);
  };

  // Recurrence options
  const recurrenceOptions = ['Daily', 'Weekly', 'Monthly', 'Yearly'];
  const weekdays = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  const monthlyOptions = [
    { value: 'dayOfMonth', label: 'Day of month:' },
    { value: 'firstWeekday', label: 'The First' },
    { value: 'lastDay', label: 'Last day of month' },
  ];

  const days = [
    { key: 'MO', label: WEEKDAY_KEY_LABELS.MO },
    { key: 'TU', label: WEEKDAY_KEY_LABELS.TU },
    { key: 'WE', label: WEEKDAY_KEY_LABELS.WE },
    { key: 'TH', label: WEEKDAY_KEY_LABELS.TH },
    { key: 'FR', label: WEEKDAY_KEY_LABELS.FR },
    { key: 'SA', label: WEEKDAY_KEY_LABELS.SA },
    { key: 'SU', label: WEEKDAY_KEY_LABELS.SU },
  ];

  const handleToggleRecurring = () => {
    const newRecurringState = !isRecurring;
    setIsRecurring(newRecurringState);

    if (newRecurringState) {
      setShowRecurrenceForm(true);
      setCurrentRecurrence({
        type: 'Weekly',
        every: '1',
        days: [],
        recurOn: 'dayOfMonth',
        dayOfMonth: '1',
        weekday: 'Monday',
      });
    } else {
      setDisplayedRecurrence(null);
      setShowRecurrenceForm(false);
      setDateEnd('');
    }
  };

  // recurrence form
  const handleApplyRecurrence = () => {
    setDisplayedRecurrence({ ...currentRecurrence });
    setShowRecurrenceForm(false);
  };

  // Handle edit recurrence
  const handleEditRecurrence = () => {
    setShowRecurrenceForm(true);
    if (displayedRecurrence) {
      setCurrentRecurrence({ ...displayedRecurrence });
    }
  };

  // Handle cancel recurrence
  const handleCancelRecurrence = () => {
    if (displayedRecurrence) {
      setShowRecurrenceForm(false);
    } else {
      setShowRecurrenceForm(false);
      setDisplayedRecurrence(null);
    }
  };

  // Handle day selection in temp recurrence
  const toggleDay = dayKey => {
    setCurrentRecurrence(prev => ({
      ...prev,
      days: prev.days.includes(dayKey)
        ? prev.days.filter(d => d !== dayKey)
        : [...prev.days, dayKey],
    }));
  };

  const handleWeekdaySelect = weekday => {
    setCurrentRecurrence(prev => ({ ...prev, weekday }));
    setShowWeekdayDropdown(false);
  };

  const getRecurrenceSummary = () => {
    if (!displayedRecurrence) return '';

    const everyText = `Every ${displayedRecurrence.every} `;

    switch (displayedRecurrence.type) {
      case 'Daily':
        return `${everyText}Day${parseInt(displayedRecurrence.every) > 1 ? 's' : ''
          }`;

      case 'Weekly':
        if (displayedRecurrence.days.length === 0)
          return `${everyText}Week${parseInt(displayedRecurrence.every) > 1 ? 's' : ''
            }`;

        if (displayedRecurrence.days.length === 7)
          return `${everyText}Week${parseInt(displayedRecurrence.every) > 1 ? 's' : ''
            }`;

        const dayLabels = displayedRecurrence.days.map(
          day => WEEKDAY_KEY_LABELS[day] || day
        );

        return `${everyText}Week${parseInt(displayedRecurrence.every) > 1 ? 's' : ''
          } on ${dayLabels.join(', ')}`;

      case 'Monthly':
        let monthlyText = `${everyText}Month${parseInt(displayedRecurrence.every) > 1 ? 's' : ''
          }`;

        if (displayedRecurrence.recurOn === 'dayOfMonth') {
          monthlyText += ` on day ${displayedRecurrence.dayOfMonth}`;
        } else if (displayedRecurrence.recurOn === 'firstWeekday') {
          monthlyText += ` on the first ${displayedRecurrence.weekday}`;
        } else if (displayedRecurrence.recurOn === 'lastDay') {
          monthlyText += ` on the last day`;
        }

        return monthlyText;

      case 'Yearly':
        return `${everyText}Year${parseInt(displayedRecurrence.every) > 1 ? 's' : ''
          }`;

      default:
        return '';
    }
  };

  const getCurrentRecurrenceSummary = () => {
    const everyText = `Every ${currentRecurrence.every} `;

    switch (currentRecurrence.type) {
      case 'Daily':
        return `${everyText}Day${parseInt(currentRecurrence.every) > 1 ? 's' : ''
          }`;

      case 'Weekly':
        if (currentRecurrence.days.length === 0)
          return `${everyText}Week${parseInt(currentRecurrence.every) > 1 ? 's' : ''
            }`;

        const dayLabels = currentRecurrence.days.map(
          day => WEEKDAY_KEY_LABELS[day] || day
        );

        return `${everyText}Week${parseInt(currentRecurrence.every) > 1 ? 's' : ''
          } on ${dayLabels.join(', ')}`;

      case 'Monthly':
        let monthlyText = `${everyText}Month${parseInt(currentRecurrence.every) > 1 ? 's' : ''
          }`;

        if (currentRecurrence.recurOn === 'dayOfMonth') {
          monthlyText += ` on day ${currentRecurrence.dayOfMonth}`;
        } else if (currentRecurrence.recurOn === 'firstWeekday') {
          monthlyText += ` on the first ${currentRecurrence.weekday}`;
        } else if (currentRecurrence.recurOn === 'lastDay') {
          monthlyText += ` on the last day`;
        }

        return monthlyText;

      case 'Yearly':
        return `${everyText}Year${parseInt(currentRecurrence.every) > 1 ? 's' : ''
          }`;

      default:
        return '';
    }
  };

  // Render recurrence
  const renderRecurrenceInput = () => {
    switch (currentRecurrence.type) {
      case 'Daily':
        return (
          <View style={styles.recurrenceInputRow}>
            <TextInput
              style={[styles.input, styles.repeatInput]}
              value={currentRecurrence.every}
              onChangeText={value =>
                setCurrentRecurrence(prev => ({ ...prev, every: value }))
              }
              keyboardType="numeric"
            />
            <Text style={styles.unitText}>day(s)</Text>
          </View>
        );

      case 'Weekly':
        return (
          <>
            <View style={styles.recurrenceInputRow}>
              <TextInput
                style={[styles.input, styles.repeatInput]}
                value={currentRecurrence.every}
                onChangeText={value =>
                  setCurrentRecurrence(prev => ({ ...prev, every: value }))
                }
                keyboardType="numeric"
              />
              <Text style={styles.unitText}>week(s)</Text>
            </View>

            <Text style={styles.label}>ON DAYS</Text>
            <View style={styles.daysContainer}>
              {days.map(day => (
                <TouchableOpacity
                  key={day.key}
                  style={[
                    styles.dayButton,
                    currentRecurrence.days.includes(day.key) &&
                    styles.dayButtonSelected,
                  ]}
                  onPress={() => toggleDay(day.key)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      currentRecurrence.days.includes(day.key) &&
                      styles.dayTextSelected,
                    ]}
                  >
                    {day.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        );

      case 'Monthly':
        return (
          <>
            <View style={styles.recurrenceInputRow}>
              <TextInput
                style={[styles.input, styles.repeatInput]}
                value={currentRecurrence.every}
                onChangeText={value =>
                  setCurrentRecurrence(prev => ({ ...prev, every: value }))
                }
                keyboardType="numeric"
              />
              <Text style={styles.unitText}>month(s)</Text>
            </View>

            <Text style={styles.label}>RECUR ON *</Text>

            {monthlyOptions.map(option => (
              <View key={option.value} style={styles.monthlyOptionRow}>
                <TouchableOpacity
                  style={styles.radioButton}
                  onPress={() =>
                    setCurrentRecurrence(prev => ({
                      ...prev,
                      recurOn: option.value,
                    }))
                  }
                >
                  <View
                    style={[
                      styles.radioOuter,
                      currentRecurrence.recurOn === option.value &&
                      styles.radioOuterSelected,
                    ]}
                  >
                    {currentRecurrence.recurOn === option.value && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                </TouchableOpacity>
                <Text style={styles.monthlyOptionLabel}>{option.label}</Text>

                {option.value === 'dayOfMonth' &&
                  currentRecurrence.recurOn === 'dayOfMonth' && (
                    <TextInput
                      style={[styles.input, styles.dayOfMonthInput]}
                      value={currentRecurrence.dayOfMonth}
                      onChangeText={value =>
                        setCurrentRecurrence(prev => ({
                          ...prev,
                          dayOfMonth: value,
                        }))
                      }
                      keyboardType="numeric"
                      maxLength={2}
                    />
                  )}

                {option.value === 'firstWeekday' &&
                  currentRecurrence.recurOn === 'firstWeekday' && (
                    <View style={styles.weekdayDropdownContainer}>
                      <TouchableOpacity
                        style={styles.weekdayDropdownTrigger}
                        onPress={() =>
                          setShowWeekdayDropdown(!showWeekdayDropdown)
                        }
                      >
                        <Text style={styles.weekdayDropdownText}>
                          {currentRecurrence.weekday}
                        </Text>
                        <Icon
                          name={
                            showWeekdayDropdown
                              ? 'keyboard-arrow-up'
                              : 'keyboard-arrow-down'
                          }
                          size={20}
                          color="#666"
                        />
                      </TouchableOpacity>
                    </View>
                  )}
              </View>
            ))}
          </>
        );

      case 'Yearly':
        return (
          <View style={styles.recurrenceInputRow}>
            <TextInput
              style={[styles.input, styles.repeatInput]}
              value={currentRecurrence.every}
              onChangeText={value =>
                setCurrentRecurrence(prev => ({ ...prev, every: value }))
              }
              keyboardType="numeric"
            />
            <Text style={styles.unitText}>year(s)</Text>
          </View>
        );

      default:
        return null;
    }
  };

  const initializeRecurrenceData = eventData => {
    const extra = eventData.extra || {};

    if (eventData.rrule) {
      parseRRule(eventData.rrule);
    } else if (extra.rrule) {
      parseRRule(extra.rrule);
    } else {
      parseLegacyRecurrence(extra);
    }
    setIsRecurring(true);
  };

  const parseRRule = rruleString => {
    try {
      const rule = rruleString.replace('RRULE:', '');
      const params = rule.split(';').reduce((acc, param) => {
        const [key, value] = param.split('=');
        if (key && value) acc[key] = value;
        return acc;
      }, {});

      const recurrence = {
        type: params.FREQ
          ? params.FREQ.charAt(0).toUpperCase() +
          params.FREQ.slice(1).toLowerCase()
          : 'Weekly',
        every: params.INTERVAL || '1',
        days: params.BYDAY ? params.BYDAY.split(',') : [],
        recurOn: 'dayOfMonth',
        dayOfMonth: '1',
        weekday: 'Monday',
      };

      if (params.FREQ === 'MONTHLY') {
        if (params.BYMONTHDAY) {
          recurrence.recurOn = 'dayOfMonth';
          recurrence.dayOfMonth = params.BYMONTHDAY;
        } else if (params.BYDAY) {
          const byDayMatch = params.BYDAY.match(/(-?\d+)([A-Z]+)/);
          if (byDayMatch) {
            const [_, weekNum, dayCode] = byDayMatch;
            if (weekNum === '1') {
              recurrence.recurOn = 'firstWeekday';
            } else if (weekNum === '-1') {
              recurrence.recurOn = 'lastDay';
            }

            const weekdayMap = {
              MO: 'Monday',
              TU: 'Tuesday',
              WE: 'Wednesday',
              TH: 'Thursday',
              FR: 'Friday',
              SA: 'Saturday',
              SU: 'Sunday',
            };
            recurrence.weekday = weekdayMap[dayCode] || 'Monday';
          }
        }
      }

      setCurrentRecurrence(recurrence);
      setDisplayedRecurrence(recurrence);
    } catch (error) {
      const defaultRecurrence = {
        type: 'Weekly',
        every: '1',
        days: [],
        recurOn: 'dayOfMonth',
        dayOfMonth: '1',
        weekday: 'Monday',
      };
      setCurrentRecurrence(defaultRecurrence);
      setDisplayedRecurrence(defaultRecurrence);
    }
  };

  const parseLegacyRecurrence = extra => {
    const recurrence = {
      type: 'Weekly',
      every: '1',
      days: [],
      recurOn: 'dayOfMonth',
      dayOfMonth: '1',
      weekday: 'Monday',
    };

    if (extra.recurrence_period === 'W' && extra.recurrence_day) {
      recurrence.type = 'Weekly';
      recurrence.every = '1';
      const dayMap = {
        0: 'SU',
        1: 'MO',
        2: 'TU',
        3: 'WE',
        4: 'TH',
        5: 'FR',
        6: 'SA',
      };
      recurrence.days = [dayMap[extra.recurrence_day]];
    }

    setCurrentRecurrence(recurrence);
    setDisplayedRecurrence(recurrence);
  };

  const matchExistingStaffMembers = useCallback((providersArray) => {
    if (!providersArray || providersArray.length === 0) return false;

    let foundMatches = false;

    if (actualEventType === 'clinic') {
      // CLINIC EVENT
      const staffMemberIds = [];

      if (eventData.staff_members && eventData.staff_members.length > 0) {
        staffMemberIds.push(
          ...eventData.staff_members.map(staff => staff.id || staff)
        );
      }

      if (eventData.extra?.staff_members && eventData.extra.staff_members.length > 0) {
        staffMemberIds.push(
          ...eventData.extra.staff_members.map(staff => staff.id || staff)
        );
      }

      const uniqueStaffIds = [...new Set(staffMemberIds)];

      if (uniqueStaffIds.length > 0) {
        const matchedProviders = providersArray.filter(provider =>
          uniqueStaffIds.includes(provider.id)
        );

        if (matchedProviders.length !== selectedProviders.length ||
          !matchedProviders.every((p, i) => p.id === selectedProviders[i]?.id)) {
          setSelectedProviders(matchedProviders);
          foundMatches = true;
        }
      }
    } else {
      // PERSONAL EVENT
      let staffMemberId = null;

      if (eventData.staff_member && eventData.staff_member.id) {
        staffMemberId = eventData.staff_member.id;
      } else if (eventData.staff_member) {
        staffMemberId = eventData.staff_member;
      } else if (eventData.extra?.staff_members && eventData.extra.staff_members.length === 1) {
        staffMemberId = eventData.extra.staff_members[0].id || eventData.extra.staff_members[0];
      } else if (eventData.extra?.staff_member) {
        staffMemberId = eventData.extra.staff_member.id || eventData.extra.staff_member;
      }

      if (staffMemberId) {
        const matchedProvider = providersArray.find(
          provider => provider.id === staffMemberId
        );
        if (matchedProvider && matchedProvider.id !== selectedProvider?.id) {
          setSelectedProvider(matchedProvider);
          foundMatches = true;
        }
      }
    }

    return foundMatches;
  }, [actualEventType, eventData, selectedProvider, selectedProviders]);

  // Generate RRULE recurrence data
  const generateRRule = () => {
    if (!displayedRecurrence) return '';

    const { type, every, days, recurOn, dayOfMonth, weekday } =
      displayedRecurrence;

    switch (type) {
      case 'Daily':
        return `RRULE:FREQ=DAILY;INTERVAL=${every}`;

      case 'Weekly':
        if (days.length === 0) return `RRULE:FREQ=WEEKLY;INTERVAL=${every}`;

        const dayMap = {
          MO: 'MO',
          TU: 'TU',
          WE: 'WE',
          TH: 'TH',
          FR: 'FR',
          SA: 'SA',
          SU: 'SU',
        };
        const byDay = days.map(day => dayMap[day]).join(',');
        return `RRULE:FREQ=WEEKLY;INTERVAL=${every};BYDAY=${byDay}`;

      case 'Monthly':
        if (recurOn === 'dayOfMonth') {
          return `RRULE:FREQ=MONTHLY;INTERVAL=${every};BYMONTHDAY=${dayOfMonth}`;
        } else if (recurOn === 'firstWeekday') {
          const weekdayMap = {
            Monday: 'MO',
            Tuesday: 'TU',
            Wednesday: 'WE',
            Thursday: 'TH',
            Friday: 'FR',
            Saturday: 'SA',
            Sunday: 'SU',
          };
          return `RRULE:FREQ=MONTHLY;INTERVAL=${every};BYDAY=1${weekdayMap[weekday]}`;
        } else if (recurOn === 'lastDay') {
          return `RRULE:FREQ=MONTHLY;INTERVAL=${every};BYMONTHDAY=-1`;
        }
        return `RRULE:FREQ=MONTHLY;INTERVAL=${every}`;

      case 'Yearly':
        return `RRULE:FREQ=YEARLY;INTERVAL=${every}`;

      default:
        return '';
    }
  };

  const buildPayload = () => {
    // Use exact selected time
    // let finalStartTime = selectedSlot ? formatTimeForAPI(selectedSlot) : '';

    // // Calculate end time (30 minutes after start)
    // let finalEndTime = '';
    // if (selectedSlot) {
    //   const endTime = new Date(selectedSlot.getTime());
    //   endTime.setMinutes(endTime.getMinutes() + 30);
    //   finalEndTime = formatTimeForAPI(endTime);
    // }
    let finalStartTime = '';
    let finalEndTime = '';
    const timezoneKey = "America/New_York";

    if (isEditMode && eventData?.start_moment && !isTimeChangedByUser) {
      // const eventTimezone = eventData.clinic?.timezone || 'us/eastern';
      // const timezoneKey = TIMEZONE_MAP[eventTimezone.toLowerCase()] || 'America/New_York';
      // const originalStartMoment = moment.tz(eventData.start_moment, timezoneKey);
      // const originalEndMoment = moment.tz(eventData.end_moment || eventData.start_moment, timezoneKey);

      // finalStartTime = originalStartMoment.format('HH:mm');
      // finalEndTime = originalEndMoment.format('HH:mm');

      const eventTimezone = eventData.clinic?.timezone || 'us/eastern';
      const timezoneKey =
        TIMEZONE_MAP[eventTimezone.toLowerCase()] || 'America/New_York';

      const originalStartMoment = moment
        .utc(eventData.start_moment)
        .tz(timezoneKey);

      const originalEndMoment = moment
        .utc(eventData.end_moment || eventData.start_moment)
        .tz(timezoneKey);

      finalStartTime = originalStartMoment.format('HH:mm');
      finalEndTime = originalEndMoment.format('HH:mm');

      // console.log('Using original time:', finalStartTime, finalEndTime);
    } else {
      if (selectedSlot) {
        // finalStartTime = formatTimeForAPI(selectedSlot);
        // const endTime = new Date(selectedSlot.getTime());
        // endTime.setMinutes(endTime.getMinutes() + 30);
        // finalEndTime = formatTimeForAPI(endTime);


        finalStartTime = moment.utc(selectedSlot).tz(timezoneKey);
        finalStartTime = finalStartTime.format('HH:mm');

        finalEndTime = moment
          .utc(selectedSlot)
          .tz(timezoneKey)
          .add(selectedDurationTime, "minutes");

        finalEndTime = finalEndTime.format("HH:mm");

        // console.log('Using selected time:', finalStartTime, finalEndTime);
      }
    }

    if (!finalStartTime && isEditMode && eventData?.start_moment) {
      // const eventTimezone = eventData.clinic?.timezone || 'us/eastern';
      // const timezoneKey = TIMEZONE_MAP[eventTimezone.toLowerCase()] || 'America/New_York';
      // const originalStartMoment = moment.tz(eventData.start_moment, timezoneKey);
      // const originalEndMoment = moment.tz(eventData.end_moment || eventData.start_moment, timezoneKey);

      // finalStartTime = originalStartMoment.format('HH:mm');
      // finalEndTime = originalEndMoment.format('HH:mm');

      const eventTimezone = eventData.clinic?.timezone || 'us/eastern';
      const timezoneKey =
        TIMEZONE_MAP[eventTimezone.toLowerCase()] || 'America/New_York';

      const originalStartMoment = moment
        .utc(eventData.start_moment)
        .tz(timezoneKey);

      const originalEndMoment = moment
        .utc(eventData.end_moment || eventData.start_moment)
        .tz(timezoneKey);

      finalStartTime = originalStartMoment.format('HH:mm');
      finalEndTime = originalEndMoment.format('HH:mm');

    }
    if (selectedSlot) {
      // finalStartTime = formatTimeForAPI(selectedSlot);
      // const endTime = new Date(selectedSlot.getTime());
      // endTime.setMinutes(endTime.getMinutes() + 30);
      // finalEndTime = formatTimeForAPI(endTime);


      finalStartTime = moment.utc(selectedSlot).tz(timezoneKey);
      finalStartTime = finalStartTime.format('HH:mm');

      finalEndTime = moment
        .utc(selectedSlot)
        .tz(timezoneKey)
        .add(selectedDurationTime, "minutes");

      finalEndTime = finalEndTime.format("HH:mm");

      // console.log('Using selected time:', finalStartTime, finalEndTime);
    }

    console.log("===== finalEndTime :", finalStartTime, finalEndTime, selectedSlot)

    // return;

    const basePayload = {
      title: title?.trim() || '',
      is_available: false,
      start_time: finalStartTime,
      end_time: finalEndTime,
      start_date: selectedDate ? formatDateForAPI(selectedDate.dateObj) : '',
      end_date: selectedDate ? formatDateForAPI(selectedDate.dateObj) : '',
      clinic: showInAllClinics ? null : selectedClinic?.id || null,
      is_global_practice_event: showInAllClinics,
      appointment_types: selectedEventType ? [selectedEventType.id] : [],
      notes: eventNotes?.trim() || '',
      recurrence_period: null,
      recurrence_day: null,
      recurrence_week: null,
    };

    if (showInAllClinics) {
      if (isEditMode && eventData?.clinic) {
        basePayload.clinic = eventData.clinic.id || eventData.clinic;
      } else if (selectedClinic) {
        basePayload.clinic = selectedClinic.id;
      } else if (clinic_pk_id) {
        basePayload.clinic = clinic_pk_id;
      } else if (clinics.length > 0) {
        basePayload.clinic = clinics[0].id;
      }
    } else {
      basePayload.clinic = selectedClinic?.id || null;
    }

    if (actualEventType === 'clinic') {
      // CLINIC EVENT
      if (isEditMode) {
        const currentStaffIds = selectedProviders?.map(p => p.id) || [];

        const existingStaffIds = [];

        if (eventData.staff_members && eventData.staff_members.length > 0) {
          existingStaffIds.push(...eventData.staff_members.map(staff => staff.id || staff));
        }

        if (eventData.extra?.staff_members && eventData.extra.staff_members.length > 0) {
          existingStaffIds.push(...eventData.extra.staff_members.map(staff => staff.id || staff));
        }

        const uniqueExistingIds = [...new Set(existingStaffIds)];

        const add = currentStaffIds.filter(id => !uniqueExistingIds.includes(id));
        const remove = uniqueExistingIds.filter(id => !currentStaffIds.includes(id));

        if (add.length > 0 || remove.length > 0) {
          basePayload.staff_members = {};

          if (add.length > 0) {
            basePayload.staff_members.add = add;
          }

          if (remove.length > 0) {
            basePayload.staff_members.remove = remove;
          }
        }
      } else {
        if (selectedProviders && selectedProviders.length > 0) {
          basePayload.staff_members = {
            add: selectedProviders.map(p => p.id)
          };
        }
      }

      basePayload.staff_member = null;

    } else {
      // PERSONAL EVENT
      basePayload.staff_member = selectedProvider?.id || null;
      delete basePayload.staff_members;
    }

    if (displayedRecurrence) {
      const rruleString = generateRRule();
      if (rruleString) {
        basePayload.rrule = rruleString;
      }

      if (dateEnd) {
        // const parsedEndDate = new Date(dateEnd);
        // if (!isNaN(parsedEndDate.getTime())) {
        // basePayload.end_date = formatDateForAPI(parsedEndDate);

        // }
        basePayload.end_date = formatDateForAPI(dateEnd)
        console.log("===== End Date : ", dateEnd, basePayload.end_date)

      } else {
        const defaultEndDate = new Date(selectedDate.dateObj);
        defaultEndDate.setDate(defaultEndDate.getDate() + 30);
        basePayload.end_date = formatDateForAPI(defaultEndDate);
      }
    }

    if (isEditMode && displayedRecurrence && selectedDate) {
      const startDateFormatted = formatDateForAPI(selectedDate.dateObj);
      basePayload.instance_start_date = startDateFormatted;

      if (dateEnd) {
        // const parsedEndDate = new Date(dateEnd);
        // if (!isNaN(parsedEndDate.getTime())) {
        basePayload.instance_end_date = formatDateForAPI(dateEnd);
        // } else {
        //   basePayload.instance_end_date = startDateFormatted;
        // }
      } else {
        basePayload.instance_end_date = startDateFormatted;
      }
    }

    console.log(
      `Final ${actualEventType.toUpperCase()} Payload:`,
      JSON.stringify(basePayload, null, 2)
    );

    return basePayload;
  };

  const handleShowInAllClinicsToggle = () => {
    const newValue = !showInAllClinics;
    setShowInAllClinics(newValue);

    if (newValue) {
      setSelectedClinic(null);
      setShowClinicDropdown(false);
    } else {
      if (!selectedClinic && clinics.length > 0) {
        if (isEditMode && eventData?.clinic) {
          const matchedClinic = clinics.find(
            clinic =>
              clinic.id === eventData.clinic.id ||
              clinic.id === eventData.clinic
          );
          if (matchedClinic) {
            setSelectedClinic(matchedClinic);
          }
        } else if (clinic_pk_id) {
          const defaultClinic = clinics.find(
            clinic => clinic.id === clinic_pk_id
          );
          if (defaultClinic) {
            setSelectedClinic(defaultClinic);
          }
        }
      }
    }
  };

  const handleClose = () => {
    Alert.alert(
      'Are you sure?',
      'Are you sure you want to close? Your changes will not be saved.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const isValidDate = date => {
    return date instanceof Date && !isNaN(date.getTime());
  };

  // Render provider
  const renderProviderOption = (provider, index, eventType) => {
    const isPreferred = false;

    if (eventType === 'clinic') {
      // Clinic event
      const isSelected = selectedProviders.some(p => p.id === provider.id);
      return (
        <TouchableOpacity
          key={provider.id || `provider-${index}`}
          style={[
            styles.dropdownOption,
            isSelected && styles.dropdownOptionSelected,
          ]}
          onPress={() => handleProviderSelect(provider)}
        >
          <View style={styles.clinicOptionRow}>
            <View style={styles.checkboxContainer}>
              <View
                style={[
                  styles.providerCheckbox,
                  isSelected && styles.providerCheckboxSelected,
                ]}
              >
                {isSelected && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </View>
            <View style={styles.optionContent}>
              <View style={styles.optionMainTypeRow}>
                <Text style={styles.optionName}>
                  {getProviderName(provider)}
                </Text>
              </View>
              <View style={styles.optionDetailsRow}>
                <Text style={styles.optionDuration}>
                  {provider.role || 'No role specified'}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    } else {
      // Personal event
      const isCurrentlySelected = selectedProvider?.id === provider.id;
      return (
        <TouchableOpacity
          key={provider.id || `provider-${index}`}
          style={[
            styles.dropdownOption,
            isCurrentlySelected && styles.dropdownOptionSelected,
          ]}
          onPress={() => handleProviderSelect(provider)}
        >
          <View style={styles.clinicOptionRow}>
            <View style={styles.checkboxContainer}>
              <View
                style={[
                  styles.providerCheckbox,
                  isCurrentlySelected && styles.providerCheckboxSelected,
                ]}
              >
                {isCurrentlySelected && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </View>
            <View style={styles.optionContent}>
              <View style={styles.optionMainTypeRow}>
                <Text style={styles.optionName}>
                  {getProviderName(provider)}
                </Text>
                {isCurrentlySelected && (
                  <View style={styles.currentSelectionBadge}>
                    <Text style={styles.currentSelectionText}>
                      Currently Selected
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.optionDetailsRow}>
                <Text style={styles.optionDuration}>
                  {provider.role || 'No role specified'}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    }
  };

  // Render clinic dropdown option
  const renderClinicOption = (clinic, index) => {
    const isSelected = selectedClinic?.id === clinic.id;
    return (
      <TouchableOpacity
        key={clinic.id || `clinic-${index}`}
        style={[
          styles.dropdownOption,
          isSelected && styles.dropdownOptionSelected,
        ]}
        onPress={() => handleClinicSelect(clinic)}
      >
        <View style={styles.clinicOptionRow}>
          <View style={styles.checkboxContainer}>
            <View
              style={[
                styles.providerCheckbox,
                isSelected && styles.providerCheckboxSelected,
              ]}
            >
              {isSelected && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </View>
          <View style={styles.optionContent}>
            <View style={styles.optionMainTypeRow}>
              <Text style={styles.optionName}>
                {clinic.name || clinic.display_name}
              </Text>
              {isSelected && (
                <View style={styles.currentSelectionBadge}>
                  <Text style={styles.currentSelectionText}>
                    Currently Selected
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.optionDetailsRow}>
              <Text style={styles.optionDuration}>{clinic.timezone || ''}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Render event type dropdown
  const renderEventTypeOption = (eventType, index) => {
    const isSelected = selectedEventType?.id === eventType.id;
    const duration = eventType.default_duration
      ? `(${eventType.default_duration.split(':')[0]} hour${parseInt(eventType.default_duration.split(':')[0]) > 1 ? 's' : ''
      })`
      : '';

    return (
      <TouchableOpacity
        key={eventType.id || `event-type-${index}`}
        style={[
          styles.dropdownOption,
          isSelected && styles.dropdownOptionSelected,
        ]}
        onPress={() => handleEventTypeSelect(eventType)}
      >
        <View style={styles.clinicOptionRow}>
          <View style={styles.checkboxContainer}>
            <View
              style={[
                styles.providerCheckbox,
                isSelected && styles.providerCheckboxSelected,
              ]}
            >
              {isSelected && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </View>
          <View style={styles.optionContent}>
            <View style={styles.optionMainTypeRow}>
              <Text style={styles.optionName}>{eventType.name}</Text>
              {isSelected && (
                <View style={styles.currentSelectionBadge}>
                  <Text style={styles.currentSelectionText}>
                    Currently Selected
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.optionDetailsRow}>
              <Text style={styles.optionDuration}>{duration}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Submit the details
  const handleSave = async () => {
    const isConnected = await checkInternetAndProceed();
    if (!isConnected) {
      return;
    }
    if (!isFormValid) {
      Alert.alert(
        'Missing Information',
        'Please fill all required fields marked with *',
        [{ text: 'OK' }]
      );
      return;
    }

    if (dateEnd) {
      console.log("====== dateEnd :", dateEnd)
      const startDate = selectedDate
        ? new Date(selectedDate.dateObj)
        : new Date();
      const endDate = dateEnd //new Date(dateEnd);

      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      if (endDate < startDate) {
        Alert.alert(
          'Invalid Date Range',
          'End date cannot be before start date. Please select a valid end date.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    if (actualEventType === 'personal' && !selectedProvider) {
      Alert.alert(
        'Staff Member Required',
        'Please select a staff member for personal events',
        [{ text: 'OK' }]
      );
      return;
    }

    if (hasAppointmentTypes && !showInAllClinics && !selectedClinic) {
      Alert.alert(
        'Clinic Required',
        'Please select a clinic or enable "Show in all clinics"',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = buildPayload();

      if (isEditMode && eventData) {
        const existingStaffIds = [];
        if (eventData.staff_members) {
          existingStaffIds.push(...eventData.staff_members.map(s => s.id || s));
        }
        if (eventData.extra?.staff_members) {
          existingStaffIds.push(...eventData.extra.staff_members.map(s => s.id || s));
        }
      }

      let url = `${globalValues.API_BASE_URL}/schedules/`;
      let method = 'POST';

      if (isEditMode && scheduleId) {
        url = `${url}${scheduleId}/`;
        method = 'PATCH';
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: AUTH_HEADER,
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      let responseData;

      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        logError('Error parsing response:', e);
        responseData = { detail: 'Invalid response from server' };
      }

      if (response.ok) {
        const successMessage = isEditMode
          ? 'Event has been updated successfully!'
          : 'Event has been created successfully!';

        DeviceEventEmitter.emit('reloadScheduleData');
        Alert.alert('Success', successMessage, [
          {
            text: 'OK',
            onPress: () => {
              if (route.params?.onSaveSuccess) {
                route.params.onSaveSuccess(responseData);
              }
              navigation.goBack();
            },
          },
        ]);
      } else {
        let errorMessage = 'An error occurred while saving the event';

        if (response.status === 400) {
          errorMessage = 'Please check your input data';

          if (responseData) {
            const validationErrors = [];

            Object.keys(responseData).forEach(field => {
              if (Array.isArray(responseData[field])) {
                validationErrors.push(
                  `${field}: ${responseData[field].join(', ')}`
                );
              } else if (
                typeof responseData[field] === 'object' &&
                responseData[field] !== null
              ) {
                try {
                  const errorObj = responseData[field];
                  if (errorObj instanceof Array) {
                    validationErrors.push(`${field}: ${errorObj.join(', ')}`);
                  } else {
                    validationErrors.push(
                      `${field}: ${JSON.stringify(errorObj)}`
                    );
                  }
                } catch (e) {
                  validationErrors.push(`${field}: Invalid error format`);
                }
              } else {
                validationErrors.push(`${field}: ${responseData[field]}`);
              }
            });

            if (validationErrors.length > 0) {
              errorMessage = `Validation errors:\n${validationErrors.join(
                '\n'
              )}`;
            }
          }
        } else if (response.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (response.status === 403) {
          errorMessage = 'You do not have permission to perform this action.';
        } else if (response.status === 404) {
          errorMessage = 'The requested resource was not found.';
        } else if (response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage =
            responseData.detail ||
            responseData.message ||
            responseData.error ||
            `Failed to ${isEditMode ? 'update' : 'create'} event (Status: ${response.status
            })`;
        }

        Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
      }
    } catch (error) {
      logError('Network error:', error);

      Alert.alert(
        'Network Error',
        'Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTimeSelection = () => {
    const timezone = eventData?.clinic?.timezone || 'us/eastern';

    return (
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>
          Time<Text style={styles.required}>*</Text>
        </Text>

        {/* Time Selection Method Toggle */}
        <View style={styles.timeMethodToggle}>
          <TouchableOpacity
            style={[
              styles.timeMethodButton,
              selectedTimeMethod === 'grid' && styles.timeMethodButtonActive
            ]}
            onPress={() => {
              setSelectedTimeMethod('grid');
              setIsUsingCustomTime(false);
              setCustomTimeError('');
            }}
          >
            <Text style={[
              styles.timeMethodButtonText,
              selectedTimeMethod === 'grid' && styles.timeMethodButtonTextActive
            ]}>
              Select from Slots
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.timeMethodButton,
              selectedTimeMethod === 'custom' && styles.timeMethodButtonActive
            ]}
            onPress={() => {
              setSelectedTimeMethod('custom');
              setIsUsingCustomTime(false);
              setCustomTimeError('');
              if (!selectedSlot) {
                openTimePicker();
              }
            }}
          >
            <Text style={[
              styles.timeMethodButtonText,
              selectedTimeMethod === 'custom' && styles.timeMethodButtonTextActive
            ]}>
              Custom Time
            </Text>
          </TouchableOpacity>
        </View>

        {/* Error message */}
        {customTimeError ? (
          <Text style={styles.errorText}>{customTimeError}</Text>
        ) : null}

        {/* Grid Time Slots */}
        {selectedTimeMethod === 'grid' && (
          <View style={styles.slotGrid}>
            {slots.length > 0 ? (
              slots.map((slot, index) => {
                const isSelected = selectedSlot?.getTime() === slot.getTime();
                let isOriginalEventTime = false;

                if (isEditMode && eventData?.start_moment) {
                  const timezone = eventData.clinic?.timezone || 'us/eastern';
                  const timezoneKey = TIMEZONE_MAP[timezone.toLowerCase()] || 'America/New_York';
                  const originalEventTime = moment.tz(eventData.start_moment, timezoneKey).toDate();

                  isOriginalEventTime = (
                    slot.getHours() === originalEventTime.getHours() &&
                    slot.getMinutes() === originalEventTime.getMinutes()
                  );
                }

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.slot,
                      isSelected && styles.slotSelected,
                      isOriginalEventTime && styles.originalEventTimeSlot,
                      isOriginalEventTime && isSelected && styles.originalEventTimeSelected
                    ]}
                    onPress={() => {
                      if (isEditMode && originalEventDateTime) {
                        const isDifferent = !compareDateTime(slot, originalEventDateTime);

                        if (isDifferent) {
                          setIsTimeChangedByUser(true);
                          setIsTimeChanged(true);
                        } else {
                          setIsTimeChangedByUser(false);
                          setIsTimeChanged(false);
                        }
                      } else {
                        setIsTimeChangedByUser(true);
                        setIsTimeChanged(true);
                      }

                      setSelectedSlot(slot);
                      setIsUsingCustomTime(false);
                      setCustomTimeError('');
                      setSelectedTimeMethod('grid');
                    }}
                    disabled={false}
                  >
                    <Text style={[
                      styles.slotText,
                      isSelected && styles.slotTextSelected,
                      isOriginalEventTime && styles.originalEventTimeText,
                      isOriginalEventTime && isSelected && styles.originalEventTimeSelectedText
                    ]}>
                      {formatTime(slot, timezone)}
                    </Text>

                  </TouchableOpacity>
                );
              })
            ) : (
              <Text style={styles.noSlots}>No available slots for this date.</Text>
            )}
          </View>
        )}

        {/* Custom Time Display */}
        {selectedTimeMethod === 'custom' && selectedSlot && (
          <View style={styles.customTimeDisplay}>
            <Icon name="access-time" size={20} color="#066858" style={styles.customTimeIcon} />
            <Text style={styles.customTimeLabel}>Selected Time:</Text>
            <Text style={styles.customTimeValue}>
              {formatTime(selectedSlot, timezone)}
            </Text>
            <TouchableOpacity
              style={styles.editCustomTimeButton}
              onPress={openTimePicker}
            >
              <Icon name="edit" size={16} color="#066858" />
              <Text style={styles.editCustomTimeText}>Edit</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // const handleTimeSelect = (slot) => {
  //   if (isEditMode && eventData?.start_moment) {
  //     const timezone = eventData.clinic?.timezone || 'us/eastern';
  //     const timezoneKey = TIMEZONE_MAP[timezone.toLowerCase()] || 'America/New_York';
  //     const originalEventTime = moment.tz(eventData.start_moment, timezoneKey).toDate();

  //     const isDifferent = !compareTimes(slot, originalEventTime);
  //     setIsTimeChanged(isDifferent);
  //   } else {
  //     setIsTimeChanged(true);
  //   }
  //   setSelectedSlot(slot);
  //   setIsUsingCustomTime(false);
  //   setCustomTimeError('');
  //   setSelectedTimeMethod('grid');
  // };

  const renderTimePickerModal = () => {
    if (Platform.OS === 'ios') {
      return (
        showTimePicker && (
          <Modal
            transparent={true}
            animationType="slide"
            visible={showTimePicker}
            onRequestClose={handleTimePickerCancel}
          >
            <View style={styles.datePickerModalContainer}>
              <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={handleTimePickerCancel}
              />

              <View style={styles.datePickerContent}>
                <View style={styles.datePickerHeader}>
                  <TouchableOpacity
                    onPress={handleTimePickerCancel}
                    style={styles.datePickerButton}
                  >
                    <Text style={styles.datePickerCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <Text style={styles.datePickerTitle}>Select Time</Text>
                  <TouchableOpacity
                    onPress={handleTimePickerDone}
                    style={styles.datePickerButton}
                    disabled={!!timeError}
                  >
                    <Text
                      style={[
                        styles.datePickerDoneText,
                        !!timeError && styles.timePickerDoneTextDisabled,
                      ]}
                    >
                      Done
                    </Text>
                  </TouchableOpacity>
                </View>

                {timeError ? (
                  <View style={styles.errorSection}>
                    <Icon name="error-outline" size={18} color="#EF4444" />
                    <Text style={styles.errorMessage}>{timeError}</Text>
                  </View>
                ) : null}

                <DateTimePicker
                  value={tempTime}
                  mode="time"
                  display="spinner"
                  onChange={handleTimePickerChange}
                  style={styles.iosDatePicker}
                />
              </View>
            </View>
          </Modal>
        )
      );
    }

    return (
      showTimePicker && (
        <DateTimePicker
          value={tempTime}
          mode="time"
          display="default"
          onChange={handleTimePickerChange}
        />
      )
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.containerMain}
    >
      <SafeAreaView style={styles.safeAreaView}>
        {/* Header Section */}
        <View style={styles.headerSafe}>
          <Text style={styles.headerTitle}>{screenTitle}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Icon name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formContainer}>
            {/* Title Section */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                Title<Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Add title"
                  placeholderTextColor="#999"
                  value={title}
                  onChangeText={setTitle}
                />
              </View>
            </View>

            {/* Staff member Section */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                {staffMemberLabel}
                {actualEventType === 'personal' && (
                  <Text style={styles.required}>*</Text>
                )}
              </Text>

              <TouchableOpacity
                style={styles.dropdownTrigger}
                onPress={() => setShowProviderDropdown(!showProviderDropdown)}
                disabled={providers.length === 0}
              >
                <View style={styles.selectedTypeContainer}>
                  {actualEventType === 'clinic' ? (
                    // Clinic event - multiple staff
                    selectedProviders.length === 0 ? (
                      <Text style={styles.placeholderText}>
                        Select Staff Members
                      </Text>
                    ) : (
                      <View style={styles.selectedProvidersContainer}>
                        <Text style={styles.selectedProvidersCount}>
                          {selectedProviders.length} staff member(s) selected
                        </Text>
                        <ScrollView
                          horizontal
                          style={styles.selectedProvidersList}
                          showsHorizontalScrollIndicator={false}
                        >
                          {selectedProviders.map(provider => (
                            <View
                              key={provider.id}
                              style={styles.selectedProviderBadge}
                            >
                              <Text style={styles.selectedProviderBadgeText}>
                                {getProviderName(provider)}
                              </Text>
                              <TouchableOpacity
                                style={styles.removeProviderButton}
                                onPress={() =>
                                  handleRemoveProvider(provider.id)
                                }
                              >
                                <Text style={styles.removeProviderText}>×</Text>
                              </TouchableOpacity>
                            </View>
                          ))}
                        </ScrollView>
                      </View>
                    )
                  ) : // Personal event - single staff
                    selectedProvider ? (
                      <>
                        <Text style={styles.selectedTypeName}>
                          {getProviderName(selectedProvider)}
                        </Text>
                        <Text style={styles.selectedProviderDetails}>
                          {getProviderDetails(selectedProvider)}
                        </Text>
                      </>
                    ) : (
                      <Text style={styles.placeholderText}>
                        Select Staff Member
                      </Text>
                    )}
                </View>
                <Icon
                  name={
                    showProviderDropdown
                      ? 'keyboard-arrow-up'
                      : 'keyboard-arrow-down'
                  }
                  size={24}
                  color="#6B7280"
                />
              </TouchableOpacity>

              {/* Dropdown Options */}
              {showProviderDropdown && providers.length > 0 && (
                <View style={styles.dropdownOptions}>
                  <ScrollView
                    style={styles.dropdownScrollView}
                    nestedScrollEnabled={true}
                  >
                    {providers.map((provider, index) =>
                      renderProviderOption(provider, index, actualEventType)
                    )}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Clinic Section */}
            {hasAppointmentTypes && !showInAllClinics && (
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  Clinic<Text style={styles.required}>*</Text>
                </Text>

                <TouchableOpacity
                  style={styles.dropdownTrigger}
                  onPress={() => setShowClinicDropdown(!showClinicDropdown)}
                  disabled={clinics.length === 0}
                >
                  <View style={styles.selectedTypeContainer}>
                    {selectedClinic ? (
                      <>
                        <Text style={styles.selectedTypeName}>
                          {selectedClinic.name || selectedClinic.display_name}
                        </Text>
                        <Text style={styles.selectedProviderDetails}>
                          {selectedClinic.timezone || ''}
                        </Text>
                      </>
                    ) : (
                      <Text style={styles.placeholderText}>
                        {clinics.length === 0
                          ? 'Loading clinics...'
                          : 'Select Clinic'}
                      </Text>
                    )}
                  </View>
                  <Icon
                    name={
                      showClinicDropdown
                        ? 'keyboard-arrow-up'
                        : 'keyboard-arrow-down'
                    }
                    size={24}
                    color="#6B7280"
                  />
                </TouchableOpacity>

                {/* Dropdown Options */}
                {showClinicDropdown && clinics.length > 0 && (
                  <View style={styles.dropdownOptions}>
                    <ScrollView
                      style={styles.dropdownScrollView}
                      nestedScrollEnabled={true}
                    >
                      {clinics.map((clinic, index) =>
                        renderClinicOption(clinic, index)
                      )}
                    </ScrollView>
                  </View>
                )}
              </View>
            )}

            {/* Show in all clinics checkbox */}
            {hasAppointmentTypes && (
              <View style={styles.sectionCheckbox}>
                <Icon name="location-searching" size={24} color="#666" />
                <View style={styles.inputContainer}>
                  <View style={styles.recurringRow}>
                    <Text style={styles.showAllClinicsText}>
                      Show in all clinics
                    </Text>
                    <TouchableOpacity
                      style={styles.checkbox}
                      onPress={handleShowInAllClinicsToggle}
                    >
                      {showInAllClinics && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* Date Selection */}

            <View style={styles.formGroup}>
              <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'space-between', alignItems: 'center' }}>

                <Text style={styles.formLabel}>
                  Date Start<Text style={styles.required}>*</Text>
                </Text>

                <TouchableOpacity
                  onPress={() => {
                    setShowDatePickerSelection(true);
                    setShowDateSelection(true);
                  }}
                  style={[styles.inputWrapper, { borderColor: '#066858', marginBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
                >
                  <TextInput
                    label="Date"
                    value={selectedDate?.dateObj
                      ? new Date(selectedDate.dateObj).toLocaleDateString('en-US', {
                        month: '2-digit',
                        day: '2-digit',
                        year: 'numeric',
                      })
                      : new Date().toLocaleDateString('en-US', {
                        month: '2-digit',
                        day: '2-digit',
                        year: 'numeric',
                      })}
                    placeholder="MM/DD/YYYY"
                    required
                    onPressIn={() => {
                      setShowDatePickerSelection(true)
                      setShowDateSelection(true)
                    }
                    }
                    style={[styles.inputNormal]}
                    editable={false}
                  />
                  <IconButton
                    onPress={() => {
                      setShowDatePickerSelection(true)
                      setShowDateSelection(true)
                    }}
                    color={'#6B7280'}
                    icon={'MaterialCommunityIcons/calendar'}
                    size={24}
                  />
                </TouchableOpacity>

                {Platform.OS === 'ios' ? (
                  <Modal
                    visible={showDatePickerSelection}
                    transparent={true}
                    animationType="none"
                    onRequestClose={() => setShowDatePickerSelection(false)}
                  >
                    <View style={styles.modalOverlayPicker}>
                      <View style={styles.modalContent}>
                        <DateTimePicker
                          value={selectedDate?.dateObj
                            ? new Date(selectedDate.dateObj)
                            : new Date()}
                          mode="date"
                          display="spinner"
                          minimumDate={new Date()}
                          onChange={(event, selectedDate) => {
                            if (event.type === 'set' && selectedDate) {
                              // setBirthDate(selectedDate);
                              // console.log("==== selectedDate : ",selectedDate)
                              const dateObj = new Date(selectedDate);

                              const result = {
                                dateObj,
                                day: dateObj.getDate(),
                                fullDate: dateObj.toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "2-digit",
                                  year: "numeric",
                                }),
                                month: dateObj
                                  .toLocaleDateString("en-US", { month: "short" })
                                  .toUpperCase(),
                                weekday: getWeekdayLabel(dateObj),
                              };

                              // console.log(result);
                              handleDateSelect(result)
                              setShowDatePickerSelection(false);
                            }
                          }}
                        />

                        <TouchableOpacity
                          style={styles.closeButtonModal}
                          onPress={() => setShowDatePickerSelection(false)}
                        >
                          <Text style={styles.closeButtonTextModal}>Done</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Modal>
                ) : (
                  showDatePickerSelection && (
                    <DateTimePicker
                      value={selectedDate?.dateObj
                        ? new Date(selectedDate.dateObj)
                        : new Date()}
                      mode="date"
                      display="calendar" // "default" or "spinner" also possible
                      minimumDate={new Date()}
                      onChange={(event, selectedDate) => {
                        setShowDatePickerSelection(false); // close after picking
                        if (event.type === 'set' && selectedDate) {
                          // console.log("==== selectedDate : ",selectedDate)
                          // setBirthDate(selectedDate);
                          const dateObj = new Date(selectedDate);

                          const result = {
                            dateObj,
                            day: selectedDate.getDate(),
                            fullDate: selectedDate.toLocaleDateString("en-US", {
                              month: "short",
                              day: "2-digit",
                              year: "numeric",
                            }),
                            month: selectedDate
                              .toLocaleDateString("en-US", { month: "short" })
                              .toUpperCase(),
                            weekday: getWeekdayLabel(selectedDate),
                          };

                          // console.log("==== result ",result);
                          handleDateSelect(result)
                          setShowDatePickerSelection(false);
                        }
                      }}
                    />
                  )
                )}
              </View>
              {!showDateSelection &&

                <ScrollView
                  horizontal
                  contentContainerStyle={styles.datesContainer}
                >
                  {availableDates.map((day, index) => {
                    const isSelected =
                      selectedDate &&
                      day.dateObj.toDateString() ===
                      selectedDate.dateObj.toDateString();

                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.dateOption,
                          isSelected && styles.dateOptionSelected,
                        ]}
                        onPress={() => {
                          handleDateSelect(day);
                        }}
                      >
                        <Text
                          style={[
                            styles.dateOptionWeekday,
                            isSelected && styles.dateOptionTextSelected,
                          ]}
                        >
                          {day.weekday}
                        </Text>
                        <Text
                          style={[
                            styles.dateOptionDay,
                            isSelected && styles.dateOptionTextSelected,
                          ]}
                        >
                          {day.day}
                        </Text>
                        <Text
                          style={[
                            styles.dateOptionMonth,
                            isSelected && styles.dateOptionTextSelected,
                          ]}
                        >
                          {day.month}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              }
            </View>

            {/* Time Selection */}
            {selectedDate && renderTimeSelection()}

            {/* Event Type Section */}
            {hasAppointmentTypes && (
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Event Type</Text>

                <TouchableOpacity
                  style={styles.dropdownTrigger}
                  onPress={() =>
                    setShowEventTypeDropdown(!showEventTypeDropdown)
                  }
                  disabled={eventTypes.length === 0}
                >
                  <View style={styles.selectedTypeContainer}>
                    {selectedEventType ? (
                      <>
                        <Text style={styles.selectedTypeName}>
                          {selectedEventType.name}
                        </Text>
                        <Text style={styles.selectedProviderDetails}>
                          {selectedEventType.default_duration
                            ? `(${selectedEventType.default_duration.split(':')[0]
                            } hour${parseInt(
                              selectedEventType.default_duration.split(
                                ':'
                              )[0]
                            ) > 1
                              ? 's'
                              : ''
                            })`
                            : ''}
                        </Text>
                      </>
                    ) : (
                      <Text style={styles.placeholderText}>
                        Select Event Type
                      </Text>
                    )}
                  </View>
                  <Icon
                    name={
                      showEventTypeDropdown
                        ? 'keyboard-arrow-up'
                        : 'keyboard-arrow-down'
                    }
                    size={24}
                    color="#6B7280"
                  />
                </TouchableOpacity>

                {/* Dropdown Options */}
                {showEventTypeDropdown && eventTypes.length > 0 && (
                  <View style={styles.dropdownOptions}>
                    <ScrollView
                      style={styles.dropdownScrollView}
                      nestedScrollEnabled={true}
                    >
                      {eventTypes.map((eventType, index) =>
                        renderEventTypeOption(eventType, index)
                      )}
                    </ScrollView>
                  </View>
                )}
              </View>
            )}

            {/* Date and Time Section */}
            {(isRecurring || displayedRecurrence) && (
              <View style={styles.section}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Date End</Text>

                  <TouchableOpacity
                    onPress={() => {
                      setShowDatePicker(true);
                    }}
                    style={[styles.inputWrapper, { borderColor: '#066858', marginBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
                  >


                    <TextInput
                      label="Date"
                      value={dateEnd
                        ? new Date(dateEnd).toLocaleDateString('en-US', {
                          month: '2-digit',
                          day: '2-digit',
                          year: 'numeric',
                        })
                        : new Date().toLocaleDateString('en-US', {
                          month: '2-digit',
                          day: '2-digit',
                          year: 'numeric',
                        })}
                      placeholder="MM/DD/YYYY"
                      // required
                      onPressIn={() => {
                        setShowDatePicker(true)
                      }
                      }
                      style={[styles.inputNormal]}
                      editable={false}
                    />
                    <IconButton
                      onPress={() => {
                        setShowDatePicker(true)
                      }}
                      color={'#6B7280'}
                      icon={'MaterialCommunityIcons/calendar'}
                      size={24}
                    />
                  </TouchableOpacity>

                  {Platform.OS === 'ios' ? (
                    <Modal
                      visible={showDatePicker}
                      transparent={true}
                      animationType="none"
                      onRequestClose={() => setShowDatePicker(false)}
                    >
                      <View style={styles.modalOverlayPicker}>
                        <View style={styles.modalContent}>
                          <DateTimePicker
                            value={dateEnd
                              ? new Date(dateEnd)
                              : new Date()}
                            mode="date"
                            display="spinner"
                            minimumDate={new Date()}
                            onChange={(event, selectedDate) => {
                              if (event.type === 'set' && selectedDate) {
                                const dateObj = new Date(selectedDate);

                                // const formattedDate = selectedDate.toLocaleDateString('en-US', {
                                //   month: '2-digit',
                                //   day: '2-digit',
                                //   year: 'numeric',
                                // });
                                setDateEnd(dateObj);
                                setShowDatePicker(false);
                              }
                            }}
                          />

                          <TouchableOpacity
                            style={styles.closeButtonModal}
                            onPress={() => setShowDatePicker(false)}
                          >
                            <Text style={styles.closeButtonTextModal}>Done</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </Modal>
                  ) : (
                    showDatePicker && (
                      <DateTimePicker
                        value={dateEnd
                          ? new Date(dateEnd)
                          : new Date()}
                        mode="date"
                        display="calendar" // "default" or "spinner" also possible
                        minimumDate={new Date()}
                        onChange={(event, selectedDate) => {
                          setShowDatePicker(false); // close after picking
                          if (event.type === 'set' && selectedDate) {
                            // console.log("==== selectedDate : ",selectedDate)
                            // const formattedDate = selectedDate.toLocaleDateString('en-US', {
                            //   month: '2-digit',
                            //   day: '2-digit',
                            //   year: 'numeric',
                            // });
                            const dateObj = new Date(selectedDate);

                            setDateEnd(dateObj);
                            setShowDatePicker(false);

                          }
                        }}
                      />
                    )
                  )}


                  {/* <TouchableOpacity style={styles.dateInputContainer}
                      onPress={showDatePickerModal}
                    >
                    <TextInput
                      style={[styles.input, styles.dateInput]}
                      placeholder={
                        selectedDate
                          ? formatDateForAPI(selectedDate.dateObj)
                          : 'MM/DD/YYYY'
                      }
                      placeholderTextColor="#999"
                      value={dateEnd}
                      editable={false}
                    />
                    <TouchableOpacity
                      style={styles.calendarIconContainer}
                    >
                      <Icon name="calendar-month" size={18} color="#666" />
                    </TouchableOpacity>
                    {/* {dateEnd ? (
                      <TouchableOpacity
                        style={styles.clearButton}
                        onPress={() => setDateEnd('')}
                      >
                        <Text style={styles.clearText}>✕</Text>
                      </TouchableOpacity>
                    ) : null} */}
                  {/* </TouchableOpacity> */}
                </View>
              </View>
            )}

            {/* Recurring Section */}
            <View style={styles.section}>
              <Icon name="calendar-month" size={24} color="#666" />
              <View style={styles.inputContainer}>
                {/* Always show the "Is recurring" title and checkbox */}
                <View style={styles.recurringRow}>
                  <Text style={styles.recurringText}>Is recurring</Text>
                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={handleToggleRecurring}
                  >
                    {isRecurring && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                </View>

                {/* Show recurrence summary card when recurrence is set */}
                {displayedRecurrence && !showRecurrenceForm && (
                  <View style={styles.recurrenceSummaryCard}>
                    <View style={styles.recurrenceSummaryContent}>
                      <Text style={styles.recurrenceSummaryValue}>
                        {getRecurrenceSummary()}
                      </Text>
                      <TouchableOpacity
                        style={styles.editRecurrenceButton}
                        onPress={handleEditRecurrence}
                      >
                        <Text style={styles.editRecurrenceText}>Edit</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Show recurrence form when adding/editing recurrence */}
                {showRecurrenceForm && (
                  <View style={styles.recurrenceFormCard}>
                    <Text style={styles.label}>RECURRENCE *</Text>
                    <View style={styles.dropdownContainerFixed}>
                      <TouchableOpacity
                        style={styles.dropdownTrigger}
                        onPress={() =>
                          setShowRecurrenceDropdown(!showRecurrenceDropdown)
                        }
                      >
                        <Text style={styles.dropdownText}>
                          {currentRecurrence.type}
                        </Text>
                        <Icon
                          name={
                            showRecurrenceDropdown
                              ? 'keyboard-arrow-up'
                              : 'keyboard-arrow-down'
                          }
                          size={20}
                          color="#666"
                        />
                      </TouchableOpacity>

                      {showRecurrenceDropdown && (
                        <View style={styles.dropdownOptionsFixed}>
                          {recurrenceOptions.map(option => (
                            <TouchableOpacity
                              key={option}
                              style={[
                                styles.dropdownOption,
                                currentRecurrence.type === option &&
                                styles.dropdownOptionSelected,
                              ]}
                              onPress={() => {
                                setCurrentRecurrence(prev => ({
                                  ...prev,
                                  type: option,
                                }));
                                setShowRecurrenceDropdown(false);
                              }}
                            >
                              <Text style={styles.dropdownOptionText}>
                                {option}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>

                    {renderRecurrenceInput()}

                    <Text style={styles.everyText}>
                      {getCurrentRecurrenceSummary()}
                    </Text>

                    <View style={styles.buttonRow}>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={handleCancelRecurrence}
                      >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.applyButton}
                        onPress={handleApplyRecurrence}
                      >
                        <Text style={styles.applyButtonText}>Apply</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Event Notes Section */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Event Instructions</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, styles.notesInput]}
                  placeholder="Add notes"
                  placeholderTextColor="#999"
                  value={eventNotes}
                  onChangeText={setEventNotes}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>
        </ScrollView>

        {/* footer section */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <TouchableOpacity
              style={[
                styles.cancelButtonFt,
                isFormValid && styles.cancelButtonDisabled,
              ]}
              onPress={() => {
                navigation.goBack();
              }}
            >
              <Text
                style={[
                  styles.cancelButtonTextFt,
                  isFormValid && styles.cancelButtonTextDisabled,
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footerRight}>
            <TouchableOpacity
              style={[
                styles.continueButton,
                !isFormValid && styles.continueButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text
                  style={[
                    styles.continueButtonText,
                    !isFormValid && styles.continueButtonTextDisabled,
                  ]}
                >
                  Save
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
        {isSubmitting && (
          <View style={styles.fullScreenLoader}>
            <View style={styles.loaderContent}>
              <ActivityIndicator size="large" color="#066858" />
              <Text style={styles.loaderText}>
                {isEditMode ? 'Updating Event...' : 'Scheduling Event...'}
              </Text>
            </View>
          </View>
        )}

        {/* Weekday dropdown */}
        {showWeekdayDropdown && (
          <View style={styles.weekdayDropdownPortal}>
            <View style={styles.weekdayDropdownOptions}>
              {weekdays.map(weekday => (
                <TouchableOpacity
                  key={weekday}
                  style={styles.weekdayOption}
                  onPress={() => handleWeekdaySelect(weekday)}
                >
                  <Text style={styles.weekdayOptionText}>{weekday}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Date Picker Modal */}
        {/* {Platform.OS === 'ios'
          ? showDatePicker && (
            <Modal
              transparent={true}
              animationType="slide"
              visible={showDatePicker}
              onRequestClose={handleDatePickerCancel}
            >
              <View style={styles.datePickerModalContainer}>
                <TouchableOpacity
                  style={styles.modalOverlay}
                  activeOpacity={1}
                  onPress={handleDatePickerCancel}
                />

                <View style={styles.datePickerContent}>
                  <View style={styles.datePickerHeader}>
                    <TouchableOpacity
                      onPress={handleDatePickerCancel}
                      style={styles.datePickerButton}
                    >
                      <Text style={styles.datePickerCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.datePickerTitle}>Select Date</Text>
                    <TouchableOpacity
                      onPress={handleDatePickerDone}
                      style={styles.datePickerButton}
                    >
                      <Text style={styles.datePickerDoneText}>Done</Text>
                    </TouchableOpacity>
                  </View>

                  <DateTimePicker
                    value={tempDate}
                    mode={datePickerMode}
                    display="spinner"
                    onChange={handleDatePickerChange}
                    minimumDate={new Date()}
                    style={styles.iosDatePicker}
                  />
                </View>
              </View>
            </Modal>
          )
          : showDatePicker && (
            <DateTimePicker
              value={tempDate}
              mode={datePickerMode}
              display="default"
              onChange={handleDatePickerChange}
              minimumDate={new Date()}
            />
          )} */}

        {renderTimePickerModal()}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  containerMain: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  safeAreaView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalOverlayPicker: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    backgroundColor: 'white',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  inputNormal: {
    borderColor: '#D1D5DB',
    //  flex: 1,
    // paddingVertical: 8,
    fontSize: 14,
    color: '#111827',
    paddingHorizontal: 8,
    paddingVertical: 15,
  },
  closeButtonModal: {
    marginTop: 10,
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonTextModal: {
    color: 'white',
    fontWeight: '600',
  },
  // header design
  headerSafe: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },

  // body design
  formContainer: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'visible',
  },
  section: {
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  sectionCheckbox: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  // staff member
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    padding: 12,
    backgroundColor: '#FFFFFF',
    minHeight: 44,
  },
  selectedTypeContainer: {
    flex: 1,
  },
  selectedTypeName: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
    marginBottom: 2,
  },
  selectedTypeDuration: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectedProviderDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  placeholderText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  dropdownScrollView: {
    maxHeight: 300,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dropdownOptions: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginTop: 4,
  },
  dropdownOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dropdownOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  dropdownText: {
    fontSize: 16,
    color: '#111827',
  },
  currentSelectionBadge: {
    backgroundColor: '#066858',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  currentSelectionText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  optionMainTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  optionName: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  optionDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionDuration: {
    fontSize: 14,
    color: '#6B7280',
  },
  clinicOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxContainer: {
    marginRight: 12,
  },
  providerCheckbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  providerCheckboxSelected: {
    backgroundColor: '#066858',
    borderColor: '#066858',
  },
  optionContent: {
    flex: 1,
  },
  selectedProvidersContainer: {
    flex: 1,
  },
  selectedProvidersCount: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  removeProviderButton: {
    marginLeft: 6,
    paddingHorizontal: 4,
  },
  removeProviderText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: 'bold',
  },
  selectedProvidersList: {
    flexDirection: 'row',
    flexGrow: 0,
  },
  selectedProviderBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#066858',
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedProviderBadgeText: {
    fontSize: 12,
    color: '#066858',
    fontWeight: '500',
  },

  // Show in all clinics checkbox
  showAllClinicsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  showAllClinicsText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    marginRight: 8,
  },

  // date design
  datesContainer: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  dateOption: {
    width: 70,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 8,
    marginRight: 8,
  },
  dateOptionSelected: {
    backgroundColor: '#ECFDF5',
    borderColor: '#066858',
  },
  dateOptionWeekday: {
    fontSize: 10,
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  dateOptionDay: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  dateOptionMonth: {
    fontSize: 10,
    color: '#6B7280',
    textTransform: 'uppercase',
  },

  // input design
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    marginTop: 4,
  },
  iconText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  inputContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#333',
  },

  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#4B5563' },
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  slot: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    margin: 5,
    minWidth: 80,
    alignItems: 'center',
  },
  slotSelected: {
    backgroundColor: '#ECFDF5',
    borderColor: '#066858',
  },
  slotText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  slotTextSelected: {
    color: '#111827',
  },
  slotDisabled: {
    backgroundColor: '#ced4da',
    opacity: 0.6,
  },
  slotTextDisabled: {
    color: '#6c757d',
  },
  noSlots: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 8,
  },
  selectedTimeContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#e7f3ff',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  selectedTimeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007bff',
    textAlign: 'center',
  },
  timeSelector: {
    marginBottom: 20,
  },
  afterHoursMessage: {
    fontSize: 16,
    color: '#dc3545',
    fontStyle: 'italic',
    marginBottom: 16,
  },

  // recurring design
  dropdownContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dropdownInput: {
    flex: 1,
    paddingRight: 40,
  },
  dropdownIcon: {
    position: 'absolute',
    right: 12,
    fontSize: 14,
    color: '#666',
  },
  clearButton: {
    position: 'absolute',
    right: 32,
    padding: 4,
  },
  clearText: {
    fontSize: 14,
    color: '#666',
  },
  dateTimeRow: {
    marginBottom: 16,
  },
  dateInputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateInput: {
    flex: 1,
    paddingRight: 40,
  },
  calendarIcon: {
    position: 'absolute',
    right: 12,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  timeContainer: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  timeInput: {
    textAlign: 'center',
  },
  recurringRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#066858',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginTop: 4,
  },
  checkmark: {
    color: '#066858',
    fontSize: 12,
    fontWeight: 'bold',
  },
  recurringText: {
    fontSize: 16,
    color: '#333',
    paddingHorizontal: 8,
  },
  repeatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  repeatInput: {
    width: 80,
    marginRight: 12,
    textAlign: 'center',
  },
  weekText: {
    fontSize: 16,
    color: '#333',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    backgroundColor: 'white',
  },
  dayButtonSelected: {
    backgroundColor: '#ECFDF5',
    borderColor: '#066858',
  },
  dayText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  dayTextSelected: {
    color: '#333',
  },
  everyWeekText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#066858',
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },

  recurrenceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  unitText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 4,
  },
  monthlyOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  radioButton: {
    marginRight: 12,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#066858',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#066858',
  },
  monthlyOptionLabel: {
    fontSize: 14,
    color: '#333',
    marginRight: 12,
  },
  dayOfMonthInput: {
    width: 60,
    textAlign: 'center',
  },
  weekdayInput: {
    width: 120,
    marginRight: 8,
  },
  everyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  recurrenceSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  recurrenceSummaryRow: {
    flex: 1,
  },
  recurrenceSummaryText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  recurrenceSummaryValue: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  editRecurrenceButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#066858',
    borderRadius: 4,
  },
  editRecurrenceText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  dropdownContainerFixed: {
    position: 'relative',
    marginBottom: 16,
    zIndex: 1000,
  },
  dropdownOptionsFixed: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1001,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    padding: 12,
    backgroundColor: '#FFFFFF',
    minHeight: 44,
  },
  dropdownText: {
    fontSize: 16,
    color: '#111827',
  },

  recurrenceSummaryCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#066858',
  },
  recurrenceSummaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recurrenceSummaryValue: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  recurrenceFormCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },

  weekdayDropdownContainer: {},
  weekdayDropdownTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    padding: 8,
    backgroundColor: '#FFFFFF',
  },
  weekdayDropdownText: {
    fontSize: 14,
    color: '#111827',
  },
  weekdayDropdownPortal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10000,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  weekdayDropdownOptions: {
    position: 'absolute',
    top: '40%',
    left: '30%',
    right: '30%',
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 10001,
    maxHeight: 300,
  },
  weekdayOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  weekdayOptionText: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
  },
  ////loader/////
  fullScreenLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loaderContent: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
  },
  loaderText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  // Modal design
  calendarIconContainer: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  datePickerModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  datePickerContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 0,
  },

  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  datePickerButton: {
    padding: 8,
    minWidth: 60,
  },

  datePickerCancelText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },

  datePickerDoneText: {
    fontSize: 16,
    color: '#066858',
    fontWeight: '600',
  },

  datePickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },

  iosDatePicker: {
    height: 200,
    width: '100%',
  },

  // Footer design
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelButtonFt: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    backgroundColor: 'white',
  },
  cancelButtonTextFt: {
    fontSize: 16,
    color: '#374151',
  },
  continueButton: {
    backgroundColor: '#066858',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
  cancelButtonDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  cancelButtonTextDisabled: {
    color: '#9CA3AF',
  },
  continueButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  continueButtonTextDisabled: {
    color: '#9CA3AF',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  /////////////Timer//////////////
  // Time Method Toggle
  timeMethodToggle: {
    flexDirection: 'row',
    marginBottom: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 6,
  },
  timeMethodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  timeMethodButtonActive: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timeMethodButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  timeMethodButtonTextActive: {
    color: '#066858',
    fontWeight: '600',
  },

  customTimeDisplay: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#066858',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  customTimeLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    marginLeft: -8,
  },
  customTimeValue: {
    fontSize: 16,
    color: '#066858',
    fontWeight: '800',
  },
  customTimeIcon: {
    marginRight: 2,
  },
  editCustomTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#066858',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editCustomTimeText: {
    fontSize: 12,
    color: '#066858',
    fontWeight: '500',
    marginLeft: 4,
  },

  // Time Picker Modal
  timePickerModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  timePickerContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: '70%',
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  timePickerButton: {
    padding: 8,
    minWidth: 60,
  },
  timePickerCancelText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  timePickerDoneText: {
    fontSize: 16,
    color: '#066858',
    fontWeight: '600',
  },
  timePickerDoneTextDisabled: {
    color: '#9CA3AF',
    opacity: 0.5,
  },
  timePickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  timeDisplaySection: {
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  timeDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  timeDisplayLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    // width: 80,
  },
  previousTimeDisplay: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '500',
    textDecorationLine: 'line-through',
  },
  newTimeDisplay: {
    fontSize: 18,
    color: '#066858',
    fontWeight: '700',
    paddingLeft: 8
  },
  wheelLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  wheelLabelColumn: {
    flex: 1,
    alignItems: 'center',
  },
  wheelLabelText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timeWheelsContainer: {
    flexDirection: 'row',
    height: 220,
    backgroundColor: 'white',
    position: 'relative',
    paddingVertical: 4
  },
  centerSelectionLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 52,
    marginTop: -22,
    backgroundColor: 'rgba(6, 104, 88, 0.1)',
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#066858',
    zIndex: 1,
  },
  wheelColumn: {
    flex: 1,
    alignItems: 'center',
    overflow: 'hidden',
  },
  wheelScrollView: {
    width: '100%',
  },
  wheelContentContainer: {
    paddingVertical: 88,
  },
  wheelItem: {
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelItemText: {
    fontSize: 18,
    color: '#9CA3AF',
    fontWeight: '400',
  },
  wheelItemTextSelected: {
    fontSize: 24,
    color: '#066858',
    fontWeight: '700',
  },
  selectedTimePreview: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#ECFDF5',
    borderTopWidth: 1,
    borderTopColor: '#D1FAE5',
  },
  selectedTimeLabel: {
    fontSize: 16,
    color: '#065F46',
    fontWeight: '600',
    marginRight: 8,
  },
  selectedTimeValue: {
    fontSize: 20,
    color: '#065F46',
    fontWeight: '800',
  },
  modalOverlayTimer: {
    flex: 1,
  },

  previousTimeBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  previousValueItem: {
    backgroundColor: '#ECFDF5',
    borderRadius: 6,
  },
  previousValueText: {
    color: '#066858',
    fontWeight: '600',
  },
  previousValueIndicator: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#066858',
  },

  // Error Text
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 8,
    marginBottom: 8,
  },
  errorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: '#FEF2F2',
    marginHorizontal: 16,
    borderRadius: 6,
    marginTop: 8,
  },
  errorMessage: {
    color: '#EF4444',
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },

  ///////
  wheelContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  centerSelectionHighlight: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 52,
    marginTop: -26,
    zIndex: 1,
  },

  centerSelectionLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    marginTop: -1,
    backgroundColor: '#066858',
    opacity: 0.8,
  },

  centerSelectionCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 10,
    height: 10,
    marginLeft: -5,
    marginTop: -5,
    borderRadius: 5,
    backgroundColor: '#066858',
  },

  wheelItemContainer: {
    width: 60,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: 'transparent',
  },

  wheelItemContainerSelected: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  wheelItemText: {
    fontSize: 18,
    color: '#94A3B8',
    fontWeight: '500',
  },

  wheelItemTextSelected: {
    fontSize: 22,
    color: '#065F46',
    fontWeight: '700',
  },

  wheelItemIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },

  previousTimeSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },

  previousTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F59E0B',
    alignSelf: 'flex-start',
  },

  previousTimeLabel: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '600',
    marginLeft: 6,
    marginRight: 4,
  },

  previousTimeValue: {
    fontSize: 15,
    color: '#92400E',
    fontWeight: '700',
  },
});

export default PersonalClinicView;