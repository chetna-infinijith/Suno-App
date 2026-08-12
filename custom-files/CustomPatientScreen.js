// StepperScreen.js

import React, { useRef, useState, useEffect, forwardRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Icon, useTheme } from '@draftbit/ui';
import * as GlobalStyles from '../GlobalStyles.js';
import useWindowDimensions from '../utils/useWindowDimensions';
import * as StyleSheet from '../utils/StyleSheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DropDownBlock } from '../custom-files/DropDownBlock';
import * as SunoApi from '../apis/SunoApi.js';
import fetchReferenceSource from '../global-functions/fetchReferenceSource';
import fetchClinic from '../global-functions/fetchClinic';
import useNavigation from '../utils/useNavigation';

import * as GlobalVariables from '../config/GlobalVariableContext';
import palettes from '../themes/palettes';
import { logEvent } from '../global-functions/analyticsService.js';
import { checkInternetAndProceed } from './InternetConnection.js';

export const CustomPatientScreen = ({ theme }) => {
  const dimensions = useWindowDimensions();
  const Constants = GlobalVariables.useValues();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [birthDate, setBirthDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [referenceSourceType, setReferenceSourceType] = useState('');
  const [referenceData, setReferenceSourceData] = useState([]);
  const [isCreateNoahPatient, setIsCreateNoahPatient] = useState(true);

  const [clinicType, setClinicType] = useState('');
  const [clinicData, setClinicData] = useState([]);

  const [phoneType, setPhoneType] = useState('');
  const [phoneTypeData, setPhoneTypeData] = useState([
    { label: 'Mobile', value: 1 },
    { label: 'Landline', value: 2 },
  ]);

  const [phoneNo, setPhoneNo] = useState('');
  const [email, setEmail] = useState('');
  const [genderValue, setGenderValue] = useState(null); // 'male' or 'female'

  const middleNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const phoneRef = useRef(null);
  const emailRef = useRef(null);
  const sunoCreatePatientPOST = SunoApi.useCreatePatientPOST();
  const sunoCreatePatientsNoahPOST = SunoApi.useCreatePatientsNoahPOST();
  useEffect(() => {
    const handler = async () => {
      try {
        const isConnected = await checkInternetAndProceed();
        if (!isConnected) {
          return;
        }

        const AllReferernceData = (
          await SunoApi.getReferenceSourceGET(Constants, {
            parent__isnull: true,
            query: '{-children}',
          })
        )?.json;
        const referernceData = fetchReferenceSource(AllReferernceData, 1);
        setReferenceSourceData(referernceData);

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
        setClinicData(ClinicData);
      } catch (err) {
        console.log(err);
      }
    };
    handler();
  }, []);

  const FormField = ({ label }) => {
    return <Text style={[styles.label, styles.labelNormal]}>{label}</Text>;
  };

  const formatDate = date => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const onPressSavePatient = async () => {
    try {
      console.log("==== ", phoneType == '')

      if (!firstName.trim()) {
        Alert.alert('', 'Please enter First Name');
        return;
      }

      if (!lastName.trim()) {
        Alert.alert('', 'Please enter Last Name');
        return;
      }

      if (!birthDate) {
        Alert.alert('', 'Please select Birth Date');
        return;
      }

      if (!genderValue) {
        Alert.alert('', 'Please select Gender');
        return;
      }

      if (!referenceSourceType.trim()) {
        Alert.alert('', 'Please select Referral Source');
        return;
      }

      if (!clinicType.trim()) {
        Alert.alert('', 'Please select Preferred clinic ');
        return;
      }

      if (phoneType == '') {
        Alert.alert('', 'Please select Phone Type');
        return;
      }
      if (!phoneNo.trim()) {
        Alert.alert('', 'Please enter valid Phone Number ');
        return;
      } else if (!/^[0-9]{10}$/.test(phoneNo)) {
        Alert.alert('', 'Phone Number must be 10 digits');
        return;
      }

      if (
        email.trim() &&
        !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)
      ) {
        Alert.alert('', 'Enter a valid email address');
        return;
      }
      const isConnected = await checkInternetAndProceed();
      if (!isConnected) {
        return;
      }
      setLoading(true);
      const param = {
        first_name: firstName.trim(),
        middle_name: middleName?.trim() || '',
        last_name: lastName.trim(),
        sex: genderValue === 'male' ? 'M' : 'F', // or whatever your API expects
        gender: '', // remove if API doesn’t need both
        birthdate: birthDate ? formatDate(birthDate) : null,
        phone: phoneNo,
        phone_type: phoneType,
        email: email.trim(),
        referral_source: referenceSourceType || '',
        preferred_clinic: clinicType || '1',
      };
      const response = (await sunoCreatePatientPOST.mutateAsync(param))?.json;
      // console.log('======== Rsponse : ', response);

      if (isCreateNoahPatient) {
        const responseNoahPatient = (
          await sunoCreatePatientsNoahPOST.mutateAsync({
            patient_pk: response.id,
          })
        )?.json;
        console.log(
          '======== isCreateNoahPatient Rsponse : ',
          response.id,
          responseNoahPatient
        );
      }
      setLoading(false);
      await logEvent('patient_created', {
        creation_method: isCreateNoahPatient ? "Noah_Patient" : "Normal_Patient"
      });
      Alert.alert(
        'Success',
        'Patient saved successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(), // 👈 navigate back
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.log("==== error : ", error)
      setLoading(false);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <Modal transparent visible={loading} animationType="fade">
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.6)',
            }}
          >
            <ActivityIndicator size="large" color="#066858" />
          </View>
        </Modal>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={110} // adjust if you have a header
        >
          <ScrollView style={{ flex: 1 }}>
            <View style={styles.stepScrollContent}>
              <FormField label="First Name *" />
              <TextInput
                value={firstName}
                onChangeText={text => setFirstName(text)}
                placeholder="Enter first name"
                style={[styles.inputWrapper, styles.inputNormal]}
                keyboardType="default"
                returnKeyType="next"
                onSubmitEditing={() => middleNameRef.current?.focus()}
              />
              <FormField label="Middle Name" />

              <TextInput
                ref={middleNameRef}
                value={middleName}
                onChangeText={text => setMiddleName(text)}
                placeholder="Enter Middle name"
                keyboardType="default"
                returnKeyType="next"
                onSubmitEditing={() => lastNameRef.current?.focus()}
                style={[styles.inputWrapper, styles.inputNormal]}
              />
              <FormField label="Last Name *" />

              <TextInput
                value={lastName}
                onChangeText={text => setLastName(text)}
                placeholder="Enter last name"
                ref={lastNameRef}
                keyboardType="default"
                returnKeyType="next"
                onSubmitEditing={() => lastNameRef.current?.focus()}
                style={[styles.inputWrapper, styles.inputNormal]}
              />

              <FormField label="Birth Date *" />

              <TouchableOpacity
                onPress={() => {
                  setShowPicker(true);
                }}
              >
                <TextInput
                  label="Birth Date"
                  value={birthDate.toLocaleDateString('en-US')}
                  placeholder="MM/DD/YYYY"
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
                        value={birthDate}
                        mode="date"
                        display="spinner"
                        maximumDate={new Date()}
                        minimumDate={new Date(1800, 0, 1)}
                        onChange={(event, selectedDate) => {
                          if (event.type === 'set' && selectedDate) {
                            setBirthDate(selectedDate);
                          }
                        }}
                      />

                      <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setShowPicker(false)}
                      >
                        <Text style={styles.closeButtonText}>Done</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>
              ) : (
                showPicker && (
                  <DateTimePicker
                    value={birthDate}
                    mode="date"
                    display="calendar" // "default" or "spinner" also possible
                    maximumDate={new Date()}
                    minimumDate={new Date(1800, 0, 1)}
                    onChange={(event, selectedDate) => {
                      setShowPicker(false); // close after picking
                      if (event.type === 'set' && selectedDate) {
                        // console.log("====== Date : ", selectedDate)
                        setBirthDate(selectedDate);
                      }
                    }}
                  />
                )
              )}
              <FormField label="Sex *" />

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
                      setGenderValue('male');
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
                    <Icon
                      color={
                        genderValue === 'male'
                          ? '#1b8281'
                          : palettes.App.ButtonColor
                      }
                      name={
                        genderValue === 'male'
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
                      {'Male'}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Female */}
                <TouchableOpacity
                  onPress={() => {
                    try {
                      setGenderValue('female');
                    } catch (err) {
                      console.log(err);
                    }
                  }}
                >
                  <View
                    style={StyleSheet.applyWidth(
                      {
                        alignItems: 'center',
                        flexDirection: 'row',
                        paddingHorizontal: 30,
                      },
                      dimensions.width
                    )}
                  >
                    <Icon
                      color={
                        genderValue === 'female'
                          ? '#1b8281'
                          : palettes.App.ButtonColor
                      }
                      name={
                        genderValue === 'female'
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
                      {'Female'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View
                style={{ zIndex: Platform.OS === 'android' ? undefined : 1600 }}
              >
                <Text style={[styles.label]}>{'Referral Source *'}</Text>
                <DropDownBlock
                  dropdownData={referenceData}
                  value={referenceSourceType}
                  setValue={setReferenceSourceType}
                  placeholderText="Select Referral Source"
                  zIndex={1600}
                />
              </View>

              <View
                style={{ zIndex: Platform.OS === 'android' ? undefined : 800 }}
              >
                <Text style={[styles.label]}>{'Preferred clinic *'}</Text>
                <DropDownBlock
                  dropdownData={clinicData}
                  value={clinicType}
                  setValue={setClinicType}
                  placeholderText="Select Preferred clinic"
                  zIndex={800}
                />
              </View>

              <View
                style={{ zIndex: Platform.OS === 'android' ? undefined : 600 }}
              >
                <Text style={[styles.label]}>{'Phone Type *'}</Text>
                <DropDownBlock
                  dropdownData={phoneTypeData}
                  value={phoneType}
                  setValue={setPhoneType}
                  placeholderText="Select Phone Type"
                  zIndex={500}
                />
              </View>

              <View style={{ zIndex: 1, marginBottom: 20 }}>
                <FormField label="Phone Number *" />
                <TextInput
                  value={phoneNo}
                  onChangeText={text => setPhoneNo(text)}
                  placeholder="Enter Phone Number"
                  required
                  style={[styles.inputWrapper, styles.inputNormal]}
                  ref={phoneRef}
                  maxLength={10}
                  keyboardType="phone-pad"
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                />

                <FormField label="Email" />
                <TextInput
                  value={email}
                  onChangeText={text => setEmail(text)}
                  placeholder="Enter Email"
                  required
                  style={[styles.inputWrapper, styles.inputNormal]}
                  ref={emailRef}
                  keyboardType="email-address"
                  returnKeyType="next"
                // onSubmitEditing={() => lastNameRef.current?.focus()}
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      {/* Navigation Buttons */}
      <View
        style={{
          // flexDirection: 'row',
          justifyContent: 'center',
          padding: 16,
          marginBottom: 10,
        }}
      >
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            paddingVertical: 15,
            alignItems: 'center',
          }}
          onPress={() => setIsCreateNoahPatient(!isCreateNoahPatient)}
        >
          <Icon
            name={
              isCreateNoahPatient === true
                ? 'MaterialIcons/check-box'
                : 'MaterialIcons/check-box-outline-blank'
            }
            size={25}
            color={isCreateNoahPatient === true ? '#066858' : '#6B7280'}
          />
          <Text style={{}}>{'Find / Create Noah Patient'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onPressSavePatient()}
          style={[styles.navButton]}
        >
          <Text style={styles.navButtonText}>Save Patient</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: 'white',
    zIndex: 0,
  },
  contentContainer: {
    flex: 1,
    zIndex: 0,
  },
  stepScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    zIndex: 0,
  },
  navButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#066858',
    borderRadius: 8,
  },
  navButtonText: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
  container: {
    flex: 1,
    zIndex: 0,
  },
  label: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 4,
    color: '#111827',
    marginTop: 20,
  },
  labelNormal: {
    color: '#111827',
  },
  labelError: {
    color: '#DC2626', // red
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
  inputError: {
    borderColor: '#DC2626',
  },
  input: {
    flex: 1,
    // paddingVertical: 8,
    fontSize: 14,
    color: '#111827',
    paddingHorizontal: 4,
    paddingVertical: 15,
  },
  icon: {
    marginRight: 8,
    color: '#6B7280',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    marginTop: 4,
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
  closeButton: {
    marginTop: 10,
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
