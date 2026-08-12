import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  ScrollView,
  StyleSheet,
  Switch,
  Alert,
  SafeAreaView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  CheckBox,
  DeviceEventEmitter,
  Modal,
  Linking
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as GlobalVariables from '../config/GlobalVariableContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { IconButton } from '@draftbit/ui';
import moment from 'moment-timezone';
import debounce from 'lodash.debounce';
import useWindowDimensions from '../utils/useWindowDimensions';
import * as GlobalStyles from '../GlobalStyles.js';
import * as StyleSheetCustom from '../utils/StyleSheet';
import palettes from '../themes/palettes';
import { logError } from '../index.js';
import { TIMEZONE_MAP } from '../CalendarBigView.js';
import { checkInternetAndProceed } from './InternetConnection.js';

const { width, height } = Dimensions.get('window');
const PAGE_SIZE = 25;

const buildPatientSearchTerm = (firstName, middleName, lastName) =>
  [firstName, middleName, lastName].filter(Boolean).join(' ').trim();

const formatPatientSearchLabel = (firstName, middleName, lastName) =>
  buildPatientSearchTerm(firstName, middleName, lastName);

const matchesPatientName = (patient, firstName, middleName, lastName) => {
  const patientFirst = patient.first_name?.toLowerCase() ?? '';
  const patientMiddle = (patient.middle_name || '').trim().toLowerCase();
  const patientLast = patient.last_name?.toLowerCase() ?? '';
  const searchFirst = firstName?.toLowerCase() ?? '';
  const searchMiddle = (middleName || '').trim().toLowerCase();
  const searchLast = lastName?.toLowerCase() ?? '';

  return (
    patientFirst === searchFirst &&
    patientLast === searchLast &&
    patientMiddle === searchMiddle
  );
};

const getNextTenDays = () => {
  const days = [];
  const weekdayOptions = { weekday: 'short' };
  const dateOptions = { month: 'short', day: 'numeric', year: 'numeric' };

  for (let i = 0; i < 10; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    days.push({
      weekday: date.toLocaleDateString('en-US', weekdayOptions).toUpperCase(),
      month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      day: date.getDate(),
      fullDate: date.toLocaleDateString('en-US', dateOptions),
      dateObj: date,
    });
  }

  return days;
};

const getSurroundingDays = startDate => {
  const days = [];
  const weekdayOptions = { weekday: 'short' };
  const dateOptions = { month: 'short', day: 'numeric', year: 'numeric' };

  for (let i = -5; i < 15; i++) {
    // includes 5 days before + 15 days after
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    days.push({
      weekday: date.toLocaleDateString('en-US', weekdayOptions).toUpperCase(),
      month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      day: date.getDate(),
      fullDate: date.toLocaleDateString('en-US', dateOptions),
      dateObj: date,
    });
  }
  return days;
};

