import React, { useMemo, useState, useRef } from 'react';
import {
  Button,
  Icon,
  IconButton,
  ScreenContainer,
  Touchable,
  TextInput,
  withTheme,
  SimpleStyleFlatList,
  Surface,
  SimpleStyleFlashList,
  SimpleStyleScrollView,
  BottomSheet,
} from '@draftbit/ui';
import {
  Text, View, Platform,
  Modal,
  Alert,
  ActivityIndicator, Image, TouchableOpacity,
  Linking,
  PermissionsAndroid
} from 'react-native';
import CustomChildHeaderBlock from '../components/CustomChildHeaderBlock';
import * as GlobalVariables from '../config/GlobalVariableContext';
import palettes from '../themes/palettes';
import * as StyleSheet from '../utils/StyleSheet';
import showAlertUtil from '../utils/showAlert';
import useNavigation from '../utils/useNavigation';
import useParams from '../utils/useParams';
import useWindowDimensions from '../utils/useWindowDimensions';
import { insuranceTypeMap } from './PatientDetailsScreen.js';
import { scanDocument } from '../DocumentScanner.js';
import DocumentScanner from "react-native-document-scanner-plugin";
import RNBlobUtil from "react-native-blob-util";
import * as SunoApi from '../apis/SunoApi.js';
import * as GlobalStyles from '../GlobalStyles.js';
import { logError } from '../index.js';

// import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
// import BottomSheet from '@gorhom/bottom-sheet';

const defaultProps = { insuranceData: null };

export const insurancePolicyTypeMap = {
  1: 'Commercial',
  2: 'PPO',
  3: 'HMO',
  4: 'EPO',
  5: 'POS',
  6: 'SNP',
  7: 'Medicaid',
  8: 'Workers Compensation',
  9: 'Third Party',
  10: 'Medicare',
  11: 'Supplement',
  12: 'HDHP',
};

export const relationshipMap = {
  0: 'Self',
  1: 'Spouse',
  2: 'Sibling',
  3: 'Parent',
  4: 'Child',
  5: 'Partner',
  6: 'Caregiver',
  99: 'Other',
};

const getUploadFieldName = type =>
  type === 'front' ? 'insurance_card_front' : 'insurance_card_back';

const getUploadFileMeta = (uri, cardType, policyId) => {
  const lowerUri = (uri || '').toLowerCase();
  const isPdf = lowerUri.endsWith('.pdf');
  const extension = isPdf ? 'pdf' : 'jpeg';
  return {
    filename: `${policyId}_${cardType}.${extension}`,
    mimeType: isPdf ? 'application/pdf' : 'image/jpeg',
  };
};

