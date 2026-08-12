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
  DeviceEventEmitter,
} from 'react-native';
import { ScreenContainer, withTheme } from '@draftbit/ui';
import * as SunoApi from '../apis/SunoApi.js';
import CustomChildHeaderBlock from '../components/CustomChildHeaderBlock';
import * as GlobalVariables from '../config/GlobalVariableContext';
import * as CustomCode from '../custom-files/CustomCode';
import * as CustomPatientScreen from '../custom-files/CustomPatientScreen';
import palettes from '../themes/palettes';
import * as Utils from '../utils';
import useIsFocused from '../utils/useIsFocused';
import useNavigation from '../utils/useNavigation';
import useParams from '../utils/useParams';
import useWindowDimensions from '../utils/useWindowDimensions';


import { Icon, useTheme } from '@draftbit/ui';
import * as GlobalStyles from '../GlobalStyles.js';
import * as StyleSheet from '../utils/StyleSheet';
import { DropDownBlock } from '../custom-files/DropDownBlock';


const EditPatientScreen = props => {
  const { theme } = props;
  const patientInfo =  props.route.params.patientInfo;
  const dimensions = useWindowDimensions();
  const Constants = GlobalVariables.useValues();
  const Variables = Constants;
  const [textInputValue, setTextInputValue] = React.useState('');
  const [textInputValue2, setTextInputValue2] = React.useState('');
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const [firstName, setFirstName] = useState(patientInfo?.first_name ?? '');
  const [lastName, setLastName] = useState(patientInfo?.last_name ??'');
  const [middleName, setMiddleName] = useState(patientInfo?.middle_name ??'');

  const [street_address_1, setStreet_Address_Line1] = useState(patientInfo?.street_address_1 ?? '');
  const [street_address_2, setStreet_Address_Line2] = useState(patientInfo?.street_address_2 ?? '');
  const [city, setCity] = useState(patientInfo?.city ?? '');
  const [zipCode, setZipCode] = useState(patientInfo?.zip_code ??'');

 
  const [countryData, setCountryData] = useState([{ label: 'USA', value: 'USA' }, { label: 'Canada', value: 'Canada' }, { label: 'Bahamas', value: 'Bahamas' }, { label: 'US Virgin Islands', value: 'US Virgin Islands' },]);
  const [country, setCountry] = useState(patientInfo?.country == 'United States of America' ? 'USA' : patientInfo?.country);
  const [stateCodeData, setStateCodeData] = useState(patientInfo?.state);
  const [stateData, setStateData] = useState([]);
  const [phoneType, setPhoneType] = useState(patientInfo?.payment_source_type ?? 0);
  const [phoneTypeData, setPhoneTypeData] = useState([
    { label: 'Mobile', value: 1 },
    { label: 'Landline', value: 2 },
  ]);

  const [phoneNo, setPhoneNo] = useState(patientInfo?.phone ?? '');
  const [email, setEmail] = useState(patientInfo?.email ?? '');
  const middleNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const phoneRef = useRef(null);
  const emailRef = useRef(null);
  const streetAddress1Ref = useRef(null);
  const streetAddress2Ref = useRef(null);
  const cityRef = useRef(null);
  const zipCodeRef = useRef(null);

  const sunoUpdatePatientPATCH = SunoApi.useUpdatePatientsInfoPATCH();
  React.useEffect(() => {
    const handler = async () => {
      try {
        if (country == 'US Virgin Islands') {
          setStateData([
            { label: "Saint Croix", value: "SX" },
            { label: "Saint John", value: "SJ" },
            { label: "Saint Thomas", value: "ST" },
          ])
          // 00801 – 00851

        } else if (country == 'USA') {
          setStateData([
            { label: "Alabama", value: "AL" },
            { label: "Alaska", value: "AK" },
            { label: "Arizona", value: "AZ" },
            { label: "Arkansas", value: "AR" },
            { label: "California", value: "CA" },
            { label: "Colorado", value: "CO" },
            { label: "Connecticut", value: "CT" },
            { label: "Delaware", value: "DE" },
            { label: "District of Columbia", value: "DC" },
            { label: "Florida", value: "FL" },
            { label: "Georgia", value: "GA" },
            { label: "Hawaii", value: "HI" },
            { label: "Idaho", value: "ID" },
            { label: "Illinois", value: "IL" },
            { label: "Indiana", value: "IN" },
            { label: "Iowa", value: "IA" },
            { label: "Kansas", value: "KS" },
            { label: "Kentucky", value: "KY" },
            { label: "Louisiana", value: "LA" },
            { label: "Maine", value: "ME" },
            { label: "Maryland", value: "MD" },
            { label: "Massachusetts", value: "MA" },
            { label: "Michigan", value: "MI" },
            { label: "Minnesota", value: "MN" },
            { label: "Mississippi", value: "MS" },
            { label: "Missouri", value: "MO" },
            { label: "Montana", value: "MT" },
            { label: "Nebraska", value: "NE" },
            { label: "Nevada", value: "NV" },
            { label: "New Hampshire", value: "NH" },
            { label: "New Jersey", value: "NJ" },
            { label: "New Mexico", value: "NM" },
            { label: "New York", value: "NY" },
            { label: "North Carolina", value: "NC" },
            { label: "North Dakota", value: "ND" },
            { label: "Ohio", value: "OH" },
            { label: "Oklahoma", value: "OK" },
            { label: "Oregon", value: "OR" },
            { label: "Pennsylvania", value: "PA" },
            { label: "Rhode Island", value: "RI" },
            { label: "South Carolina", value: "SC" },
            { label: "South Dakota", value: "SD" },
            { label: "Tennessee", value: "TN" },
            { label: "Texas", value: "TX" },
            { label: "Utah", value: "UT" },
            { label: "Vermont", value: "VT" },
            { label: "Virginia", value: "VA" },
            { label: "Washington", value: "WA" },
            { label: "West Virginia", value: "WV" },
            { label: "Wisconsin", value: "WI" },
            { label: "Wyoming", value: "WY" },
          ])
        } else if (country == 'Canada') {
          setStateData([{ label: "Alberta", value: "AB" },
          { label: "British Columbia", value: "BC" },
          { label: "Manitoba", value: "MB" },
          { label: "New Brunswick", value: "NB" },
          { label: "Newfoundland and Labrador", value: "NL" },
          { label: "Nova Scotia", value: "NS" },
          { label: "Northwest Territories", value: "NT" },
          { label: "Nunavut", value: "NU" },
          { label: "Ontario", value: "ON" },
          { label: "Prince Edward Island", value: "PE" },
          { label: "Quebec", value: "QC" },
          { label: "Saskatchewan", value: "SK" },
          { label: "Yukon", value: "YT" }])
        } else if (country == 'Bahamas') {
          setStateData([])
        }
      } catch (err) {
        console.log(err);
      }
    };
    handler();
  }, [country]);

  

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

  const US_ZIP_REGEX = /^\d{5}(-\d{4})?$/;
      const CANADA_POSTAL_REGEX =
      /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ ]?\d[ABCEGHJ-NPRSTV-Z]\d$/i;

      const BAHAMAS_ZIP_REGEX = /^\d{5}$/;
      const USVI_ZIP_REGEX = /^008\d{2}$/;

      const validateZipCode = (country, zipCode) => {

  switch (country) {
    case "USA":
      return US_ZIP_REGEX.test(zipCode);

    case "Canada":
      return CANADA_POSTAL_REGEX.test(zipCode);

    case "Bahamas":
      return BAHAMAS_ZIP_REGEX.test(zipCode);

    case "US Virgin Islands":
      return USVI_ZIP_REGEX.test(zipCode);

    default:
      return false;
  }
}

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

      if (zipCode.trim()) {
       const valid = validateZipCode(country, zipCode);  
       console.log("====valid :  ",valid)      // true
if (!valid) {

if (country == 'Canada') {
    Alert.alert('', 'ZIP Code is not valid. Example: M5V 3L9, K1A 0A6');
    return
  }  else {
    Alert.alert('', 'ZIP Code is not valid. Example: 12345, 12345-6789');
    return
  }

}
      }

    


      setLoading(true);
      const param = {
        first_name: firstName.trim(),
        middle_name: middleName?.trim() || '',
        last_name: lastName.trim(),
        "phone_type": phoneType,
        "email": email.trim(),
        "street_address_1": street_address_1.trim(),
        "street_address_2": street_address_2.trim(),
        "city": city.trim(),
        "zip_code": zipCode.trim(),
        "country": country == 'USA' ? 'United States of America' : country,
        "phone":phoneNo,
        "state": stateCodeData,
        id : patientInfo?.id
      };
      const response = (await sunoUpdatePatientPATCH.mutateAsync(param))?.json;
      console.log('======== Rsponse : ', response);

      setLoading(false);

      Alert.alert(
        'Success',
        'Patient saved successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              DeviceEventEmitter.emit('reloadPatientData');

              // navigation.goBack()
            } // 👈 navigate back
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
    <ScreenContainer scrollable={false} hasSafeArea={true}>
      <CustomChildHeaderBlock name={'Edit Patient'} />
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



                <View
                  style={{ zIndex: Platform.OS === 'android' ? undefined : 2000 }}
                >
                  <Text style={[styles.label]}>{'Phone Type *'}</Text>
                  <DropDownBlock
                    dropdownData={phoneTypeData}
                    value={phoneType}
                    setValue={setPhoneType}
                    placeholderText="Select Phone Type"
                    zIndex={2000}
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
                    onSubmitEditing={() => streetAddress1Ref.current?.focus()}
                  />
                  <View
                    style={{ zIndex: Platform.OS === 'android' ? undefined : 800 }}
                  >
                    <Text style={[styles.label]}>{'Country'}</Text>
                    <DropDownBlock
                      dropdownData={countryData}
                      value={country}
                      setValue={setCountry}
                      placeholderText="Select Country"
                      zIndex={800}
                    />
                  </View>
                  {country != 'Bahamas' &&
                    <View
                      style={{ zIndex: Platform.OS === 'android' ? undefined : 600 }}
                    >
                      <Text style={[styles.label]}>{'State'}</Text>
                      <DropDownBlock
                        dropdownData={stateData}
                        value={stateCodeData}
                        setValue={setStateCodeData}
                        placeholderText="Select State"
                        zIndex={600}
                      />
                    </View>
                  }

                  <FormField label="Street Address Line 1" />
                  <TextInput
                    ref={streetAddress1Ref}
                    value={street_address_1}
                    onChangeText={text => setStreet_Address_Line1(text)}
                    placeholder="Enter street address line 1"
                    style={[styles.inputWrapper, styles.inputNormal]}
                    keyboardType="default"
                    returnKeyType="next"
                    onSubmitEditing={() => streetAddress2Ref.current?.focus()}
                  />
                  <FormField label="Street Address Line 2" />

                  <TextInput
                    ref={streetAddress2Ref}
                    value={street_address_2}
                    onChangeText={text => setStreet_Address_Line2(text)}
                    placeholder="Enter street address line 2"
                    keyboardType="default"
                    returnKeyType="next"
                    onSubmitEditing={() => cityRef.current?.focus()}
                    style={[styles.inputWrapper, styles.inputNormal]}
                  />
                  <FormField label="City" />

                  <TextInput
                    value={city}
                    onChangeText={text => setCity(text)}
                    placeholder="Enter city"
                    ref={cityRef}
                    keyboardType="default"
                    returnKeyType="next"
                    onSubmitEditing={() => zipCodeRef.current?.focus()}
                    style={[styles.inputWrapper, styles.inputNormal]}
                  />


                  <FormField label="Zip Code" />

                  <TextInput
                    value={zipCode}
                    onChangeText={text => setZipCode(text)}
                    placeholder="Enter Zip code"
                    ref={zipCodeRef}
                    keyboardType="default"
                    returnKeyType="next"
                    onSubmitEditing={() => zipCodeRef.current?.focus()}
                    style={[styles.inputWrapper, styles.inputNormal]}
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
            onPress={() => onPressSavePatient()}
            style={[styles.navButton]}
          >
            <Text style={styles.navButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ScreenContainer>
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
export default withTheme(EditPatientScreen);