export const AppointmentWizard = ({ theme }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const dimensions = useWindowDimensions();

  const { appointmentData, isEditing } = route.params ?? {};
  const [selectedDurationTime, setSelectedDurationTime] = useState(60);
  const [appointmentTypes, setAppointmentTypes] = useState([]);
  // Dates selections
  const [availableDates, setAvailableDates] = useState(getNextTenDays());
  const [selectedDate, setSelectedDate] = useState(availableDates[0]);
  const [onBoardingFormData, setOnBoardingFormData] = useState([]);

  // const [selectedType, setSelectedType] = useState(
  //   isEditing ? appointmentData?.extra?.appointment_type : ''
  // );
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState('');

  const getNext5Min = (date) => {
    const d = new Date(date);
    const minutes = d.getMinutes();
    const nextMinutes = Math.ceil(minutes / 5) * 5;

    if (nextMinutes === 60) {
      d.setHours(d.getHours() + 1);
      d.setMinutes(0, 0, 0);
    } else {
      d.setMinutes(nextMinutes, 0, 0);
    }

    return d;
  };

  const getCurrentESTDate = () => {
    return moment().tz(validZone).toDate();
  };

  const [fromTime, setFromTime] = useState(getNext5Min(new Date()));

  const [toTime, setToTime] = useState(getNext5Min(new Date().setHours(new Date().getHours() + 1)));

  const { firstname, middlename, lastname, inboxRoute } = route.params ?? {};

  React.useEffect(() => {
    Text.defaultProps = Text.defaultProps || {};
    Text.defaultProps.allowFontScaling = false;
    Text.defaultProps.includeFontPadding = false;

    TextInput.defaultProps = TextInput.defaultProps || {};
    TextInput.defaultProps.allowFontScaling = false;
    TextInput.defaultProps.includeFontPadding = false;
  }, []);

  // state to track if we're searching from inboxThreads
  const [isInboxSearch, setIsInboxSearch] = useState(!!inboxRoute);
  const [inboxSearchCompleted, setInboxSearchCompleted] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);
  const globalValues = GlobalVariables.useValues();
  const { clinic_pk_id, regionId, typeId, AUTH_HEADER, practice, practice_name, clinic_timezone } = globalValues;
  const REGION_ID = regionId;
  const TYPE_ID = typeId;
  const CLINIC_ID = clinic_pk_id;
  // const { MessageId } = GlobalVariables.useValues();
  // const { AUTH_HEADER } = GlobalVariables.useValues();

  const [validationMessages, setValidationMessages] = useState({
    provider: '',
    location: '',
    onboarding: ''

  });
  const [validZone, setValidZone] = useState('UTC');

  // Loading states for editing mode
  const [isLoadingEditData, setIsLoadingEditData] = useState(isEditing);
  const [editDataLoaded, setEditDataLoaded] = useState(false);
  const [editStartMoment, setEditStartMoment] = useState(null);
  const [isScheduling, setIsScheduling] = useState(false);

  // Initialize state with empty values first
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedType, setSelectedType] = useState('');

  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  // const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [appointmentId, setAppointmentId] = useState(null);
  const [referralSource, setReferralSource] = useState(null);
  const [onboardingOption, setOnboardingOption] = useState(null); // 'male' or 'female'
  const [showOnBoardingDropdown, setShowPOnBoardingDropdown] = useState(false);
  const [selectedBoardingForm, setSelectedBoardingForm] = useState([]);
  const [isLoadingOnboardingForm, setIsLoadingOnboardingForm] = useState(false);


  React.useEffect(() => {
    const validZone = TIMEZONE_MAP[selectedLocation?.timezone?.toLowerCase()] || 'UTC';
    console.log("Time Zone : ", validZone);

    setValidZone(validZone);
  }, [selectedLocation]);
  React.useEffect(() => {
    setOnboardingOption(selectedPatient?.email?.trim() ? '2' : selectedPatient?.phone?.trim() ? '1' : '')
    fetchOnboardingFormData();
  }, [selectedPatient]);

  const fetchOnboardingFormData = async () => {
    try {
      const isConnected = await checkInternetAndProceed();
      if (!isConnected) {
        return;
      }
      setIsLoadingOnboardingForm(true);

      const baseUrl = `${globalValues.API_BASE_URL}/intake-forms/`;
      const queryParams = new URLSearchParams({
        is_active: true,
        practice: practice,
        clinic: CLINIC_ID,
      });
      const url = `${baseUrl}?${queryParams}`;

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: AUTH_HEADER,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        logError('API Error:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      // console.log('Fetching BoardingForm:', data);

      // Handle different response structures
      const typesList = data.results || data.items || data;
      setOnBoardingFormData(Array.isArray(typesList) ? typesList : [typesList]);
    } catch (error) {
      console.log('Error fetching BoardingForm:', error);
    } finally {
      setIsLoadingOnboardingForm(false);
    }
  };

  useEffect(() => {
    if (isEditing && appointmentData && !editDataLoaded) {
      loadEditData();
    }
  }, [isEditing, appointmentData, editDataLoaded]);

  const convertESTUTCToDeviceTimeKeepClock = (utcString) => {
    const deviceTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Convert UTC → EST first
    const estTime = moment.utc(utcString).tz(validZone); //"America/New_York"

    // Rebuild same clock time in device timezone
    const deviceTime = moment.tz(
      {
        year: estTime.year(),
        month: estTime.month(),
        day: estTime.date(),
        hour: estTime.hour(),
        minute: estTime.minute(),
        second: estTime.second(),
      },
      deviceTimezone
    );

    return deviceTime.toDate();
  };

  const convertESTToISTKeepClock = (estDateString, selectedTimeZone = '') => {
    // Step 1: Parse EST time
    const estTime = moment.tz(estDateString, selectedTimeZone ? selectedTimeZone : validZone);

    const deviceTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // console.log("===== deviceTimezone : ",validZone, deviceTimezone,selectedTimeZone, selectedTimeZone ? selectedTimeZone : validZone)
    // Step 2: Build same clock time in IST
    const istTime = moment.tz(
      {
        year: estTime.year(),
        month: estTime.month(),
        day: estTime.date(),
        hour: estTime.hour(),
        minute: estTime.minute(),
        second: estTime.second(),
      },
      deviceTimezone
    );

    return istTime.toDate();
  };


  const loadEditData = async () => {
    try {
      setIsLoadingEditData(true);
      // console.log("====== appointmentData : ", appointmentData)
      // Set all data from the appointment
      // setAppointmentOutsideWorkingHours(appointmentData?.extra?.should_create_schedule_for_staff || false)
      // if (appointmentData?.extra?.should_create_schedule_for_staff) {
      // console.log("==== ",appointmentData.start_moment, convertESTToISTKeepClock(appointmentData.start_moment), convertESTUTCToDeviceTimeKeepClock(new Date(appointmentData.start_moment)))
      // setFromTime(new Date(appointmentData.start_moment))
      setSelectedLocation(appointmentData?.clinic || null);
      // console.log("======= appointmentData?.clinic : ", appointmentData?.clinic?.timezone)
      setFromTime(
        convertESTToISTKeepClock(appointmentData.start_moment, appointmentData?.clinic?.timezone)
      );
      setToTime(
        convertESTToISTKeepClock(appointmentData.end_moment, appointmentData?.clinic?.timezone)
      );
      // setToTime(new Date(appointmentData.end_moment))
      // convertESTUTCToDeviceTimeKeepClock(new Date(appointmentData.start_moment))
      // convertESTUTCToDeviceTimeKeepClock(new Date(appointmentData.end_moment))
      // }
      setSelectedPatient(appointmentData?.extra?.patient || null);
      setSelectedType(appointmentData?.extra?.appointment_type || '');
      setSelectedProvider(appointmentData?.staff_member || null);
      // setSelectedRoom(appointmentData?.extra?.room || null);
      setSpecialInstructions(appointmentData?.extra?.notes || '');
      setAppointmentId(appointmentData?.extra?.appointment_id || null);
      setReferralSource(appointmentData?.extra?.referral_source || null);

      // Set date
      if (appointmentData?.start_moment) {
        const startMoment = new Date(appointmentData.start_moment);
        const days = getSurroundingDays(startMoment);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const futureDays = days.filter(day => {
          const dayDate = new Date(day.dateObj);
          dayDate.setHours(0, 0, 0, 0);
          return dayDate >= today;
        });

        if (futureDays.length > 0) {
          setAvailableDates(futureDays);

          const originalDate = futureDays.find(
            d => {
              const dayDate = new Date(d.dateObj);
              dayDate.setHours(0, 0, 0, 0);
              const startDate = new Date(startMoment);
              startDate.setHours(0, 0, 0, 0);
              return dayDate.getTime() === startDate.getTime();
            }
          );

          if (originalDate) {
            setSelectedDate(originalDate);
            console.log('Found original date:', originalDate);
          } else {
            setSelectedDate(futureDays[0]);
          }
        } else {
          const matchingDate = days.find(
            d => {
              const dayDate = new Date(d.dateObj);
              dayDate.setHours(0, 0, 0, 0);
              const startDate = new Date(startMoment);
              startDate.setHours(0, 0, 0, 0);
              return dayDate.getTime() === startDate.getTime();
            }
          );
          if (matchingDate) {
            setAvailableDates(days);
            setSelectedDate(matchingDate);
          } else {
            setAvailableDates(days);
            setSelectedDate(days[Math.floor(days.length / 2)]);
          }
        }

        setEditStartMoment(startMoment);


        const eventTimezone = 'us/eastern';

        const isoString = appointmentData?.start_moment;
        const datePart = isoString.split('T')[0];
        const [year, month, day] = datePart.split('-').map(Number);
        const originalEventDate = new Date(year, month - 1, day);


        const targetDateStr = originalEventDate.toDateString();
        const matchingDate = days.find(day => {
          const dayDateStr = new Date(day.dateObj).toDateString();
          return dayDateStr === targetDateStr;
        });



        console.log("===== matchingDate :", matchingDate, appointmentData?.start_moment)
        if (matchingDate) {
          setSelectedDate(matchingDate);

        }

        // setSelectedSlot(null);
      }

      // Set duration
      if (appointmentData?.extra?.appointment_type?.default_duration) {
        const durationInMinutes = convertDurationToMinutesSec(
          appointmentData.extra.appointment_type.default_duration
        );
        // console.log("===== durationInMinutes : ", durationInMinutes, appointmentData.extra.appointment_type.default_duration)
        const formattedDuration = formatDuration(durationInMinutes);
        setSelectedDuration(formattedDuration);
        setSelectedDurationTime(durationInMinutes)

      }

      // Fetch additional data
      const isConnected = await checkInternetAndProceed();
      if (!isConnected) {
        return;
      }
      await Promise.all([
        fetchAppointmentTypes(true, 4),
        fetchPatients('', PAGE_SIZE, 0),
        fetchProviders(),
      ]);

      // Fetch location-specific data
      if (appointmentData?.staff_member && appointmentData?.clinic) {
        const regionId = appointmentData.clinic.region?.id;
        const validRegionId = regionId && !isNaN(regionId) ? regionId : REGION_ID;
        await fetchLocations(
          appointmentData.staff_member.id,
          TYPE_ID,
          validRegionId
        );

        // if (appointmentData.clinic.id) {
        //   await fetchRooms(appointmentData.clinic.id);
        // }
      }

      setEditDataLoaded(true);
    } catch (error) {
      logError('Error loading edit data:', error);
    } finally {
      setIsLoadingEditData(false);
    }
  };

  // Initial loading methods - only fetch if not editing
  useEffect(() => {
    if (!isEditing && !inboxRoute) {
      fetchAppointmentTypes(true, 4);
      // fetchPatients('', PAGE_SIZE, 0);
      fetchProviders();
    } else if (inboxRoute) {
      fetchAppointmentTypes(true, 4);
      fetchProviders();
    }
  }, [isEditing]);

  useEffect(() => {
    if (selectedProvider && selectedProvider.id) {
      const regionId = selectedPatient?.preferred_clinic?.region?.id;
      const validRegionId = regionId && !isNaN(regionId) ? regionId : REGION_ID;
      fetchLocations(selectedProvider.id, TYPE_ID, validRegionId);
    }
  }, [selectedProvider, selectedPatient]);

  useEffect(() => {
    // console.log("==== selectedDuration ===== : ", selectedDurationTime)
    if (!selectedDurationTime) return;

    const loadAvailability = async () => {
      try {
        const isConnected = await checkInternetAndProceed();
        if (!isConnected) {
          return;
        }
        const clinicIDtemp = selectedLocation?.id || CLINIC_ID;

        await fetchStaffAvailability(
          selectedProvider?.id,
          clinicIDtemp,
          selectedDate
        );
      } catch (error) {
        console.log('Availability error:', error);
      }
    };

    loadAvailability();
  }, [selectedDurationTime]);
  // console.log("==== selectedDuration : ", selectedDurationTime)
  // console.log("==== ",new Date(appointmentData.start_moment).toISOString(), fromTime)
  useEffect(() => {
    if (selectedProvider && selectedPatient && !isEditing && !appointmentData) {
      const patientPreferredClinic = selectedPatient?.preferred_clinic;

      if (
        patientPreferredClinic &&
        patientPreferredClinic.id &&
        locations.length > 0
      ) {
        const preferredLocation = locations.find(
          location =>
            location.id.toString() === patientPreferredClinic.id.toString()
        );

        if (preferredLocation && !selectedLocation) {
          setSelectedLocation(preferredLocation);
          console.log('Auto-selected location after fetch:', preferredLocation);
        }
      }
    }
  }, [
    locations,
    selectedProvider,
    selectedPatient,
    isEditing,
    appointmentData,
  ]);

  // Fetch rooms when location is selected (including from edit data)
  // useEffect(() => {
  //   if (editDataLoaded && selectedLocation && selectedLocation.id) {
  //     fetchRooms(selectedLocation.id);
  //   }
  // }, [editDataLoaded, selectedLocation]);

  // Fetch staff availability when all required fields are available
  useEffect(() => {
    if (
      editDataLoaded &&
      selectedProvider &&
      selectedLocation &&
      selectedDate
    ) {
      const clinicIDtemp = selectedLocation?.id || CLINIC_ID;
      fetchStaffAvailability(
        selectedProvider.id,
        clinicIDtemp,
        selectedDate
      );
    }
  }, [editDataLoaded, selectedProvider, selectedLocation, selectedDate]);

  useEffect(() => {
    if (editDataLoaded && locations.length > 0 && appointmentData?.clinic) {
      const match = locations.find(
        l => l.id.toString() === appointmentData.clinic.id.toString()
      );
      if (match) setSelectedLocation(match);
    }
  }, [editDataLoaded, locations, editDataLoaded]);

  const formatDateTime = (date, zone = 'UTC') => {
    // const options = { hour: 'numeric', minute: 'numeric', hour12: true };
    // // return date.toLocaleTimeString([], options);
    // if (!date) return null;
    // // return moment(date).format('hh:mm A'); // e.g., 01:00 PM
    // return moment.tz(date, zone).format('hh:mm A');

    return new Date(date).toLocaleTimeString("en-US", {
      timeZone: validZone, //"America/New_York",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })

  };
  // const formatted = slots.map(date =>
  //   new Date(date).toLocaleTimeString("en-US", {
  //     timeZone: "America/New_York",
  //     hour: "numeric",
  //     minute: "2-digit",
  //     hour12: true,
  //   })
  // );
  useEffect(() => {
    if (!isEditing || !editStartMoment || !slots || slots.length === 0) return;

    const targetTime = new Date(editStartMoment);

    let match = slots.find(s => {
      const slotTime = s instanceof Date ? s : new Date(s);
      return (
        slotTime.getHours() === targetTime.getHours() &&
        slotTime.getMinutes() === targetTime.getMinutes()
      );
    });

    if (!match) {
      const tolerance = 2 * 60 * 1000;
      match = slots.find(s => {
        const slotTime = s instanceof Date ? s : new Date(s);
        return Math.abs(slotTime.getTime() - targetTime.getTime()) <= tolerance;
      });
    }

    if (match) {
      setSelectedSlot(match instanceof Date ? match : new Date(match));
      console.log('Matched time slot for editing:', match);
    }
  }, [slots, isEditing, editStartMoment]);

  // // Re-select room once rooms are fetched
  // useEffect(() => {
  //   if (editDataLoaded && rooms.length > 0 && appointmentData?.extra?.room) {
  //     const match = rooms.find(
  //       r => r.id.toString() === appointmentData.extra.room.id.toString()
  //     );
  //     if (match) setSelectedRoom(match);
  //   }
  // }, [rooms, editDataLoaded]);

  ////////////////////////END////////////////////////

  // Patient selection
  // const [selectedPatient, setSelectedPatient] = useState(
  //   isEditing ? appointmentData?.extra?.patient : null
  // );
  const [allPatients, setAllPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [searchDebounce, setSearchDebounce] = useState(null);
  const searchInputRef = useRef(null);
  const [isLoadingAppointment, setIsLoadingAppointment] = useState(false);

  // const [offset, setOffset] = useState(0);
  // const [hasMore, setHasMore] = useState(true);
  // const [isFetchingMore, setIsFetchingMore] = useState(false);

  const [patientOriginalPreferences, setPatientOriginalPreferences] = useState({
    clinic: null,
    provider: null,
  });

  const fetchPatients = async (
    searchTerm = '',
    limit = PAGE_SIZE,
    offsetValue = 0
  ) => {
    try {
      setIsInitialLoad(false);
      // if (append) {
      //   setIsFetchingMore(true);
      // } else {
      //   setIsLoading(true);
      // }
      if (searchTerm) setIsLoading(true);
      else setIsInitialLoad(true);

      // const baseUrlPt = `${globalValues.API_BASE_URL}/patients/?search=${searchTerm}&is_active=true&limit=${limit}&offset=${offsetValue}&ordering=last_name,first_name,id&query={id,first_name,middle_name,last_name,full_name,is_active,primary_care_physician{full_name},referring_physician{full_name},referral_source{id,name,referred_type},sub_referral_source{id,name,object_id,object_type,parent{id}},preferred_name,title,birthdate,age_years,photo,suffix,email,phone,secondary_phone,crm_segment,box_folder_id,unread_inbound_message_count,preferred_communication_method,phone_type,primary_contact_notes,secondary_contact_notes,city,state,preferred_clinic{id,timezone,name,noah_provider,region},preferred_provider,previous_appointment_moment,next_appointment_moment,previous_appointment{id,type{name},status,start_moment,clinic{timezone},patient_feedback_rating,staff_member{first_name,last_name}},following_appointment_moment,following_appointment{id,type{id,name},needs_reschedule,title,start_moment,clinic{name,timezone},status,patient_feedback_rating,staff_member{first_name,last_name}},next_appointment{id,type{name},status,start_moment,clinic{timezone},patient_feedback_rating,staff_member{first_name,last_name}},managed_care_plan{id,name,notes,managed_care_provider{name}},assigned_tags{id,tag,description,expires_at},created_at_display}`;
      const baseUrlPt = `${globalValues.API_BASE_URL}/patients/?search=${searchTerm}&is_active=true&limit=${limit}&offset=${offsetValue}&ordering=last_name,first_name,id&query={id,first_name,middle_name,last_name,full_name,is_active,referral_source{id,name,referred_type},preferred_name,title,birthdate,age_years,photo,suffix,email,phone,secondary_phone,crm_segment,box_folder_id,unread_inbound_message_count,preferred_communication_method,phone_type,primary_contact_notes,secondary_contact_notes,city,state,preferred_clinic{id,timezone,name,noah_provider,region},preferred_provider,created_at_display}`;

      const url = `${baseUrlPt}`;
      // console.log("==== url :", AUTH_HEADER, baseUrlPt)
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: AUTH_HEADER,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        logError('API Error:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const patientList = data.results || data.items || data;

      // if (Array.isArray(patientList)) {
      //   if (append) {
      //     setAllPatients(prev => [...prev, ...patientList]);
      //     setFilteredPatients(prev => [...prev, ...patientList]);
      //   } else {
      //     setAllPatients(patientList);
      //     setFilteredPatients(patientList);
      //   }
      //   // setHasMore(patientList.length === limit);
      //   const hasMoreResults = patientList.length === limit;
      //   setHasMore(hasMoreResults);
      // }
      if (Array.isArray(patientList)) {
        if (searchTerm) {
          setFilteredPatients(patientList);

          // Auto-select patient if coming from inbox and we found a match
          if (
            isInboxSearch &&
            !inboxSearchCompleted &&
            patientList.length > 0
          ) {
            const exactMatch = patientList.find(patient =>
              matchesPatientName(patient, firstname, middlename, lastname)
            );

            if (exactMatch) {
              handlePatientSelect(exactMatch);
            } else if (patientList.length === 1) {
              handlePatientSelect(patientList[0]);
            }

            setInboxSearchCompleted(true);
            setIsInboxSearch(false);
          } else if (isInboxSearch && !inboxSearchCompleted) {
            setInboxSearchCompleted(true);
            setIsInboxSearch(false);
          }
        } else {
          setAllPatients(patientList);
          setFilteredPatients(patientList);
        }
      } else {
        logError('Unexpected API response:', data);
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      logError('Error fetching patients:', error);
      if (!searchTerm) setFilteredPatients(allPatients);
      if (isInboxSearch) {
        setInboxSearchCompleted(true);
        setIsInboxSearch(false);
      }
    } finally {
      setIsLoading(false);
      // setIsFetchingMore(false);
      setIsInitialLoad(false);
    }
  };

  React.useEffect(() => {
    if (!inboxRoute || !firstname || !lastname || inboxSearchCompleted) {
      return;
    }

    const searchTerm = buildPatientSearchTerm(firstname, middlename, lastname);
    setSearchText(searchTerm);
    fetchPatients(searchTerm, PAGE_SIZE, 0);
  }, [inboxRoute, firstname, middlename, lastname, inboxSearchCompleted]);

  // const handleSearch = text => {
  //   setSearchText(text);
  //   if (searchDebounce) clearTimeout(searchDebounce);

  //   const timeout = setTimeout(() => {
  //     // setOffset(0);
  //     if (text.trim().length < 2) {
  //       setFilteredPatients(allPatients);
  //     } else {
  //       fetchPatients(text, PAGE_SIZE, 0);
  //     }
  //   }, 400);

  //   setSearchDebounce(timeout);
  // };
  // const [textInputValue, setTextInputValue] = React.useState('');

  // const [searchValue, setSearchValue] = React.useState('');
  // const [isApiCalling, setIsApiCalling] = React.useState(false);


  // const debouncedSearch = useCallback(
  //   debounce((value) => {
  //     // setPatientListData([]);
  //     setSearchValue(value.toLowerCase());

  //   }, 600), // delay 600ms
  //   []
  // );

  // const handleTextChange = (text) => {
  //   setTextInputValue(text);
  //   debouncedSearch(text.toLowerCase());
  // };

  // React.useEffect(() => {
  //   if (searchValue === undefined) return;
  //   // console.log("====== searchValue: ", searchValue, textInputValue)
  //   setIsLoading(true);
  // }, [searchValue]);

  // React.useEffect(() => {
  //   let timer;

  //   if (isLoading) {
  //     timer = setTimeout(() => {
  //       if (!isApiCalling);
  //       setIsLoading(false);
  //       // console.log("Loader hidden after 4 seconds");
  //     }, Platform.OS == 'android' ? 6000 : 6000);
  //   }

  //   return () => clearTimeout(timer);
  // }, [isLoading]);

  const PatientSearchInput = React.memo(
    ({ onSearch, inputRef, externalSearchText }) => {


      const [localSearchText, setLocalSearchText] = useState(
        externalSearchText || ''
      );
      const debounceRef = useRef(null);

      // Sync local state with external prop changes
      // useEffect(() => {
      //   setLocalSearchText(externalSearchText || '');
      // }, [externalSearchText]);

      useEffect(() => {
        if (externalSearchText !== localSearchText) {
          setLocalSearchText(externalSearchText || '');
        }
      }, [externalSearchText]);

      const handleTextChange = useCallback(
        text => {
          setLocalSearchText(text);

          // Clear previous timeout
          if (debounceRef.current) {
            clearTimeout(debounceRef.current);
          }

          // Set new timeout
          // debounceRef.current = setTimeout(() => {
          //   // onSearch(text);
          // }, 600);

          debounceRef.current = setTimeout(() => {
            if (text.trim().length >= 2) {
              onSearch(text);
            }
          }, 600);
        },
        [onSearch]
      );

      // Cleanup on unmount
      useEffect(() => {
        return () => {
          if (debounceRef.current) {
            clearTimeout(debounceRef.current);
          }
        };
      }, []);

      return (
        <View style={styles.searchContainer}>
          <Icon
            name="search"
            size={20}
            color="#9CA3AF"
            style={styles.searchIcon}
          />
          <TextInput
            key="patient-search-input"
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Search by name, phone, ID, location..."
            placeholderTextColor="#9CA3AF"
            value={localSearchText}
            onChangeText={handleTextChange}
            returnKeyType="search"
            autoFocus={false}
            blurOnSubmit={false}
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>
      );
    }
  );

  const loadMorePatients = () => {
    if (hasMore && !isFetchingMore && !isLoading) {
      const newOffset = offset + PAGE_SIZE;
      setOffset(newOffset);
      fetchPatients(searchText, PAGE_SIZE, newOffset, true);
    }
  };

  const handleInputFocus = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  /** Render patient card */
  const renderPatientItem = useCallback(
    ({ item: patient }) => (
      <TouchableOpacity
        key={patient.id}
        style={[
          styles.patientCard,
          selectedPatient?.id === patient.id && styles.patientCardSelected,
        ]}
        onPress={() => handlePatientSelect(patient)}
      >
        <View style={styles.patientInfo}>
          <View style={styles.patientAvatar}>
            <Icon name="person" size={24} color="#6B7280" />
          </View>
          <View style={styles.patientDetails}>
            <Text style={styles.patientName}>
              {patient.first_name} {patient.middle_name ? `${patient.middle_name} ` : ''}{patient.last_name}
            </Text>
            <Text style={styles.patientMeta}>
              {patient.age_years || 'N/A'} yrs • {patient.phone}
            </Text>
          </View>
        </View>
        <View style={styles.recentBadge}>
          <Icon name="badge" size={14} color="#9CA3AF" />
          <Text style={styles.recentText}>{patient.id}</Text>
        </View>
      </TouchableOpacity>
    ),
    [selectedPatient]
  );

  const handlePatientSelect = async patient => {
    setSelectedPatient(patient);
    console.log('Provider found for this patient:', patient);
    if (!isEditing && !appointmentData) {
      setSelectedType('');
      setSelectedProvider(null);
      setSelectedLocation(null);
      // setSelectedRoom(null);

      setValidationMessages({
        provider: '',
        location: '',
      });
      const patientPreferredClinic = patient?.preferred_clinic;
      const patientPreferredProvider = patient?.preferred_provider;

      // console.log('Patient preferred clinic:', patientPreferredClinic);
      // console.log('Patient preferred provider:', patientPreferredProvider);

      // Store original preferences for comparison
      setPatientOriginalPreferences({
        clinic: patientPreferredClinic,
        provider: patientPreferredProvider,
      });

      if (patientPreferredProvider && patientPreferredProvider.id) {
        let providersList = providers;
        if (!providersList || providersList.length === 0) {
          providersList = await fetchProviders();
        }
        const preferredProvider = providersList.find(
          p =>
            p.id === patientPreferredProvider.id ||
            p.id?.toString() === patientPreferredProvider.id?.toString()
        );

        if (preferredProvider) {
          console.log(
            'Found preferred provider in providers list:',
            preferredProvider
          );
          setSelectedProvider(preferredProvider);
          showProviderDifferenceValidation(
            preferredProvider,
            patientPreferredProvider
          );

          // Fetch locations for this provider
          const regionId = patientPreferredClinic?.region?.id;
          const fetchedLocations = await fetchLocations(
            preferredProvider.id,
            TYPE_ID,
            regionId
          );

          await new Promise(resolve => setTimeout(resolve, 100));

          if (patientPreferredClinic && patientPreferredClinic.id) {
            // setTimeout(async () => {
            if (patientPreferredClinic && patientPreferredClinic.id) {
              const preferredLocation = fetchedLocations.find(
                location =>
                  location.id.toString() ===
                  patientPreferredClinic.id.toString()
              );

              if (preferredLocation) {
                setSelectedLocation(preferredLocation);

                // await fetchRooms(preferredLocation.id);

                if (selectedDate) {
                  const clinicIDtemp = preferredLocation?.id || CLINIC_ID;
                  await fetchStaffAvailability(
                    preferredProvider.id,
                    clinicIDtemp,
                    selectedDate
                  );

                  if (selectedType) {
                    const durationInMinutes = convertDurationToMinutesSec(
                      selectedType.default_duration
                    );
                    const availableSlots = getAvailableSlots(
                      selectedDate,
                      durationInMinutes,
                      preferredProvider.id,
                      preferredLocation.id
                    );
                    setSlots(availableSlots);
                  }
                }
              }
            }
            // }, 800);
          }
        } else {
          console.log('Preferred provider not found in providers list');
          setSelectedProvider(null);
        }
      } else {
        setSelectedProvider(null);
        console.log('No preferred provider for this patient');
      }
      // If we now have provider + location + selectedDate, fetch availability
      if (
        (selectedProvider || patientPreferredProvider) &&
        selectedLocation &&
        selectedDate
      ) {
        const providerId =
          (selectedProvider && selectedProvider.id) ||
          (patientPreferredProvider && patientPreferredProvider.id);
        if (providerId && selectedLocation.id) {
          const clinicIDtemp = selectedLocation?.id || CLINIC_ID;
          await fetchStaffAvailability(
            providerId,
            clinicIDtemp,
            selectedDate
          );
        }
      }
    }
  };

  const showClinicDifferenceValidation = (selectedClinic, preferredClinic) => {
    if (
      !selectedClinic ||
      !preferredClinic ||
      selectedClinic.id === preferredClinic.id.toString()
    ) {
      setValidationMessages(prev => ({ ...prev, location: '' }));
      return;
    }

    setValidationMessages(prev => ({
      ...prev,
      location: `The selected clinic differs from the patient's preferred choice. \nPatient's Preferred: ${preferredClinic.name || 'None'
        }`,
    }));
  };

  const showProviderDifferenceValidation = (
    selectedProvider,
    preferredProvider
  ) => {
    if (
      !selectedProvider ||
      !preferredProvider ||
      selectedProvider.id === preferredProvider.id
    ) {
      setValidationMessages(prev => ({ ...prev, provider: '' }));
      return;
    }

    setValidationMessages(prev => ({
      ...prev,
      provider: `The selected provider differs from the patient's preferred choice. \nPatient's Preferred: ${getProviderName(preferredProvider) || 'None'
        }`,
    }));
  };

  ////////////////////////END////////////////////////

  // Appointment type section

  const fetchAppointmentTypes = async (isActive, excludeType) => {
    try {
      setIsLoadingAppointment(true);

      const baseUrl = `${globalValues.API_BASE_URL}/appointment-types/`;
      const queryParams = new URLSearchParams({
        is_active: isActive,
        query:
          '{id,name,color,default_chart_note,default_duration,general_type,is_opportunity,is_audiologists_only,is_active,default_products{product{id,cpt_code{id,code},display_name,price}},generate_sale,generate_chart_note,patient_notifications_enabled,intake_forms}',
        exclude_type: excludeType,
      });
      const url = `${baseUrl}?${queryParams}`;
      // console.log('Fetching locations from:', url);

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: AUTH_HEADER,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        logError('API Error:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Handle different response structures
      const typesList = data.results || data.items || data;
      setAppointmentTypes(Array.isArray(typesList) ? typesList : [typesList]);
    } catch (error) {
      logError('Error fetching appointment types:', error);
    } finally {
      setIsLoadingAppointment(false);
    }
  };

  const handleTypeSelect = type => {
    setSelectedType(type);
    const durationInMinutes = convertDurationToMinutes(type.default_duration);
    // console.log("===== handleTypeSelect : ", durationInMinutes)
    const formattedDuration = formatDuration(durationInMinutes);
    setSelectedDurationTime(durationInMinutes);
    setSelectedDuration(formattedDuration);
    if (!isEditing && !appointmentData) {
      setShowTypeDropdown(false);
      setSelectedSlot(null);
      // setSelectedProvider(null);
      // setSelectedLocation(null);
      const availableSlots = getAvailableSlots(
        selectedDate,
        durationInMinutes,
        selectedProvider?.id,
        selectedLocation?.id
      );
      setSlots(availableSlots);
    }
  };

  const convertDurationToMinutes = durationString => {
    if (!durationString || typeof durationString !== 'string') {
      return 0;
    }

    try {
      const [hours, minutes] = durationString.split(':').map(Number);
      return hours * 60 + minutes;
    } catch (error) {
      logError('Error converting duration:', error);
      return 0;
    }
  };

  const formatDuration = totalMinutes => {
    if (
      totalMinutes === null ||
      totalMinutes === undefined ||
      isNaN(totalMinutes)
    ) {
      return '0 minutes';
    }

    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    if (hours > 0) {
      if (mins > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} ${mins} minute${mins > 1 ? 's' : ''
          }`;
      }
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    }

    return `${mins} minute${mins > 1 ? 's' : ''}`;
  };

  const getTypeCategory = type => {
    if (!type) return '';

    if (type.general_type === 1) return 'Fitting';
    if (type.general_type === 3) return 'Service';
    if (type.general_type === 2) return 'Diagnostic';
    if (type.general_type === 99) return 'Others';
    if (type.category) return type.category;
    // return type.general_type || '';
  };

  const getTypeName = type => {
    if (!type) return 'Unknown';
    return type.name || 'Unnamed Type';
  };


  const handleDateSelect = async day => {
    if (selectedDate?.dateObj?.getTime() === day.dateObj.getTime()) {
      setSelectedDate(null);
    } else {
      console.log("======= handleDateSelect ", day)
      setSelectedDate(day);
      // setFromTime(day.dateObj)
      // console.log('date selected', day);
      setSelectedSlot(null);
      // setSelectedProvider(null);
      // setSelectedLocation(null);
      if (selectedProvider && selectedLocation) {
        const clinicIDtemp = selectedLocation?.id || CLINIC_ID;
        await fetchStaffAvailability(
          selectedProvider.id,
          clinicIDtemp,
          day
        );
      }
    }
  };

  // Staff providers selection
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  const [providers, setProviders] = useState([]);
  // const [selectedProvider, setSelectedProvider] = useState(
  //   isEditing ? appointmentData?.staff_member : null
  // );
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);

  const buildProvidersUrl = () => {
    const baseUrl = `${globalValues.API_BASE_URL}/staff/`;

    const params = new URLSearchParams();

    // params.append('clinics', `${CLINIC_ID}`);
    // params.append('groups__name', '');
    params.append('is_active', 'true');
    params.append('limit', '100');
    params.append(
      'query',
      '{id,touchpoint_notifications_enabled,scheduler_select_all_staff,scheduler_persist_per_clinic,last_name,non_npi_id_qualifier,npi,role,patient_arrived_sound_enabled,user_preferences,first_name,task_is_assigned_notifications_enabled,signature,photo,title,suffix,license_number,user_reminder_notifications_enabled,suno_comms_id,date_joined,payment_request_notifications_enabled,is_active,fax_phone,full_name,last_login,user_permissions,non_npi_id,onboarding_form_notifications_enabled,name,color,noah_username,groups{id,name,permissions},email,clinics{id,name,timezone,noah_provider,noah_alias,noah_tenant_id},default_clinic{id,name,timezone},can_see_manufacturer_cost}'
    );

    return `${baseUrl}?${params.toString()}`;
  };

  // Fetch providers from API
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
      const typesList = data.results || data.items || data;
      const providersArray = Array.isArray(typesList) ? typesList : [typesList];
      setProviders(providersArray);
      return providersArray;
    } catch (error) {
      logError('Error fetching providers:', error);
    } finally {
      setIsLoadingProviders(false);
    }
  };

  const getTitleText = titleCode => {
    if (!titleCode) return '';

    const titles = {
      'md': 'Dr.',
      'dr': 'Dr.',
      'doctor': 'Dr.',
      'do': 'Dr.',
      'phd': 'Dr.',
      'ms': 'Ms.',
      'mrs': 'Mrs.',
      'mr': 'Mr.',
      'miss': 'Miss',
      'prof': 'Prof.',
      'professor': 'Prof.',
    };

    // Handle both string and numeric title codes
    const normalizedTitle = titleCode.toString().toLowerCase().trim();
    return titles[normalizedTitle] || '';
  };

  const getProviderName = provider => {
    if (!provider) return '';

    if (provider.full_name) {
      return provider.full_name;
    }

    // For basic preferred_provider objects from patient data
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

    // const details = [];
    // if (provider.role) details.push(provider.role);
    // const clinicNames = provider.clinics?.map(clinic => clinic.name).filter(Boolean);
    // if (clinicNames && clinicNames.length > 0) {
    //   details.push(clinicNames.join(', '));
    // }
    // return details.join(' • ');
    return provider.role;
  };

  // Handle provider selection
  const handleProviderSelect = async provider => {
    setSelectedProvider(provider);
    setShowProviderDropdown(false);
    if (!isEditing && !appointmentData) {
      setSelectedLocation(null);
      // setSelectedRoom(null);
    }
    // console.log('selected providers:', provider);
    const regionId = patientOriginalPreferences.clinic?.region?.id;
    fetchLocations(provider.id, TYPE_ID, regionId);

    showProviderDifferenceValidation(
      provider,
      patientOriginalPreferences.provider
    );

    if (selectedLocation && selectedDate) {
      const clinicIDtemp = selectedLocation?.id || CLINIC_ID;
      await fetchStaffAvailability(
        selectedProvider.id,
        clinicIDtemp,
        selectedDate
      );
    }
    // }
  };

  // Location selection
  const [locations, setLocations] = useState([]);
  // const [selectedLocation, setSelectedLocation] = useState(
  //   isEditing ? appointmentData?.clinic : null
  // );
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const fetchLocations = async (userId, type, region) => {
    try {
      setIsLoadingLocation(true);

      const baseUrl = `${globalValues.API_BASE_URL}/clinics/`;
      const queryParams = new URLSearchParams({
        ordering: 'name',
        query:
          '{id,name,display_name,timezone,practice{id,name,timezone,ein,npi,non_npi_id,non_npi_id_qualifier,is_messaging_enabled,is_emailing_enabled,default_appointment_reminder_duration,tilled_account_id,justifi_account_id,logo,card_processing_provider,has_quickbooks_token,is_quickbooks_enabled,scheduling_allow_overlap,scheduling_should_create_schedule_for_staff,scheduling_should_notify,products_use_supplier_price,scheduling_staff_availability,product_requests_deactivate_existing,private_feedback_request_break,google_review_feedback_request_break,appointment_information_disabled,no_reply_email,country,private_feedback_request_disabled,is_hipaa_compliance_for_quickbooks_enabled,reschedule_disabled,patient_settings,billing_name,billing_street_address_1,billing_street_address_2,billing_city,billing_state,billing_country,billing_zip_code,billing_phone,direct_mail_enabled,sale_lock_days,unit_price_lock,product_lock,collect_outcome,no_show_disabled,limit_to_current_clinic,private_feedback_textual_request_disabled,appointment_cancelled_message_disabled,suno_comms_id,has_multiple_companies,message_auto_read_enabled,save_payment_card,products_use_barcode_scanner,go_live_at,billing_use_practice_insurers_only,create_all_sales_in_draft_status,billing_available_payment_methods,billing_claim_era_sync,use_room_traffic,quickbooks_refunds_account,allowed_ips,auto_create_patient_in_noah,use_unit_price_for_claims,allow_tilled_refund,enforce_delivery_before_ready_to_bill},ein,npi,non_npi_id,non_npi_id_qualifier,street_address_1,street_address_2,city,state,country,zip_code,phone,fax_phone,is_messaging_enabled,is_emailing_enabled,default_appointment_reminder_duration,tilled_account_id,google_place_id,review_link,justifi_account_id,card_processing_provider,noah_provider,noah_alias,noah_tenant_id,scheduling_staff_availability,web_scheduling_staff_selection,no_reply_email,type,external_id,dba,opened_date,closed_date,region{id,created_at,name,is_active,noah_location_id},is_active,sms_phone,quickbooks_token{id,name,description,quickbooks_company{id,realm_id,company_name},quickbooks_product_services_settings},logo,extra{id,billng_street_address_1,billng_street_address_2,billng_city,billng_state,billng_country,billng_zip,billng_phone},quickbooks_realm_id,suno_comms_id,quickbooks_company{id,realm_id,company_name},noah_auto_sync,web_scheduler_email_recipient,box_folder_id,place_of_service,default_assignee,caption_call_referral_code,business_name}',
        // region: region,
        staff_member: userId,
      });
      const url = `${baseUrl}?${queryParams}`;
      // console.log('Fetching locations from:', url);

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: AUTH_HEADER,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        logError('API Error:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      // console.log("===== selectedLocation : ", selectedLocation)


      let transformedLocations = [];
      if (Array.isArray(data)) {
        transformedLocations = data
          .filter(item => item && typeof item === 'object')
          .map(item => ({
            id: item.id?.toString() || Math.random().toString(),
            name: item.name || 'Unnamed Location',
            street_address_1: item.street_address_1 || '',
            street_address_2: item.street_address_2 || '',
            city: item.city || '',
            state: item.state || '',
            zip_code: item.zip_code || '',
            phone: item.phone || '',
            region: item.region?.id,
            timezone: item?.timezone
          }));
      }

      setLocations(
        Array.isArray(transformedLocations) ? transformedLocations : []
      );
      const exists = transformedLocations.some(item => item.id === selectedLocation?.id);
      if (!exists) {
        setSelectedLocation(null)
      }

      return transformedLocations;
    } catch (error) {
      logError('Error fetching locations:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleLocationSelect = async location => {
    setSelectedLocation(location);
    // console.log('selected locations:', location);
    // if (!isEditing && !appointmentData) {
    //   setSelectedRoom(null);
    // }
    // await fetchRooms(location.id);
    setSelectedSlot(null);
    showClinicDifferenceValidation(location, patientOriginalPreferences.clinic);

    if (selectedProvider && selectedDate) {
      const clinicIDtemp = location?.id || CLINIC_ID;
      await fetchStaffAvailability(
        selectedProvider.id,
        clinicIDtemp,
        selectedDate
      );
    }
  };

  // Timeslot selection
  const [slots, setSlots] = useState([]);
  // const [selectedSlot, setSelectedSlot] = useState(null);
  const [staffAvailability, setStaffAvailability] = useState({});
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

  const fetchStaffAvailability = async (providerId, clinicId, selectedDate) => {
    try {
      if (!providerId || !clinicId || !selectedDate) return;

      setIsLoadingAvailability(true);

      const validClinicId = clinicId || CLINIC_ID;
      if (!validClinicId) {
        logError('No clinic ID available for staff availability');
        return;
      }

      // Use the exact selected date
      const fromDate = new Date(selectedDate.dateObj);
      const toDate = new Date(selectedDate.dateObj);
      toDate.setDate(toDate.getDate() + 1);

      const formatDateRangeForAPI = (startDate, endDate) => {
        const from = new Date(startDate);
        from.setUTCHours(0, 0, 0, 0);

        const to = new Date(endDate);
        to.setUTCHours(23, 59, 59, 999);

        return {
          from_moment: from.toISOString().slice(0, 19),
          to_moment: to.toISOString().slice(0, 19),
        };
      };

      const parseFullDateToUTC = (fullDate) => {
        const [monthStr, day, year] = fullDate.replace(',', '').split(' ');

        const months = {
          Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
          Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
        };

        return new Date(Date.UTC(year, months[monthStr], Number(day)));
      };

      const date = parseFullDateToUTC(selectedDate.fullDate);

      const result = formatDateRangeForAPI(
        date,
        date
      );
      // const result = formatDateRangeForAPI(
      //   fromDate,
      //   fromDate
      // );

      const duration = Number(selectedDurationTime) || 60;


      const url = `${globalValues.API_BASE_URL}/staff-availability/?clinic=${validClinicId}&from_moment=${result.from_moment}&staff_member=${providerId}&to_moment=${result.to_moment}&slot_duration_minutes=${duration}&exclude_personal_events=true&limit=300&offset=0&snap_to_minutes=15`;

      console.log('Fetching staff availability from:', url);

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: AUTH_HEADER,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch staff availability');
      }

      const data = await response.json();

      // Store the availability data with the proper key
      const availabilityKey = `${providerId}-${validClinicId}-${selectedDate.dateObj.getTime()}`;
      setStaffAvailability(prev => ({
        ...prev,
        [availabilityKey]: data,
      }));
      // console.log('Fetched staff availability:', data);
    } catch (error) {
      logError('Error fetching staff availability:', error);
    } finally {
      setIsLoadingAvailability(false);
    }
  };

  const formatTime = date => {
    return date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const roundToNearest5Minutes = date => {
    const minutes = date.getMinutes();
    const roundedMinutes = Math.ceil(minutes / 5) * 5;

    const newDate = new Date(date);
    if (roundedMinutes === 60) {
      newDate.setHours(date.getHours() + 1);
      newDate.setMinutes(0);
    } else {
      newDate.setMinutes(roundedMinutes);
      newDate.setSeconds(0);
      newDate.setMilliseconds(0);
    }

    return newDate;
  };

  const getAvailableSlots = (
    selectedDate,
    durationMinutes,
    providerId,
    clinicId
  ) => {
    if (!selectedDate || !providerId || !clinicId) {
      return [];
    }
    // Get staff availability for this specific combination
    const availabilityKey = `${providerId}-${clinicId}-${selectedDate.dateObj.getTime()}`;
    const workingHours = staffAvailability[availabilityKey] || [];

    if (workingHours.length === 0) {
      // console.log('No working hours found for this combination');
      return [];
    }

    // console.log('Processing working hours:', workingHours);

    // Convert working hours to local timezone and generate slots
    const availableSlots = [];

    workingHours.forEach(block => {
      const workStart = new Date(block.start_moment);
      const workEnd = new Date(block.end_moment);

      // console.log(
      //   'Work block (local time):',
      //   workStart.toLocaleString(),
      //   'to',
      //   workEnd.toLocaleString()
      // );
      const date = new Date(workStart);


      availableSlots.push(date);
      let currentTime = roundToNearest5Minutes(workStart);

      // while (currentTime < workEnd) {
      //   const slotEnd = new Date(
      //     currentTime.getTime() + durationMinutes * 60000
      //   );
      //   if (slotEnd <= workEnd) {
      //     availableSlots.push(new Date(currentTime));
      //   }

      //   currentTime = new Date(currentTime.getTime() + durationMinutes * 60000);
      // }


      // chetna Changes
      // while (currentTime < workEnd) {
      //   const slotStart = new Date(currentTime);
      //   // slotStart.setSeconds(0, 0);

      //   const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000);
      //   if (slotEnd <= workEnd) {
      //     availableSlots.push(slotStart);
      //   }

      //   currentTime = new Date(slotStart.getTime() + durationMinutes * 60000);
      // }
    });

    // console.log(
    //   'Generated available slots:',
    //   availableSlots.map(s => s.toLocaleTimeString())
    // );

    const now = new Date();
    if (selectedDate.dateObj.toDateString() === now.toDateString()) {
      return availableSlots.filter(slot => slot > now);
    }

    return availableSlots;
  };

  // const convertDurationToMinutesSec = duration => {
  //   if (!duration) return 30;
  //   if (duration.includes('h')) return parseInt(duration) * 60;
  //   if (duration.includes('m')) return parseInt(duration);
  //   return 30;
  // };

  const convertDurationToMinutesSec = (duration) => {
    const [hours, minutes, seconds] = duration.split(":").map(Number);

    return hours * 60 + minutes + (seconds ? seconds / 60 : 0);
  };


  useEffect(() => {
    if (selectedType && selectedProvider && selectedLocation && selectedDate) {
      const durationInMinutes = convertDurationToMinutesSec(
        selectedType.default_duration
      );
      const availableSlots = getAvailableSlots(
        selectedDate,
        durationInMinutes,
        selectedProvider.id,
        selectedLocation.id
      );

      if (isEditing && appointmentData?.start_moment) {
        const startMoment = new Date(appointmentData.start_moment);

        const alreadyIncluded = availableSlots.some(slot => {
          const slotDate = slot instanceof Date ? slot : new Date(slot);
          return (
            Math.floor(slotDate.getTime() / 60000) ===
            Math.floor(startMoment.getTime() / 60000)
          );
        });
        // const exists = availableSlots.includes(startMoment);
        // console.log("==== exits : ", exists, availableSlots, startMoment)
        // console.log("==== selectedDate : ",selectedDate.dateObj, startMoment, selectedDate.dateObj.toISOString() === startMoment.toISOString())
        // if (!alreadyIncluded) {
        //   if (!appointmentData?.extra?.should_create_schedule_for_staff && availableSlots.length > 0 ){
        //     if (selectedDate.dateObj.toISOString() === startMoment.toISOString()) {
        //     availableSlots.push(startMoment);
        //     setSelectedSlot(startMoment);
        //   } 
        // }
        // }

        availableSlots.sort(
          (a, b) => new Date(a).getTime() - new Date(b).getTime()
        );

        // setSelectedSlot(startMoment);
      }
      setSlots(availableSlots);
    }
  }, [
    selectedProvider,
    selectedLocation,
    selectedDate,
    staffAvailability,
    selectedType,
  ]);

  ////////////////////////END////////////////////////

  // OptionsStep selection
  // const [rooms, setRooms] = useState([]);
  // const [isLoadingRoom, setIsLoadingRoom] = useState(false);
  // // const [selectedRoom, setSelectedRoom] = useState(
  // //   isEditing ? appointmentData?.extra?.room : null
  // // );
  // const [optionsRoom, setOptionsRoom] = useState({ room: null });
  const [sendNotification, setSendNotification] = useState(true);
  const [appointmentOutsideWorkingHours, setAppointmentOutsideWorkingHours] = useState(true);
  const [shouldCreateIntakeForm, setShouldCeateIntakeForm] = useState(false);

  const roundTo5Min = (date) => {
    const d = new Date(date);
    const minutes = d.getMinutes();
    d.setMinutes(Math.round(minutes / 5) * 5, 0, 0);
    return d;
  };


  React.useEffect(() => {
    const d = new Date(fromTime);
    // d.setHours(d.getHours() + 1);
    d.setMinutes(d.getMinutes() + Number(selectedDurationTime));

    d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5, 0, 0);

    setToTime(d)
  }, [fromTime, selectedDurationTime]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [showToTimePicker, setShowToTimePicker] = useState(false);
  const [showDateSelection, setShowDateSelection] = useState(false);

  // const [showInsuranceDetails, setShowInsuranceDetails] = useState(false);
  // const [specialInstructions, setSpecialInstructions] = useState(
  //   isEditing ? appointmentData?.extra?.notes : ''
  // );
  // const specialInstructionsRef = useRef(specialInstructions);

  // const fetchRooms = async locationId => {
  //   try {
  //     setIsLoadingRoom(true);
  //     const baseUrl = `https://prod.suno.tech/api/rooms/?clinic=${locationId}&limit=300`;
  //     const url = `${baseUrl}`;
  //     console.log('Fetched Rooms Url:', url);
  //     const response = await fetch(url, {
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: AUTH_HEADER,
  //       },
  //     });

  //     if (!response.ok) {
  //       throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  //     }

  //     const data = await response.json();
  //     const roomList = data.results || data.items || data;
  //     setRooms(roomList);
  //     // console.log('Fetched Rooms:', roomList);
  //   } catch (error) {
  //     logError('Error fetching rooms:', error);
  //   } finally {
  //     setIsLoadingRoom(false);
  //   }
  // };

  // const handleRoomSelect = room => {
  //   setSelectedRoom(room);
  //   setOptionsRoom(prev => ({ ...prev, room: room.name }));
  // };

  // other previous section
  const [options, setOptions] = useState({
    telehealth: false,
    instructions: '',
    reminders: {
      email: true,
      text: true,
      phone: false,
    },
  });



  const handleInstructionsBlur = useCallback(finalValue => {
    setSpecialInstructions(finalValue);
  }, []);

  const handleReminderToggle = type => {
    setOptions(prev => ({
      ...prev,
      reminders: {
        ...prev.reminders,
        [type]: !prev.reminders[type],
      },
    }));
  };

  const SpecialInstructionsInput = ({ initialValue = '', onBlur }) => {
    const [value, setValue] = useState(initialValue);
    const inputRef = useRef(null);
    const isInitialMount = useRef(true);

    useEffect(() => {
      if (isInitialMount.current) {
        isInitialMount.current = false;
        setValue(initialValue);
      }
    }, [initialValue]);

    const handleSubmitEditing = useCallback(() => {
      inputRef.current.focus();
    }, []);

    const handleBlur = useCallback(() => {
      onBlur && onBlur(value);
    }, [value, onBlur]);

    return (
      <TextInput
        ref={inputRef}
        style={styles.specialInstructionsInput}
        placeholder="Add any special instructions or notes for this appointment..."
        placeholderTextColor="#9CA3AF"
        multiline
        onChangeText={setValue}
        onBlur={handleBlur}
        value={value}
        blurOnSubmit={false}
        onSubmitEditing={handleSubmitEditing}
        returnKeyType="done"
      />
    );
  };
  ////////////////////////END////////////////////////

  const ValidationMessage = ({ message, type = 'warning' }) => {
    if (!message) return null;

    return (
      <View
        style={[
          styles.validationMessage,
          type === 'warning'
            ? styles.validationWarning
            : styles.validationError,
        ]}
      >
        <Icon
          style={styles.validationIcon}
          name={type === 'warning' ? 'warning' : 'error'}
          size={18}
          color={type === 'warning' ? '#F59E0B' : '#EF4444'}
        />
        <Text
          style={[
            styles.validationText,
            type === 'warning'
              ? styles.validationWarningText
              : styles.validationErrorText,
          ]}
        >
          {message}
        </Text>
      </View>
    );
  };

  const handleClose = () => {
    if (currentStep === 1) {
      navigation.goBack();
    } else {
      Alert.alert(
        'Alert!',
        'Are you sure you want to close? Your changes will not be saved.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              // Do nothing, just close the alert
            },
          },
          {
            text: 'OK',
            style: 'destructive',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]
      );
    }
  };
  const convertToEST = (dateInput) => {
    return moment(dateInput)
      .tz(validZone) //"America/New_York"
      .format("YYYY-MM-DDTHH:mm:ss");
  };

  const convertDeviceTimeToESTKeepClock = (dateInput) => {
    const deviceTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Interpret date as device timezone
    const deviceTime = moment.tz(dateInput, deviceTimezone);

    // Create same clock time in EST
    const estTime = moment.tz(
      {
        year: deviceTime.year(),
        month: deviceTime.month(),
        day: deviceTime.date(),
        hour: deviceTime.hour(),
        minute: deviceTime.minute(),
        second: deviceTime.second(),
      },
      validZone //"America/New_York"
    );

    return estTime.toISOString(); // UTC result
  };

  // Post appointment submit
  const scheduleAppointment = async () => {
    try {
      const isConnected = await checkInternetAndProceed();
      if (!isConnected) {
        return;
      }
      setIsScheduling(true);
      if (
        !selectedPatient ||
        !selectedType ||
        !selectedProvider ||
        !selectedLocation ||
        (!appointmentOutsideWorkingHours && !selectedSlot)
      ) {
        Alert.alert('Error', 'Please fill all required fields');
        setIsScheduling(false);
        return;
      }

      // Format start and end moment
      const combineDateAndTime = (date, timeSlot) => {
        const dateObj = new Date(date);
        const timeObj = new Date(timeSlot);

        const combinedDate = new Date(Date.UTC(
          dateObj.getFullYear(),
          dateObj.getMonth(),
          dateObj.getDate(),
          timeObj.getUTCHours(),
          timeObj.getUTCMinutes(),
          timeObj.getUTCSeconds()
        ));

        return combinedDate;
      };

      let startMoment, endMoment;
      // selectedDate?.fullDate
      if (appointmentOutsideWorkingHours) {

        // startMoment = fromTime;
        // endMoment = toTime;

        startMoment = combineDateAndTime(selectedDate.dateObj, fromTime);
        endMoment = combineDateAndTime(selectedDate.dateObj, toTime);

        console.log("====== startMoment :", startMoment)
        // return

      } else if (selectedDate && selectedSlot) {
        // For editing, if time slot wasn't changed
        if (isEditing && appointmentData?.start_moment && !hasTimeChanged()) {
          startMoment = new Date(appointmentData.start_moment);
        } else {
          // Use the date from selectedDate and time
          startMoment = combineDateAndTime(selectedDate.dateObj, selectedSlot);
        }

        endMoment = new Date(
          startMoment.getTime() +
          selectedDurationTime * 60000
          //convertDurationToMinutesSec(selectedType.default_duration) * 60000
        );
      } else {
        logError('Missing date or time slot selection');
        setIsScheduling(false);
        return;
      }

      // const deviceTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      // console.log(deviceTimezone);

      // console.log("==== Start :", convertDeviceTimeToESTKeepClock(fromTime), startMoment, convertToEST(fromTime), )

      // return
      const payload = {
        title: `${selectedType?.name} with ${selectedPatient?.full_name ||
          selectedPatient?.first_name + ' ' + selectedPatient?.last_name
          }`,
        patient: selectedPatient.id,
        type: selectedType.id,
        staff_member: selectedProvider.id,
        // start_moment: appointmentOutsideWorkingHours ? convertDeviceTimeToESTKeepClock(fromTime) : startMoment.toISOString(),
        // end_moment: appointmentOutsideWorkingHours ? convertDeviceTimeToESTKeepClock(toTime) :  endMoment.toISOString(),
        start_moment: convertDeviceTimeToESTKeepClock(startMoment),
        end_moment: convertDeviceTimeToESTKeepClock(endMoment),

        // room: selectedRoom.id || "",
        // room: Number(1),
        clinic: Number(selectedLocation.id),
        physician_referral: isEditing
          ? appointmentData?.extra?.physician_referral
          : 1,
        referral_source: isEditing
          ? referralSource?.id
          : selectedPatient?.referral_source?.id,
        sub_referral_source: null,
        sub_referral_source_content_type: null,
        sub_referral_source_object_id: null,
        companion_name: isEditing ? appointmentData?.extra?.companion_name : '',
        companion_type: isEditing
          ? appointmentData?.extra?.companion_type
          : null,
        should_notify: sendNotification,
        // should_create_schedule_for_staff: appointmentOutsideWorkingHours,
        should_create_schedule_for_staff: true,
        notes: specialInstructions || '',
        allow_overlap: true,
        referring_physician: null,
        notification_method: 1,
        should_create_intake_form_request: isEditing ? false : true,

        intake_form_request: isEditing
          ? {
            intake_form_request_submissions: { create: [] },
            notification_method: null,
          }
          : {
            intake_form_request_submissions: {
              create: selectedBoardingForm.map(item => ({
                intake_form: item.id,
              })),
            },
            notification_method: Number(onboardingOption),
          },
        companion_present: isEditing
          ? appointmentData?.extra?.companion_present
          : false,
        assigned_tags: {},
        schedule: null,
        telehealth_provider: options.telehealth.toString(),
        is_direct_supervisor: false,

      };

      if (isEditing) {
        if (appointmentId) {
          // payload.id = appointmentId; appointmentData.extra.appointment_id;
          payload.rescheduled_appointment_id = appointmentId;
        }
      }
      console.log(
        `${isEditing ? 'Updating' : 'Scheduling'} payload: `,
        JSON.stringify(payload)
      );

      if (isEditing && appointmentData) {
        const hasChanges = hasChangesVerify(payload, appointmentData);

        if (!hasChanges) {
          Alert.alert(
            'No Changes',
            'No changes were made to the appointment.',
            [{ text: 'OK' }]
          );
          console.log('No changes were made to the appointment.');
          setIsScheduling(false);
          return;
        }
      }

      const url = `${globalValues.API_BASE_URL}/appointments/`;
      const method = 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: AUTH_HEADER,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logError('API Error:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Appointment created:', data);
      DeviceEventEmitter.emit('reloadScheduleData');

      Alert.alert(
        'Success',
        `Appointment ${isEditing ? 'updated' : 'scheduled'} successfully!`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      logError(
        `Error ${isEditing ? 'updating' : 'scheduling'} appointment:`,
        error
      );
    } finally {
      setIsScheduling(false);
    }
  };

  const hasTimeChanged = () => {
    if (!isEditing || !appointmentData?.start_moment || !selectedSlot) {
      return true;
    }
    // console.log("===== fromTime :: ",fromTime)
    const originalTime = new Date(appointmentData.start_moment);
    const selectedTime = appointmentOutsideWorkingHours ? fromTime : new Date(selectedSlot);
    const originalDay = originalTime.getDay();
    const originalHours = originalTime.getHours();
    const originalMinutes = originalTime.getMinutes();
    const selectedHours = selectedTime.getHours();
    const selectedMinutes = selectedTime.getMinutes();
    const selectedDay = selectedTime.getDay();
    // console.log("===== fromTime :: ",originalTime, selectedTime, selectedSlot)

    return (
      originalDay !== selectedDay ||
      originalHours !== selectedHours ||
      originalMinutes !== selectedMinutes
    );
  };

  const hasChangesVerify = (newPayload, originalAppointmentData) => {


    const newStart = appointmentOutsideWorkingHours ? fromTime.getTime() : new Date(newPayload.start_moment).getTime();
    const originalStart = new Date(
      originalAppointmentData.start_moment
    ).getTime();

    const timeChanged = hasTimeChanged();

    return (
      (timeChanged && newStart !== originalStart) ||
      newPayload.staff_member !== originalAppointmentData.staff_member?.id ||
      newPayload.clinic !== originalAppointmentData.clinic?.id ||
      originalAppointmentData?.extra?.should_create_schedule_for_staff !== appointmentOutsideWorkingHours ||
      // newPayload.room !== originalAppointmentData.extra?.room?.id ||
      newPayload.type !== originalAppointmentData.extra?.appointment_type?.id ||
      (newPayload.notes || '').trim() !==
      (originalAppointmentData.extra?.notes || '').trim() ||
      (newPayload.telehealth_provider === 'true') !==
      (originalAppointmentData.extra?.telehealth_provider === 'true')
    );
  };

  const StepIndicator = ({ step, label, completed, active }) => (
    <View style={styles.stepContainer}>
      <View
        style={[
          styles.stepCircle,
          completed
            ? styles.stepCompleted
            : active
              ? styles.stepActive
              : styles.stepInactive,
        ]}
      >
        {completed ? (
          <Icon name="check" size={16} color="white" />
        ) : (
          <Text
            style={[
              styles.stepNumber,
              completed || active
                ? styles.stepNumberActive
                : styles.stepNumberInactive,
            ]}
            allowFontScaling={false}
          >
            {step}
          </Text>
        )}
      </View>
      <Text
        style={[
          styles.stepLabel,
          completed || active
            ? styles.stepLabelActive
            : styles.stepLabelInactive,
        ]}
        allowFontScaling={false}
      >
        {label}
      </Text>
    </View>
  );
  const getAge = (birthdate) => {
    const today = new Date();
    const dob = new Date(birthdate);

    let age = today.getFullYear() - dob.getFullYear();

    const monthDiff = today.getMonth() - dob.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < dob.getDate())
    ) {
      age--;
    }

    return age;
  };

  const PatientStep = () => {
    if (isEditing) {
      if (isLoadingEditData || !selectedPatient) {
        return (
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <ActivityIndicator size="large" color="#066858" />
            <Text style={{ marginTop: 8, color: '#6B7280' }}>
              Loading patient and appointment details...
            </Text>
          </View>
        );
      }
      return (
        <View style={{ flex: 1, padding: 24 }}>
          <View style={styles.editModeIndicator}>
            <Icon name="edit" size={16} color="#066858" />
            <Text style={styles.editModeText}>
              Reschedule appointment for {selectedPatient.first_name}{' '}
              {selectedPatient.last_name}
            </Text>
          </View>

          <View style={[styles.patientCard, styles.patientCardSelected]}>
            <View style={styles.patientInfo}>
              <View style={styles.patientAvatar}>
                <Icon name="person" size={24} color="#6B7280" />
              </View>
              <View style={styles.patientDetails}>
                <Text style={styles.patientName}>
                  {selectedPatient.first_name} {selectedPatient.last_name}
                </Text>
                <Text style={styles.patientMeta}>
                  {selectedPatient?.age_years ?? getAge(selectedPatient?.birthdate)} yrs •{' '}
                  {selectedPatient.phone}
                </Text>
              </View>
            </View>
            <View style={styles.recentBadge}>
              <Icon name="badge" size={14} color="#9CA3AF" />
              <Text style={styles.recentText}>{selectedPatient.id}</Text>
            </View>
          </View>
        </View>
      );
    } else {
      const handleSearch = useCallback(
        searchTerm => {
          setSearchText(searchTerm);
          setIsInboxSearch(false);

          if (searchDebounce) {
            clearTimeout(searchDebounce);
          }

          const timeout = setTimeout(() => {
            if (searchTerm.trim().length < 2) {
              setFilteredPatients(allPatients);
            } else {
              fetchPatients(searchTerm, PAGE_SIZE, 0);
            }
          }, 400);

          setSearchDebounce(timeout);
        },
        [allPatients, searchDebounce]
      );

      return (
        <View style={{ flex: 1, padding: 24 }}>
          <Text style={styles.stepTitle}>Search and Select a Patient</Text>
          <PatientSearchInput
            onSearch={handleSearch}
            inputRef={searchInputRef}
            externalSearchText={searchText}
          />

          {/* <View style={styles.searchContainer}>
          <Icon
            name="search"
            size={20}
            color="#9CA3AF"
            style={styles.searchIcon}
          /> */}
          {/* <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Search by name, phone, ID, location..."
            placeholderTextColor="#9CA3AF"
            value={textInputValue}
            onChangeText={handleTextChange}
            returnKeyType="search"
            autoFocus={false}
          /> */}

          {/* <TextInput
                      autoCapitalize={'none'}
                      ref={searchInputRef}
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
                      placeholderTextColor="#9CA3AF"
                      style={styles.searchInput}
                      value={textInputValue}
                    />
        </View> */}


          {isInboxSearch && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#066858" />
              <Text style={styles.loadingText}>
                Searching for {formatPatientSearchLabel(firstname, middlename, lastname)}...
              </Text>
            </View>
          )}

          {/* Patient List / States */}
          <View style={([styles.sectionContainer], { flex: 1 })}>
            {isLoadingEditData ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#066858" />
                <Text style={styles.loadingText}>
                  Loading appointment data...
                </Text>
              </View>
            ) : isInitialLoad && !inboxRoute ? (
              <View style={styles.loadingContainer}>
                {/* <ActivityIndicator size="large" color="#066858" /> */}
                <Icon name="search" size={48} color="#D1D5DB" />

                <Text style={styles.loadingText}>Search patients</Text>
              </View>
            ) : isLoading ? ( // && !inboxRoute 
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#066858" />
                <Text style={styles.loadingText}>Searching...</Text>
              </View>
            ) : filteredPatients.length === 0 &&
              (!inboxRoute || inboxSearchCompleted) ? (
              <View style={styles.emptyState}>
                <Icon name="search-off" size={48} color="#D1D5DB" />
                <Text style={styles.emptyStateText}>No records found</Text>
                <Text style={styles.emptyStateSubtext}>
                  {searchText
                    ? 'Try a different search term'
                    : 'No patients available'}
                </Text>
                {inboxRoute && inboxSearchCompleted && (
                  <Text style={styles.emptyStateSubtext}>
                    Patient "{formatPatientSearchLabel(firstname, middlename, lastname)}" not found
                  </Text>
                )}
              </View>
            ) : (
              <FlatList
                data={filteredPatients}
                keyExtractor={item => item.id.toString()}
                renderItem={renderPatientItem}
                contentContainerStyle={{ paddingBottom: 4 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                style={{ flex: 1 }}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                windowSize={5}
                initialNumToRender={10}
              />
            )}
          </View>
        </View>
      );
    }
  };

  const convertUTCToClinicDate = (utcString) => {
    console.log("====== convertUTCToClinicDate :", utcString, moment.utc(utcString)
      .tz(validZone) //"America/New_York"
      .toDate())
    return moment.utc(utcString)
      .tz(validZone)
      .toDate();
  }

  // console.log("==== selectedSlot : ", selectedSlot)
  const DetailsStep = () => (
    <View style={{ flex: 1 }}>
      {/* Appointment Type Dropdown */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>
          Appointment Type<Text style={styles.required}>*</Text>
        </Text>

        <TouchableOpacity
          style={styles.dropdownTrigger}
          onPress={() => setShowTypeDropdown(!showTypeDropdown)}
          disabled={appointmentTypes.length === 0}
        >
          <View style={styles.selectedTypeContainer}>
            {selectedType ? (
              <>
                <Text style={styles.selectedTypeName}>
                  {getTypeName(selectedType)}
                </Text>
              </>
            ) : (
              <Text style={styles.placeholderText}>
                {isLoadingAppointment ? 'Loading...' : 'Select appointment type'}
              </Text>
            )}
          </View>
          <Icon
            name={
              showTypeDropdown ? 'keyboard-arrow-up' : 'keyboard-arrow-down'
            }
            size={24}
            color="#6B7280"
          />
        </TouchableOpacity>
        {selectedType && (
          <View style={styles.durationContainer}>
            <Icon name={'schedule'} size={16} color="#374151" />
            <Text style={styles.durationLabel}>Duration:</Text>
            <Text style={styles.durationText}>{selectedDuration}</Text>
          </View>
        )}

        {/* Dropdown Options */}
        {showTypeDropdown && appointmentTypes.length > 0 && (
          <View style={styles.dropdownOptions}>
            <ScrollView
              style={styles.dropdownScrollView}
              nestedScrollEnabled={true}
            >
              {appointmentTypes.map((type, index) => {
                const durationMinutes = convertDurationToMinutes(
                  type.default_duration
                );
                const formattedDuration = formatDuration(durationMinutes);
                const isCurrentlySelected = selectedType?.id === type.id;

                return (
                  <TouchableOpacity
                    key={type.id || index}
                    style={[
                      styles.dropdownOption,
                      selectedType?.id === type.id &&
                      styles.dropdownOptionSelected,
                    ]}
                    onPress={() => handleTypeSelect(type)}
                  >
                    <View style={styles.optionMainTypeRow}>
                      <View
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 6,
                          marginRight: 8,
                          backgroundColor: type.color,
                        }}
                      />
                      <Text style={styles.optionName}>{getTypeName(type)}</Text>
                      {isCurrentlySelected && isEditing && (
                        <View style={styles.currentSelectionBadge}>
                          <Text style={styles.currentSelectionText}>
                            Currently Selected
                          </Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.optionDetailsRow}>
                      <Text style={styles.optionDuration}>
                        {formattedDuration}
                      </Text>
                      <Text style={styles.optionCategory}>
                        {getTypeCategory(type)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>

      {/* 1. Date Selection */}
      <View style={styles.formGroup}>
        <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.formLabel}>
            Date<Text style={styles.required}>*</Text>
          </Text>

          <TouchableOpacity
            onPress={() => {
              setShowDatePicker(true);
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
                setShowDatePicker(true)
                setShowDateSelection(true)
              }
              }
              style={[styles.inputNormal]}
              editable={false}
            />
            <IconButton
              onPress={() => {
                setShowDatePicker(true)
                setShowDateSelection(true)
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
              <View style={styles.modalOverlay}>
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
                          weekday: dateObj
                            .toLocaleDateString("en-US", { weekday: "short" })
                            .toUpperCase(),
                        };

                        // console.log(result);
                        handleDateSelect(result)
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
                value={selectedDate?.dateObj
                  ? new Date(selectedDate.dateObj)
                  : new Date()}
                mode="date"
                display="calendar" // "default" or "spinner" also possible
                minimumDate={new Date()}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false); // close after picking
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
                      weekday: selectedDate
                        .toLocaleDateString("en-US", { weekday: "short" })
                        .toUpperCase(),
                    };

                    // console.log("==== result ",result);
                    handleDateSelect(result)
                    setShowDatePicker(false);
                  }
                }}
              />
            )
          )}
        </View>
        {!showDateSelection &&
          <ScrollView horizontal contentContainerStyle={styles.datesContainer}>
            {availableDates.map((day, index) => {
              // const isSelected =
              //   selectedDate?.dateObj?.getTime() === day.dateObj.getTime();
              //   console.log("===== selectedDate :", selectedDate?.dateObj.getDate() , day.dateObj.getDate(), selectedDate?.dateObj.getDate() === day.dateObj.getDate())

              const date1 = new Date(selectedDate?.dateObj);
              const date2 = new Date(day.dateObj);

              const isSelected = (
                date1.getFullYear() === date2.getFullYear() &&
                date1.getMonth() === date2.getMonth() &&
                date1.getDate() === date2.getDate()
              );

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dateOption,
                    isSelected && styles.dateOptionSelected,
                  ]}
                  onPress={() => handleDateSelect(day)}
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

      {/* 2. Provider Selection */}
      {selectedDate && (
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>
            Provider<Text style={styles.required}>*</Text>
          </Text>

          <TouchableOpacity
            style={styles.dropdownTrigger}
            onPress={() => setShowProviderDropdown(!showProviderDropdown)}
            disabled={providers.length === 0}
          >
            <View style={styles.selectedTypeContainer}>
              {selectedProvider ? (
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
                  {isLoadingProviders ? 'Loading...' : 'Select Staff'}
                </Text>
              )}
            </View>
            <Icon
              name={
                showTypeDropdown ? 'keyboard-arrow-up' : 'keyboard-arrow-down'
              }
              size={24}
              color="#6B7280"
            />
          </TouchableOpacity>
          <ValidationMessage
            message={validationMessages.provider}
            type="warning"
          />

          {/* Dropdown Options */}
          {showProviderDropdown && providers.length > 0 && (
            <View style={styles.dropdownOptions}>
              <ScrollView
                style={styles.dropdownScrollView}
                nestedScrollEnabled={true}
              >
                {providers.map((provider, index) => {
                  const isPreferred =
                    selectedPatient?.preferred_provider?.id === provider.id;
                  const isCurrentlySelected =
                    selectedProvider?.id === provider.id;

                  return (
                    <TouchableOpacity
                      key={provider.id || `provider-${index}`}
                      style={[
                        styles.dropdownOption,
                        selectedProvider?.id === provider.id &&
                        styles.dropdownOptionSelected,
                        isPreferred && styles.preferredOption,
                      ]}
                      onPress={() => handleProviderSelect(provider)}
                    >
                      <View style={styles.optionMainTypeRow}>
                        <Text style={styles.optionName}>
                          {getProviderName(provider)}
                        </Text>
                        {isCurrentlySelected && isEditing && (
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
                          {isPreferred}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </View>
      )}

      {/* 3. Location Selection */}
      <>
        {selectedProvider && (
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>
              Location<Text style={styles.required}>*</Text>
            </Text>

            {isLoadingLocation && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#066858" />
              </View>
            )}

            {!isLoadingLocation &&
              Array.isArray(locations) &&
              locations.length > 0
              ? locations.map(location => (
                <TouchableOpacity
                  key={location.id}
                  style={[
                    styles.locationItem,
                    selectedLocation?.id === location.id
                      ? styles.locationItemSelected
                      : null,
                  ]}
                  onPress={() => handleLocationSelect(location)}
                >
                  <View style={styles.locationInfo}>
                    <View style={styles.patientAvatar}>
                      <Icon name="location-pin" size={24} color="#6B7280" />
                    </View>
                    <View style={styles.locationDetails}>
                      <Text style={styles.locationName}>
                        {location.name}
                      </Text>
                      <Text style={styles.locationAddress}>
                        {location.street_address_1}
                        {location.street_address_2
                          ? `, ${location.street_address_2}`
                          : ''}
                      </Text>
                      <Text style={styles.locationAddress}>
                        {[location.city, location.state, location.zip_code]
                          .filter(Boolean)
                          .join(', ')}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
              : null}
            {!isLoadingLocation &&
              (!Array.isArray(locations) || locations.length === 0) && (
                <Text style={styles.noLocationsText}>
                  No locations available
                </Text>
              )}
            <ValidationMessage
              message={validationMessages.location}
              type="warning"
            />
          </View>
        )}
      </>

      <View
        style={[styles.confirmationOption, { paddingBottom: 10 }]}
      // onPress={() => setAppointmentOutsideWorkingHours(!appointmentOutsideWorkingHours)}
      >
        <View
          style={[styles.checkbox, appointmentOutsideWorkingHours && styles.checkboxChecked]}
        >
          {appointmentOutsideWorkingHours && <Icon name="check" size={18} color="white" />}
        </View>
        <Text style={styles.confirmationText}>
          Allow to create appointment outside working hours
        </Text>
      </View>
      <Text style={styles.formLabel}>
        Time<Text style={styles.required}>*</Text>
      </Text>
      {appointmentOutsideWorkingHours &&
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 20 }}>

          <View style={{ flex: 1, paddingRight: 20 }}>
            <Text style={styles.formLabel}>
              From Time
            </Text>

            <TouchableOpacity
              onPress={() => {
                setShowPicker(true);
              }}
            >
              <TextInput
                label="From Time"

                value={fromTime.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                // value={fromTime}
                // value={formatDateTime(fromTime)}

                placeholder="HH:MM A"
                required
                onPressIn={() => setShowPicker(true)}
                style={[styles.inputWrapper, styles.inputNormal]}
                editable={false}
              />
            </TouchableOpacity>

            {Platform.OS === 'ios' ? (
              <Modal
                visible={showPicker}
                transparent={true}
                animationType="none"
                onRequestClose={() => setShowPicker(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <DateTimePicker
                      value={fromTime}
                      mode="time"
                      display="spinner"
                      minuteInterval={5}
                      onChange={(event, time) => {
                        if (event.type === 'set' && time) {
                          setFromTime(time);
                          setShowPicker(false)
                        }
                      }}
                    />

                    <TouchableOpacity
                      style={styles.closeButtonModal}
                      onPress={() => setShowPicker(false)}
                    >
                      <Text style={styles.closeButtonTextModal}>Done</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            ) : (
              showPicker && (
                <DateTimePicker
                  value={fromTime}
                  mode="time"
                  display="spinner"
                  minuteInterval={5}
                  onChange={(event, time) => {
                    setShowPicker(false)

                    if (event.type === 'set' && time) {
                      setFromTime(time);
                      // console.log("====== time :", formatTime(time), formatDateTime(selectedSlot))

                    }
                    setShowPicker(false)

                  }}
                />

              )
            )}
          </View>

          <View style={{ flex: 1, paddingLeft: 20 }}>
            <Text style={styles.formLabel}>
              To Time
            </Text>

            <TouchableOpacity
              onPress={() => {
                // console.log("====== ")
                setShowToTimePicker(true);
              }}
            >
              <TextInput
                label="From Time"

                value={toTime.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                // value={formatDateTime(toTime)}
                placeholder="HH:MM A"
                required
                onPressIn={() => setShowToTimePicker(true)}
                style={[styles.inputWrapper, styles.inputNormal]}
                editable={false}
              />
            </TouchableOpacity>

            {Platform.OS === 'ios' ? (
              <Modal
                visible={showToTimePicker}
                transparent={true}
                animationType="none"
                onRequestClose={() => setShowToTimePicker(false)}
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <DateTimePicker
                      value={toTime}
                      mode="time"
                      display="spinner"
                      minuteInterval={5}
                      onChange={(event, time) => {
                        // console.log("==== time : ", time)
                        if (event.type === 'set' && time) {

                          if (time && fromTime && new Date(time) <= new Date(fromTime)) {
                            Alert.alert('', 'End time is before start time');

                          } else {
                            setToTime(time);
                          }

                          setShowToTimePicker(false)
                        }
                      }}
                    />

                    <TouchableOpacity
                      style={styles.closeButtonModal}
                      onPress={() => setShowToTimePicker(false)}
                    >
                      <Text style={styles.closeButtonTextModal}>Done</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            ) : (
              showToTimePicker && (
                <DateTimePicker
                  value={toTime}
                  mode="time"
                  minuteInterval={5}
                  display="spinner" // "default" or "spinner" also possible
                  onChange={(event, time) => {
                    setShowToTimePicker(false); // close after picking
                    if (event.type === 'set' && time) {

                      if (time && fromTime && new Date(time) <= new Date(fromTime)) {
                        Alert.alert('', 'End time is before start time');

                      } else {
                        setToTime(time);
                      }
                      setShowToTimePicker(false)

                    }
                  }}
                />
              )
            )}
          </View>
        </View>
      }


      {/* 4. Time Selection  */}
      {slots.length > 0 &&
        <Text style={styles.availabilityNote}>
          * Select time manually or select a slot below
        </Text>
      }
      {selectedType && selectedProvider && selectedLocation && ( // !appointmentOutsideWorkingHours &&
        <View style={styles.formGroup}>

          {/*<Text style={styles.availabilityNote}>
            * Green slots indicate high availability
          </Text>
          <View style={styles.slotGrid}>
            {slots.length > 0 ? (
              slots.map((slot, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.slot,
                    selectedSlot?.getTime() === slot.getTime() &&
                      styles.slotSelected,
                  ]}
                  onPress={() => setSelectedSlot(slot)}
                >
                  <Text
                    style={[
                      styles.slotText,
                      selectedSlot?.getTime() === slot.getTime() &&
                        styles.slotTextSelected,
                    ]}
                  >
                    {formatTime(slot)}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noSlots}>
                No available slots or Select the future date to select a time
                slots.
              </Text>
            )}
          </View> */}



          {isLoadingAvailability && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#066858" />
              <Text style={styles.loadingText}>Loading available slots...</Text>
            </View>
          )}

          <View style={styles.slotGrid}>
            {slots.length > 0 && (
              slots.map((slot, index) => {
                // const isSelected = selectedSlot?.getTime() === slot.getTime();
                const isSelected = formatTime(fromTime).toLowerCase() === formatDateTime(slot).toLowerCase()
                //               const isSelected =
                // moment(fromTime).format('HH:mm') ===
                // moment(slot).local().format('HH:mm');

                // console.log("===== isSelected : ",index, isSelected, formatTime(fromTime) , formatDateTime(slot))
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.slot, isSelected && styles.slotSelected]}
                    onPress={() => {
                      // console.log("====== slot :", slot)
                      setSelectedSlot(slot)
                      setFromTime(convertESTToISTKeepClock(slot))

                    }
                    }
                  >
                    <Text
                      style={[
                        styles.slotText,
                        isSelected && styles.slotTextSelected,
                      ]}
                    >
                      {/* {formatTime(slot)} */}
                      {formatDateTime(slot)}
                    </Text>
                  </TouchableOpacity>
                );
              })
            )
              //  : !isLoadingAvailability ? (
              //   <Text style={styles.noSlots}>
              //     No available slots for this date and provider combination.
              //   </Text>
              // ) : null
            }
          </View>



        </View>
      )}
    </View>
  );

  const OptionsStep = () => (
    <View style={{ flex: 1 }}>
      {/* Room Assignment Section 
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>
          Room Assignment <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.roomOptionsContainer}>
          {rooms.map(room => {
            const isSelected = selectedRoom?.id === room.id;
            return (
              <TouchableOpacity
                key={room.id}
                style={[
                  styles.roomOption,
                  isSelected && styles.roomOptionSelected,
                ]}
                onPress={() => handleRoomSelect(room)}
              >
                <Text style={styles.roomOptionText}>{room.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View> */}

      <View>
        {!isEditing &&
          <TouchableOpacity
            style={[styles.confirmationOption, {}]}
            onPress={() => setShouldCeateIntakeForm(!shouldCreateIntakeForm)}
          >
            <View
              style={[styles.checkbox, shouldCreateIntakeForm && styles.checkboxChecked]}
            >
              {shouldCreateIntakeForm && <Icon name="check" size={18} color="white" />}
            </View>
            <Text style={styles.specialInstructionsLabel}>
              Send Onboarding Forms
            </Text>

          </TouchableOpacity>
        }
        {shouldCreateIntakeForm &&
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingBottom: 10,
            }}
          >
            {/* Male */}
            <TouchableOpacity
              onPress={() => {
                try {
                  setOnboardingOption('1');
                } catch (err) {
                  console.log(err);
                }
              }}
              style={StyleSheetCustom.applyWidth(
                { marginBottom: 10, marginTop: 10 },
                dimensions.width
              )}
              disabled={!selectedPatient?.phone?.trim()}
            >
              <View
                style={StyleSheetCustom.applyWidth(
                  { alignItems: 'center', flexDirection: 'row' },
                  dimensions.width
                )}
              >

                <Icon
                  color={!selectedPatient?.phone?.trim() ? "rgba(0, 0, 0, 0.26)" :
                    onboardingOption === '1'
                      ? '#066858'
                      : palettes.App.ButtonColor
                  }
                  name={
                    onboardingOption === '1'
                      ? 'radio-button-checked'
                      : 'radio-button-off'
                  }
                  size={22}
                />
                <Text
                  accessible={true}
                  selectable={false}
                  {...GlobalStyles.TextStyles(theme)['Text 2'].props}
                  style={StyleSheetCustom.applyWidth(
                    StyleSheetCustom.compose(
                      GlobalStyles.TextStyles(theme)['Text 2'].style,
                      theme.typography.body1,
                      { color: palettes.App.ButtonColor, marginLeft: 10, fontSize: 14 }
                    ),
                    dimensions.width
                  )}
                >
                  {'SMS'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Female */}
            <TouchableOpacity
              onPress={() => {
                try {
                  setOnboardingOption('2');
                } catch (err) {
                  console.log(err);
                }
              }}
              disabled={!selectedPatient?.email?.trim()}
            >
              <View
                style={StyleSheetCustom.applyWidth(
                  {
                    alignItems: 'center',
                    flexDirection: 'row',
                    paddingHorizontal: 30,
                  },
                  dimensions.width
                )}
              >
                <Icon
                  color={!selectedPatient?.email?.trim() ? "rgba(0, 0, 0, 0.26)" :
                    onboardingOption === '2'
                      ? '#066858'
                      : palettes.App.ButtonColor
                  }
                  name={
                    onboardingOption === '2'
                      ? 'radio-button-checked'
                      : 'radio-button-off'
                  }
                  size={22}
                />
                <Text
                  accessible={true}
                  selectable={false}
                  {...GlobalStyles.TextStyles(theme)['Text 2'].props}
                  style={StyleSheetCustom.applyWidth(
                    StyleSheetCustom.compose(
                      GlobalStyles.TextStyles(theme)['Text 2'].style,
                      theme.typography.body1,
                      { color: palettes.App.ButtonColor, marginLeft: 10, fontSize: 14 }
                    ),
                    dimensions.width
                  )}
                >
                  {'Email'}
                </Text>
                {!selectedPatient?.email?.trim() &&
                  <Text
                    accessible={true}
                    selectable={false}
                    {...GlobalStyles.TextStyles(theme)['Text 2'].props}
                    style={StyleSheetCustom.applyWidth(
                      StyleSheetCustom.compose(
                        GlobalStyles.TextStyles(theme)['Text 2'].style,
                        theme.typography.body1,
                        { color: palettes.App.ButtonColor, marginLeft: 10, fontSize: 10 }
                      ),
                      dimensions.width
                    )}
                  >
                    {'(*Patient has no email address)'}
                  </Text>
                }
              </View>
            </TouchableOpacity>
          </View>
        }

        {shouldCreateIntakeForm && (
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>
              Select forms<Text style={styles.required}>*</Text>
            </Text>

            <TouchableOpacity
              style={styles.dropdownTrigger}
              onPress={() => setShowPOnBoardingDropdown(!showOnBoardingDropdown)}
              disabled={onBoardingFormData.length === 0}
            >
              <View style={styles.selectedTypeContainer}>
                {selectedBoardingForm.length > 0 ? (
                  <>
                    <Text style={styles.selectedTypeName}>
                      {'Selected intake forms: '}{selectedBoardingForm.length}
                    </Text>
                    {/* <Text style={styles.selectedProviderDetails}>
                  </Text> */}
                  </>
                ) : (
                  <Text style={styles.placeholderText}>
                    {isLoadingOnboardingForm ? 'Loading...' : 'Select Onboarding Forms'}
                  </Text>
                )}
              </View>
              <Icon
                name={
                  showTypeDropdown ? 'keyboard-arrow-up' : 'keyboard-arrow-down'
                }
                size={24}
                color="#6B7280"
              />
            </TouchableOpacity>
            <ValidationMessage
              message={validationMessages.onboarding}
              type="warning"
            />

            {/* Dropdown Options */}
            {showOnBoardingDropdown && onBoardingFormData.length > 0 && (
              <View style={styles.dropdownOptions}>



                <FlatList
                  style={{ maxHeight: 300 }}
                  nestedScrollEnabled={true}
                  data={onBoardingFormData}
                  keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                  renderItem={({ item: onBoarding, index }) => {
                    const isSelected = selectedBoardingForm.some(
                      item => item.id === onBoarding.id
                    );

                    return (
                      <TouchableOpacity
                        style={[styles.dropdownOption, { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 20 }]}
                        onPress={() => {
                          setSelectedBoardingForm(prev => {
                            const exists = prev.some(item => item.id === onBoarding.id);
                            return exists
                              ? prev.filter(item => item.id !== onBoarding.id)
                              : [...prev, onBoarding];
                          });
                        }}
                      >
                        <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                          {isSelected && <Icon name="check" size={18} color="white" />}
                        </View>

                        <Text
                          style={[styles.optionName, { textDecorationLine: 'underline', color: 'blue', paddingRight: 10 }]}
                          onPress={() =>
                            Linking.openURL(`https://suno.jotform.com/${onBoarding?.external_id}?practice_name=${practice_name}`)
                          }
                        >
                          {onBoarding?.title}
                        </Text>
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
            )}
          </View>
        )}
      </View>


      {/* Special Instructions Textarea */}
      <View style={styles.specialInstructionsContainer}>
        <Text style={styles.specialInstructionsLabel}>
          Appointment Notes
        </Text>
        <SpecialInstructionsInput
          initialValue={specialInstructions}
          onBlur={handleInstructionsBlur}
        />
      </View>

      {/* Telehealth Option 
      <View style={styles.optionRow}>
        <View style={styles.optionInfo}>
          <Icon name="videocam" size={24} color="#3B82F6" />
          <Text style={styles.optionTitle}>Telehealth Appointment</Text>
        </View>
        <Switch
          value={options.telehealth}
          onValueChange={value =>
            setOptions(prev => ({ ...prev, telehealth: value }))
          }
          trackColor={{ false: '#D1D5DB', true: '#066858' }}
          thumbColor="#FFFFFF"
        />
      </View> */}

      {/*  <View style={styles.insuranceRow}>
          <View style={styles.insuranceInfo}>
            <Icon name="warning" size={24} color="#F59E0B" />
            <Text style={styles.optionTitle}>Insurance Verification</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowInsuranceDetails(!showInsuranceDetails)}
          >
            <Text style={styles.checkStatusButton}>
              {showInsuranceDetails ? 'Remove' : 'Check Status'}
            </Text>
          </TouchableOpacity>
        </View>

        {showInsuranceDetails && (
          <View style={styles.insuranceSection}>
            <View style={styles.insuranceHeader}>
              <Icon name="verified" size={24} color="#10B981" />
              <Text style={styles.insuranceTitle}>Insurance Details</Text>
            </View>
            <Text style={styles.insuranceMessage}>
              Insurance verified. Coverage: 80% for {selectedType?.name}.
            </Text>
            <TouchableOpacity
              style={styles.checkStatusButton}
              onPress={() =>
                Alert.alert(
                  'Insurance Status',
                  `Your insurance covers 80% of ${selectedType?.name} appointments.`
                )
              }
            ></TouchableOpacity>
          </View>
        )} */}

      {/* Reminder Preferences Section 
      <View style={styles.remindersSection}>
        <View style={styles.reminderHeader}>
          <Icon name="notifications" size={24} color="#6B7280" />
          <Text style={styles.optionTitle}>Reminder Preferences</Text>
        </View>

        <View style={styles.reminderOptions}>
          {[
            {
              key: 'email',
              label: 'Email reminder (24 hours before)',
              icon: 'email',
            },
            {
              key: 'text',
              label: 'Text message reminder (2 hours before)',
              icon: 'sms',
            },
            {
              key: 'phone',
              label: 'Phone call reminder (day before)',
              icon: 'phone',
            },
          ].map(({ key, label, icon }) => (
            <TouchableOpacity
              key={key}
              style={styles.reminderOption}
              onPress={() => handleReminderToggle(key)}
            >
              <View
                style={[
                  styles.checkbox,
                  options.reminders[key] && styles.checkboxChecked,
                ]}
              >
                {options.reminders[key] && (
                  <Icon name="check" size={16} color="white" />
                )}
              </View>
              <Text style={styles.reminderLabel}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View> */}
    </View>
  );

  const ConfirmStep = () => (
    <View style={{ flex: 1 }}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>
          {isEditing ? 'Appointment Update' : 'Appointment Summary'}
        </Text>

        <View style={styles.summaryItem}>
          <Icon name="person" size={24} color="#6B7280" />
          <View style={styles.summaryDetails}>
            <Text style={styles.summaryPrimary}>
              {selectedPatient?.full_name ||
                `${selectedPatient?.first_name} ${selectedPatient?.last_name}`}
            </Text>
            <Text style={styles.summarySecondary}>
              {selectedPatient?.age_years} yrs • DOB:{' '}
              {selectedPatient?.birthdate}
            </Text>
          </View>
        </View>

        <View style={styles.summaryItem}>
          <Icon name="event" size={24} color="#066858" />
          <View style={styles.summaryDetails}>
            <Text style={styles.summaryPrimary}>{selectedType?.name}</Text>
            <Text style={styles.summarySecondary}>{selectedDuration}</Text>
          </View>
        </View>

        <View style={styles.summaryItem}>
          <Icon name="schedule" size={24} color="#3B82F6" />
          <View style={styles.summaryDetails}>
            <Text style={styles.summaryPrimary}>{selectedDate?.fullDate}</Text>
            <Text style={styles.summarySecondary}>
              {appointmentOutsideWorkingHours ? formatTime(fromTime) : selectedSlot ? formatDateTime(selectedSlot) : 'No time selected'}
            </Text>
          </View>
        </View>

        <View style={styles.summaryItem}>
          <Icon name="location-on" size={24} color="#8B5CF6" />
          <View style={styles.summaryDetails}>
            <Text style={styles.summaryPrimary}>
              {selectedProvider?.full_name ||
                `${selectedProvider?.first_name} ${selectedProvider?.last_name}`}
            </Text>
            <Text style={styles.summarySecondary}>
              {selectedLocation?.name}
            </Text>
          </View>
        </View>

        {specialInstructions && (
          <View style={styles.summaryItem}>
            <Icon name="notes" size={24} color="#10B981" />
            <View style={styles.summaryDetails}>
              <Text style={styles.summaryPrimary}>Special Instructions:</Text>
              <Text style={styles.summarySecondary}>{specialInstructions}</Text>
            </View>
          </View>
        )}

        {/* {isEditing && ( - {selectedRoom?.name}
          <View style={styles.summaryItem}>
            <Icon name="info" size={24} color="#F59E0B" />
            <View style={styles.summaryDetails}>
              <Text style={styles.summaryPrimary}>Editing Appointment ID:</Text>
              <Text style={styles.summarySecondary}>{appointmentId}</Text>
            </View>
          </View>
        )} */}
      </View>

      {/* {showInsuranceDetails && (
          <View style={styles.insuranceVerified}>
            <Icon name="check-circle" size={20} color="#10B981" />
            <Text style={styles.insuranceText}>
              <Text style={styles.insuranceLabel}>Insurance Verified: </Text>
              Coverage confirmed for this appointment type.
            </Text>
          </View>
        )} */}

      <View style={styles.contactCard}>
        <Text style={styles.contactTitle}>Patient Contact Information</Text>
        <View style={styles.contactItem}>
          <Icon name="phone" size={18} color="#066858" />
          <Text style={styles.contactText} allowFontScaling={false}>{selectedPatient?.phone}</Text>
        </View>
        <View style={styles.contactItem}>
          <Icon name="email" size={18} color="#066858" />
          <Text style={styles.contactTextEmail} allowFontScaling={false}>{selectedPatient?.email}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.confirmationOption}
        onPress={() => setSendNotification(!sendNotification)}
      >
        <View
          style={[styles.checkbox, sendNotification && styles.checkboxChecked]}
        >
          {sendNotification && <Icon name="check" size={18} color="white" />}
        </View>
        <Text style={styles.confirmationText}>
          Send appointment confirmation to patient
        </Text>
      </TouchableOpacity>

      <View style={styles.policyCard}>
        <Text style={styles.policyText}>
          <Text style={styles.policyLabel}>Cancellation Policy: </Text>
          Please provide at least 24 hours notice for cancellations.
        </Text>
      </View>
    </View>
  );

  const insets = useSafeAreaInsets();
  const safeAreaStyles = StyleSheet.create({
    safeAreaView: {
      flex: 1,
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    },
    headerSafe: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB',
    },
  });

  // console.log("===== ,slots : ", (!selectedType ||
  //   // ((!appointmentOutsideWorkingHours &&  slots.length == 0 ) || !selectedSlot ) ||
  //   !fromTime ||
  //   !selectedProvider ||
  //   !selectedLocation), selectedLocation)

  //   (!selectedType ||
  //     (!appointmentOutsideWorkingHours &&  slots.length == 0 && !selectedSlot ) ||
  //     !selectedProvider ||
  //     !selectedLocation)),  (currentStep === 2 &&
  //       (!selectedType ||
  //         (!appointmentOutsideWorkingHours && slots.length == 0 && !selectedSlot) ||
  //         !selectedProvider ||
  //         !selectedLocation))  ||
  //     isScheduling, 
  //     isScheduling , !selectedSlot, (!appointmentOutsideWorkingHours && slots.length == 0) ||  !selectedSlot)
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    // behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={safeAreaStyles.safeAreaView}>
        <View style={safeAreaStyles.headerSafe}>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Reschedule Appointment' : 'New Appointment'}
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Icon name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Step Indicator */}
        <View style={styles.stepIndicatorContainer}>
          <View style={styles.stepIndicator}>
            <StepIndicator
              step={1}
              label="Patient"
              completed={currentStep > 1}
              active={currentStep === 1}
            />
            <View style={styles.stepConnector} />
            <StepIndicator
              step={2}
              label="Details"
              completed={currentStep > 2}
              active={currentStep === 2}
            />
            <View style={styles.stepConnector} />
            <StepIndicator
              step={3}
              label="Options"
              completed={currentStep > 3}
              active={currentStep === 3}
            />
            <View style={styles.stepConnector} />
            <StepIndicator
              step={4}
              label="Confirm"
              completed={false}
              active={currentStep === 4}
            />
          </View>
        </View>

        {/* Step Content */}
        <View style={styles.contentContainer}>
          {currentStep === 1 ? (
            <PatientStep key="patient-step" />
          ) : (
            <KeyboardAwareScrollView
              style={styles.contentContainer}
              contentContainerStyle={styles.stepScrollContent}
              keyboardShouldPersistTaps="handled"
              enableOnAndroid={true}
              enableAutomaticScroll={Platform.OS === 'ios'}
              extraScrollHeight={100}
            >
              {currentStep === 2 && <DetailsStep />}
              {currentStep === 3 && <OptionsStep />}
              {currentStep === 4 && <ConfirmStep />}
            </KeyboardAwareScrollView>
          )}
        </View>
        {/*<View style={styles.contentContainer}>
          <View style={{ display: currentStep === 1 ? 'flex' : 'none', flex: 1 }}>
            <PatientStep />
          </View>
          <View style={{ display: currentStep === 2 ? 'flex' : 'none', flex: 1 }}>
            <DetailsStep />
          </View>
          <View style={{ display: currentStep === 3 ? 'flex' : 'none', flex: 1 }}>
            <OptionsStep />
          </View>
          <View style={{ display: currentStep === 4 ? 'flex' : 'none', flex: 1 }}>
            <ConfirmStep />
          </View>
        </View>*/}

        {/* Footer - Always visible */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            {currentStep > 1 && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setCurrentStep(currentStep - 1)}
              >
                <Icon name="arrow-back" size={16} color="#6B7280" />
                <Text style={styles.backButtonText} allowFontScaling={false}>Back</Text>
              </TouchableOpacity>
            )}
            {currentStep === 1 && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  navigation.goBack();
                }}
              >
                <Text style={styles.cancelButtonText} allowFontScaling={false}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.footerCenter}>
            <Text style={styles.stepCounter} allowFontScaling={false}>
              Step {currentStep} of 4
            </Text>
          </View>

          <View style={styles.footerRight}>

            <TouchableOpacity
              style={[
                styles.continueButton,
                (currentStep === 1 && !selectedPatient) ||
                  (currentStep === 2 &&
                    (!selectedType ||
                      // ((!appointmentOutsideWorkingHours &&  slots.length == 0 ) || !selectedSlot ) ||
                      !fromTime ||
                      !selectedProvider ||
                      !selectedLocation)) ||
                  (currentStep === 3 &&
                    (shouldCreateIntakeForm && selectedBoardingForm.length == 0)
                  )
                  ? styles.continueButtonDisabled
                  : null,
              ]}
              onPress={() => {
                if (currentStep < 4) {
                  setCurrentStep(currentStep + 1);
                } else {
                  scheduleAppointment();
                  // Alert.alert(
                  //   'Appointment Scheduled',
                  //   'Your appointment has been successfully scheduled!',
                  //   [
                  //     {
                  //       text: 'OK',
                  //       onPress: () => navigation.goBack(),
                  //       // onPress: () => {
                  //       //   // Optional: Add any post-schedule actions here
                  //       //   navigation.goBack();
                  //       //   console.log('Appointment confirmed');
                  //       // },
                  //     },
                  //   ]
                  // );
                }
              }}
              disabled={
                (currentStep === 1 && !selectedPatient) ||
                (currentStep === 2 &&
                  (!selectedType ||
                    // ((!appointmentOutsideWorkingHours && slots.length == 0) || !selectedSlot) ||
                    !fromTime ||
                    !selectedProvider ||
                    !selectedLocation)) ||
                (currentStep === 3 &&
                  (shouldCreateIntakeForm && selectedBoardingForm.length == 0)
                ) ||
                isScheduling
              }
            >
              <Text
                style={[
                  styles.continueButtonText,
                  (currentStep === 1 && !selectedPatient) ||
                    (currentStep === 2 &&
                      (!selectedType ||
                        (!appointmentOutsideWorkingHours && !selectedSlot) ||
                        !selectedProvider ||
                        !selectedLocation))
                    ? styles.continueButtonTextDisabled
                    : null,
                ]} allowFontScaling={false}
              >
                {currentStep === 4
                  ? isEditing
                    ? 'Update'
                    : 'Save'
                  : 'Continue'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {isScheduling && (
          <View style={styles.fullScreenLoader}>
            <View style={styles.loaderContent}>
              <ActivityIndicator size="large" color="#066858" />
              <Text style={styles.loaderText}>
                {isEditing
                  ? 'Updating Appointment...'
                  : 'Scheduling Appointment...'}
              </Text>
            </View>
          </View>
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  safeArea: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    backgroundColor: 'white',
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    // backgroundColor: 'white',
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
  // closeButtonText: {
  //   color: 'white',
  //   fontWeight: '600',
  // },
  stepIndicatorContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'space-between',
  },
  stepContainer: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCompleted: {
    backgroundColor: '#066858',
  },
  stepActive: {
    backgroundColor: '#066858',
  },
  stepInactive: {
    backgroundColor: '#E5E7EB',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  stepNumberActive: {
    color: 'white',
  },
  stepNumberInactive: {
    color: '#6B7280',
  },
  stepLabel: {
    fontSize: 12,
    marginTop: 8,
    flexShrink: 1
  },
  stepLabelActive: {
    color: '#066858',
    fontWeight: '600',
  },
  stepLabelInactive: {
    color: '#6B7280',
  },
  stepConnector: {
    flex: 1,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 6,
    marginTop: -15,
  },
  contentContainer: {
    flex: 1,
  },
  stepScrollContent: {
    padding: 24,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: '#111827',
  },
  addPatientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#066858',
    paddingVertical: 12,
    marginBottom: 24,
  },
  addPatientText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#066858',
    marginLeft: 8,
  },
  sectionContainer: {
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    paddingTop: 10,
    marginBottom: 12,
  },
  patientCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 12,
  },
  patientCardSelected: {
    borderColor: '#066858',
    backgroundColor: '#ECFDF5',
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  patientAvatar: {
    width: 40,
    height: 40,
    backgroundColor: '#E5E7EB',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  patientDetails: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  patientMeta: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  recentBadge: {
    position: 'absolute',
    top: 16,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    zIndex: 10,
  },
  recentText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyStateText: { fontSize: 18, fontWeight: 'bold', color: '#6B7280' },
  emptyStateSubtext: { fontSize: 14, color: '#9CA3AF', marginTop: 5 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#4B5563' },

  validationMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginTop: 8,
    borderRadius: 6,
    borderLeftWidth: 3,
  },
  validationIcon: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  validationWarning: {
    backgroundColor: '#FFFBEB',
    borderLeftColor: '#F59E0B',
  },
  validationError: {
    backgroundColor: '#FEF2F2',
    borderLeftColor: '#EF4444',
  },
  validationText: {
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  validationWarningText: {
    color: '#92400E',
  },
  validationErrorText: {
    color: '#991B1B',
  },

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

  editModeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 18,
    borderRadius: 8,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#066858',
  },
  editModeText: {
    marginLeft: 8,
    color: '#065F46',
    fontWeight: '500',
  },
  editBadge: {
    fontSize: 12,
    color: '#066858',
    fontStyle: 'italic',
    marginTop: 4,
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

  datesContainer: {
    flexDirection: 'row',
    paddingVertical: 6,
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
  optionMainRow: {
    marginBottom: 4,
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
  optionCategory: {
    fontSize: 14,
    color: '#6B7280',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  durationLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    marginRight: 2,
    marginLeft: 2,
  },
  durationText: {
    fontSize: 14,
    color: '#6B7280',
  },

  placeholderText: {
    color: '#9CA3AF',
  },
  durationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  durationText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dateText: {
    fontSize: 16,
    color: '#111827',
    marginLeft: 8,
  },

  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  slot: {
    paddingVertical: 10,
    paddingHorizontal: 15,
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
  nextDateMessage: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFECB3',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginVertical: 10,
  },
  nextDateText: {
    color: '#856404',
    textAlign: 'center',
    fontSize: 14,
  },
  slotHighAvailability: {
    backgroundColor: '#D4EDDA',
    borderColor: '#C3E6CB',
  },
  slotLowAvailability: {
    backgroundColor: '#F8D7DA',
    borderColor: '#F5C6CB',
    opacity: 0.6,
  },

  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  timeSlot: {
    width: '30%',
    backgroundColor: 'white',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 14,
    margin: 4,
    alignItems: 'center',
  },
  timeSlotDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  timeSlotSelected: {
    backgroundColor: '#ECFDF5',
    borderColor: '#066858',
  },
  timeSlotHighAvailability: {
    backgroundColor: '#DCFCE7',
    borderColor: '#22C55E',
  },
  timeSlotText: {
    fontSize: 14,
    color: '#374151',
  },
  timeSlotTextSelected: {
    color: '#066858',
    fontWeight: '600',
  },
  timeSlotTextHighAvailability: {
    color: '#16A34A',
  },
  timeSlotTextDisabled: {
    color: '#9CA3AF',
  },
  availabilityNote: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  noLocationsText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },

  optionRole: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '400',
    flex: 1,
  },
  selectedProviderDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  providerCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    marginBottom: 10,
  },
  providerCardSelected: {
    borderColor: '#066858',
    backgroundColor: '#ECFDF5',
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerAvatar: {
    width: 40,
    height: 40,
    backgroundColor: '#E5E7EB',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  providerSpecialty: {
    fontSize: 14,
    color: '#6B7280',
  },
  providerAvailability: {
    fontSize: 14,
    color: '#066858',
    marginTop: 4,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    marginBottom: 8,
  },
  locationItemSelected: {
    borderColor: '#066858',
    backgroundColor: '#ECFDF5',
  },
  locationDetails: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    color: '#111827',
  },
  locationAddress: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    marginBottom: 12,
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 12,
  },
  roomOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  roomOption: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  roomOptionSelected: {
    backgroundColor: '#ECFDF5',
    borderColor: '#066858',
  },
  roomOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  specialInstructionsContainer: {
    marginBottom: 20,
  },
  specialInstructionsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    paddingVertical: 16,
  },
  specialInstructionsInput: {
    borderWidth: 1,
    borderColor: '#066858',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#FFFFFF',
    fontSize: 14,
    color: '#111827',
  },
  insuranceSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    marginBottom: 24,
  },
  insuranceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insuranceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
  },
  insuranceMessage: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
  },
  checkStatusButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#066858',
    borderRadius: 6,
  },
  textArea: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    padding: 12,
    height: 96,
    fontSize: 16,
    color: '#111827',
  },
  insuranceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 24,
  },
  insuranceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkStatusButton: {
    fontSize: 12,
    fontWeight: '600',
    color: '#066858',
  },
  remindersSection: {
    paddingVertical: 12,
    marginBottom: 24,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  reminderOptions: {
    marginLeft: 36,
  },
  reminderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#054743',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#066858',
    borderColor: '#066858',
  },
  reminderLabel: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 18,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    alignItems: 'center',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryDetails: {
    marginLeft: 12,
    flex: 1,
  },
  summaryPrimary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  summarySecondary: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  insuranceVerified: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#22C55E',
    padding: 16,
    marginBottom: 16,
  },
  insuranceText: {
    fontSize: 14,
    color: '#065F46',
    marginLeft: 8,
    flex: 1,
  },
  insuranceLabel: {
    fontWeight: '600',
  },
  contactCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 16,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    flex: 1,
    flexWrap: 'wrap',
    includeFontPadding: false,
  },
  contactTextEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    flexShrink: 1,
    // flex: 1,
    flexWrap: 'nowrap',
    includeFontPadding: false,
  },
  confirmationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  confirmationText: {
    fontSize: 14,
    color: '#374151',
  },
  policyCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 10,
  },
  policyText: {
    fontSize: 14,
    color: '#6B7280',
  },
  policyLabel: {
    fontWeight: '600',
  },
  summaryContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  summaryDetails: {
    marginLeft: 12,
    flex: 1,
  },
  summaryPrimary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  summarySecondary: {
    fontSize: 14,
    color: '#6B7280',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    // minHeight: 64,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-start',
  },
  footerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 40,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 6,
    includeFontPadding: false,
    textAlignVertical: 'center',
    paddingVertical: 0,
    marginVertical: 0,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    backgroundColor: 'white',
    minHeight: 40,
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#374151',
    includeFontPadding: false,
    textAlignVertical: 'center',
    paddingVertical: 0,
    marginVertical: 0,
  },
  stepCounter: {
    fontSize: 14,
    color: '#6B7280',
    includeFontPadding: false,
    textAlignVertical: 'center',
    paddingVertical: 0,
    marginVertical: 0,
  },
  continueButton: {
    backgroundColor: '#066858',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    minHeight: 40,
    justifyContent: 'center',
    minWidth: 100,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    includeFontPadding: false,
    textAlignVertical: 'center',
    paddingVertical: 0,
    marginVertical: 0,
    textAlign: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  continueButtonTextDisabled: {
    color: '#6B7280',
  },
  //////loader///////
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
});

export default AppointmentWizard;