const getUploadErrorMessage = (result, fallback) => {
  if (!result) return fallback;
  if (typeof result === 'string') return result;
  if (result.detail) return String(result.detail);
  if (result.message) return String(result.message);
  if (result.error) return String(result.error);
  return JSON.stringify(result);
};
const ViewInsurancePolicyScreen = props => {
  const { theme } = props;
  const navigation = useNavigation();
  const dimensions = useWindowDimensions();
  const params = useParams();
  const Constants = GlobalVariables.useValues();
  const Variables = Constants;
  const [loading, setIsLoaderVisible] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [menuEdocShow, setMenuEdocShow] = React.useState(false);
  const [isExpandPhoto, setIsExpandPhoto] = React.useState(false);
  const [insuranceCard, setInsuranceCard] = useState('');


  const bottomSheetRef = useRef(null);
  // const snapPoints = useMemo(() => ['25%'], []);
  const snapPoints = ['75%'];
  const [patientID, setPatientID] = useState(params?.patientID ?? defaultProps.patientID);

  const [insuranceData, setInsurancePoliciesData] = useState(params?.insuranceData ?? defaultProps.insuranceData);
  const [insuranceFrontCard, setInsuranceFrontCard] = useState(params?.insuranceData?.insurance_card_front ?? defaultProps.insuranceData?.insurance_card_front);
  const [insuranceBackCard, setInsuranceBackCard] = useState(params?.insuranceData?.insurance_card_back ?? defaultProps.insuranceData?.insurance_card_back);

  React.useEffect(() => {
    const handler = async () => {
      try {
        console.log("==== handler : ", patientID)
        setIsLoaderVisible(true)
        const data = (
          await SunoApi.getInsurancePolicyGET(Constants, {
            patient: patientID,
            query: `{id,policyholder_member_id,plan_name,is_active,type,hearing_benefit,deductible,copay,has_hearing_aid,policyholder_relationship,policyholder_first_name,policyholder_last_name,policyholder_middle_name,policyholder_sex,policyholder_birthdate,policyholder_employer_name,policyholder_group_number,policyholder_street_address_1,policyholder_street_address_2,policyholder_city,policyholder_state,policyholder_country,policyholder_zip_code,policyholder_phone,notes,insurance_card_front,insurance_card_back,insurer_phone_number,coverage_type,insurer{id,name,payer_id,payer_name,email,fax_phone},effective_date,expiration_date,policy_type,verified,intake_form_submission}`,
          })
        )?.json;
        const tempData = data[0];
        setInsurancePoliciesData(tempData);
        setInsuranceFrontCard(tempData?.insurance_card_front)
        setInsuranceBackCard(tempData?.insurance_card_back)
        setIsLoaderVisible(false)

      } catch (err) {
        console.log(err);
        setIsLoaderVisible(false)

      }
    };
    handler();
  }, []);

  // const openSheet = (type) => {
  //   setSelectedType(type);
  //   // bottomSheetRef.current?.expand();
  //   bottomSheetRef.current?.snapToIndex(0);

  // };
  const openSheet = (type) => {
    setSelectedType(type);
    setInsuranceCard(type == 'front' ? insuranceFrontCard : insuranceBackCard)
    setMenuEdocShow(true)
    // handleScan(type)
  };


  const handleScan = async (type) => {
    if (Platform.OS === 'ios') {
      const result = await scanDocument();
      const pdfPath = result.image; // 🖼️ First page image
      uploadInsuranceImages(pdfPath, type);
      console.log('PDF saved at:', pdfPath);

    } else if (Platform.OS === 'android' && await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA
    ) !== PermissionsAndroid.RESULTS.GRANTED) {
      // Alert.alert('Error', 'User must grant camera permissions to use document scanner.')
      Alert.alert(
        'Permission Required',
        'This feature needs Camera permission to use document scanner. Please enable it from app settings.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Open Settings',
            onPress: () => {
              Linking.openSettings().catch(() => {
                Alert.alert(
                  'Error',
                  'Unable to open settings. Please open them manually.'
                );
              });
            },
          },
        ],
        { cancelable: false }
      );
      return
    }
    if (Platform.OS === 'android') {

      try {
        console.log("==== scanResult : =====")

        // const scanResult = await DocumentScanner.scanDocument();
        const { scannedImages } = await DocumentScanner.scanDocument({
          maxNumDocuments: 1
        })

        if (!scannedImages?.length) {
          throw new Error("No images scanned");
        }
        console.log("==== scannedImages : ", scannedImages)
        const imageUri = scannedImages[0];

        uploadInsuranceImages(imageUri, type);

        // const outputPath = `file://${RNBlobUtil.fs.dirs.DocumentDir}/suno_${insuranceData?.id}_${type}.jpeg`;

        // console.log(`PDF created successfully at: ${outputPath}`);
        // uploadInsuranceImages(outputPath, type);
      } catch (error) {
        console.log("Failed to create PDF:", error);
      }
    }
  };

  const deleteInsuranceImages = async (type) => {

    try {
      setTimeout(() => {
        setIsLoaderVisible(true);
      }, 300);
      const apiUrl = `${Constants.API_BASE_URL}/insurance-policies/${insuranceData?.id}/`;
      if (Platform.OS === 'android') {
        const formData = new FormData();
        formData.append(type == 'front' ? 'insurance_card_front' : 'insurance_card_back', '');

        const response = await fetch(apiUrl, {
          method: 'PATCH',
          body: formData,
          headers: {
            // ❌ DO NOT set Content-Type manually
            'Content-Type': 'multipart/form-data',
            Authorization: Constants.AUTH_HEADER, // if needed
          },
        });


        const result = await response.json();
        // console.log('Upload response:', result);

        // if (status < 200 || status >= 300) {
        //   setIsLoaderVisible(false);
        //   return
        // }

        setIsLoaderVisible(false);
        setInsuranceFrontCard(result.insurance_card_front)
        setInsuranceBackCard(result.insurance_card_back)
        Alert.alert('Success', 'Image deleted successfully.', [
          {
            text: 'Ok',
            onPress: () => {
              setIsLoaderVisible(false);

            },
          },
        ]);


      } else {
        const formData = new FormData();
        formData.append(type == 'front' ? 'insurance_card_front' : 'insurance_card_back', {
        });

        const response = await fetch(
          `${apiUrl}`,
          {
            method: 'PATCH',
            headers: {
              Accept: 'application/json',
              Authorization: Constants.AUTH_HEADER,
            },
            body: formData,
          }
        );

        const result = await response.json();

        if (!response.ok) {

        }
        setIsLoaderVisible(false);
        setInsuranceFrontCard(result.insurance_card_front)
        setInsuranceBackCard(result.insurance_card_back)
        Alert.alert('Success', 'Image deleted successfully', [
          {
            text: 'Ok',
            onPress: () => {
              setIsLoaderVisible(false);

            },
          },
        ]);
      }

    } catch (error) {
      console.log('Upload failed:', error);
      setIsLoaderVisible(false);

      Alert.alert('Upload Failed', error.message, [
        {
          text: 'Ok',
          onPress: () => {
            // navigation.goBack();
          },
        },
      ]);
    }
  };
  const uploadInsuranceImages = async (uri, type) => {
    const policyId = insuranceData?.id;
    const fieldName = getUploadFieldName(type);
    console.log("==== policyId : ", policyId)
    if (!policyId) {
      Alert.alert('Upload Failed', 'Insurance policy ID is missing.');
      return;
    }

    if (!uri) {
      Alert.alert('Upload Failed', 'No image was captured.');
      return;
    }

    try {
      setTimeout(() => {
        setIsLoaderVisible(true);
      }, 300);
      const apiUrl = `${Constants.API_BASE_URL}/insurance-policies/${policyId}/`;
      const { filename, mimeType } = getUploadFileMeta(uri, type, policyId);


      if (Platform.OS === 'android') {
        const cleanUri = uri.replace('file://', '');

        const response = await RNBlobUtil.fetch(
          'PATCH',
          apiUrl,
          {
            Accept: 'application/json',
            Authorization: Constants.AUTH_HEADER,
          },
          [
            {
              name: fieldName,
              filename,
              type: mimeType,
              data: RNBlobUtil.wrap(cleanUri),
            },
          ]
        );

        const status = response.info().status;
        const result = await response.json();
        console.log('Upload response:', status, result);

        if (status < 200 || status >= 300) {
          Alert.alert(
            'Upload Failed',
            getUploadErrorMessage(result, 'Unable to upload insurance card.')
          );
          return;
        }

        setInsuranceFrontCard(result.insurance_card_front);
        setInsuranceBackCard(result.insurance_card_back);
        Alert.alert('Success', 'Insurance card uploaded successfully.');
      } else {
        const formData = new FormData();
        formData.append(fieldName, {
          uri,
          name: filename,
          type: mimeType,
        });

        const response = await fetch(apiUrl, {
          method: 'PATCH',
          headers: {
            Accept: 'application/json',
            Authorization: Constants.AUTH_HEADER,
          },
          body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
          Alert.alert(
            'Upload Failed',
            getUploadErrorMessage(result, 'Unable to upload insurance card.')
          );
          return;
        }

        setInsuranceFrontCard(result.insurance_card_front);
        setInsuranceBackCard(result.insurance_card_back);
        Alert.alert('Success', 'Insurance card uploaded successfully.');
      }
    } catch (error) {
      logError('Upload insurance card error:', error);
      Alert.alert(
        'Upload Failed',
        error?.message || 'Unable to upload insurance card.'
      );
    } finally {
      setIsLoaderVisible(false);
      setMenuEdocShow(false);
    }
  };

  // const closeSheet = () => {
  //   bottomSheetRef.current?.close();
  // };

  // const pickImage = (fromCamera = false) => {
  //   const callback = (response) => {
  //     if (response.didCancel) return;

  //     const uri = response.assets?.[0]?.uri;

  //     if (selectedType === 'front') setFrontImage(uri);
  //     else setBackImage(uri);

  //     bottomSheetRef.current?.close();
  //   };

  //   if (fromCamera) {
  //     launchCamera({ mediaType: 'photo' }, callback);
  //   } else {
  //     launchImageLibrary({ mediaType: 'photo' }, callback);
  //   }
  // };

  // const removeImage = () => {
  //   if (selectedType === 'front') setFrontImage(null);
  //   else setBackImage(null);

  //   bottomSheetRef.current?.close();
  // };

  const renderCard = (label, image, type) => (
    <TouchableOpacity style={styles.card} onPress={() => image ? openSheet(type) : handleScan(type)}>
      <View style={{ width: '100%', height: 120, justifyContent: 'center', alignItems: 'center' }}>

        {image ? (
          <>
            {loadingImage && (
              <ActivityIndicator
                size="small"
                color="#066858"
                style={{ position: 'absolute', zIndex: 1 }}
              />
            )}

            <Image
              source={{ uri: image }}
              style={[styles.image, { position: 'absolute' }]}
              onLoadStart={() => setLoadingImage(true)}
              onLoadEnd={() => setLoadingImage(false)}
            />
          </>
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.icon}>📷</Text>
            <Text>Upload</Text>
          </View>
        )}
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );



  return (
    <ScreenContainer scrollable={false} hasSafeArea={true}>

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
      <CustomChildHeaderBlock name={'Insurance Policy Details'} />

      {/* <View style={StyleSheet.applyWidth({ padding: 20, paddingHorizontal: 20, flex : 1 }, dimensions.width)}> */}
      <SimpleStyleScrollView
        bounces={true}
        horizontal={false}
        keyboardShouldPersistTaps={'never'}
        nestedScrollEnabled={false}
        showsHorizontalScrollIndicator={true}
        showsVerticalScrollIndicator={true}
        style={StyleSheet.applyWidth(
          { padding: 20, },
          dimensions.width
        )}
      >

        {/* Title */}
        <View
          style={StyleSheet.applyWidth(
            {
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between'
            },
            dimensions.width
          )}
        >
          <Text
            accessible={true}
            selectable={false}
            style={StyleSheet.applyWidth(
              {
                color: palettes.App.TextPlaceholder,
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                textAlign: 'left',
                textTransform: 'uppercase',
              },
              dimensions.width
            )}
          >
            {'Insurer Carrier'}
          </Text>

        </View>
        {/* Name 3 */}
        <View
          style={StyleSheet.applyWidth(
            {
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between'
            },
            dimensions.width
          )}
        >
          <Text
            accessible={true}
            selectable={false}
            style={StyleSheet.applyWidth(
              {
                color: palettes.App.FilterTextColor,
                fontFamily: 'Inter_500Medium',
                fontSize: 20,
                marginBottom: 30,
                marginTop: 3,
                textAlign: 'left',
              },
              dimensions.width
            )}
          >
            {insuranceData?.insurer?.name === null
              ? ''
              : insuranceData?.insurer?.name
            }

          </Text>

        </View>
        <View
          style={StyleSheet.applyWidth(
            {
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between'
            },
            dimensions.width
          )}
        >
          <Text
            accessible={true}
            selectable={false}
            style={StyleSheet.applyWidth(
              {
                color: palettes.App.TextPlaceholder,
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                textAlign: 'left',
                textTransform: 'uppercase',
              },
              dimensions.width
            )}
          >
            {'Member ID'}
          </Text>
          <Text
            accessible={true}
            selectable={false}
            style={StyleSheet.applyWidth(
              {
                color: palettes.App.TextPlaceholder,
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                textAlign: 'left',
                textTransform: 'uppercase',
              },
              dimensions.width
            )}
          >
            {'Payer ID'}
          </Text>
        </View>
        {/* Name 3 */}
        <View
          style={StyleSheet.applyWidth(
            {
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
              zIndex: 9999,
            },
            dimensions.width
          )}
        >
          <Text
            accessible={true}
            selectable={false}
            style={StyleSheet.applyWidth(
              {
                color: palettes.App.FilterTextColor,
                fontFamily: 'Inter_500Medium',
                fontSize: 14,
                marginBottom: 30,
                marginTop: 3,
                textAlign: 'left',
                flex: 1
              },
              dimensions.width
            )}
          >
            {insuranceData?.policyholder_member_id}
          </Text>
          <Text
            accessible={true}
            selectable={false}
            style={StyleSheet.applyWidth(
              {
                color: palettes.App.FilterTextColor,
                fontFamily: 'Inter_500Medium',
                fontSize: 14,
                marginBottom: 30,
                marginTop: 3,
                textAlign: 'right',
                flex: 1
              },
              dimensions.width
            )}
          >
            {insuranceData?.insurer?.payer_id}
          </Text>
        </View>


        <View
          style={StyleSheet.applyWidth(
            {
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between'
            },
            dimensions.width
          )}
        >
          <Text
            accessible={true}
            selectable={false}
            style={StyleSheet.applyWidth(
              {
                color: palettes.App.TextPlaceholder,
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                textAlign: 'left',
                textTransform: 'uppercase',
              },
              dimensions.width
            )}
          >
            {'Category'}
          </Text>
          <Text
            accessible={true}
            selectable={false}
            style={StyleSheet.applyWidth(
              {
                color: palettes.App.TextPlaceholder,
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                textAlign: 'left',
                textTransform: 'uppercase',
              },
              dimensions.width
            )}
          >
            {'Policy Type'}
          </Text>
        </View>


        {/* Name 7 */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 1 }}>
          <Text
            accessible={true}
            selectable={false}
            style={StyleSheet.applyWidth(
              {
                color: palettes.App.FilterTextColor,
                fontFamily: 'Inter_500Medium',
                fontSize: 14,
                marginBottom: 30,
                marginTop: 3,
                textAlign: 'left',
              },
              dimensions.width
            )}
          >
            {insuranceTypeMap[insuranceData?.type] || ''}
          </Text>

          <Text
            accessible={true}
            selectable={false}
            style={StyleSheet.applyWidth(
              {
                color: palettes.App.FilterTextColor,
                fontFamily: 'Inter_500Medium',
                fontSize: 14,
                marginBottom: 30,
                marginTop: 3,
                textAlign: 'left',
              },
              dimensions.width
            )}
          >
            {insurancePolicyTypeMap[insuranceData?.policy_type] || ''}
          </Text>
        </View>

        <View
          style={StyleSheet.applyWidth(
            {
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between'
            },
            dimensions.width
          )}
        >
          <Text
            accessible={true}
            selectable={false}
            style={StyleSheet.applyWidth(
              {
                color: palettes.App.TextPlaceholder,
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                textAlign: 'left',
                textTransform: 'uppercase',
                flex: 1
              },
              dimensions.width
            )}
          >
            {'Policy Holder Name'}
          </Text>
          <Text
            accessible={true}
            selectable={false}
            style={StyleSheet.applyWidth(
              {
                color: palettes.App.TextPlaceholder,
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                textAlign: 'right',
                textTransform: 'uppercase',
                flex: 1
              },
              dimensions.width
            )}
          >
            {'Relation to Insurer'}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 1 }}>
          <Text
            accessible={true}
            selectable={false}
            style={StyleSheet.applyWidth(
              {
                color: palettes.App.FilterTextColor,
                fontFamily: 'Inter_500Medium',
                fontSize: 14,
                marginBottom: 30,
                marginTop: 3,
                textAlign: 'left',
                flex: 1
              },
              dimensions.width
            )}
          >

            {[insuranceData.policyholder_first_name,
            insuranceData.policyholder_middle_name,
            insuranceData.policyholder_last_name,
            ].filter(Boolean).join(' ')}
          </Text>

          <Text
            accessible={true}
            selectable={false}
            style={StyleSheet.applyWidth(
              {
                color: palettes.App.FilterTextColor,
                fontFamily: 'Inter_500Medium',
                fontSize: 14,
                marginBottom: 30,
                marginTop: 3,
                textAlign: 'right',
                flex: 1

              },
              dimensions.width
            )}
          >
            {relationshipMap[insuranceData?.policyholder_relationship] || ''}
          </Text>
        </View>
        {/* Assignee */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 1 }}>

          <Text
            accessible={true}
            selectable={false}
            style={StyleSheet.applyWidth(
              {
                color: palettes.App.TextPlaceholder,
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                textAlign: 'left',
                textTransform: 'uppercase',
                textDecorationLine: insuranceData?.balance > 0 && (insuranceData?.status == 999 || insuranceData?.status == 1000) ? 'line-through' : 'none',
                fontStyle: insuranceData?.balance > 0 && (insuranceData?.status == 999 || insuranceData?.status == 1000) ? 'italic' : 'normal'
                , flex: 0.4
              },
              dimensions.width
            )}
          >
            {'Hearing Aid Benefit'}
          </Text>
          <View style={{ paddingLeft: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 0.6 }}>

            <Text
              accessible={true}
              selectable={false}
              style={StyleSheet.applyWidth(
                {
                  color: palettes.App.TextPlaceholder,
                  fontFamily: 'Inter_400Regular',
                  fontSize: 14,
                  textAlign: 'left',
                  textTransform: 'uppercase',

                },
                dimensions.width
              )}
            >
              {'Deductible'}
            </Text>

            <Text
              accessible={true}
              selectable={false}
              style={StyleSheet.applyWidth(
                {
                  color: palettes.App.TextPlaceholder,
                  fontFamily: 'Inter_400Regular',
                  fontSize: 14,
                  textAlign: 'left',
                  textTransform: 'uppercase',

                },
                dimensions.width
              )}
            >
              {'Co-pay'}
            </Text>
          </View>
        </View>
        {/* View 2 */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Name 4 */}
          <Text
            accessible={true}
            selectable={false}
            style={StyleSheet.applyWidth(
              {
                color: palettes.App.FilterTextColor,
                fontFamily: 'Inter_500Medium',
                fontSize: 14,
                // marginLeft: 7,
                textAlign: 'left',
                textDecorationLine: insuranceData?.balance > 0 && (insuranceData?.status == 999 || insuranceData?.status == 1000) ? 'line-through' : 'none',
                fontStyle: insuranceData?.balance > 0 && (insuranceData?.status == 999 || insuranceData?.status == 1000) ? 'italic' : 'normal'
                , flex: 0.4
              },
              dimensions.width
            )}
          >
            ${insuranceData?.hearing_benefit}
          </Text>
          <View style={{ paddingLeft: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 0.6 }}>

            <Text
              accessible={true}
              selectable={false}
              style={StyleSheet.applyWidth(
                {
                  color: palettes.App.FilterTextColor,
                  fontFamily: 'Inter_500Medium',
                  fontSize: 14,
                  // marginLeft: 7,
                  textAlign: 'left',
                  textDecorationLine: insuranceData?.balance > 0 && (insuranceData?.status == 999 || insuranceData?.status == 1000) ? 'line-through' : 'none',
                  fontStyle: insuranceData?.balance > 0 && (insuranceData?.status == 999 || insuranceData?.status == 1000) ? 'italic' : 'normal'

                },
                dimensions.width
              )}
            >
              ${insuranceData?.deductible}
            </Text>
            <Text
              accessible={true}
              selectable={false}
              style={StyleSheet.applyWidth(
                {
                  color: palettes.App.FilterTextColor,
                  fontFamily: 'Inter_500Medium',
                  fontSize: 14,
                  // marginLeft: 7,
                  textAlign: 'left',
                  textDecorationLine: insuranceData?.balance > 0 && (insuranceData?.status == 999 || insuranceData?.status == 1000) ? 'line-through' : 'none',
                  fontStyle: insuranceData?.balance > 0 && (insuranceData?.status == 999 || insuranceData?.status == 1000) ? 'italic' : 'normal'

                },
                dimensions.width
              )}
            >
              ${insuranceData?.copay}
            </Text>
          </View>
        </View>
        {/* Additional Assignees */}
        <>

          <Text
            accessible={true}
            selectable={false}
            style={StyleSheet.applyWidth(
              {
                color: palettes.App.TextPlaceholder,
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                textAlign: 'left',
                textTransform: 'uppercase',
                paddingTop: 25,
                paddingBottom: 15
              },
              dimensions.width
            )}
          >
            {'Insurance Card Photos'}
          </Text>
        </>

        <View style={styles.row}>
          {renderCard('Insurance Card Front', insuranceFrontCard, 'front')}
          {renderCard('Insurance Card Back', insuranceBackCard, 'back')}
        </View>



        {/* Bottom Sheet */}
        {/* <BottomSheet ref={bottomSheetRef} index={-1} snapPoints={snapPoints} showHandle={true}  initialSnapIndex={-1} // 👈 closed by default
      >
        <View style={styles.sheetContent}>
          <TouchableOpacity onPress={() => pickImage(false)}>
            <Text style={styles.sheetItem}>Choose from Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => pickImage(true)}>
            <Text style={styles.sheetItem}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={removeImage}>
            <Text style={styles.sheetItem}>Remove Photo</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet> */}

      </SimpleStyleScrollView>
      <Modal
        animationType={'none'}
        supportedOrientations={['portrait', 'landscape']}
        presentationStyle={'overFullScreen'}
        transparent={true}
        visible={Boolean(menuEdocShow)}
      >
        <View
          style={StyleSheet.applyWidth(
            {
              alignContent: 'center',
              alignItems: 'center',
              alignSelf: 'auto',
              backgroundColor: palettes.App['Custom Color 6'],
              flex: 1,
              flexDirection: 'column',
              justifyContent: 'center',
            },
            dimensions.width
          )}
        >
          <View
            style={StyleSheet.applyWidth(
              {
                alignItems: 'center',
                backgroundColor: palettes.App['Custom #ffffff'],
                borderRadius: 16,
                justifyContent: 'center',
                marginLeft: 24,
                marginRight: 24,
                width: '90%'
              },
              dimensions.width
            )}
          >
            {isExpandPhoto &&
              <View style={{ width: '100%', justifyContent: 'center', }}>
                <View
                  style={StyleSheet.applyWidth(
                    {
                      // alignItems: 'flex-end',
                      borderBottomWidth: 1.5,
                      borderColor: palettes.App.Peoplebit_Light_Stone_Gray,
                      paddingBottom: 16,
                      paddingTop: 10,
                      justifyContent: 'space-between',
                      flexDirection: 'row',
                      paddingHorizontal: 15
                    },
                    dimensions.width
                  )}
                >


                  <Text
                    accessible={true}
                    selectable={false}
                    {...GlobalStyles.TextStyles(theme)['Text 2'].props}
                    style={StyleSheet.applyWidth(
                      StyleSheet.compose(
                        GlobalStyles.TextStyles(theme)['Text 2'].style,
                        theme.typography.body1,
                        {
                          color: theme.colors.text.medium,
                          fontFamily: 'Inter_500Medium',
                          fontSize: 20,
                        }
                      ),
                      dimensions.width
                    )}
                  >
                    {selectedType === 'front' ? 'Insurance Card Front' : 'Insurance Card Back'}
                  </Text>
                  <IconButton
                    onPress={() => {
                      try {
                        setMenuEdocShow(!menuEdocShow);
                        setIsExpandPhoto(false)
                      } catch (err) {
                        logError(err);
                      }
                    }}
                    color={theme.colors.branding.secondary}
                    icon={'MaterialCommunityIcons/close-circle-outline'}
                    size={28}
                  />
                </View>
                <>

                  <Image
                    source={{ uri: insuranceCard }}
                    style={{
                      width: '100%',
                      aspectRatio: 1.5, // 👈 adjust based on your card
                      resizeMode: 'contain',
                    }}
                  />
                </>
              </View>
            }
            {/* View section */}
            {!isExpandPhoto &&
              <View
                style={StyleSheet.applyWidth(
                  {
                    paddingBottom: 12,
                    paddingLeft: 16,
                    paddingRight: 16,
                    paddingTop: 12,
                    width: '100%',
                  },
                  dimensions.width
                )}
              >
                {/* Header */}
                <View
                  style={StyleSheet.applyWidth(
                    {
                      alignItems: 'flex-end',
                      borderBottomWidth: 1.5,
                      borderColor: palettes.App.Peoplebit_Light_Stone_Gray,
                      paddingBottom: 16,
                      paddingTop: 10,
                      justifyContent: 'space-between',
                      flexDirection: 'row'
                    },
                    dimensions.width
                  )}
                >


                  <Text
                    accessible={true}
                    selectable={false}
                    {...GlobalStyles.TextStyles(theme)['Text 2'].props}
                    style={StyleSheet.applyWidth(
                      StyleSheet.compose(
                        GlobalStyles.TextStyles(theme)['Text 2'].style,
                        theme.typography.body1,
                        {
                          color: theme.colors.text.medium,
                          fontFamily: 'Inter_500Medium',
                          fontSize: 20,
                        }
                      ),
                      dimensions.width
                    )}
                  >
                    {'Actions'}
                  </Text>
                  <IconButton
                    onPress={() => {
                      try {
                        setMenuEdocShow(!menuEdocShow);
                      } catch (err) {
                        logError(err);
                      }
                    }}
                    color={theme.colors.branding.secondary}
                    icon={'MaterialCommunityIcons/close-circle-outline'}
                    size={28}
                  />
                </View>
                {/* Flex Touchable */}
                <View
                  style={StyleSheet.applyWidth(
                    { paddingBottom: 10, paddingTop: 16 },
                    dimensions.width
                  )}
                >
                  <Touchable
                    onPress={() => {
                      setIsExpandPhoto(true)

                    }}
                  >
                    {/* Button Frame */}
                    <View
                      style={StyleSheet.applyWidth(
                        {
                          flexDirection: 'row',
                          justifyContent: 'flex-start',
                          marginLeft: 8,
                          marginRight: 8,
                          paddingBottom: 8,
                          paddingTop: 8,
                        },
                        dimensions.width
                      )}
                    >
                      {/* Icon Frame */}
                      <View
                        style={StyleSheet.applyWidth(
                          {
                            alignItems: 'flex-start',
                            backgroundColor: theme.colors.background.brand,
                            borderRadius: 12,
                            justifyContent: 'flex-start',
                            paddingBottom: 10,
                            paddingLeft: 10,
                            paddingRight: 10,
                            paddingTop: 10,
                          },
                          dimensions.width
                        )}
                      >
                        <Icon
                          color={theme.colors.foreground.base}
                          name={'Ionicons/expand-outline'}
                          size={21}
                        />
                      </View>
                      {/* Button Label */}
                      <Text
                        accessible={true}
                        selectable={false}
                        style={StyleSheet.applyWidth(
                          {
                            color: theme.colors.text.normal,
                            fontFamily: 'OpenSans_500Medium',
                            fontSize: 17,
                            lineHeight: 18,
                            paddingBottom: 10,
                            paddingLeft: 12,
                            paddingRight: 8,
                            paddingTop: 10,
                          },
                          dimensions.width
                        )}
                      >
                        {'Expand Photo'}
                      </Text>
                    </View>
                  </Touchable>
                </View>

                <View
                  style={StyleSheet.applyWidth(
                    { paddingBottom: 10 },
                    dimensions.width
                  )}
                >
                  <Touchable
                    onPress={() => {
                      setMenuEdocShow(false)
                      setTimeout(() => {
                        handleScan(selectedType)

                      }, 300);
                    }}
                  >
                    <View
                      style={StyleSheet.applyWidth(
                        {
                          flexDirection: 'row',
                          justifyContent: 'flex-start',
                          marginLeft: 8,
                          marginRight: 8,
                          paddingBottom: 8,
                          paddingTop: 8,
                        },
                        dimensions.width
                      )}
                    >
                      <View
                        style={StyleSheet.applyWidth(
                          {
                            backgroundColor: theme.colors.background.warning,
                            borderRadius: 12,
                            paddingBottom: 10,
                            paddingLeft: 10,
                            paddingRight: 10,
                            paddingTop: 10,
                          },
                          dimensions.width
                        )}
                      >

                        <Icon
                          color={theme.colors.text.warning}
                          name={'Feather/camera'}
                          size={22}
                        />
                      </View>

                      <Text
                        accessible={true}
                        selectable={false}
                        style={StyleSheet.applyWidth(
                          {
                            color: theme.colors.text.normal,
                            fontFamily: 'OpenSans_500Medium',
                            fontSize: 17,
                            lineHeight: 18,
                            paddingBottom: 10,
                            paddingLeft: 12,
                            paddingRight: 8,
                            paddingTop: 10,
                          },
                          dimensions.width
                        )}
                      >
                        {'Change Photo'}
                      </Text>
                    </View>
                  </Touchable>
                </View>


                <View
                  style={StyleSheet.applyWidth(
                    { paddingBottom: 10, },
                    dimensions.width
                  )}
                >
                  <Touchable
                    onPress={() => {
                      setMenuEdocShow(false)
                      setTimeout(() => {
                        Alert.alert(
                          'Confirm',
                          'Are you sure you want to delete photo?',
                          [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'Delete',
                              style: 'destructive',
                              onPress: async () => {
                                deleteInsuranceImages(selectedType);
                              },
                            },
                          ]
                        );
                      }, 300);
                    }}
                  >
                    {/* Button Frame */}
                    <View
                      style={StyleSheet.applyWidth(
                        {
                          flexDirection: 'row',
                          justifyContent: 'flex-start',
                          marginLeft: 8,
                          marginRight: 8,
                          paddingBottom: 8,
                          paddingTop: 8,
                        },
                        dimensions.width
                      )}
                    >
                      {/* Icon Frame */}
                      <View
                        style={StyleSheet.applyWidth(
                          {
                            alignItems: 'flex-start',
                            backgroundColor: theme.colors.background.danger,
                            borderRadius: 12,
                            justifyContent: 'flex-start',
                            paddingBottom: 10,
                            paddingLeft: 10,
                            paddingRight: 10,
                            paddingTop: 10,
                          },
                          dimensions.width
                        )}
                      >
                        <Icon
                          color={theme.colors.foreground.danger}
                          name={'MaterialCommunityIcons/delete'}
                          size={21}
                        />
                      </View>
                      {/* Button Label */}
                      <Text
                        accessible={true}
                        selectable={false}
                        style={StyleSheet.applyWidth(
                          {
                            color: theme.colors.text.normal,
                            fontFamily: 'OpenSans_500Medium',
                            fontSize: 17,
                            lineHeight: 18,
                            paddingBottom: 10,
                            paddingLeft: 12,
                            paddingRight: 8,
                            paddingTop: 10,
                          },
                          dimensions.width
                        )}
                      >
                        {'Delete Photo'}
                      </Text>
                    </View>
                  </Touchable>
                </View>
                {/* Flex Touchable */}
                {/* {selectedEdocItem?.type === 'file' && */}

                {/* } */}
              </View>
            }
          </View>
        </View>
      </Modal>

    </ScreenContainer>
  );
};
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FFFFFF'
  },
  headerSection: {
    marginBottom: 12
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827'
  },
  taskPriority: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4
  },
  taskDesc: {
    fontSize: 15,
    color: '#374151',
    marginTop: 8
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    color: '#111827'
  },
  commentCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    marginHorizontal: 15
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10
  },
  placeholderAvatar: {
    backgroundColor: '#E5E7EB'
  },
  commentUser: {
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2
  },
  commentText: {
    color: '#374151'
  },
  footerSection: {
    marginTop: 16,
    paddingHorizontal: 15
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 10,
    minHeight: 40,
    textAlignVertical: 'top'
  },
  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center'
  },
  buttonText: {
    color: 'white',
    fontWeight: '600'
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 3,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    padding: 10,
    alignItems: 'center',
    elevation: 2,
    borderWidth: 0.5,
    borderColor: 'gray'
    // borderStyle: 'dashed',
  },
  image: {
    width: '100%',
    height: 120,
    borderRadius: 10,
  },
  placeholder: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
    marginBottom: 5,
  },
  label: {
    marginTop: 8,
    // fontSize : '11'
    fontWeight: '500',
    textAlign: 'center'
  },
  sheetContent: {
    padding: 16,
  },
  sheetItem: {
    fontSize: 16,
    paddingVertical: 12,
  },
});
export default withTheme(ViewInsurancePolicyScreen);
