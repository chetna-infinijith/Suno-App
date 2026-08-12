import React, { useState } from 'react';
import {
  Checkbox,
  ExpoImage,
  HStack,
  Icon,
  IconButton,
  Pressable,
  ScreenContainer,
  SimpleStyleFlashList,
  SimpleStyleFlatList,
  SimpleStyleScrollView,
  Surface,
  TextInput,
  Touchable,
  withTheme,
} from '@draftbit/ui';
import { ActivityIndicator, Modal, Text, View, Platform, PermissionsAndroid, Alert, TouchableOpacity, Linking, ToastAndroid, FlatList, TouchableWithoutFeedback } from 'react-native';
import { Fetch } from 'react-request';
import * as GlobalStyles from '../GlobalStyles.js';
import * as DraftbitExampleApi from '../apis/DraftbitExampleApi.js';
import * as SunoApi from '../apis/SunoApi.js';
import CustomAddBlock from '../components/CustomAddBlock';
import CustomChildHeaderBlock from '../components/CustomChildHeaderBlock';
import EmptyListBlock from '../components/EmptyListBlock';
import HeaderEventsBlock from '../components/HeaderEventsBlock';
import MenuButtonBlock from '../components/MenuButtonBlock';
import * as GlobalVariables from '../config/GlobalVariableContext';
import * as CustomCode from '../custom-files/CustomCode';
import * as DropDownBlock from '../custom-files/DropDownBlock';
import * as HtmlView from '../custom-files/HtmlView';
import callPhoneNumber from '../global-functions/callPhoneNumber';
import checkExpiredTags from '../global-functions/checkExpiredTags';
import dueAmount from '../global-functions/dueAmount';
import fetchSelectedTags from '../global-functions/fetchSelectedTags';
import filterDocumentFlashListData from '../global-functions/filterDocumentFlashListData';
import formatPhoneNumber from '../global-functions/formatPhoneNumber';
import formatTime from '../global-functions/formatTime';
import getCurrentTime from '../global-functions/getCurrentTime';
import hasTextInHTML from '../global-functions/hasTextInHTML';
import palettes from '../themes/palettes';
import * as Utils from '../utils';
import Breakpoints from '../utils/Breakpoints';
import * as DateUtils from '../utils/DateUtils';
import * as StyleSheet from '../utils/StyleSheet';
import imageSource from '../utils/imageSource';
import useIsFocused from '../utils/useIsFocused';
import useNavigation from '../utils/useNavigation';
import useParams from '../utils/useParams';
import useWindowDimensions from '../utils/useWindowDimensions';
import { scanDocument } from '../DocumentScanner';
import RNBlobUtil from "react-native-blob-util";
import DocumentScanner from "react-native-document-scanner-plugin";
import { createPdf } from "react-native-images-to-pdf";
import getTextColor from '../global-functions/getColor.js';
import * as ImagePicker from 'expo-image-picker';
import { Camera, CameraType, CameraView, useCameraPermissions, FlashMode } from 'expo-camera';
import CameraModal from '../custom-files/CameraModal.js';
import { DeviceEventEmitter } from 'react-native';
import * as Clipboard from "expo-clipboard";
import Toast from "react-native-root-toast";
import { showToast } from '../global-functions/showToast.js';
import { ScrollView } from 'react-native';
import getTaskStatus from '../global-functions/getTaskStatus.js';
import getBillingStatus from '../global-functions/getBillingStatus.js';
import getTaskStatusColor from '../global-functions/getTaskStatusColor.js';
import getBillingStatusColor from '../global-functions/getBillingStatusColor.js';
import ScribeControlBar from './ScribeControlBar.js';
import useAmbientScribe from './useAmbientScribe.js';
import { logEvent } from '../global-functions/analyticsService.js';
import { size } from 'lodash';
import { logError } from '../index.js';
import moment from 'moment';
import { checkInternetAndProceed } from '../custom-files/InternetConnection.js';
import { TaskListSection } from '../components/TaskListView';

// import {
//   useLDClient,
// } from '@launchdarkly/react-native-client-sdk';
const defaultProps = { box_folder_id: null, id: null };

const skeletonBlock = (width, height, borderRadius = 6) => ({
  width,
  height,
  borderRadius,
  backgroundColor: '#E8ECF0',
});

const PatientProfileSkeleton = ({ theme, dimensions }) => (
  <>
    <Surface
      {...GlobalStyles.SurfaceStyles(theme)['Surface'].props}
      elevation={3}
      style={StyleSheet.applyWidth(
        StyleSheet.compose(
          GlobalStyles.SurfaceStyles(theme)['Surface'].style,
          { borderRadius: 10, marginLeft: 20, marginRight: 20 }
        ),
        dimensions.width
      )}
    >
      <View
        style={StyleSheet.applyWidth(
          {
            backgroundColor: palettes.App['Custom Color'],
            borderRadius: 10,
            padding: 20,
          },
          dimensions.width
        )}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ ...skeletonBlock(90, 90, 45) }} />
          <View style={{ flex: 1, marginLeft: 20 }}>
            <View style={{ ...skeletonBlock('70%', 18), marginBottom: 10 }} />
            <View style={{ ...skeletonBlock('55%', 14), marginBottom: 8 }} />
            <View style={{ ...skeletonBlock('65%', 14), marginBottom: 8 }} />
            <View style={{ ...skeletonBlock('40%', 14) }} />
          </View>
        </View>
        <View style={{ marginTop: 20 }}>
          <View style={{ ...skeletonBlock('45%', 14), marginBottom: 10 }} />
          <View style={{ ...skeletonBlock('60%', 14), marginBottom: 10 }} />
          <View style={{ ...skeletonBlock('50%', 14), marginBottom: 10 }} />
          <View style={{ ...skeletonBlock('75%', 14) }} />
        </View>
      </View>
    </Surface>
    <Surface
      {...GlobalStyles.SurfaceStyles(theme)['Surface'].props}
      elevation={2}
      style={StyleSheet.applyWidth(
        StyleSheet.compose(
          GlobalStyles.SurfaceStyles(theme)['Surface'].style,
          {
            backgroundColor: palettes.App['Custom #ffffff'],
            borderRadius: 2,
            marginBottom: 15,
            marginLeft: 22,
            marginRight: 22,
            marginTop: 15,
            padding: 15,
          }
        ),
        dimensions.width
      )}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {[1, 2, 3, 4, 5].map(item => (
          <View key={item} style={{ alignItems: 'center', width: 56 }}>
            <View style={{ ...skeletonBlock(40, 40, 20), marginBottom: 8 }} />
            <View style={{ ...skeletonBlock(48, 10, 4) }} />
          </View>
        ))}
      </View>
    </Surface>
  </>
);


export const getProductStatusColor = (Variables, status) => {
  const found = Variables.productStatus.find(s => s.value === String(status));
  return found ? found.color : '#f87171';
};
export const getProductStatusTextColor = (Variables, status) => {
  const found = Variables.productStatus.find(s => s.value === String(status));
  return found ? found.textColor : '#000000';
};
export const getProductStatusName = (Variables, status) => {
  const found = Variables.productStatus.find(s => s.value === String(status));
  return found ? found.label : 'Unknown Status';
};

export const insuranceTypeMap = {
  1: 'Primary',
  2: 'Secondary',
  3: 'Tertiary',
  99: 'Other',
};

const PatientDetailsScreen = props => {
  const { theme } = props;
  const dimensions = useWindowDimensions();
  const navigation = useNavigation();
  const params = useParams();
  const Constants = GlobalVariables.useValues();
  const Variables = Constants;
  const setGlobalVariableValue = GlobalVariables.useSetValue();
  const [imageUri, setImageUri] = React.useState(null);
  const [openCamera, setOpenCamera] = React.useState(false);
  const [scribes_enabled, setScribes_enabled] = React.useState(false);



  const [Details, setDetails] = React.useState('');
  const [accessoriesData, setAccessoriesData] = React.useState('');
  const [appointmentOption, setAppointmentOption] = React.useState(0);
  const [appointmentStatus, setAppointmentStatus] = React.useState([
    { id: 1, label: 'Pending', value: 'pending' },
    { id: 2, label: 'Confirmed', value: 'confirmed' },
    { id: 3, label: 'In Progress', value: 'in_progress' },
    { id: 4, label: 'Completed', value: 'completed' },
    { id: 5, label: 'Cancelled', value: 'cancelled' },
    { id: 6, label: 'Rescheduled', value: 'rescheduled' },
    { id: 7, label: 'No Show', value: 'no_show' },
  ]);
  const [appointmentType, setAppointmentType] = React.useState(0);
  const [billingType, setBillingType] = React.useState(0);
  const [currentDeviceData, setCurrentDeviceData] = React.useState([]);
  const [currentDomesData, setCurrentDomesData] = React.useState([]);
  const [currentEarmoldsData, setCurrentEarmoldsData] = React.useState([]);
  const [currentReceiversData, setCurrentReceiversData] = React.useState([]);
  const [currentTubesData, setCurrentTubesData] = React.useState([]);
  const [docType, setDocType] = React.useState(0);
  const [globalTags, setGlobalTags] = React.useState([]);
  const [isLoaderVisible, setIsLoaderVisible] = React.useState(false);
  const [isPatientProfileLoading, setIsPatientProfileLoading] = React.useState(true);
  const [menuOption, setMenuOption] = React.useState(0);
  const [patientDetailsData, setPatientDetailsData] = React.useState({});
  const [productData, setProductData] = React.useState([]);
  const [reloadChart, setReloadChart] = React.useState(0);
  const [selectedID, setSelectedID] = React.useState('');
  const [selectedNoteType, setSelectedNoteType] = React.useState('');
  const [selectedTag, setSelectedTag] = React.useState('');
  const [selectedTags, setSelectedTags] = React.useState([]);
  const [taskType, setTaskType] = React.useState(0);
  const [checkboxValue, setCheckboxValue] = React.useState(false);
  const [profilePic, setProfilePic] = React.useState('');
  const [boxAccessToken, setBoxAccessToken] = useState('');
  const [items, setItems] = useState([]);
  const [itemsMoves, setItemsMoves] = useState([]);
  const [documentData, setDocumentData] = useState({});
  const [documentID, setDocumentID] = useState([]);
  const [documentNames, setDocumentNames] = useState([]);
  const [billingData, setBillingData] = React.useState([]);
  const [insurancePoliciesData, setInsurancePoliciesData] = React.useState([]);
  const [loadingEdocs, setLoadingEdocs] = React.useState(false);
  const [selectedPreviewMain, setSelectedPreviewMain] = React.useState(true);
  const [selectedSOAPMain, setSelectedSOAPMain] = React.useState(true);
  const [selectedChartNoteMain, setSelectedChartNoteMain] = React.useState(true);
  const [menuEdocShow, setMenuEdocShow] = React.useState(false);
  const [selectedEdocItem, setSelectedEdocItem] = React.useState({});
  const [newName, setNewName] = React.useState('');
  const [isRenameFile, setIsRenameFile] = React.useState(false);
  const [nameEdocShow, setNameEdocShow] = React.useState(false);
  const [edocFilePath, setEdocFilePath] = React.useState('');
  const [folderNameModel, setFolderNameModel] = React.useState(false);
  const [folderName, setFolderName] = React.useState('');
  const [selectedFolder, setSelectedFolder] = React.useState(null);
  const [showMoveModal, setShowMoveModal] = React.useState(false);
  const [documentIDMove, setDocumentIDMove] = useState([]);
  const [documentNamesMove, setDocumentNamesMove] = useState([]);



  // const ldClient = useLDClient();
  // React.useEffect(() => {
  //   const getFlag = async () => {
  //     if (!ldClient) return;

  //     const value = await ldClient.boolVariation(
  //       'medicalScribe',   // flag key
  //       false              // default value
  //     );

  //     console.log('medicalScribe flag:', ldClient);
  //   };

  //   getFlag();
  // }, [ldClient]);

  // const [status, setStatus] = React.useState('idle');
  const {
    status,
    transcript,
    seconds,
    amplitude,
    isConnecting,
    isPostponing,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    showSilenceModal,
    countdown,
    postponeRecording,
    onSilenceContinue,
    prepareForNewRecording,
  } = useAmbientScribe(params?.id ?? defaultProps.id, params?.clientID ?? defaultProps.clientID, selectedSOAPMain, selectedChartNoteMain);

  const openBackCamera = async () => {
    // request permission
    try {


      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Camera permission is required.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
        exif: false,
        cameraType: 'back',     // ✅ back camera
      });

      if (!result.canceled) {
        console.log(result.assets[0].uri);
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.log(" error : ", error);
    }
  };

  const getBoxAccessToken = async () => {
    try {
      setIsLoaderVisible(true);
      setLoadingEdocs(true);

      const isConnected = await checkInternetAndProceed();
      if (!isConnected) {
        return;
      }

      // console.log("==== ", Constants.AUTH_HEADER, `${Constants.API_BASE_URL}/practices/my/box-access-token/`)
      const response = await fetch(`${Constants.API_BASE_URL}/practices/my/box-access-token/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: Constants.AUTH_HEADER,
        },
      });

      const result = await response.json();

      if (response.ok) {
        // console.log("===== result", result);
        setBoxAccessToken(result.box_access_token);
        // const name = [
        //   Constants?.UserInfo?.suffix,
        //   Constants?.UserInfo?.first_name,
        //   Constants?.UserInfo?.last_name
        // ].filter(Boolean).join(" ")
        const name = `${patientDetailsData?.full_name}`
        getDocumentFolder(result.box_access_token, patientDetailsData?.box_folder_id, name);

      } else {
        // console.log("===== result else", result);
        setLoadingEdocs(false);

      }
    } catch (err) {
      console.log('======= err :', err);
      setLoadingEdocs(false);


    } finally {
      setIsLoaderVisible(false);

      setLoading(false);
    }
  };
  const getDocumentFolderForMove = async (token, id, name, fromBack = false) => {
    try {
      setIsLoaderVisible(true);
      setLoadingEdocs(true);

      // console.log("==== ", `${Constants.API_BOX_URL}/folders/${id == '' ? patientDetailsData?.box_folder_id ?? patientDetailsData?.box_folder_id : id}?fields=id,name,type,size,parent,extension,permissions,path_collection,modified_at,created_at,modified_by,has_collaborations,is_externally_owned,item_collection,authenticated_download_url,is_download_available,representations,url,file_version,sha1,shared_link,watermark_info&direction=desc&limit=50&offset=0&sort=date`)
      const response = await fetch(`${Constants.API_BOX_URL}/folders/${id == '' ? patientDetailsData?.box_folder_id ?? patientDetailsData?.box_folder_id : id}?fields=id,name,type,size,parent,extension,permissions,path_collection,modified_at,created_at,modified_by,has_collaborations,is_externally_owned,item_collection,authenticated_download_url,is_download_available,representations,url,file_version,sha1,shared_link,watermark_info&direction=desc&limit=50&offset=0&sort=date`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok) {
        // console.log("===== result", result);
        if (!fromBack) {
          setDocumentIDMove(prev => [...prev, id == '' ? patientDetailsData?.box_folder_id ?? patientDetailsData?.box_folder_id : id]);
          // const UserName = [
          //   Constants?.UserInfo?.suffix,
          //   Constants?.UserInfo?.first_name,
          //   Constants?.UserInfo?.last_name
          // ].filter(Boolean).join(" ")
          const UserName = patientDetailsData?.full_name
          setDocumentNamesMove(prev => [...prev, name == '' ? UserName : name]);
        }
        // setDocumentData(result);
        // setItems(result.item_collection.entries);
        console.log("==== showMoveModal :", showMoveModal, result)

        // setItemsMoves(result.item_collection.entries);
        const foldersOnly = result.item_collection.entries.filter(
          (item) => item.type === 'folder'
        );

        setItemsMoves(foldersOnly);

      } else {

        // console.log("===== result else", result);
      }
    } catch (err) {

      console.log('======= err :', err);
    } finally {
      setIsLoaderVisible(false);
      setLoadingEdocs(false);

      setLoading(false);
    }
  };

  const getDocumentFolder = async (token, id, name, fromBack = false) => {
    try {
      setIsLoaderVisible(true);
      setLoadingEdocs(true);

      // console.log("==== ", `${Constants.API_BOX_URL}/folders/${id == '' ? patientDetailsData?.box_folder_id ?? patientDetailsData?.box_folder_id : id}?fields=id,name,type,size,parent,extension,permissions,path_collection,modified_at,created_at,modified_by,has_collaborations,is_externally_owned,item_collection,authenticated_download_url,is_download_available,representations,url,file_version,sha1,shared_link,watermark_info&direction=desc&limit=50&offset=0&sort=date`)
      const response = await fetch(`${Constants.API_BOX_URL}/folders/${id == '' ? patientDetailsData?.box_folder_id ?? patientDetailsData?.box_folder_id : id}?fields=id,name,type,size,parent,extension,permissions,path_collection,modified_at,created_at,modified_by,has_collaborations,is_externally_owned,item_collection,authenticated_download_url,is_download_available,representations,url,file_version,sha1,shared_link,watermark_info&direction=desc&limit=50&offset=0&sort=date`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok) {
        // console.log("===== result", result);
        if (!fromBack) {
          setDocumentID(prev => [...prev, id == '' ? patientDetailsData?.box_folder_id ?? patientDetailsData?.box_folder_id : id]);
          // const UserName = [
          //   Constants?.UserInfo?.suffix,
          //   Constants?.UserInfo?.first_name,
          //   Constants?.UserInfo?.last_name
          // ].filter(Boolean).join(" ")
          const UserName = patientDetailsData?.full_name
          setDocumentNames(prev => [...prev, name == '' ? UserName : name]);
        }
        setDocumentData(result);
        // setItems(result.item_collection.entries);
        setItems(result.item_collection.entries);


      } else {

        // console.log("===== result else", result);
      }
    } catch (err) {

      console.log('======= err :', err);
    } finally {
      setIsLoaderVisible(false);
      setLoadingEdocs(false);

      setLoading(false);
    }
  };
  const downloadDocuments = async (item) => {
    try {
      setIsLoaderVisible(true);

      // console.log("==== ", `${Constants.API_BOX_URL}/files/${item?.id}??fields=download_url`)
      const response = await fetch(`${Constants.API_BOX_URL}/files/${item?.id}?fields=download_url`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${boxAccessToken}`,
        },
      });

      const result = await response.json();

      if (response.ok) {
        // console.log("===== downloadDocuments", result);
        setIsLoaderVisible(false);

        await Linking.openURL(result.download_url);


      } else {
        // console.log("===== result else", result);
      }
    } catch (err) {
      console.log('======= err :', err);
    } finally {
      setLoading(false);
      setIsLoaderVisible(false);

    }
  };

  const handleScan = async () => {
    if (Platform.OS === 'ios') {
      const result = await scanDocument();
      const pdfPath = result.pdf;     // 📄 PDF

      setEdocFilePath(pdfPath);
      // setNameEdocShow(true)
      setTimeout(() => {
        // setIsLoaderVisible(true);
        setNameEdocShow(true)

      }, 300);
      // uploadImages(pdfPath);
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
        const scanResult = await DocumentScanner.scanDocument();
        const scannedImages = scanResult.scannedImages;
        if (!scannedImages?.length) {
          throw new Error("No images scanned");
        }
        let timeStamp = Math.floor(Date.now() / 1000);

        const outputPath = `file://${RNBlobUtil.fs.dirs.DocumentDir}/suno_${timeStamp}.pdf`;
        const pdfPath = await createPdf({
          pages: scannedImages.map((imagePath) => ({ imagePath })),
          outputPath,
        });
        console.log(`PDF created successfully at: ${pdfPath}`);
        // uploadImages(pdfPath);
        setEdocFilePath(pdfPath);
        setNameEdocShow(true)
      } catch (error) {
        console.log("Failed to create PDF:", error);
      }
    }
  };

  const isValidBoxFolderId = id =>
    id != null && String(id).trim() !== '' && String(id) !== '.';

  const resolveBoxParentId = () => {
    const lastFolderId = documentID[documentID.length - 1];
    if (isValidBoxFolderId(lastFolderId)) {
      return String(lastFolderId);
    }
    if (isValidBoxFolderId(patientDetailsData?.box_folder_id)) {
      return String(patientDetailsData.box_folder_id);
    }
    if (isValidBoxFolderId(params?.box_folder_id ?? defaultProps.box_folder_id)) {
      return String(params?.box_folder_id ?? defaultProps.box_folder_id);
    }
    return null;
  };

  const uploadImages = async (uri, name) => {

    try {
      setTimeout(() => {
        setIsLoaderVisible(true);
      }, 300);

      const apiUrl = `${Constants.API_BASE_URL}/patients/${params?.id ?? defaultProps.id}/e-documents/upload/`;
      // const filename = uri.split('/').pop() || 'document.pdf';
      const cleanFilenamefilename = `${name}.pdf`

      const filename = (cleanFilenamefilename || 'photo.pdf')
        .trim()
        .replace(/\s+\./g, '.')   // remove space before extension
        .replace(/\s+/g, '_');

      console.log("uri:", uri);
      let sizeBytes = 0
      if (Platform.OS == 'ios') {
        const responseFileSize = await fetch(uri);
        const blob = await responseFileSize.blob();

        sizeBytes = blob.size;
      } else {
        const fileStat = await RNBlobUtil.fs.stat(uri.replace("file://", ""));
        sizeBytes = fileStat.size;
      }


      // const sizeMB = sizeBytes / (1024 * 1024);

      console.log("File size (bytes):", sizeBytes);


      // if (Platform.OS === 'android') {
      //   // ✅ Android: Use RNBlobUtil
      //   console.log(`Uploading (Android) file: ${filename}`);
      //   const cleanUri = uri.replace('file://', '');

      //   const response = await RNBlobUtil.fetch(
      //     'POST',
      //     apiUrl,
      //     {
      //       'Content-Type': 'multipart/form-data',
      //       Accept: 'application/json',
      //       Authorization: Constants.AUTH_HEADER,
      //     },
      //     [
      //       {
      //         name: 'document',
      //         filename,
      //         type: 'application/pdf',
      //         data: RNBlobUtil.wrap(cleanUri),
      //       },
      //     ]
      //   );

      //   const status = response.info().status;
      //   const result = await response.json();
      //   console.log('Upload response:', status, result);

      //   if (status < 200 || status >= 300) {
      //     Alert.alert(
      //       'Upload Failed',
      //       `File ${filename} failed: ${JSON.stringify(result)}`
      //     );
      //   }

      //   setIsLoaderVisible(false);
      //   Alert.alert('Success', 'Documents uploaded successfully.', [
      //     {
      //       text: 'Ok',
      //       onPress: () => {
      //         // navigation.goBack();
      //       },
      //     },
      //   ]);


      // } else {

      const parentFolderId = resolveBoxParentId();
      if (!parentFolderId) {
        Alert.alert(
          'Upload Failed',
          'Patient document folder is not available. Please refresh patient details and try again.'
        );
        setIsLoaderVisible(false);
        return;
      }

      const parent = { id: parentFolderId };
      console.log("Raw response:", parent);


      const response = await fetch(`${Constants.API_BOX_URL}/files/content`, {
        method: 'OPTIONS',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${boxAccessToken}`,
        },
        body: JSON.stringify({ parent: parent, size: sizeBytes, name: filename || "photo.pdf", }),

      });



      if (!response.ok) {
        const result = await response.json();
        console.log("===== result : ", result)
        Alert.alert(
          'Upload Failed',
          `File name ${filename} failed:\n${result.message}`
        );
        setIsLoaderVisible(false);
        return
      }

      const resultFile = await response.json();
      const uploadPath = resultFile.upload_url;
      //       // const filename = uri.split('/').pop();


      const contentModifiedAt = new Date()
        .toISOString()
        .replace(/\.\d{3}Z$/, "Z");
      const attributes = {
        name: filename || "photo.pdf",
        parent: parent,
        content_modified_at: contentModifiedAt
      };

      const formData = new FormData();

      formData.append("attributes", JSON.stringify(attributes));

      formData.append("file", {
        uri: uri,
        name: filename || "photo.pdf",
        type: "application/pdf",
      });

      console.log("==== formData : ", formData)
      let response_UploadFile = '';

      if (Platform.OS === 'android') {
        // ✅ Android: Use RNBlobUtil
        console.log(`Uploading (Android) file: ${filename}`);
        const cleanUri = uri.replace('file://', '');

        const response = await RNBlobUtil.fetch(
          'POST',
          uploadPath,
          {
            Authorization: `Bearer ${boxAccessToken}`,
            'Content-Type': 'multipart/form-data',
          },
          [
            {
              name: 'attributes',
              data: JSON.stringify(attributes),
            },
            {
              name: 'file',
              filename: filename,
              type: 'application/pdf',
              data: RNBlobUtil.wrap(cleanUri),
            },
          ]
        );

        // const status = response.info().status;
        // const result = await response.json();

        const status = response.info().status;
        const result = await response.json();
        console.log('Upload response:', status, result);

        if (status < 200 || status >= 300) {
          Alert.alert(
            'Upload Failed',
            `File ${filename} failed: ${JSON.stringify(result)}`
          );
          setIsLoaderVisible(false);
          return
        }

        setIsLoaderVisible(false);

        Alert.alert('Success', 'Documents uploaded successfully.', [
          {
            text: 'Ok',
            onPress: () => {
              const lastItem = documentID[documentID.length - 1];
              const lastIteName = documentNames[documentNames.length - 1];
              getDocumentFolder(
                boxAccessToken,
                lastItem,
                lastIteName,
                true

              );
            },
          },
        ]);


      } else {
        response_UploadFile = await fetch(
          `${uploadPath}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${boxAccessToken}`,
            },
            body: formData,
          }
        );



        const result = await response_UploadFile.json();
        console.log(`Result for ${uploadPath}:`, result);


        if (!response_UploadFile.ok) {
          Alert.alert(
            'Upload Failed',
            `File ${filename} failed: ${JSON.stringify(response_UploadFile)}`
          );
          setIsLoaderVisible(false);
          return
        }

        setIsLoaderVisible(false);


        Alert.alert('Success', 'Documents uploaded successfully.', [
          {
            text: 'Ok',
            onPress: () => {
              const lastIteName = documentNames[documentNames.length - 1];
              getDocumentFolder(
                boxAccessToken,
                lastItem,
                lastIteName,
                true
              );
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

  const uploadImagesMainFolder = async (uri, name) => {

    try {
      setTimeout(() => {
        setIsLoaderVisible(true);
      }, 300);

      const apiUrl = `${Constants.API_BASE_URL}/patients/${params?.id ?? defaultProps.id}/e-documents/upload/`;
      // const filename = uri.split('/').pop() || 'document.pdf';
      const cleanFilenamefilename = `${name}.pdf`

      const filename = (cleanFilenamefilename || 'photo.pdf')
        .trim()
        .replace(/\s+\./g, '.')   // remove space before extension
        .replace(/\s+/g, '_');


      if (Platform.OS === 'android') {
        // ✅ Android: Use RNBlobUtil
        console.log(`Uploading (Android) file: ${filename}`);
        const cleanUri = uri.replace('file://', '');

        const response = await RNBlobUtil.fetch(
          'POST',
          apiUrl,
          {
            'Content-Type': 'multipart/form-data',
            Accept: 'application/json',
            Authorization: Constants.AUTH_HEADER,
          },
          [
            {
              name: 'document',
              filename,
              type: 'application/pdf',
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
            `File ${filename} failed: ${JSON.stringify(result)}`
          );
          setIsLoaderVisible(false);
          return
        }

        setIsLoaderVisible(false);

        Alert.alert('Success', 'Documents uploaded successfully.', [
          {
            text: 'Ok',
            onPress: () => {
              const lastItem = documentID[documentID.length - 1];
              const lastIteName = documentNames[documentNames.length - 1];
              getDocumentFolder(
                boxAccessToken,
                lastItem,
                lastIteName,
                true
              );
            },
          },
        ]);


      } else {


        // const filename = uri.split('/').pop();
        const type = 'application/pdf';

        const formData = new FormData();
        formData.append('document', {
          uri,
          name: filename || `photo.pdf`,
          type,
        });

        console.log(
          `Uploading file ${filename}`
        );

        const response = await fetch(
          `${Constants.API_BASE_URL}/patients/${params?.id ?? defaultProps.id}/e-documents/upload/`,
          {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              Authorization: Constants.AUTH_HEADER,
            },
            body: formData,
          }
        );

        const result = await response.json();
        console.log(`Result for ${filename}:`, result);

        if (!response.ok) {
          Alert.alert(
            'Upload Failed',
            `File ${filename} failed: ${JSON.stringify(result)}`
          );
          setIsLoaderVisible(false);
          return;
        }

        setIsLoaderVisible(false);

        Alert.alert('Success', 'Documents uploaded successfully.', [
          {
            text: 'Ok',
            onPress: () => {
              const lastItem = documentID[documentID.length - 1];
              const lastIteName = documentNames[documentNames.length - 1];
              getDocumentFolder(
                boxAccessToken,
                lastItem,
                lastIteName,
                true
              );
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

  // const getProductDataByType = (type, subtype, data) => {
  //   return data.filter(item => {
  //     const master = item.inventory_product?.product?.master_product;

  //     if (subtype === '') {
  //       return master?.type === type;
  //     }
  //     // console.log("===== deviceData :", master)

  //     return master?.type === type && master?.subtype === subtype;
  //   });
  // };

  const getProductDataByType = (type, subtype, data) => {
    return data.filter(item => {
      const master = item.inventory_product?.product?.master_product;

      // ✅ Fallback to item level if inventory_product is null
      const itemType = master?.type ?? item.type;
      const itemSubtype = master?.subtype ?? item.subtype;

      if (subtype === '') {
        return itemType === type;
      }

      return itemType === type && itemSubtype === subtype;
    });
  };


  const getRelationShip = relationID => {
    const relationships = [
      'Spouse',
      'Sibling',
      'Parent',
      'Child',
      'Partner',
      'Caregiver',
      'Other',
    ];
    return relationID >= 1 && relationID <= relationships.length
      ? relationships[relationID - 1]
      : 'Other';
  };

  const getTaskPriority = (Variables, status) => {
    const found = Variables.taskStatus.find(s => s.value === String(status));
    return found ? found.label : 'Not Set';
  };

  const getTaskPriorityColor = (Variables, status) => {
    const found = Variables.taskStatus.find(s => s.value === String(status));
    return found ? found.color : '#bfc2c1';
  };
  const sunoDeleteNoteDELETE = SunoApi.useDeleteNoteDELETE();
  const sunoUpdateNoteStatusPATCH = SunoApi.useUpdateNoteStatusPATCH();
  const isFocused = useIsFocused();
  const loadPatientProfile = React.useCallback(async ({ showLoader = true } = {}) => {
    try {
      if (showLoader) {
        setIsPatientProfileLoading(true);
      }
      const isConnected = await checkInternetAndProceed();
      if (!isConnected) {
        return;
      }

      const response = await fetch(`${Constants.API_BASE_URL}/auth/users/me/features/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: Constants.AUTH_HEADER,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const userData = await response.json();
      const ScribesActive = userData?.ambient_scribe_users?.active;
      setScribes_enabled(ScribesActive);

      const patientData = (
        await SunoApi.patientDeatilGET(Constants, {
          id: params?.id ?? defaultProps.id,
        })
      )?.json;

      setPatientDetailsData(patientData);
      setProfilePic(patientData?.photo);
    } catch (err) {
      logError(err);
    } finally {
      if (showLoader) {
        setIsPatientProfileLoading(false);
      }
    }
  }, [Constants, params?.id]);

  React.useEffect(() => {
    if (!isFocused) {
      return;
    }
    prepareForNewRecording();
    loadPatientProfile();
  }, [isFocused, loadPatientProfile, prepareForNewRecording]);

  const formatAddress = (data) => {
    if (!data) return "";

    const parts = [
      data.street_address_1,
      data.street_address_2,
      data.city,
      data.state,
      data.zip_code,
      data.country,
    ];

    // Keep only non-empty values and join with comma + space
    return parts.filter(Boolean).join(", ");
  };

  const checkCameraPermission = async () => {
    const permission = await Camera.getCameraPermissionsAsync();

    if (permission.granted) {
      console.log("Camera permission already granted");
      return true;
    } else {
      console.log("Camera permission NOT granted");

      // request permission
      const newPermission = await Camera.requestCameraPermissionsAsync();
      return newPermission.granted;
    }
  };

  const BreadcrumbMove = ({ data }) => {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 12,
          alignItems: 'center',
          // paddingVertical: 15,
          // marginVertical : 15
          minHeight: 60,
          paddingBottom: 8
        }}
      >
        {data.map((item, index) => {
          const isLast = index === data.length - 1;


          return (
            <View key={item} style={{
              flexDirection: 'row',
              alignItems: 'center'
            }}>
              <TouchableOpacity
                disabled={isLast} // optional: disable click on last item
                onPress={() => {


                  setDocumentIDMove(prev => {
                    const updatedIDs = prev.slice(0, index + 1);
                    const lastDocumentID = updatedIDs.at(-1);

                    // 🔥 Call API with the CORRECT ID
                    getDocumentFolderForMove(
                      boxAccessToken,
                      lastDocumentID,
                      documentNamesMove[index],
                      true
                    );

                    return updatedIDs;
                  });

                  setDocumentNamesMove(prev => prev.slice(0, index + 1));

                }}


              >
                <Text
                  style={[
                    {
                      fontSize: 16,
                      color: '#6B7280',
                      maxWidth: 200,
                    },
                    index === data.length - 1 && {
                      color: '#111827',
                      fontWeight: '600',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {item}
                </Text>
              </TouchableOpacity>

              {index !== data.length - 1 && (
                <Text style={{
                  marginHorizontal: 6,
                  fontSize: 20,
                  color: '#9CA3AF',
                }}>›</Text>
              )}
            </View>
          )
        })}

      </ScrollView>
    );
  };

  const Breadcrumb = ({ data }) => {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 12,
          alignItems: 'center',
          paddingVertical: 15,
        }}
      >
        {data.map((item, index) => {
          const isLast = index === data.length - 1;


          return (
            <View key={item} style={{
              flexDirection: 'row',
              alignItems: 'center'
            }}>
              <TouchableOpacity
                disabled={isLast} // optional: disable click on last item
                onPress={() => {


                  setDocumentID(prev => {
                    const updatedIDs = prev.slice(0, index + 1);
                    const lastDocumentID = updatedIDs.at(-1);

                    // 🔥 Call API with the CORRECT ID
                    getDocumentFolder(
                      boxAccessToken,
                      lastDocumentID,
                      documentNames[index],
                      true
                    );

                    return updatedIDs;
                  });

                  setDocumentNames(prev => prev.slice(0, index + 1));

                }}


              >
                <Text
                  style={[
                    {
                      fontSize: 16,
                      color: '#6B7280',
                      maxWidth: 200,
                    },
                    index === data.length - 1 && {
                      color: '#111827',
                      fontWeight: '600',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {item}
                </Text>
              </TouchableOpacity>

              {index !== data.length - 1 && (
                <Text style={{
                  marginHorizontal: 6,
                  fontSize: 20,
                  color: '#9CA3AF',
                }}>›</Text>
              )}
            </View>
          )
        })}

      </ScrollView>
    );
  };
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024; // 1 KB = 1024 Bytes
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    const size = (bytes / Math.pow(k, i)).toFixed(2);
    return `${size} ${sizes[i]}`;
  }
  const renderFolderItemOld = item => {
    console.log('===== item :  ', item);

    if (item.type !== 'folder') return null;

    return (
      <TouchableOpacity
        onPress={() => setSelectedFolder(item)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 14,
          borderBottomWidth: 1,
          borderColor: '#eee'
        }}
      >
        {/* Folder Icon */}
        <Icon
          name="Entypo/folder"
          size={22}
          color="#2687FC"
        />

        {/* Folder Info */}
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '500' }}>
            {item.name}
          </Text>

          <Text style={{ fontSize: 12, color: '#666', marginTop: 3 }}>
            {DateUtils.format(item.modified_at, 'MMM DD YYYY')} • {formatFileSize(item.size)}
          </Text>
        </View>

        {/* Radio Button */}
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 11,
            borderWidth: 2,
            borderColor: selectedFolder === item.id ? '#2687FC' : '#ccc',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {selectedFolder === item.id && (
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: '#2687FC'
              }}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };
  const renderFolderItem = selectedData => {


    // console.log('===== item : , ', selectedData);
    const item = selectedData.item;
    if (item.type !== 'folder') return null;

    // ?.key ,selectedDate, item?.fullData.type == 'S' ? item.fullData.title : item?.fullData.extra.appointment_type.name);
    // const imgName = item.extension === 'pdf' ? 'file-pdf-box' : item.extension === 'png' ? 'file-png-box' : item.extension === 'jpg' ||  item.extension === 'jpeg' ? 'file-jpg-box' : item.extension === 'gif' ? 'file-gif-box' :  'file'
    const imgName = item.extension === 'pdf' ? 'Ionicons/document-text'
      : 'MaterialCommunityIcons/image'
    const imgColor = item.extension === 'pdf' ? '#dc2626' : '#2563eb';
    return (
      <View style={{ backgroundColor: '#fff', paddingHorizontal: 15, }}>

        <Surface
          {...GlobalStyles.SurfaceStyles(theme)[
            'Surface'
          ].props}
          elevation={1}
          style={StyleSheet.applyWidth(
            StyleSheet.compose(
              GlobalStyles.SurfaceStyles(theme)[
                'Surface'
              ].style,
              {
                borderColor: palettes.App.TagBorder,
                borderRadius: 10,
                borderWidth: 1,
                marginBottom: 15,
              }
            ),
            dimensions.width
          )}
        >
          <TouchableOpacity onPress={() => {
            if (item.type == 'folder') {
              getDocumentFolderForMove(boxAccessToken, item.id, item.name)
            } else {
              downloadDocuments(item)
            }
          }}>
            {/* View 2 */}
            <View
              style={StyleSheet.applyWidth(
                {
                  alignItems: 'center',
                  backgroundColor:
                    palettes.App['Custom Color_15'],
                  borderRadius: 10,
                  flex: 1,
                  flexDirection: 'row',
                  paddingLeft: 8,
                  paddingRight: 8,
                },
                dimensions.width
              )}
            >

              {item.type == 'folder' ?
                <Icon
                  size={24}
                  name={'Entypo/folder'}
                  color="#2687FC"
                // style={{ marginLeft: 5 }}
                />
                :
                <Icon
                  size={24}
                  name={`${imgName}`}
                  // color="#1F2937FF"
                  color={imgColor}
                />
              }
              <View
                style={StyleSheet.applyWidth(
                  {
                    backgroundColor:
                      palettes.App['Custom Color_15'],
                    borderBottomLeftRadius: 10,
                    borderBottomRightRadius: 10,
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10,
                    flex: 1,
                    flexDirection: 'row',
                    paddingBottom: 10,
                    paddingLeft: 10,
                    paddingRight: 15,
                    paddingTop: 10,
                  },
                  dimensions.width
                )}
              >
                {/* Details */}
                <View
                  style={StyleSheet.applyWidth(
                    { flex: 1 },
                    dimensions.width
                  )}
                >
                  <View
                    style={StyleSheet.applyWidth(
                      {
                        alignItems: 'center',
                        flexDirection: 'row',
                        justifyContent:
                          'space-between',
                      },
                      dimensions.width
                    )}
                  >
                    {/* Name */}
                    <Text
                      accessible={true}
                      selectable={false}
                      style={StyleSheet.applyWidth(
                        {
                          color:
                            palettes.App[
                            'Custom Color_18'
                            ],
                          fontFamily:
                            'Inter_500Medium',
                          fontSize: 16,
                        },
                        dimensions.width
                      )}
                    >
                      {item?.name}
                    </Text>
                  </View>
                  {/* timestamp */}
                  <Text
                    accessible={true}
                    selectable={false}
                    style={StyleSheet.applyWidth(
                      {
                        color:
                          palettes.App[
                          'Custom Color_18'
                          ],
                        fontFamily:
                          'Inter_400Regular',
                        fontSize: 12,
                        marginTop: 8,
                        opacity: 0.7,
                      },
                      dimensions.width
                    )}
                  >
                    {DateUtils.format(
                      item?.created_at,
                      'MM/DD/YYYY'
                    )}
                    {' • '}
                    {formatFileSize(item?.size)}
                    {' • Modified by: '}
                    {item?.modified_by?.name}
                  </Text>
                </View>
              </View>
              {/* {item.type != 'folder' && */}


              <IconButton
                color={selectedFolder.id === item.id ? '#4b5563' :
                  '#4b5563' ??
                  palettes.App['Custom Color']
                }
                icon={selectedFolder.id === item.id ? 'Ionicons/radio-button-on-sharp' : 'Ionicons/radio-button-off-sharp'} //download
                size={28}
                // onPress={() => { downloadDocuments(item) }}
                onPress={() => {
                  setSelectedFolder(item)
                }}

              />
              {/* } */}

            </View>
          </TouchableOpacity>
        </Surface>


        {/* {item.type == 'folder' ?
        <Surface
                                  elevation={3}
                                  styles={{
                                      border: 1,
                                      borderRadius: 12,
                                      flex: 1,
                  shadowColor: 'rgb(80, 95, 122)',
                  shadowOpacity: 0.1,
                  shadowOffset: { width: 0, height: 2 },
                  shadowRadius: 6,
                  elevation: 3,
                  borderColor: 'rgb(80, 95, 122)',
                                    }
                                  }
                                >
          <TouchableOpacity
            style={{}}
            onPress={() => {
              // setSelectedItem(item.fullData);
              // setModalVisible(true);
            }}
          >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 10,
                  

                }}
              >
                <View
                style={{
                  flexDirection: 'row',
                  // justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: 5,
                  flex : 1,
                }}
              >
                {item.type == 'folder' ?
                <Icon
                      size={25}
                      name={ 'Entypo/folder'}
                      color="#1F2937FF"
                      style={{ marginLeft: 5 }}
                    />
:

<Icon
                      size={40}
                      name={`${imgName}`}
                      // color="#1F2937FF"
                      color={imgColor}
                      style={{ marginLeft: 5 }}
                    />
                }
                <View
                  style={{
                    // flexDirection: 'row',
                    // alignItems: 'center',
                    paddingLeft: 10,
                    paddingRight: 50,
                  }}
                >
                  <Text
                    style={{
                      color: '#1F2937FF',
                     
                    }}
                    numberOfLines={3} 
                  >
                    {item.name}
                  </Text>
                 
                  {item.modified_by?.name.length > 0 && (
                    <Text
                      style={{
                        fontSize: 13,
                        paddingTop: 3,
                        color: '#889099FF',
                      }}
                    >
                      {item.modified_by?.name}
                    </Text>
                  )}
                   </View>
                   </View>
                    <Text
                      style={{
                        fontSize: 13,
                        paddingLeft: 10,
                        color: '#889099FF',
                      }}
                    > {formatFileSize(item.size)}
                    </Text>
              </View>

             
          </TouchableOpacity>
          </Surface>
        :  */}


      </View>
    );
  };
  const renderAgendaItem = selectedData => {


    // console.log('===== item : , ', selectedData);
    const item = selectedData.item;
    // ?.key ,selectedDate, item?.fullData.type == 'S' ? item.fullData.title : item?.fullData.extra.appointment_type.name);
    // const imgName = item.extension === 'pdf' ? 'file-pdf-box' : item.extension === 'png' ? 'file-png-box' : item.extension === 'jpg' ||  item.extension === 'jpeg' ? 'file-jpg-box' : item.extension === 'gif' ? 'file-gif-box' :  'file'
    const imgName = item.extension === 'pdf' ? 'Ionicons/document-text'
      : 'MaterialCommunityIcons/image'
    const imgColor = item.extension === 'pdf' ? '#dc2626' : '#2563eb';
    return (
      <View style={{ backgroundColor: '#fff', paddingHorizontal: 15, }}>

        <Surface
          {...GlobalStyles.SurfaceStyles(theme)[
            'Surface'
          ].props}
          elevation={1}
          style={StyleSheet.applyWidth(
            StyleSheet.compose(
              GlobalStyles.SurfaceStyles(theme)[
                'Surface'
              ].style,
              {
                borderColor: palettes.App.TagBorder,
                borderRadius: 10,
                borderWidth: 1,
                marginBottom: 15,
              }
            ),
            dimensions.width
          )}
        >
          <TouchableOpacity onPress={() => {
            if (item.type == 'folder') {
              getDocumentFolder(boxAccessToken, item.id, item.name)
            } else {
              downloadDocuments(item)
            }
          }}>
            {/* View 2 */}
            <View
              style={StyleSheet.applyWidth(
                {
                  alignItems: 'center',
                  backgroundColor:
                    palettes.App['Custom Color_15'],
                  borderRadius: 10,
                  flex: 1,
                  flexDirection: 'row',
                  paddingLeft: 8,
                  paddingRight: 8,
                },
                dimensions.width
              )}
            >

              {item.type == 'folder' ?
                <Icon
                  size={24}
                  name={'Entypo/folder'}
                  color="#2687FC"
                // style={{ marginLeft: 5 }}
                />
                :
                <Icon
                  size={24}
                  name={`${imgName}`}
                  // color="#1F2937FF"
                  color={imgColor}
                />
              }
              <View
                style={StyleSheet.applyWidth(
                  {
                    backgroundColor:
                      palettes.App['Custom Color_15'],
                    borderBottomLeftRadius: 10,
                    borderBottomRightRadius: 10,
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10,
                    flex: 1,
                    flexDirection: 'row',
                    paddingBottom: 10,
                    paddingLeft: 10,
                    paddingRight: 15,
                    paddingTop: 10,
                  },
                  dimensions.width
                )}
              >
                {/* Details */}
                <View
                  style={StyleSheet.applyWidth(
                    { flex: 1 },
                    dimensions.width
                  )}
                >
                  <View
                    style={StyleSheet.applyWidth(
                      {
                        alignItems: 'center',
                        flexDirection: 'row',
                        justifyContent:
                          'space-between',
                      },
                      dimensions.width
                    )}
                  >
                    {/* Name */}
                    <Text
                      accessible={true}
                      selectable={false}
                      style={StyleSheet.applyWidth(
                        {
                          color:
                            palettes.App[
                            'Custom Color_18'
                            ],
                          fontFamily:
                            'Inter_500Medium',
                          fontSize: 16,
                        },
                        dimensions.width
                      )}
                    >
                      {item?.name}
                    </Text>
                  </View>
                  {/* timestamp */}
                  <Text
                    accessible={true}
                    selectable={false}
                    style={StyleSheet.applyWidth(
                      {
                        color:
                          palettes.App[
                          'Custom Color_18'
                          ],
                        fontFamily:
                          'Inter_400Regular',
                        fontSize: 12,
                        marginTop: 8,
                        opacity: 0.7,
                      },
                      dimensions.width
                    )}
                  >
                    {DateUtils.format(
                      item?.created_at,
                      'MM/DD/YYYY'
                    )}
                    {' • '}
                    {formatFileSize(item?.size)}
                    {' • Modified by: '}
                    {item?.modified_by?.name}
                  </Text>
                </View>
              </View>
              {/* {item.type != 'folder' && */}


              <IconButton
                color={
                  '#4b5563' ??
                  palettes.App['Custom Color']
                }
                icon={'Feather/more-vertical'} //download
                size={28}
                // onPress={() => { downloadDocuments(item) }}
                onPress={() => {
                  setMenuEdocShow(true)
                  setSelectedEdocItem(item)
                }}

              />
              {/* } */}

            </View>
          </TouchableOpacity>
        </Surface>


        {/* {item.type == 'folder' ?
        <Surface
                                  elevation={3}
                                  styles={{
                                      border: 1,
                                      borderRadius: 12,
                                      flex: 1,
                  shadowColor: 'rgb(80, 95, 122)',
                  shadowOpacity: 0.1,
                  shadowOffset: { width: 0, height: 2 },
                  shadowRadius: 6,
                  elevation: 3,
                  borderColor: 'rgb(80, 95, 122)',
                                    }
                                  }
                                >
          <TouchableOpacity
            style={{}}
            onPress={() => {
              // setSelectedItem(item.fullData);
              // setModalVisible(true);
            }}
          >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 10,
                  

                }}
              >
                <View
                style={{
                  flexDirection: 'row',
                  // justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: 5,
                  flex : 1,
                }}
              >
                {item.type == 'folder' ?
                <Icon
                      size={25}
                      name={ 'Entypo/folder'}
                      color="#1F2937FF"
                      style={{ marginLeft: 5 }}
                    />
:

<Icon
                      size={40}
                      name={`${imgName}`}
                      // color="#1F2937FF"
                      color={imgColor}
                      style={{ marginLeft: 5 }}
                    />
                }
                <View
                  style={{
                    // flexDirection: 'row',
                    // alignItems: 'center',
                    paddingLeft: 10,
                    paddingRight: 50,
                  }}
                >
                  <Text
                    style={{
                      color: '#1F2937FF',
                     
                    }}
                    numberOfLines={3} 
                  >
                    {item.name}
                  </Text>
                 
                  {item.modified_by?.name.length > 0 && (
                    <Text
                      style={{
                        fontSize: 13,
                        paddingTop: 3,
                        color: '#889099FF',
                      }}
                    >
                      {item.modified_by?.name}
                    </Text>
                  )}
                   </View>
                   </View>
                    <Text
                      style={{
                        fontSize: 13,
                        paddingLeft: 10,
                        color: '#889099FF',
                      }}
                    > {formatFileSize(item.size)}
                    </Text>
              </View>

             
          </TouchableOpacity>
          </Surface>
        :  */}


      </View>
    );
  };
  const renderPatientProductInfoRow = (label, value, isLast = false) => (
    <View
      style={{
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: isLast ? 0 : 8,
      }}
    >
      <Text
        accessible={true}
        selectable={false}
        style={StyleSheet.applyWidth(
          {
            color: '#667085',
            fontFamily: 'Inter_500Medium',
            fontSize: 11,
            textTransform: 'uppercase',
          },
          dimensions.width
        )}
      >
        {label}
      </Text>
      <Text
        accessible={true}
        selectable={false}
        numberOfLines={1}
        style={StyleSheet.applyWidth(
          {
            color: '#101828',
            flex: 1,
            fontFamily: 'Inter_500Medium',
            fontSize: 13,
            marginLeft: 12,
            textAlign: 'right',
          },
          dimensions.width
        )}
      >
        {value}
      </Text>
    </View>
  );

  const getAccessorySubtypeLabel = subtype => {
    const subtypeMap = {
      1: 'Receiver',
      2: 'Earmold',
      3: 'Tube',
      4: 'Dome',
      5: 'Battery',
      6: 'Charger',
      9: 'Remote',
      999: 'Other',
    };
    if (subtype == null || subtype === '' || subtype === 'null') {
      return 'None';
    }
    return subtypeMap[Number(subtype)] || 'Other';
  };

  const renderPatientProductCard = (item, options = {}) => {
    const showFullDetails = options.showFullDetails === true;
    const isAccessoriesSection = options.sectionTitle === 'Accessories';
    const displayName =
      item?.inventory_product?.product?.display_name || 'Existing Hearing Aid';
    const subtypeValue =
      item?.subtype ??
      item?.inventory_product?.product?.master_product?.subtype;
    const typeLabel = isAccessoriesSection
      ? getAccessorySubtypeLabel(subtypeValue)
      : item?.type === 2
        ? 'Hearing Aid'
        : item?.type === 3
          ? 'Accessory'
          : displayName;
    const showEar = !isAccessoriesSection && item?.ear && item?.ear !== 'N';
    const serialLabel = item?.serial_number || '-';
    const returnDueLabel = item?.due_date
      ? DateUtils.format(item?.due_date, 'MMM DD, YYYY')
      : '-';
    const invoiceDateLabel = item?.sale?.service_date
      ? DateUtils.format(item?.sale?.service_date, 'MMM DD, YYYY')
      : '-';
    const mfrWarrantyLabel = item?.manufacturer_warranty_expiration_date
      ? DateUtils.format(item.manufacturer_warranty_expiration_date, 'MMM DD, YYYY')
      : '-';
    const deliveryLabel = item?.delivered_at_display
      ? moment(item.delivered_at_display, 'MM/DD/YYYY').format('MMM DD, YYYY')
      : '-';
    const servicePlanLabel = item?.service_plan_expiration_date
      ? DateUtils.format(item.service_plan_expiration_date, 'MMM DD, YYYY')
      : '-';

    return (
      <Surface
        key={item?.id}
        elevation={0}
        {...GlobalStyles.SurfaceStyles(theme)['Surface'].props}
        style={StyleSheet.applyWidth(
          StyleSheet.compose(GlobalStyles.SurfaceStyles(theme)['Surface'].style, {
            borderColor: '#E4E7EC',
            borderRadius: 14,
            borderWidth: 1,
            marginBottom: 12,
            overflow: 'hidden',
          }),
          dimensions.width
        )}
      >
        <TouchableOpacity
          onPress={() => {
            try {
              navigation.navigate(
                'ViewHearingAidsScreen',
                {
                  hearingAidsData: item,
                  patientID: params?.id ?? defaultProps.id,
                  sectionTitle: options.sectionTitle,
                },
                { pop: true }
              );
            } catch (err) {
              logError(err);
            }
          }}
          style={StyleSheet.applyWidth(
            {
              backgroundColor: '#FFFFFF',
              paddingBottom: 14,
              paddingLeft: 14,
              paddingRight: 14,
              paddingTop: 14,
            },
            dimensions.width
          )}
        >
          <View
            style={{
              alignItems: 'flex-start',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flex: 1, paddingRight: 10 }}>
              <View style={{ alignItems: 'center', flexDirection: 'row' }}>
                {isAccessoriesSection ? null : (
                  <View
                    style={{
                      alignItems: 'center',
                      backgroundColor: '#F2F4F7',
                      borderRadius: 18,
                      height: 36,
                      justifyContent: 'center',
                      width: 36,
                    }}
                  >
                    <Icon
                      color={'#253144'}
                      name={
                        showEar
                          ? 'Ionicons/ear-outline'
                          : 'MaterialCommunityIcons/hearing-aid'
                      }
                      size={18}
                      style={{
                        transform: [{ scaleX: item?.ear === 'R' ? -1 : 1 }],
                      }}
                    />
                  </View>
                )}
                <View
                  style={{
                    flex: 1,
                    paddingLeft: isAccessoriesSection ? 0 : 10,
                  }}
                >
                  <Text
                    accessible={true}
                    selectable={false}
                    numberOfLines={2}
                    style={StyleSheet.applyWidth(
                      {
                        color: '#101828',
                        fontFamily: 'Inter_600SemiBold',
                        fontSize: 15,
                        lineHeight: 20,
                      },
                      dimensions.width
                    )}
                  >
                    {displayName}
                  </Text>
                  <Text
                    accessible={true}
                    selectable={false}
                    style={StyleSheet.applyWidth(
                      {
                        color: '#667085',
                        fontFamily: 'Inter_400Regular',
                        fontSize: 12,
                        marginTop: 3,
                      },
                      dimensions.width
                    )}
                  >
                    {isAccessoriesSection
                      ? `Type: ${typeLabel}`
                      : `${showEar ? `${item?.ear === 'R' ? 'Right' : 'Left'} • ` : ''}${typeLabel}`}
                  </Text>
                </View>
              </View>
            </View>

            <Touchable
              onPress={() => {
                try {
                  navigation.navigate(
                    'EditHearingAidScreen',
                    {
                      hearingAidsData: item,
                      patientID: params?.id ?? defaultProps.id,
                      sectionTitle: options.sectionTitle,
                    },
                    { pop: true }
                  );
                } catch (err) {
                  logError(err);
                }
              }}
            >
              <View
                style={{
                  alignItems: 'center',
                  backgroundColor: '#E8F5F3',
                  borderRadius: 9,
                  height: 36,
                  justifyContent: 'center',
                  width: 36,
                }}
              >
                <Icon
                  color={theme.colors.branding.secondary}
                  name={'Feather/edit-2'}
                  size={16}
                />
              </View>
            </Touchable>
          </View>

          <View style={{ marginTop: 12 }}>
            <View
              style={{
                alignSelf: 'flex-start',
                backgroundColor: getProductStatusColor(Variables, item?.status),
                borderRadius: 999,
                paddingHorizontal: 10,
                paddingVertical: 6,
              }}
            >
              <Text
                accessible={true}
                selectable={false}
                style={StyleSheet.applyWidth(
                  {
                    color: getProductStatusTextColor(Variables, item?.status),
                    fontFamily: 'Inter_500Medium',
                    fontSize: 11,
                  },
                  dimensions.width
                )}
              >
                {getProductStatusName(Variables, item?.status)}
              </Text>
            </View>
          </View>

          <View
            style={{
              backgroundColor: '#F8FAFC',
              borderRadius: 12,
              marginTop: 12,
              paddingHorizontal: 12,
              paddingVertical: 10,
            }}
          >
            {renderPatientProductInfoRow('Serial No', serialLabel)}
            {renderPatientProductInfoRow(
              isAccessoriesSection ? 'Invoice Date' : 'Return Due',
              isAccessoriesSection ?  invoiceDateLabel  : returnDueLabel,
              
              !showFullDetails
            )}
            {showFullDetails ? (
              <>
                {renderPatientProductInfoRow('MFR Warranty', mfrWarrantyLabel)}
                {renderPatientProductInfoRow('Delivery Date', deliveryLabel)}
                {renderPatientProductInfoRow(
                  'Service Plan',
                  servicePlanLabel,
                  true
                )}
              </>
            ) : null}
          </View>
        </TouchableOpacity>
      </Surface>
    );
  };

  const renderPatientProductSection = (title, data, emptyMessage, iconName) => (
    <>
      <HeaderEventsBlock
        header_name={title}
        icon_name={iconName}
        rightTextVisible={true}
      />
      <View
        style={StyleSheet.applyWidth(
          { paddingLeft: 20, paddingRight: 20 , paddingTop: 10},
          dimensions.width
        )}
      >
        <View
          style={StyleSheet.applyWidth(
            { borderRadius: 12, overflow: 'hidden' },
            dimensions.width
          )}
        >
          {data?.length
            ? data.map(item =>
                renderPatientProductCard(item, { sectionTitle: title })
              )
            : <EmptyListBlock message={emptyMessage} />}
        </View>
      </View>
    </>
  );

  const tabData = [
    { speciality: 'Overview' },
    { speciality: 'E-Docs' },
    { speciality: 'Billing' },
    { speciality: 'Scribes' }, //Capture Visit
    { speciality: 'Tasks' }, 
    { speciality: 'Insurance Policies' },
    { speciality: 'Devices' }

  ];
  return (
    <ScreenContainer scrollable={false} hasSafeArea={true}>
      <CustomChildHeaderBlock name={'Patient Profile'} />
      <CameraModal
        visible={openCamera}
        onClose={() => setOpenCamera(false)}
        onCapture={async (img) => {
          console.log("Captured image:", img);
          // setImageUri(img);     // Save captured image

          try {
            setTimeout(() => {
              setIsLoaderVisible(true);
            }, 300);

            const apiUrl = `${Constants.API_BASE_URL}/patients/${params?.id ?? defaultProps.id}/`;
            console.log("apiUrl", apiUrl);

            const filename = img?.uri.split('/').pop() || `${params?.id ?? defaultProps.id}.jpg`;

            // ✅ Android: Use RNBlobUtil
            console.log(`Uploading (Android) file: ${filename}`);
            const cleanUri = img.uri.replace('file://', '');

            const response = await RNBlobUtil.fetch(
              'PATCH',
              apiUrl,
              {
                'Content-Type': 'multipart/form-data',
                Accept: 'application/json',
                Authorization: Constants.AUTH_HEADER,
              },
              [
                {
                  name: 'photo',
                  filename,
                  type: 'application/jpg',
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
                `File ${filename} failed: ${JSON.stringify(result)}`
              );
            }

            setIsLoaderVisible(false);
            setProfilePic(result?.photo)
            DeviceEventEmitter.emit('reloadPatientData');
            await loadPatientProfile({ showLoader: false });

            Alert.alert('Success', 'Image uploaded successfully.', [
              {
                text: 'Ok',
                onPress: () => {
                  // navigation.goBack();
                },
              },
            ]);




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

        }}
      />

      <SimpleStyleScrollView
        bounces={true}
        horizontal={false}
        keyboardShouldPersistTaps={'never'}
        nestedScrollEnabled={false}
        showsHorizontalScrollIndicator={true}
        showsVerticalScrollIndicator={true}
        style={StyleSheet.applyWidth(
          { paddingBottom: 20, paddingTop: 20 },
          dimensions.width
        )}
      >

        {isPatientProfileLoading ? (
          <PatientProfileSkeleton theme={theme} dimensions={dimensions} />
        ) : (
          <>
        <Surface
          {...GlobalStyles.SurfaceStyles(theme)['Surface'].props}
          elevation={3}
          style={StyleSheet.applyWidth(
            StyleSheet.compose(
              GlobalStyles.SurfaceStyles(theme)['Surface'].style,
              { borderRadius: 10, marginLeft: 20, marginRight: 20 }
            ),
            dimensions.width
          )}
        >
          {/* About Doctor */}
          <View
            style={StyleSheet.applyWidth(
              {
                backgroundColor: palettes.App['Custom Color'],
                borderRadius: 10,
                paddingBottom: 20,
                paddingLeft: 20,
                paddingRight: 20,
                paddingTop: 20,
              },
              dimensions.width
            )}
          >
            {/* Top Section */}
            <View
              style={StyleSheet.applyWidth(
                { alignItems: 'center', flexDirection: 'row' },
                dimensions.width
              )}
            >
              <TouchableOpacity onPress={async () => {
                const granted = await checkCameraPermission();

                if (!granted) {
                  Alert.alert(
                    "Permission Required",
                    "Camera access is required. Please enable it in Settings.",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Open Settings",
                        onPress: () => Linking.openSettings(),  // 🔥 Redirect to app settings
                      },
                    ]
                  );
                  return;
                }

                setOpenCamera(true)
              }
              }>
                <ExpoImage
                  allowDownscaling={true}
                  cachePolicy={'disk'}
                  contentPosition={'center'}
                  contentFit={'cover'}
                  transitionDuration={300}
                  transitionEffect={'cross-dissolve'}
                  transitionTiming={'ease-in-out'}
                  {...GlobalStyles.ExpoImageStyles(theme)['Image'].props}
                  source={imageSource(
                    `${profilePic === null
                      ? 'https://master-app.suno.tech/assets/user-CXthF0zB.png'
                      : profilePic
                    }`
                  )}
                  style={StyleSheet.applyWidth(
                    StyleSheet.compose(
                      GlobalStyles.ExpoImageStyles(theme)['Image'].style,
                      { height: 90, width: 90 }
                    ),
                    dimensions.width
                  )}
                />
              </TouchableOpacity>
              <View
                style={StyleSheet.applyWidth(
                  { flex: 1, marginLeft: 20 },
                  dimensions.width
                )}
              >
                {/* Name */}
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
                        color: theme.colors.text.medium,
                        fontFamily: 'Inter_500Medium',
                        fontSize: 17,
                        marginBottom: 6,
                        textDecorationLine: patientDetailsData?.is_active ? 'none' : 'line-through'
                      },
                      dimensions.width
                    )}
                  >
                    {patientDetailsData?.full_name}
                  </Text>
                  <Touchable
                    onPress={async () => {
                      try {
                        navigation.navigate('EditPatientScreen', { patientInfo: patientDetailsData }, { pop: true });
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
                  </Touchable>
                </View>
                {/* Speciality 2 */}
                <Text
                  accessible={true}
                  selectable={false}
                  style={StyleSheet.applyWidth(
                    {
                      color: theme.colors.text.medium,
                      fontFamily: 'Inter_400Regular',
                      opacity: 0.5,
                    },
                    dimensions.width
                  )}
                >
                  {'Preferred : '}
                  {patientDetailsData?.preferred_provider === null
                    ? '-'
                    : patientDetailsData?.preferred_provider?.name}
                </Text>
                {/* Speciality */}
                <Text
                  accessible={true}
                  selectable={false}
                  style={StyleSheet.applyWidth(
                    {
                      color: theme.colors.text.medium,
                      fontFamily: 'Inter_400Regular',
                      opacity: 0.5,
                    },
                    dimensions.width
                  )}
                >
                  {patientDetailsData?.age_years}
                  {' yrs • '}
                  {patientDetailsData?.sex === 'M'
                    ? 'Male'
                    : patientDetailsData?.sex === 'F'
                      ? 'Female'
                      : ''}
                  {/* {patientDetailsData?.gender} */}
                  {' • DOB: '}
                  {patientDetailsData?.birthdate}
                </Text>
                <Text
                  accessible={true}
                  selectable={false}
                  style={StyleSheet.applyWidth(
                    {
                      color: theme.colors.text.medium,
                      fontFamily: 'Inter_400Regular',
                      opacity: 0.5,
                    },
                    dimensions.width
                  )}
                >
                  {'Suno ID : '}
                  {patientDetailsData?.id === null
                    ? '-'
                    : patientDetailsData?.id}
                </Text>
              </View>
            </View>
            {/* CallPone */}
            <View
              style={StyleSheet.applyWidth(
                { alignItems: 'center', flexDirection: 'row', marginTop: 10 },
                dimensions.width
              )}
            >
              <Touchable
                onPress={async () => {
                  try {
                    await callPhoneNumber(patientDetailsData?.phone);
                  } catch (err) {
                    console.log(err);
                  }
                }}
              >
                <Icon
                  color={theme.colors.text.strong}
                  name={'FontAwesome/phone'}
                  size={22}
                />
              </Touchable>
              <View
                style={StyleSheet.applyWidth(
                  { alignItems: 'center', marginLeft: 15 },
                  dimensions.width
                )}
              >
                <Touchable
                  onPress={async () => {
                    try {
                      await callPhoneNumber(patientDetailsData?.phone);
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
                    {formatPhoneNumber(patientDetailsData?.phone)}
                  </Text>
                </Touchable>
              </View>
              <Touchable
                onPress={async () => {
                  try {
                    await Clipboard.setStringAsync(formatPhoneNumber(patientDetailsData?.phone));

                    showToast("Copied!")

                  } catch (err) {
                    console.log(err);
                  }
                }}
              >
                <Icon
                  color={theme.colors.text.strong}
                  name={'MaterialIcons/content-copy'}
                  size={22}
                  style={{ marginLeft: 10 }}
                />
              </Touchable>
            </View>
            {/* Email */}
            <View
              style={StyleSheet.applyWidth(
                { alignItems: 'center', flexDirection: 'row', marginTop: 10 },
                dimensions.width
              )}
            >
              <Icon
                color={theme.colors.text.strong}
                name={'MaterialIcons/email'}
                size={22}
              />
              <View
                style={StyleSheet.applyWidth(
                  { alignItems: 'center', marginLeft: 15 },
                  dimensions.width
                )}
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
                  {patientDetailsData?.email === ''
                    ? 'No email address on file'
                    : patientDetailsData?.email}
                </Text>
              </View>
            </View>
            {/* Relation */}
            <>
              {patientDetailsData?.emergency_contact_relationship ===
                null ? null : (
                <View
                  style={StyleSheet.applyWidth(
                    { alignItems: 'center', flexDirection: 'row' },
                    dimensions.width
                  )}
                >
                  <Icon
                    color={theme.colors.text.strong}
                    name={'Feather/user-plus'}
                    size={25}
                    style={StyleSheet.applyWidth(
                      { height: 24, width: 24 },
                      dimensions.width
                    )}
                  />
                  <View
                    style={StyleSheet.applyWidth(
                      { marginLeft: 15 },
                      dimensions.width
                    )}
                  >
                    {/* Text 2 */}
                    <Text
                      accessible={true}
                      selectable={false}
                      style={StyleSheet.applyWidth(
                        {
                          color: palettes.App['Custom Color_18'],
                          fontFamily: 'Inter_400Regular',
                          fontSize: 13,
                          marginTop: 4,
                        },
                        dimensions.width
                      )}
                    >
                      {patientDetailsData?.emergency_contact_first_name ?? ''}{' '}
                      {patientDetailsData?.emergency_contact_last_name ?? ''}
                      {' ('}
                      {getRelationShip(
                        patientDetailsData?.emergency_contact_relationship
                      )}
                      {')'}
                    </Text>

                    <Text
                      accessible={true}
                      selectable={false}
                      style={StyleSheet.applyWidth(
                        {
                          color: palettes.App['Custom Color_18'],
                          fontFamily: 'Inter_400Regular',
                          fontSize: 13,
                          marginTop: 4,
                        },
                        dimensions.width
                      )}
                    >
                      {formatPhoneNumber(
                        patientDetailsData?.emergency_contact_phone
                      )}
                    </Text>
                  </View>
                </View>
              )}
            </>
            <Touchable
              onPress={() => {
                try {
                  let address = formatAddress(patientDetailsData);
                  if (!address) return;

                  const encodedAddress = encodeURIComponent(address);

                  const url = Platform.select({
                    ios: `maps:0,0?q=${encodedAddress}`,
                    android: `geo:0,0?q=${encodedAddress}`,
                  });

                  Linking.openURL(url);
                } catch (err) {
                  console.log(err);
                }
              }}
            >
              <View
                style={StyleSheet.applyWidth(
                  { alignItems: 'center', flexDirection: 'row', marginTop: 10 },
                  dimensions.width
                )}
              >

                <Icon
                  color={theme.colors.text.strong}
                  name={'MaterialIcons/location-pin'}
                  size={22}
                />

                <View
                  style={StyleSheet.applyWidth(
                    { alignItems: 'center', marginLeft: 15 },
                    dimensions.width
                  )}
                >
                  <Text
                    accessible={true}
                    selectable={false}
                    style={StyleSheet.applyWidth(
                      {
                        color: palettes.App['Custom Color_18'],
                        fontFamily: 'Inter_400Regular',
                        fontSize: 13,
                        textDecorationLine:
                          'underline',
                      },
                      dimensions.width,
                    )}
                  >{formatAddress(patientDetailsData)}
                  </Text>

                </View>

              </View>
            </Touchable>
          </View>
        </Surface>

        <View
          style={StyleSheet.applyWidth(
            {
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: patientDetailsData?.assigned_tags?.length === 0 ? 0 : 15,
              marginLeft: 20,
              marginRight: 20,
              marginTop: patientDetailsData?.assigned_tags?.length === 0 ? 0 : 15,
            },
            dimensions.width
          )}
        >
          {/* <>
            {!(patientDetailsData?.assigned_tags?.length === 0) ? null : (
              <Pressable>
                <View
                  style={StyleSheet.applyWidth(
                    {
                      alignItems: 'center',
                      backgroundColor: palettes.App['Custom #ffffff'],
                      borderColor: palettes.App.TagBorder,
                      borderRadius: 13,
                      borderWidth: 1,
                      flexDirection: 'row',
                      gap: 5,
                      opacity: 1,
                      padding: 7,
                    },
                    dimensions.width
                  )}
                >
                  <Icon
                    color={palettes.App.FilterTextColor}
                    name={'AntDesign/plus'}
                    size={14}
                  />
                  <Text
                    accessible={true}
                    selectable={false}
                    style={StyleSheet.applyWidth(
                      {
                        color: palettes.App.FilterTextColor,
                        fontFamily: 'Inter_500Medium',
                        fontSize: 11,
                      },
                      dimensions.width
                    )}
                  >
                    {'Add tag'}
                  </Text>
                </View>
              </Pressable>
            )}
          </> */}
          {/* assignedTag */}
          <SimpleStyleFlatList
            data={patientDetailsData?.assigned_tags}
            decelerationRate={'normal'}
            inverted={false}
            keyExtractor={(assignedTagData, index) =>
              assignedTagData?.id ??
              assignedTagData?.uuid ??
              index?.toString() ??
              JSON.stringify(assignedTagData)
            }
            keyboardShouldPersistTaps={'never'}
            listKey={'Scroll View->View->assignedTag'}
            nestedScrollEnabled={false}
            numColumns={1}
            onEndReachedThreshold={0.5}
            renderItem={({ item, index }) => {
              const assignedTagData = item;
              return (
                <>
                  {/* View 2 */}
                  <View
                    style={StyleSheet.applyWidth(
                      {
                        alignItems: 'center',
                        backgroundColor: [
                          {
                            minWidth: Breakpoints.Mobile,
                            value: palettes.App.CustomLightGreenColor,
                          },
                          {
                            minWidth: Breakpoints.Mobile,
                            value: assignedTagData?.tag?.color,
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
                    {/* <>
                      {!assignedTagData?.tag?.is_active ? null : (
                        <Icon
                          color={palettes.App['Custom #ffffff']}
                          name={'MaterialIcons/cancel'}
                          size={14}
                        />
                      )}
                    </> */}
                    <Text
                      accessible={true}
                      selectable={false}
                      style={StyleSheet.applyWidth(
                        {
                          color: getTextColor(assignedTagData?.tag?.color),
                          fontFamily: 'Inter_500Medium',
                          fontSize: 11,
                          textDecorationColor: palettes.App['Custom #ffffff'],
                          textDecorationLine: [
                            { minWidth: Breakpoints.Mobile, value: 'none' },
                            {
                              minWidth: Breakpoints.Mobile,
                              value: checkExpiredTags(
                                assignedTagData?.expires_at
                              )
                                ? 'line-through'
                                : 'none',
                            },
                          ],
                        },
                        dimensions.width
                      )}
                    >
                      {assignedTagData?.tag?.name}
                    </Text>
                  </View>
                </>
              );
            }}
            showsHorizontalScrollIndicator={true}
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
          {/* Email 2 */}
          <View
            style={StyleSheet.applyWidth(
              { alignItems: 'center', flexDirection: 'row', marginLeft: 8 },
              dimensions.width
            )}
          >
            <>
              {!dueAmount(
                patientDetailsData?.patient_responsibility_balance,
                patientDetailsData?.available_credit
              ) ? null : (
                <View
                  style={StyleSheet.applyWidth(
                    { alignItems: 'center', marginLeft: 10 },
                    dimensions.width
                  )}
                >
                  <Text
                    accessible={true}
                    selectable={false}
                    style={StyleSheet.applyWidth(
                      StyleSheet.compose(theme.typography.headline1, {
                        color: [
                          {
                            minWidth: Breakpoints.Mobile,
                            value: palettes.App['Custom Color_18'],
                          },
                          { minWidth: Breakpoints.Mobile, value: '#92400e' },
                        ],
                        fontFamily: 'Inter_400Regular',
                        fontSize: 16,
                        paddingVertical: patientDetailsData?.assigned_tags?.length > 0 ? 0 : 15
                      }),
                      dimensions.width
                    )}
                  >
                    {'$ '}
                    {(dueAmount(
                      patientDetailsData?.patient_responsibility_balance,
                      patientDetailsData?.available_credit
                    ) || 0).toFixed(2)}
                    {' due'}
                  </Text>
                </View>
              )}
            </>
          </View>
        </View>
        {/* SurfaceTab 2 */}
        <Surface
          {...GlobalStyles.SurfaceStyles(theme)['Surface'].props}
          elevation={2}
          style={StyleSheet.applyWidth(
            StyleSheet.compose(
              GlobalStyles.SurfaceStyles(theme)['Surface'].style,
              { marginBottom: 5, minHeight: 5 }
            ),
            dimensions.width
          )}
        />
        {/* SurfaceMenu */}
        <Surface
          {...GlobalStyles.SurfaceStyles(theme)['Surface'].props}
          elevation={2}
          style={StyleSheet.applyWidth(
            StyleSheet.compose(
              GlobalStyles.SurfaceStyles(theme)['Surface'].style,
              {
                backgroundColor: palettes.App['Custom #ffffff'],
                borderRadius: 2,
                marginBottom: 15,
                marginLeft: 2,
                marginRight: 2,
              }
            ),
            dimensions.width
          )}
        >
          <HStack
            {...GlobalStyles.HStackStyles(theme)['H Stack'].props}
            style={StyleSheet.applyWidth(
              StyleSheet.compose(
                GlobalStyles.HStackStyles(theme)['H Stack'].style,
                {
                  alignContent: 'space-between',
                  alignSelf: 'auto',
                  backgroundColor: palettes.App['Custom #ffffff'],
                  borderRadius: 2,
                  flex: 1,
                  gap: 0,
                  justifyContent: 'space-between',
                  padding: 15,
                  paddingLeft: 10,
                  paddingRight: 10,
                }
              ),
              dimensions.width
            )}
          >
            <MenuButtonBlock
              routeName={() => {
                try {
                  navigation.navigate(
                    'WizardViewScreen',
                    {
                      fullname: patientDetailsData?.full_name ?? '',
                      firstname: patientDetailsData?.first_name ?? '',
                      middlename: patientDetailsData?.middle_name ?? '',
                      lastname: patientDetailsData?.last_name ?? '',
                      inboxRoute: true,
                    },
                    { pop: true }
                  );
                } catch (err) {
                  logError(err);
                }
              }}
              icon={'MaterialCommunityIcons/calendar-range-outline'}
              name={'New Appt'}
            />
            {/* MenuButton 2 */}
            <MenuButtonBlock
              routeName={() => {
                try {
                  navigation.navigate(
                    'NewNoteScreen',
                    { id: params?.id ?? defaultProps.id, clientID: params?.clientID ?? defaultProps.clientID },
                    { pop: true }
                  );
                } catch (err) {
                  logError(err);
                }
              }}
              icon={'Entypo/plus'}
              name={'Chart Note'}
            />
            {/* MenuButton 3 */}
            <MenuButtonBlock
              routeName={() => {
                const handler = async () => {
                  try {
                    await callPhoneNumber(patientDetailsData?.phone);
                  } catch (err) {
                    logError(err);
                  }
                };
                handler();
              }}
              icon={'Ionicons/call-outline'}
              name={'Call'}
            />
            {/* MenuButton 4 */}
            <MenuButtonBlock
              routeName={() => {
                const handler = async () => {
                  try {
                    navigation.navigate(
                      'InboxThreadsScreen',
                      {
                        FirstName: patientDetailsData?.first_name ?? '',
                        LastName: patientDetailsData?.last_name ?? '',
                        Age: patientDetailsData?.age_years ?? '',
                        PhoneNumber: patientDetailsData?.phone ?? '',
                        MessageId: patientDetailsData?.id ?? '',
                        fullName: patientDetailsData?.full_name ?? '',
                      },
                      { pop: true }
                    );
                    await setGlobalVariableValue({
                      key: 'MessageId',
                      value: patientDetailsData?.id,
                    });
                  } catch (err) {
                    logError(err);
                  }
                };
                handler();
              }}
              icon={'Feather/message-square'}
              name={'Message'}
            />
            {/* MenuButton 5 */}
            <MenuButtonBlock
              routeName={() => {
                try {
                  //   navigation.navigate(
                  //     'ScanDocumentScreen',
                  //     {
                  //       id: params?.id ?? defaultProps.id,
                  //       box_folder_id:
                  //         params?.box_folder_id ?? defaultProps.box_folder_id,
                  //     },
                  //     { pop: true }
                  //   );
                  if (menuOption != 1) {
                    setDocumentID([])
                    setDocumentNames([])
                  }
                  handleScan()
                } catch (err) {
                  logError(err);
                }
              }}
              icon={'Ionicons/scan'}
              name={'Scan'}
            />
          </HStack>
        </Surface>
          </>
        )}
        {/* ScrollTab */}
        <View
          style={StyleSheet.applyWidth(
            { marginLeft: 20, marginRight: 20, marginTop: 10 },
            dimensions.width
          )}
        >
          {/* List 2 */}
          <SimpleStyleFlatList
            data={tabData} // , { speciality: 'Billing' }, { speciality: 'Capture Visit' }
            decelerationRate={'normal'}
            inverted={false}
            keyExtractor={(list2Data, index) =>
              list2Data?.id ??
              list2Data?.uuid ??
              index?.toString() ??
              JSON.stringify(list2Data)
            }
            keyboardShouldPersistTaps={'never'}
            listKey={'Scroll View->ScrollTab->List 2'}
            nestedScrollEnabled={false}
            numColumns={1}
            onEndReachedThreshold={0.5}
            pagingEnabled={false}
            renderItem={({ item, index }) => {
              const list2Data = item;
              return (
                <View
                  style={StyleSheet.applyWidth(
                    { alignItems: 'flex-start', justifyContent: 'center' },
                    dimensions.width
                  )}
                >
                  {/* Unselected */}
                  <Touchable
                    onPress={() => {
                      try {
                        setSelectedTag(index);
                        setMenuOption(index);
                        if (index == 1) {
                          setDocumentID([])
                          setDocumentNames([])
                          setItems([])
                          getBoxAccessToken()
                        }
                      } catch (err) {
                        logError(err);
                      }
                    }}
                    activeOpacity={0.8}
                    disabledOpacity={0.8}
                    style={StyleSheet.applyWidth(
                      { marginRight: 12 },
                      dimensions.width
                    )}
                  >
                    <Surface
                      {...GlobalStyles.SurfaceStyles(theme)['Surface'].props}
                      elevation={2}
                      style={StyleSheet.applyWidth(
                        StyleSheet.compose(
                          GlobalStyles.SurfaceStyles(theme)['Surface'].style,
                          {
                            alignItems: 'center',
                            backgroundColor:
                              index === menuOption
                                ? theme.colors.branding.secondary
                                : palettes.App['Custom #ffffff'],
                            borderColor: palettes.App.TagBorder,
                            borderRadius: 8,
                            borderWidth: 0.22,
                            justifyContent: 'center',
                            marginBottom: 10,
                            paddingLeft: 10,
                            paddingRight: 10,
                          }
                        ),
                        dimensions.width
                      )}
                    >
                      <Text
                        accessible={true}
                        selectable={false}
                        style={StyleSheet.applyWidth(
                          {
                            color: [
                              {
                                minWidth: Breakpoints.Mobile,
                                value: theme.colors.text.strong,
                              },
                              {
                                minWidth: Breakpoints.Mobile,
                                value:
                                  index === menuOption
                                    ? palettes.App['Custom #ffffff']
                                    : theme.colors.text.medium,
                              },
                            ],
                            fontFamily: 'Inter_400Regular',
                          },
                          dimensions.width
                        )}
                      >
                        {list2Data?.speciality}
                      </Text>
                    </Surface>
                  </Touchable>
                </View>
              );
            }}
            snapToAlignment={'start'}
            horizontal={true}
            showsHorizontalScrollIndicator={true}
            showsVerticalScrollIndicator={false}
          />
        </View>
        {/* SurfaceTab */}
        <Surface
          {...GlobalStyles.SurfaceStyles(theme)['Surface'].props}
          elevation={2}
          style={StyleSheet.applyWidth(
            StyleSheet.compose(
              GlobalStyles.SurfaceStyles(theme)['Surface'].style,
              { minHeight: 12 }
            ),
            dimensions.width
          )}
        />
        {/* Overview */}
        <>
          {!(menuOption === 0) ? null : (
            <View>
              {/* HeaderEvents 4 */}
              <HeaderEventsBlock
                onPressEvent={() => {
                  try {
                    navigation.navigate(
                      'UpcomingAppointmentsScreen',
                      { id: params?.id ?? defaultProps.id },
                      { pop: true }
                    );
                  } catch (err) {
                    logError(err);
                  }
                }}
              />
              {/* Upcomming Appointment */}
              <View
                style={StyleSheet.applyWidth(
                  { paddingLeft: 20, paddingRight: 20 },
                  dimensions.width
                )}
              >
                <View
                  style={StyleSheet.applyWidth(
                    { borderRadius: 12, overflow: 'hidden' },
                    dimensions.width
                  )}
                >
                  {/* reviews list */}
                  <SunoApi.FetchPatientAppointmentsGET
                    after_moment={getCurrentTime(
                      patientDetailsData?.preferred_clinic?.timezone
                    )}
                    before_moment={''}
                    id={params?.id ?? defaultProps.id}
                    offset={'0'}
                    ordering={'start_moment'}
                    patient={params?.id ?? defaultProps.id}
                    status={'0,1,2,5,99,7'}
                  >
                    {({ loading, error, data, refetchPatientAppointments }) => {
                      const reviewsListData = data?.json;
                      if (loading) {
                        return <ActivityIndicator />;
                      }

                      if (error || data?.status < 200 || data?.status >= 300) {
                        return <ActivityIndicator />;
                      }

                      return (
                        <>
                          <>
                            {!(
                              reviewsListData?.results?.length === 0
                            ) ? null : (
                              <EmptyListBlock
                                message={'No upcoming appointments'}
                              />
                            )}
                          </>
                          <>
                            {!(
                              reviewsListData?.results?.length === 0
                            ) ? null : (
                              <CustomAddBlock
                                onPressEvent={() => {
                                  try {
                                    navigation.navigate(
                                      'WizardViewScreen',
                                      {},
                                      { pop: true }
                                    );
                                  } catch (err) {
                                    logError(err);
                                  }
                                }}
                              />
                            )}
                          </>
                          <>
                            {reviewsListData?.results?.length === 0 ? null : (
                              <SimpleStyleFlashList
                                data={(reviewsListData?.results).slice(0, 3)}
                                estimatedItemSize={50}
                                horizontal={false}
                                inverted={false}
                                keyExtractor={(flashListData, index) =>
                                  flashListData?.id ??
                                  flashListData?.uuid ??
                                  index?.toString() ??
                                  JSON.stringify(flashListData)
                                }
                                listKey={
                                  'Scroll View->Overview->Upcomming Appointment->View->reviews list->FlashList'
                                }
                                numColumns={1}
                                onEndReachedThreshold={0.5}
                                renderItem={({ item, index }) => {
                                  const flashListData = item;
                                  return (
                                    <Surface
                                      {...GlobalStyles.SurfaceStyles(theme)[
                                        'Surface'
                                      ].props}
                                      elevation={1}
                                      style={StyleSheet.applyWidth(
                                        StyleSheet.compose(
                                          GlobalStyles.SurfaceStyles(theme)[
                                            'Surface'
                                          ].style,
                                          {
                                            borderColor: palettes.App.TagBorder,
                                            borderRadius: 10,
                                            borderWidth: 0.5,
                                            marginBottom: 10,
                                          }
                                        ),
                                        dimensions.width
                                      )}
                                    >
                                      <View
                                        style={StyleSheet.applyWidth(
                                          {
                                            backgroundColor:
                                              palettes.App['Custom Color'],
                                            borderBottomLeftRadius: 10,
                                            borderBottomRightRadius: 10,
                                            borderColor: palettes.App.TagBorder,
                                            borderTopLeftRadius: 10,
                                            borderTopRightRadius: 10,
                                            flexDirection: 'row',
                                            paddingBottom: 10,
                                            paddingLeft: 10,
                                            paddingRight: 10,
                                            paddingTop: 10,
                                          },
                                          dimensions.width
                                        )}
                                      >
                                        {/* Details */}
                                        <View
                                          style={StyleSheet.applyWidth(
                                            { flex: 1 },
                                            dimensions.width
                                          )}
                                        >
                                          <View
                                            style={StyleSheet.applyWidth(
                                              {
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                              },
                                              dimensions.width
                                            )}
                                          >
                                            {/* Name */}
                                            <Text
                                              accessible={true}
                                              selectable={false}
                                              style={StyleSheet.applyWidth(
                                                {
                                                  color: [
                                                    {
                                                      minWidth:
                                                        Breakpoints.Mobile,
                                                      value:
                                                        theme.colors.text
                                                          .strong,
                                                    },
                                                    {
                                                      minWidth:
                                                        Breakpoints.Mobile,
                                                      value:
                                                        flashListData?.tag
                                                          ?.color,
                                                    },
                                                  ],
                                                  fontFamily: 'Inter_500Medium',
                                                  fontSize: 16,
                                                },
                                                dimensions.width
                                              )}
                                            >
                                              {DateUtils.format(
                                                flashListData?.start_moment,
                                                'MM/DD/YYYY'
                                              )}
                                            </Text>
                                            {/* Name 2 */}
                                            <Text
                                              accessible={true}
                                              selectable={false}
                                              style={StyleSheet.applyWidth(
                                                {
                                                  color: [
                                                    {
                                                      minWidth:
                                                        Breakpoints.Mobile,
                                                      value:
                                                        theme.colors.text
                                                          .strong,
                                                    },
                                                    {
                                                      minWidth:
                                                        Breakpoints.Mobile,
                                                      value:
                                                        flashListData?.tag
                                                          ?.color,
                                                    },
                                                  ],
                                                  fontFamily: 'Inter_500Medium',
                                                  fontSize: 16,
                                                },
                                                dimensions.width
                                              )}
                                            >
                                              {formatTime(
                                                flashListData?.start_moment,
                                                flashListData?.clinic?.timezone
                                              )}
                                            </Text>
                                          </View>
                                          {/* timestamp */}
                                          <Text
                                            accessible={true}
                                            selectable={false}
                                            style={StyleSheet.applyWidth(
                                              {
                                                color: [
                                                  {
                                                    minWidth:
                                                      Breakpoints.Mobile,
                                                    value:
                                                      theme.colors.text.strong,
                                                  },
                                                  {
                                                    minWidth:
                                                      Breakpoints.Mobile,
                                                    value:
                                                      flashListData?.tag?.color,
                                                  },
                                                ],
                                                fontFamily: 'Inter_400Regular',
                                                fontSize: 12,
                                                marginTop: 8,
                                                opacity: 0.7,
                                              },
                                              dimensions.width
                                            )}
                                          >
                                            {flashListData?.type?.name}
                                          </Text>
                                          {/* Review */}
                                          <Text
                                            accessible={true}
                                            selectable={false}
                                            numberOfLines={3}
                                            style={StyleSheet.applyWidth(
                                              {
                                                color: [
                                                  {
                                                    minWidth:
                                                      Breakpoints.Mobile,
                                                    value:
                                                      theme.colors.text.strong,
                                                  },
                                                  {
                                                    minWidth:
                                                      Breakpoints.Mobile,
                                                    value:
                                                      flashListData?.tag?.color,
                                                  },
                                                ],
                                                fontFamily: 'Inter_400Regular',
                                                fontSize: 13,
                                                lineHeight: 16,
                                                marginTop: 8,
                                                opacity: 0.6,
                                              },
                                              dimensions.width
                                            )}
                                          >
                                            {'Staff : '}
                                            {
                                              flashListData?.staff_member
                                                ?.first_name
                                            }{' '}
                                            {
                                              flashListData?.staff_member
                                                ?.last_name
                                            }
                                          </Text>
                                        </View>
                                      </View>
                                    </Surface>
                                  );
                                }}
                                showsHorizontalScrollIndicator={true}
                                showsVerticalScrollIndicator={true}
                                style={StyleSheet.applyWidth(
                                  {
                                    borderRadius: 12,
                                    overflow: 'hidden',
                                    paddingBottom: 10,
                                    paddingTop: 10,
                                  },
                                  dimensions.width
                                )}
                              />
                            )}
                          </>
                        </>
                      );
                    }}
                  </SunoApi.FetchPatientAppointmentsGET>
                </View>
              </View>
              <HeaderEventsBlock
                onPressEvent={async () => {
                  try {

                    await logEvent('patient_chart_opened', {
                      // chart_load_time_ms: textInputValue || '',
                      // has_recent_appt: json?.results?.length ?? 0
                    });
                    navigation.navigate(
                      'ChartNotesScreen',
                      { id: params?.id ?? defaultProps.id },
                      { pop: true }
                    );
                  } catch (err) {
                    logError(err);
                  }
                }}
                header_name={'Recent Chart Notes'}
                icon_name={'AntDesign/copy1'}
              />
              {/* Recent Chart */}
              <View
                style={StyleSheet.applyWidth(
                  { paddingLeft: 20, paddingRight: 20 },
                  dimensions.width
                )}
              >
                <View
                  style={StyleSheet.applyWidth(
                    { borderRadius: 12, overflow: 'hidden' },
                    dimensions.width
                  )}
                >
                  {/* reviews list */}
                  <SunoApi.FetchPatientChartNoteGET
                    limit={'25'}
                    offset={'0'}
                    ordering={'-display_moment,-id'}
                    patient={params?.id ?? defaultProps.id}
                    query={
                      '{id,type,created_by,created_at,updated_at,display_moment,updated_by,text,pinned,appointment{id,start_moment,type{id,name}},status,icd10_codes,clinic{id},patient{first_name,last_name}}'
                    }
                    refreshKey={reloadChart}
                  >
                    {({ loading, error, data, refetchPatientChartNote }) => {
                      const reviewsListData = data?.json;
                      if (loading) {
                        return <ActivityIndicator />;
                      }

                      if (error || data?.status < 200 || data?.status >= 300) {
                        return <ActivityIndicator />;
                      }

                      return (
                        <>
                          <>
                            {!(reviewsListData?.length === 0) ? null : (
                              <EmptyListBlock
                                message={'No recent chart notes'}
                              />
                            )}
                          </>
                          <>
                            {!(reviewsListData?.length === 0) ? null : (
                              <CustomAddBlock
                                onPressEvent={() => {
                                  try {
                                    navigation.navigate(
                                      'NewNoteScreen',
                                      { id: params?.id ?? defaultProps.id, clientID: params?.clientID ?? defaultProps.clientID },
                                      { pop: true }
                                    );
                                  } catch (err) {
                                    logError(err);
                                  }
                                }}
                                title={'Add New Chart Note'}
                              />
                            )}
                          </>
                          <SimpleStyleFlashList
                            data={reviewsListData.slice(0, 3)}
                            estimatedItemSize={50}
                            horizontal={false}
                            inverted={false}
                            keyExtractor={(flashListData, index) =>
                              flashListData?.id ??
                              flashListData?.uuid ??
                              index?.toString() ??
                              JSON.stringify(flashListData)
                            }
                            listKey={
                              'Scroll View->Overview->Recent Chart->View->reviews list->FlashList'
                            }
                            numColumns={1}
                            onEndReachedThreshold={0.5}
                            renderItem={({ item, index }) => {
                              const flashListData = item;
                              return (
                                <Surface
                                  {...GlobalStyles.SurfaceStyles(theme)[
                                    'Surface'
                                  ].props}
                                  elevation={1}
                                  style={StyleSheet.applyWidth(
                                    StyleSheet.compose(
                                      GlobalStyles.SurfaceStyles(theme)[
                                        'Surface'
                                      ].style,
                                      {
                                        borderColor: palettes.App.TagBorder,
                                        borderRadius: 10,
                                        borderWidth: 1,
                                        marginBottom: 10,
                                      }
                                    ),
                                    dimensions.width
                                  )}
                                >
                                  <TouchableOpacity
                                    onPress={() => {
                                      try {
                                        navigation.navigate(
                                          'NewNoteScreen',
                                          {
                                            id: params?.id ?? defaultProps.id, clientID: params?.clientID ?? defaultProps.clientID,
                                            chartNoteData: flashListData,
                                          },
                                          { pop: true }
                                        );
                                      } catch (err) {
                                        logError(err);
                                      }
                                    }}
                                  >
                                    <View
                                      style={StyleSheet.applyWidth(
                                        {
                                          backgroundColor:
                                            flashListData?.status === 2
                                              ? 'rgba(207, 207, 207, 0.1)'
                                              : '#ef44441a',
                                          borderColor: palettes.App.TagBorder,
                                          borderRadius: 10,
                                          flexDirection: 'row',
                                          paddingBottom: 10,
                                          paddingLeft: 10,
                                          paddingRight: 10,
                                          paddingTop: 10,
                                        },
                                        dimensions.width
                                      )}
                                    >
                                      {/* Details */}
                                      <View
                                        style={StyleSheet.applyWidth(
                                          { flex: 1 },
                                          dimensions.width
                                        )}
                                      >
                                        <View
                                          style={StyleSheet.applyWidth(
                                            {
                                              flexDirection: 'row',
                                              justifyContent: 'space-between',
                                            },
                                            dimensions.width
                                          )}
                                        >
                                          {/* Name */}
                                          <Text
                                            accessible={true}
                                            selectable={false}
                                            style={StyleSheet.applyWidth(
                                              {
                                                color:
                                                  palettes.App['Custom Color_18'],
                                                fontFamily: 'Inter_500Medium',
                                                fontSize: 16,
                                              },
                                              dimensions.width
                                            )}
                                          >
                                            {flashListData?.appointment === null
                                              ? flashListData?.type === 1
                                                ? 'General Note'
                                                : flashListData?.type === 2
                                                  ? 'Patient Visit'
                                                  : 'Billing Note'
                                              : flashListData?.appointment?.type
                                                ?.name}
                                          </Text>

                                          {/* Icon Button 2 */}

                                          {!(hasTextInHTML(flashListData?.text)
                                            ? flashListData?.status !== 2
                                            : undefined) ? null : (

                                            <TouchableOpacity style={{ width: 50, alignItems: 'flex-end' }} onPress={() => {
                                              const handler = async () => {
                                                // setVisible(true)
                                                Alert.alert(
                                                  'Confirmation',
                                                  'Are you sure you want to mark this chart note as completed?',
                                                  [
                                                    {
                                                      text: 'Cancel',
                                                      style: 'cancel',
                                                      onPress: () => {
                                                        // handle cancel action
                                                        console.log('User cancelled');
                                                      },
                                                    },
                                                    {
                                                      text: 'Yes',
                                                      onPress: async () => {
                                                        let error = null;
                                                        try {
                                                          const chartData = (
                                                            await sunoUpdateNoteStatusPATCH.mutateAsync(
                                                              {
                                                                id: flashListData?.id,
                                                                note: flashListData?.text,
                                                              }
                                                            )
                                                          )?.json;

                                                          setReloadChart(
                                                            reloadChart + 1
                                                          );
                                                          Alert.alert(
                                                            '',
                                                            'This chart note has been marked as completed successfully.'
                                                          );

                                                        } catch (err) {
                                                          logError(err);
                                                          error = err.message ?? err;
                                                        }

                                                      },
                                                    },
                                                  ],
                                                  { cancelable: true }
                                                );

                                              }
                                              handler();
                                            }}>

                                              <Icon

                                                color={palettes.App.FilterTextColor}
                                                name={'MaterialCommunityIcons/checkbox-blank-outline'}
                                                size={30}
                                              />
                                            </TouchableOpacity>


                                          )}

                                        </View>
                                        {/* Date */}
                                        <Text
                                          accessible={true}
                                          selectable={false}
                                          style={StyleSheet.applyWidth(
                                            {
                                              color:
                                                palettes.App['Custom Color_18'],
                                              fontFamily: 'Inter_400Regular',
                                              fontSize: 12,
                                            },
                                            dimensions.width
                                          )}
                                        >
                                          {flashListData?.appointment === null ? flashListData?.created_at === null
                                            ? undefined
                                            : DateUtils.format(
                                              flashListData?.created_at,
                                              'MMM DD, YYYY'
                                            ) : DateUtils.format(
                                              flashListData?.appointment?.start_moment,
                                              'MMM DD, YYYY'
                                            )}
                                        </Text>
                                        {/* View 2 */}
                                        <View
                                          style={StyleSheet.applyWidth(
                                            {
                                              alignContent: 'center',
                                              alignSelf: 'auto',
                                              flexDirection: 'row',
                                              justifyContent: 'space-between',
                                            },
                                            dimensions.width
                                          )}
                                        >
                                          {/* timestamp */}
                                          <Text
                                            accessible={true}
                                            selectable={false}
                                            style={StyleSheet.applyWidth(
                                              {
                                                color:
                                                  palettes.App['Custom Color_18'],
                                                fontFamily: 'Inter_400Regular',
                                                fontSize: 12,
                                                marginBottom: 8,
                                                marginTop: 8,
                                                opacity: 0.7,
                                              },
                                              dimensions.width
                                            )}
                                          >
                                            {'By: '}
                                            {flashListData?.updated_by === null
                                              ? flashListData?.created_by
                                                ?.full_name
                                              : flashListData?.updated_by
                                                ?.full_name}
                                            {' at '}
                                            {DateUtils.format(
                                              flashListData?.updated_at,
                                              'MM/DD/YYYY hh:mm a'
                                            )}
                                          </Text>

                                          <View
                                            style={StyleSheet.applyWidth(
                                              { flexDirection: 'row' },
                                              dimensions.width
                                            )}
                                          >
                                            {/* <>
                                            {!(
                                              flashListData?.created_by?.id ===
                                              Constants['UserInfo']?.id
                                            ) ? null : (
                                              <IconButton
                                                onPress={() => {
                                                  const handler = async () => {
                                                    try {
                                                      const chartData = (
                                                        await sunoDeleteNoteDELETE.mutateAsync(
                                                          {
                                                            id: flashListData?.id,
                                                          }
                                                        )
                                                      )?.json;
                                                      setReloadChart(
                                                        reloadChart + 1
                                                      );
                                                    } catch (err) {
                                                      logError(err);
                                                    }
                                                  };
                                                  handler();
                                                }}
                                                color={
                                                  palettes.App.FilterTextColor
                                                }
                                                icon={'MaterialIcons/delete'}
                                                size={25}
                                                style={StyleSheet.applyWidth(
                                                  { right: 5 },
                                                  dimensions.width
                                                )}
                                              />
                                            )}
                                          </> */}

                                          </View>
                                        </View>
                                        <Utils.CustomCodeErrorBoundary>
                                          <HtmlView.HtmlView
                                            htmlContent={flashListData?.text}
                                            patientData={flashListData}
                                            fontSize={13}
                                            color={
                                              palettes.App['Custom Color_18']
                                            }
                                            collapsible={true}
                                            collapsedMaxHeight={120}
                                            moreColor={
                                              theme.colors.branding.secondary
                                            }
                                          />
                                        </Utils.CustomCodeErrorBoundary>
                                      </View>
                                    </View>
                                  </TouchableOpacity>
                                </Surface>
                              );
                            }}
                            showsHorizontalScrollIndicator={true}
                            showsVerticalScrollIndicator={true}
                            style={StyleSheet.applyWidth(
                              {
                                borderRadius: 12,
                                overflow: 'hidden',
                                paddingBottom: 10,
                                paddingTop: 10,
                              },
                              dimensions.width
                            )}
                          />
                        </>
                      );
                    }}
                  </SunoApi.FetchPatientChartNoteGET>
                </View>
              </View>
              {/* HeaderEvents 2 */}
              <HeaderEventsBlock
                header_name={'Current Hearing Aids'}
                icon_name={'Feather/headphones'}
                rightTextVisible={true}
              />
              {/* CurrentDevice */}
              <View
                style={StyleSheet.applyWidth(
                  { paddingLeft: 20, paddingRight: 20,  },
                  dimensions.width
                )}
              >
                <View
                  style={StyleSheet.applyWidth(
                    { borderRadius: 12, overflow: 'hidden' },
                    dimensions.width
                  )}
                >
                  {/* reviews list */}
                  <SunoApi.FetchGetPatientProductsGET
                    handlers={{
                      on2xx: reviewsListData => {
                        try {
                          const deviceData = reviewsListData?.json?.results;
                          // console.log("===== deviceData :", deviceData)
                          setProductData(deviceData);
                          setCurrentDeviceData(
                            getProductDataByType(2, '', deviceData)
                          );
                          setCurrentDeviceData(
                            getProductDataByType(2, '', deviceData)
                          );
                          setCurrentReceiversData(
                            getProductDataByType(3, 1, deviceData)
                          );
                          setCurrentTubesData(
                            getProductDataByType(3, 2, deviceData)
                          );
                          setCurrentDomesData(
                            getProductDataByType(3, 3, deviceData)
                          );
                          setCurrentEarmoldsData(
                            getProductDataByType(3, 4, deviceData)
                          );
                          setAccessoriesData(
                            getProductDataByType(3, 999, deviceData)
                          );
                        } catch (err) {
                          logError(err);
                        }
                      },
                    }}
                    is_active={true}
                    limit={100}
                    patient={params?.id ?? defaultProps.id}
                    query={
                      // '{id,returned_at,exchanged_at,patient{id},sale{id,service_date,items{id,price,quantity,total,patient_responsibility,description,discount,insurer_responsibility,tax_rate}},sale_item,inventory_product{id,status,created_at,product{id,display_name,master_product{manufacturer,specification,type,subtype,description,model,msrp}},specification,serial_number,manufacturer_warranty_expiration_date,loss_damage_warranty_expiration_date},order_item{id,manufacturer{name},model,price,quantity,description,total,tracking_number,created_at},status,service_plan_expiration_date,extended_warranty_expiration_date,purchase_date,description,is_active,is_in_use,serial_number,ear,type,subtype,manufacturer_warranty_expiration_date,loss_damage_warranty_expiration_date,delivered_at_display,statuses{value}}'
                      // '{id,patient{id},assigned_tags,sale{id,service_date,items{product{id},quantity}},sale_item,inventory_product{id,status,condition,loanable,demoable,created_at,product{id,display_name,price,master_product{manufacturer,specification,type,subtype,description,model,msrp}},specification,serial_number,manufacturer_warranty_expiration_date,loss_damage_warranty_expiration_date},order_item{id,manufacturer{name},model,price,quantity,description,total,tracking_number,created_at},status,description,is_active,is_in_use,serial_number,ear,service_plan_expiration_date,manufacturer_warranty_expiration_date,loss_damage_warranty_expiration_date,extended_warranty_expiration_date,purchase_date,due_date,type,subtype,delivered_at,delivered_at_display,notes,statuses}'
                      '{id,returned_at,exchanged_at,patient{id},sale{id,service_date,items{id,price,quantity,total,patient_responsibility,description,discount,insurer_responsibility,tax_rate}},sale_item,inventory_product{id,status,created_at,product{id,display_name,master_product{manufacturer,specification,type,subtype,description,model,msrp}},specification,serial_number,manufacturer_warranty_expiration_date,loss_damage_warranty_expiration_date},order_item{id,manufacturer{name},model,price,quantity,description,total,tracking_number,created_at},status,service_plan_expiration_date,extended_warranty_expiration_date,purchase_date,due_date,description,is_active,is_in_use,serial_number,notes,ear,type,subtype,manufacturer_warranty_expiration_date,loss_damage_warranty_expiration_date,delivered_at_display,statuses{value,created_at}}'
                    }
                  >
                    {({ loading, error, data, refetchGetPatientProducts }) => {
                      const reviewsListData = data?.json;
                      if (loading) {
                        return <ActivityIndicator />;
                      }

                      if (error || data?.status < 200 || data?.status >= 300) {
                        return <ActivityIndicator />;
                      }

                      return (
                        <>
                          <SimpleStyleFlashList
                            data={currentDeviceData}
                            estimatedItemSize={50}
                            horizontal={false}
                            inverted={false}
                            keyExtractor={(flashListData, index) => index}
                            listKey={
                              'Scroll View->Overview->CurrentDevice->View->reviews list->FlashList'
                            }
                            numColumns={1}
                            onEndReachedThreshold={0.5}
                            renderItem={({ item, index }) => {
                              const flashListData = item;
                              return renderPatientProductCard(flashListData, {
                                showFullDetails: true,
                              });
                            }}
                            showsHorizontalScrollIndicator={true}
                            showsVerticalScrollIndicator={true}
                            style={StyleSheet.applyWidth(
                              {
                                borderRadius: 12,
                                overflow: 'hidden',
                                paddingBottom: 10,
                                paddingTop: 10,
                              },
                              dimensions.width
                            )}
                          />
                          <>
                            {!(currentDeviceData?.length === 0) ? null : (
                              <EmptyListBlock message={'No Hearing Aids'} />
                            )}
                          </>
                        </>
                      );
                    }}
                  </SunoApi.FetchGetPatientProductsGET>
                </View>
              </View>
              {/* HeaderEvents 3 */}
              <HeaderEventsBlock
                header_name={'Outstanding Tasks'}
                icon_name={'Feather/check-square'}
                rightTextVisible={true}
              />
              {/* Task */}
              <View
                style={StyleSheet.applyWidth(
                  { paddingLeft: 20, paddingRight: 20 },
                  dimensions.width
                )}
              >
                <View
                  style={StyleSheet.applyWidth(
                    { borderRadius: 12, overflow: 'hidden' },
                    dimensions.width
                  )}
                >
                  {/* reviews list */}
                  <SunoApi.FetchGetCompletedTasksGET
                    assignee={109}
                    is_active={true}
                    is_complete={false}
                    limit={25}
                    offset={0}
                    ordering={'due_at,-created_at'}
                    patient={params?.id ?? defaultProps.id}
                    query={
                      '{id,title,priority,status,description,due_at,completed_at,updated_at,created_at,patient{id,first_name,middle_name,last_name,title,suffix,preferred_name,photo},comments{id,text,user{id,full_name},created_at,created_by},assignees{user{id,first_name,last_name,full_name,suffix,title,is_active,photo}},assignee{id,first_name,last_name,full_name,suffix,title,is_active,photo},created_by}'
                    }
                    refreshKey={0}
                  >
                    {({ loading, error, data, refetchGetCompletedTasks }) => {
                      const reviewsListData = data?.json;
                      if (loading) {
                        return <ActivityIndicator />;
                      }

                      if (error || data?.status < 200 || data?.status >= 300) {
                        return <ActivityIndicator />;
                      }

                      return (
                        <>
                          <SimpleStyleFlashList
                            data={reviewsListData?.results}
                            estimatedItemSize={50}
                            horizontal={false}
                            inverted={false}
                            keyExtractor={(flashListData, index) =>
                              flashListData?.id ??
                              flashListData?.uuid ??
                              index?.toString() ??
                              JSON.stringify(flashListData)
                            }
                            listKey={
                              'Scroll View->Overview->Task->View->reviews list->FlashList'
                            }
                            numColumns={1}
                            onEndReachedThreshold={0.5}
                            renderItem={({ item, index }) => {
                              const flashListData = item;
                              return (
                                <Surface
                                  {...GlobalStyles.SurfaceStyles(theme)[
                                    'Surface'
                                  ].props}
                                  elevation={1}
                                  style={StyleSheet.applyWidth(
                                    StyleSheet.compose(
                                      GlobalStyles.SurfaceStyles(theme)[
                                        'Surface'
                                      ].style,
                                      {
                                        backgroundColor:
                                          palettes.App['Custom #ffffff'],
                                        borderColor: palettes.App.TagBorder,
                                        borderRadius: 10,
                                        borderWidth: 1,
                                        marginBottom: 10,
                                      }
                                    ),
                                    dimensions.width
                                  )}
                                >
                                  <View
                                    style={StyleSheet.applyWidth(
                                      {
                                        alignItems: 'center',
                                        backgroundColor:
                                          palettes.App['Custom Color_15'],
                                        borderBottomLeftRadius: 10,
                                        borderBottomRightRadius: 10,
                                        borderTopLeftRadius: 10,
                                        borderTopRightRadius: 10,
                                        flexDirection: 'row',
                                        paddingBottom: 10,
                                        paddingLeft: 10,
                                        paddingRight: 10,
                                        paddingTop: 10,
                                      },
                                      dimensions.width
                                    )}
                                  >
                                    {/* Details */}
                                    <View
                                      style={StyleSheet.applyWidth(
                                        { flex: 1 },
                                        dimensions.width
                                      )}
                                    >
                                      {/* Name */}
                                      <Text
                                        accessible={true}
                                        selectable={false}
                                        style={StyleSheet.applyWidth(
                                          {
                                            color:
                                              palettes.App['Custom Color_18'],
                                            fontFamily: 'Inter_500Medium',
                                            fontSize: 16,
                                            textAlign: 'left',
                                          },
                                          dimensions.width
                                        )}
                                      >
                                        {flashListData?.title}
                                      </Text>
                                      {/* View 2 */}
                                      <View
                                        style={StyleSheet.applyWidth(
                                          {
                                            alignItems: 'center',
                                            flexDirection: 'row',
                                          },
                                          dimensions.width
                                        )}
                                      >
                                        {/* Review */}
                                        <Text
                                          accessible={true}
                                          selectable={false}
                                          numberOfLines={3}
                                          style={StyleSheet.applyWidth(
                                            {
                                              color:
                                                palettes.App['Custom Color_18'],
                                              fontFamily: 'Inter_400Regular',
                                              fontSize: 13,
                                              lineHeight: 16,
                                              marginTop: 8,
                                              opacity: 0.6,
                                            },
                                            dimensions.width
                                          )}
                                        >
                                          {'Due Date: '}
                                          {flashListData?.due_at === null
                                            ? '-'
                                            : DateUtils.format(
                                              flashListData?.due_at,
                                              'MMM DD, YYYY'
                                            )}
                                        </Text>

                                        <View
                                          style={StyleSheet.applyWidth(
                                            {
                                              backgroundColor:
                                                getTaskPriorityColor(
                                                  Variables,
                                                  flashListData?.priority
                                                ),
                                              borderRadius: 12,
                                              marginLeft: 10,
                                              marginTop: 5,
                                              paddingBottom: 2,
                                            },
                                            dimensions.width
                                          )}
                                        >
                                          {/* timestamp */}
                                          <Text
                                            accessible={true}
                                            selectable={false}
                                            style={StyleSheet.applyWidth(
                                              {
                                                alignSelf: 'center',
                                                color: [
                                                  {
                                                    minWidth:
                                                      Breakpoints.Mobile,
                                                    value:
                                                      palettes.App[
                                                      'Custom Color_18'
                                                      ],
                                                  },
                                                  {
                                                    minWidth:
                                                      Breakpoints.Mobile,
                                                    value:
                                                      flashListData?.tag?.color,
                                                  },
                                                ],
                                                fontFamily: 'Inter_400Regular',
                                                fontSize: 12,
                                                marginLeft: 10,
                                                marginRight: 10,
                                                marginTop: 2,
                                                opacity: 0.7,
                                                textAlign: 'center',
                                              },
                                              dimensions.width
                                            )}
                                          >
                                            {getTaskPriority(
                                              Variables,
                                              flashListData?.priority
                                            )}
                                          </Text>
                                        </View>
                                      </View>
                                    </View>
                                  </View>
                                </Surface>
                              );
                            }}
                            showsHorizontalScrollIndicator={true}
                            showsVerticalScrollIndicator={true}
                            style={StyleSheet.applyWidth(
                              {
                                borderRadius: 12,
                                overflow: 'hidden',
                                paddingBottom: 10,
                                paddingTop: 10,
                              },
                              dimensions.width
                            )}
                          />
                          {/* EmptyList 2 */}
                          <>
                            {!(
                              reviewsListData?.results?.length === 0
                            ) ? null : (
                              <EmptyListBlock
                                message={'No outstanding tasks'}
                              />
                            )}
                          </>
                        </>
                      );
                    }}
                  </SunoApi.FetchGetCompletedTasksGET>
                </View>
              </View>
            </View>
          )}
        </>
        {/* Devices */}
        <>
          {!(menuOption === 6) ? null : (
            <View>
              <View
                style={StyleSheet.applyWidth(
                  { paddingLeft: 20, paddingRight: 20, paddingTop: 12 },
                  dimensions.width
                )}
              >
                <Text
                  accessible={true}
                  selectable={false}
                  style={StyleSheet.applyWidth(
                    {
                      color: '#667085',
                      fontFamily: 'Inter_400Regular',
                      fontSize: 13,
                    },
                    dimensions.width
                  )}
                >
                  Manage hearing aids and related accessories for this patient.
                </Text>
              </View>

              <SunoApi.FetchGetPatientProductsGET
                handlers={{
                  on2xx: reviewsListData => {
                    try {
                      const deviceData = reviewsListData?.json?.results || [];
                      setProductData(deviceData);
                      setCurrentDeviceData(getProductDataByType(2, '', deviceData));
                      setCurrentReceiversData(getProductDataByType(3, 1, deviceData));
                      setCurrentEarmoldsData(getProductDataByType(3, 2, deviceData));
                      setCurrentTubesData(getProductDataByType(3, 3, deviceData));
                      setCurrentDomesData(getProductDataByType(3, 4, deviceData));
                      setAccessoriesData(
                        deviceData.filter(item => {
                          const master = item.inventory_product?.product?.master_product;
                          const itemType = master?.type ?? item.type;
                          const itemSubtype = master?.subtype ?? item.subtype;
                          return itemType === 3 && ![1, 2, 3, 4].includes(itemSubtype);
                        })
                      );
                    } catch (err) {
                      logError(err);
                    }
                  },
                }}
                is_active={true}
                limit={100}
                patient={params?.id ?? defaultProps.id}
                query={
                  '{id,returned_at,exchanged_at,patient{id},sale{id,service_date,items{id,price,quantity,total,patient_responsibility,description,discount,insurer_responsibility,tax_rate}},sale_item,inventory_product{id,status,created_at,product{id,display_name,master_product{manufacturer,specification,type,subtype,description,model,msrp}},specification,serial_number,manufacturer_warranty_expiration_date,loss_damage_warranty_expiration_date},order_item{id,manufacturer{name},model,price,quantity,description,total,tracking_number,created_at},status,service_plan_expiration_date,extended_warranty_expiration_date,purchase_date,due_date,description,is_active,is_in_use,serial_number,notes,ear,type,subtype,manufacturer_warranty_expiration_date,loss_damage_warranty_expiration_date,delivered_at_display,statuses{value,created_at}}'
                }
              >
                {({ loading, error, data }) => {
                  if (loading) {
                    return <ActivityIndicator />;
                  }

                  if (error || data?.status < 200 || data?.status >= 300) {
                    return <ActivityIndicator />;
                  }

                  return (
                    <>
                      {renderPatientProductSection(
                        'Current Hearing Aids',
                        currentDeviceData,
                        'No Hearing Aids',
                        'Feather/headphones'
                      )}
                      {renderPatientProductSection(
                        'Receivers',
                        currentReceiversData,
                        'No Receivers',
                        'MaterialCommunityIcons/ear-hearing'
                      )}
                      {renderPatientProductSection(
                        'Earmolds',
                        currentEarmoldsData,
                        'No Earmolds',
                        'Ionicons/ear-outline'
                      )}
                      {renderPatientProductSection(
                        'Tubes',
                        currentTubesData,
                        'No Tubes',
                        'MaterialCommunityIcons/vector-line'
                      )}
                      {renderPatientProductSection(
                        'Domes',
                        currentDomesData,
                        'No Domes',
                        'MaterialCommunityIcons/circle-outline'
                      )}
                      {renderPatientProductSection(
                        'Accessories',
                        accessoriesData,
                        'No Accessories',
                        'MaterialCommunityIcons/package-variant-closed'
                      )}
                    </>
                  );
                }}
              </SunoApi.FetchGetPatientProductsGET>
            </View>
          )}
        </>

        {/* Docs */}
        <>
          {!(menuOption === 1) ? null : (
            <View accessible={false}>



              <Breadcrumb data={documentNames} />
              <Surface
                {...GlobalStyles.SurfaceStyles(theme)['Surface'].props}
                elevation={2}
                style={StyleSheet.applyWidth(
                  StyleSheet.compose(
                    GlobalStyles.SurfaceStyles(theme)['Surface'].style,
                    { minHeight: 12 }
                  ),
                  dimensions.width
                )}
              />
              {/* <View style={{backgroundColor : '#066858', marginBottom : 5, height : 0.7}}>

              </View> */}
              <View
                style={StyleSheet.applyWidth(
                  {
                    alignContent: 'flex-start',
                    alignItems: 'center',
                    alignSelf: 'auto',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingBottom: 10,
                    paddingTop: 5
                  },
                  dimensions.width
                )}
              >
                <Touchable
                  onPress={() => {
                    try {
                      handleScan()
                    } catch (err) {
                      logError(err);
                    }
                  }}
                  activeOpacity={0.8}
                  disabledOpacity={0.8}
                  style={StyleSheet.applyWidth(
                    {
                      marginBottom: 4,
                      marginLeft: 4,
                      marginRight: 4,
                      marginTop: 4,
                    },
                    dimensions.width
                  )}
                >
                  <View
                    style={StyleSheet.applyWidth(
                      {
                        alignContent: 'center',
                        alignItems: 'center',
                        alignSelf: 'center',
                        borderRadius: 8,
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        paddingBottom: 4,
                        paddingLeft: 12,
                        paddingRight: 5,
                        paddingTop: 10,
                      },
                      dimensions.width
                    )}
                  >
                    <Icon
                      color={theme.colors.branding.secondary}
                      name={'Ionicons/scan-outline'}
                      size={20}
                      style={StyleSheet.applyWidth(
                        { marginRight: 3 },
                        dimensions.width
                      )}
                    />
                    <Text
                      accessible={true}
                      selectable={false}
                      style={StyleSheet.applyWidth(
                        {
                          color: theme.colors.branding.secondary,
                          fontFamily: 'Inter_500Medium',
                          fontSize: 14,
                        },
                        dimensions.width
                      )}
                    >
                      {'Scan Document'}
                    </Text>
                  </View>
                </Touchable>
                <Touchable
                  onPress={() => {
                    try {
                      setFolderNameModel(true);
                    } catch (err) {
                      logError(err);
                    }
                  }}
                  activeOpacity={0.8}
                  disabledOpacity={0.8}
                  style={StyleSheet.applyWidth(
                    {
                      marginBottom: 4,
                      marginLeft: 24,
                      marginRight: 4,
                      marginTop: 4,
                    },
                    dimensions.width
                  )}
                >
                  <View
                    style={StyleSheet.applyWidth(
                      {
                        alignContent: 'center',
                        alignItems: 'center',
                        alignSelf: 'center',
                        borderRadius: 8,
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        paddingBottom: 4,
                        paddingLeft: 12,
                        paddingRight: 5,
                        paddingTop: 10,
                      },
                      dimensions.width
                    )}
                  >
                    <Icon
                      color={theme.colors.branding.secondary}
                      name={'FontAwesome/plus-square-o'}
                      size={20}
                      style={StyleSheet.applyWidth(
                        { marginRight: 3 },
                        dimensions.width
                      )}
                    />
                    <Text
                      accessible={true}
                      selectable={false}
                      style={StyleSheet.applyWidth(
                        {
                          color: theme.colors.branding.secondary,
                          fontFamily: 'Inter_500Medium',
                          fontSize: 14,
                        },
                        dimensions.width
                      )}
                    >
                      {'New Folder'}
                    </Text>
                  </View>
                </Touchable>
              </View>


              {/* <V */}
              {/* <View
                style={StyleSheet.applyWidth(
                  { marginLeft: 20, marginRight: 20, marginTop: 12 },
                  dimensions.width
                )}
              >
                <SimpleStyleFlatList
                  data={[
                    { speciality: 'All' },
                    { speciality: 'Test Results' },
                    { speciality: 'Insurance' },
                    { speciality: 'Consent Forms' },
                    { speciality: 'Reports' },
                  ]}
                  decelerationRate={'normal'}
                  inverted={false}
                  keyExtractor={(list2Data, index) => index}
                  keyboardShouldPersistTaps={'never'}
                  listKey={'Scroll View->Docs->ScrollTab 2->List 2'}
                  nestedScrollEnabled={false}
                  numColumns={1}
                  onEndReachedThreshold={0.5}
                  pagingEnabled={false}
                  renderItem={({ item, index }) => {
                    const list2Data = item;
                    return (
                      <View>
                        <Touchable
                          onPress={() => {
                            try {
                              setDocType(index);
                              setDocType(index);
                            } catch (err) {
                              logError(err);
                            }
                          }}
                          activeOpacity={0.8}
                          disabledOpacity={0.8}
                          style={StyleSheet.applyWidth(
                            { marginRight: 12 },
                            dimensions.width
                          )}
                        >
                          <Surface
                            {...GlobalStyles.SurfaceStyles(theme)['Surface']
                              .props}
                            elevation={1}
                            style={StyleSheet.applyWidth(
                              StyleSheet.compose(
                                GlobalStyles.SurfaceStyles(theme)['Surface']
                                  .style,
                                {
                                  borderColor: palettes.App.TagBorder,
                                  borderRadius: 10,
                                  minHeight: 36,
                                }
                              ),
                              dimensions.width
                            )}
                          >
                            <>
                              {!list2Data?.speciality ? null : (
                                <View
                                  style={StyleSheet.applyWidth(
                                    {
                                      alignItems: 'center',
                                      backgroundColor: [
                                        {
                                          minWidth: Breakpoints.Mobile,
                                          value: palettes.App['Custom #ffffff'],
                                        },
                                        {
                                          minWidth: Breakpoints.Mobile,
                                          value:
                                            index === docType
                                              ? theme.colors.branding.secondary
                                              : '#f3f4f6',
                                        },
                                      ],
                                      borderRadius: 8,
                                      height: 36,
                                      justifyContent: 'center',
                                      paddingBottom: 8,
                                      paddingLeft: 12,
                                      paddingRight: 12,
                                      paddingTop: 8,
                                    },
                                    dimensions.width
                                  )}
                                >
                                  <Text
                                    accessible={true}
                                    selectable={false}
                                    style={StyleSheet.applyWidth(
                                      {
                                        color: [
                                          {
                                            minWidth: Breakpoints.Mobile,
                                            value: theme.colors.text.strong,
                                          },
                                          {
                                            minWidth: Breakpoints.Mobile,
                                            value:
                                              index === docType
                                                ? theme.colors.background.base
                                                : '#374151',
                                          },
                                        ],
                                        fontFamily: 'Inter_400Regular',
                                      },
                                      dimensions.width
                                    )}
                                  >
                                    {list2Data?.speciality}
                                  </Text>
                                </View>
                              )}
                            </>
                          </Surface>
                        </Touchable>
                      </View>
                    );
                  }}
                  showsHorizontalScrollIndicator={true}
                  showsVerticalScrollIndicator={true}
                  snapToAlignment={'start'}
                  horizontal={true}
                />
              </View> */}

              <FlatList
                data={items}
                renderItem={renderAgendaItem}
                // keyExtractor={(item, index) => item?.key ?? index.toString()}
                ListEmptyComponent={
                  loadingEdocs ? (
                    <View style={{ alignItems: 'center', paddingTop: 30 }}>
                      <ActivityIndicator size="large" color="#066858" />
                    </View>
                  ) : (
                    <View style={{ alignItems: 'center', paddingTop: 30 }}>
                      <Text>There are no items in this folder.</Text>
                    </View>
                  )
                }
              />

              {/* <View
                style={StyleSheet.applyWidth(
                  { paddingLeft: 20, paddingRight: 20 },
                  dimensions.width
                )}
              >
                <>
                  {taskType ? null : (
                    <View
                      style={StyleSheet.applyWidth(
                        { borderRadius: 12, overflow: 'hidden' },
                        dimensions.width
                      )}
                    >
                      <DraftbitExampleApi.FetchDoctorsListGET count={6}>
                        {({ loading, error, data, refetchDoctorsList }) => {
                          const reviewsListData = data?.json;
                          if (loading) {
                            return <ActivityIndicator />;
                          }

                          if (
                            error ||
                            data?.status < 200 ||
                            data?.status >= 300
                          ) {
                            return <ActivityIndicator />;
                          }

                          return (
                            <SimpleStyleFlashList
                              data={filterDocumentFlashListData(
                                Variables,
                                docType
                              )}
                              estimatedItemSize={50}
                              horizontal={false}
                              inverted={false}
                              keyExtractor={(flashListData, index) =>
                                flashListData?.id ??
                                flashListData?.uuid ??
                                index?.toString() ??
                                JSON.stringify(flashListData)
                              }
                              listKey={
                                'Scroll View->Docs->Task->OpenTask->reviews list->FlashList'
                              }
                              numColumns={1}
                              onEndReachedThreshold={0.5}
                              renderItem={({ item, index }) => {
                                const flashListData = item;
                                return (
                                  <>
                                    <Surface
                                      {...GlobalStyles.SurfaceStyles(theme)[
                                        'Surface'
                                      ].props}
                                      elevation={1}
                                      style={StyleSheet.applyWidth(
                                        StyleSheet.compose(
                                          GlobalStyles.SurfaceStyles(theme)[
                                            'Surface'
                                          ].style,
                                          {
                                            borderColor: palettes.App.TagBorder,
                                            borderRadius: 10,
                                            borderWidth: 1,
                                            marginBottom: 10,
                                          }
                                        ),
                                        dimensions.width
                                      )}
                                    >
                                      <View
                                        style={StyleSheet.applyWidth(
                                          {
                                            alignItems: 'center',
                                            backgroundColor:
                                              palettes.App['Custom Color_15'],
                                            borderRadius: 10,
                                            flex: 1,
                                            flexDirection: 'row',
                                            paddingLeft: 8,
                                            paddingRight: 8,
                                          },
                                          dimensions.width
                                        )}
                                      >
                                        <Icon
                                          size={24}
                                          color={flashListData?.color}
                                          name={
                                            flashListData?.downloadtype === 1
                                              ? 'Ionicons/document-text'
                                              : 'MaterialCommunityIcons/image'
                                          }
                                        />
                                        <View
                                          style={StyleSheet.applyWidth(
                                            {
                                              backgroundColor:
                                                palettes.App['Custom Color_15'],
                                              borderBottomLeftRadius: 10,
                                              borderBottomRightRadius: 10,
                                              borderTopLeftRadius: 10,
                                              borderTopRightRadius: 10,
                                              flex: 1,
                                              flexDirection: 'row',
                                              paddingBottom: 10,
                                              paddingLeft: 10,
                                              paddingRight: 10,
                                              paddingTop: 10,
                                            },
                                            dimensions.width
                                          )}
                                        >
                                          <View
                                            style={StyleSheet.applyWidth(
                                              { flex: 1 },
                                              dimensions.width
                                            )}
                                          >
                                            <View
                                              style={StyleSheet.applyWidth(
                                                {
                                                  alignItems: 'center',
                                                  flexDirection: 'row',
                                                  justifyContent:
                                                    'space-between',
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
                                                      palettes.App[
                                                      'Custom Color_18'
                                                      ],
                                                    fontFamily:
                                                      'Inter_500Medium',
                                                    fontSize: 16,
                                                  },
                                                  dimensions.width
                                                )}
                                              >
                                                {flashListData?.name}
                                              </Text>
                                            </View>
                                            <Text
                                              accessible={true}
                                              selectable={false}
                                              style={StyleSheet.applyWidth(
                                                {
                                                  color:
                                                    palettes.App[
                                                    'Custom Color_18'
                                                    ],
                                                  fontFamily:
                                                    'Inter_400Regular',
                                                  fontSize: 12,
                                                  marginTop: 8,
                                                  opacity: 0.7,
                                                },
                                                dimensions.width
                                              )}
                                            >
                                              {flashListData?.date}
                                              {' • '}
                                              {flashListData?.size}
                                              {' • Uploaded by: '}
                                              {flashListData?.assign}
                                            </Text>
                                          </View>
                                        </View>
                                        <IconButton
                                          color={
                                            '#4b5563' ??
                                            palettes.App['Custom Color']
                                          }
                                          icon={'Feather/download'}
                                          size={24}
                                        />
                                      </View>
                                    </Surface>
                                  </>
                                );
                              }}
                              showsHorizontalScrollIndicator={true}
                              showsVerticalScrollIndicator={true}
                              style={StyleSheet.applyWidth(
                                {
                                  borderRadius: 12,
                                  overflow: 'hidden',
                                  paddingBottom: 10,
                                  paddingTop: 10,
                                },
                                dimensions.width
                              )}
                            />
                          );
                        }}
                      </DraftbitExampleApi.FetchDoctorsListGET>
                    </View>
                  )}
                </>
              </View> */}

            </View>
          )}
        </>

        {/* Billing */}
        <>
          {!(menuOption === 2) ? null : (
            <View
              accessible={false}
              style={StyleSheet.applyWidth(
                { flex: 1, position: 'relative' },
                dimensions.width
              )}
            >


              <View
                style={StyleSheet.applyWidth({ flex: 1 }, dimensions.width)}
              >

                {/* Note */}
                <View
                  style={StyleSheet.applyWidth(
                    { paddingLeft: 20, paddingRight: 20 },
                    dimensions.width
                  )}
                >
                  <View
                    style={StyleSheet.applyWidth(
                      { borderRadius: 12, overflow: 'hidden' },
                      dimensions.width
                    )}
                  >
                    <SunoApi.FetchBillingGET
                      patient={params?.id ?? defaultProps.id}
                      offset={0}
                      has_active_subscription={true}
                      limit={25}
                      nulls_first={true}
                      handlers={{
                        onData: fetchData => {
                          const handler = async () => {
                            try {
                              setBillingData(fetchData?.results);
                              // console.log("===== fetchData : ",fetchData)
                              // await setGlobalVariableValue({
                              //   key: 'taskOffsetFilter',
                              //   value: Constants['taskOffsetFilter'] + patientLimit,
                              // });
                              /* hidden 'Set Variable' action */
                              // if (refreshing) setRefreshing(false);

                            } catch (err) {
                              logError(err);
                            }
                          };
                          handler();
                        },
                      }}
                      query={`{id,balance,is_active_subscription,items{cpt_code,insurer_responsibility},payment_source_type,insurance_policy{insurer{name}},secondary_insurance_policy{insurer{name}},managed_care_plan{name,managed_care_provider{name}},provider{id,first_name,last_name,title,suffix,is_active},created_at,invoice_date,service_date,status,total,total_adjusted,total_paid,most_recent_hcfa_1500_form{id,status,form_data,is_uploaded},appointment{id,type{id,name,default_duration},chart_note{icd10_codes}},quickbooks_invoice_id,quickbooks_sync{sync_status,error},clinic{id,timezone,name,logo,practice{id,name,logo}},patient_responsibility_balance,insurer_responsibility_balance,total_refunds,assigned_tags,notes,created_by,updated_by,is_migrated,migration_source_id,patient{id}}`}
                    >
                      {({ loading, error, data, refetchGetMyAssigneeTasks }) => {
                        const fetchData = data?.json;
                        if (loading) {
                          return <ActivityIndicator size="large" color="#066858" />;
                        }

                        if (error || data?.status < 200 || data?.status >= 300) {
                          return <ActivityIndicator size="large" color="#066858" />;
                        }
                        // if (listLoading) {
                        //   return <ActivityIndicator size="large" color="#066858" />;
                        // }
                        return (
                          <>
                            <>
                              {!(billingData?.length === 0) ? null : (
                                <EmptyListBlock
                                  message={'No billing history available'}
                                />
                              )}
                            </>
                            <>
                              <SimpleStyleFlashList
                                data={billingData}
                                estimatedItemSize={50}
                                horizontal={false}
                                inverted={false}
                                keyExtractor={(flashListData, index) =>
                                  flashListData?.id ??
                                  flashListData?.uuid ??
                                  index?.toString() ??
                                  JSON.stringify(flashListData)
                                }
                                listKey={'Task->View->Task->Fetch->FlashList'}
                                numColumns={1}

                                // onRefresh={async () => {
                                //   setRefreshing(true);

                                //   try {
                                //     await refetchGetMyAssigneeTasks();   // ⬅️ re-fetch API
                                //   } catch (e) {
                                //     logError(e);
                                //   }

                                //   setRefreshing(false);
                                // }}

                                // refreshing={refreshing}
                                onEndReachedThreshold={0.5}
                                renderItem={({ item, index }) => {
                                  const flashListData = item;
                                  return (
                                    <Surface
                                      {...GlobalStyles.SurfaceStyles(theme)['Surface']
                                        .props}
                                      elevation={1}
                                      style={StyleSheet.applyWidth(
                                        StyleSheet.compose(
                                          GlobalStyles.SurfaceStyles(theme)['Surface']
                                            .style,
                                          {
                                            backgroundColor:
                                              palettes.App['Custom #ffffff'],
                                            borderColor: palettes.App.TagBorder,
                                            borderRadius: 10,
                                            borderWidth: 1,
                                            marginBottom: 10,
                                          }
                                        ),
                                        dimensions.width
                                      )}
                                    >
                                      <Touchable
                                        onPress={() => {
                                          try {
                                            navigation.navigate(
                                              'ViewBillingScreen',
                                              { billingData: flashListData },
                                              { pop: true }
                                            );
                                          } catch (err) {
                                            logError(err);
                                          }
                                        }}
                                      >
                                        <View
                                          style={StyleSheet.applyWidth(
                                            {
                                              alignItems: 'center',
                                              backgroundColor:
                                                palettes.App['Custom Color_15'],
                                              borderBottomLeftRadius: 10,
                                              borderBottomRightRadius: 10,
                                              borderTopLeftRadius: 10,
                                              borderTopRightRadius: 10,
                                              flexDirection: 'row',
                                              paddingBottom: 10,
                                              paddingLeft: 10,
                                              paddingRight: 10,
                                              paddingTop: 10,
                                            },
                                            dimensions.width
                                          )}
                                        >
                                          {/* Details */}
                                          <View
                                            style={StyleSheet.applyWidth(
                                              {
                                                flex: 1, marginLeft: 10
                                              },
                                              dimensions.width
                                            )}
                                          >
                                            {/* View 5 */}
                                            <View
                                              style={StyleSheet.applyWidth(
                                                { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
                                                dimensions.width
                                              )}
                                            >
                                              {/* Name */}
                                              <Text
                                                accessible={true}
                                                selectable={false}
                                                style={StyleSheet.applyWidth(
                                                  {
                                                    color:
                                                      palettes.App['Custom Color_18'],
                                                    fontFamily: 'Inter_500Medium',
                                                    fontSize: 16,
                                                    textAlign: 'left',
                                                  },
                                                  dimensions.width
                                                )}
                                              >
                                                {'Service Date: '}
                                                {flashListData?.service_date === null
                                                  ? 'Future fitting'
                                                  : DateUtils.format(
                                                    flashListData?.service_date,
                                                    'MM/DD/YYYY'
                                                  )}
                                              </Text>

                                              <Text
                                                accessible={true}
                                                selectable={false}
                                                style={StyleSheet.applyWidth(
                                                  {
                                                    color: flashListData?.balance > 0 ? '#ef4444' :
                                                      palettes.App['Custom Color_18'],
                                                    fontFamily: 'Inter_500Medium',
                                                    fontSize: 16,
                                                    textAlign: 'left',
                                                    textDecorationLine: flashListData?.balance > 0 && (flashListData?.status == 999 || flashListData?.status == 1000) ? 'line-through' : 'none',
                                                    fontStyle: flashListData?.balance > 0 && (flashListData?.status == 999 || flashListData?.status == 1000) ? 'italic' : 'normal'

                                                  },
                                                  dimensions.width
                                                )}
                                              >
                                                ${flashListData?.balance}
                                              </Text>

                                            </View>
                                            {/* View 2 */}
                                            <View
                                              style={StyleSheet.applyWidth(
                                                {
                                                  alignItems: 'center',
                                                  flexDirection: 'row',
                                                },
                                                dimensions.width
                                              )}
                                            >
                                              {/* Review */}
                                              <Text
                                                accessible={true}
                                                selectable={false}
                                                numberOfLines={3}
                                                style={StyleSheet.applyWidth(
                                                  {
                                                    color:
                                                      palettes.App['Custom Color_18'],
                                                    fontFamily: 'Inter_400Regular',
                                                    fontSize: 13,
                                                    lineHeight: 16,
                                                    marginTop: 8,
                                                    opacity: 0.6,
                                                  },
                                                  dimensions.width
                                                )}
                                              >
                                                {"Invoice Number : "} {flashListData?.id}
                                              </Text>

                                              {/* <View
                                            style={StyleSheet.applyWidth(
                                              {
                                                backgroundColor:
                                                  getTaskPriorityColor(
                                                    Variables,
                                                    flashListData?.priority
                                                  ),
                                                borderRadius: 12,
                                                marginLeft: 10,
                                                marginTop: 5,
                                                paddingBottom: 2,
                                              },
                                              dimensions.width
                                            )}
                                          >
                                            <Text
                                              accessible={true}
                                              selectable={false}
                                              style={StyleSheet.applyWidth(
                                                {
                                                  alignSelf: 'center',
                                                  color: [
                                                    {
                                                      minWidth: Breakpoints.Mobile,
                                                      value:
                                                        palettes.App[
                                                        'Custom Color_18'
                                                        ],
                                                    },
                                                    {
                                                      minWidth: Breakpoints.Mobile,
                                                      value:
                                                        flashListData?.tag?.color,
                                                    },
                                                  ],
                                                  fontFamily: 'Inter_400Regular',
                                                  fontSize: 12,
                                                  marginLeft: 10,
                                                  marginRight: 10,
                                                  marginTop: 2,
                                                  opacity: 0.7,
                                                  textAlign: 'center',
                                                },
                                                dimensions.width
                                              )}
                                            >
                                              {getTaskPriority(
                                                Variables,
                                                flashListData?.priority
                                              )}
                                            </Text>
                                          </View> */}
                                            </View>
                                            {/* View 3 */}
                                            <View
                                              style={StyleSheet.applyWidth(
                                                {
                                                  flexDirection: 'row',
                                                  justifyContent: 'space-between',
                                                },
                                                dimensions.width
                                              )}
                                            >
                                              {/* status */}
                                              <Text
                                                accessible={true}
                                                selectable={false}
                                                numberOfLines={3}
                                                style={StyleSheet.applyWidth(
                                                  {
                                                    color:
                                                      palettes.App['Custom Color_18'],
                                                    fontFamily: 'Inter_400Regular',
                                                    fontSize: 13,
                                                    lineHeight: 16,
                                                    marginTop: 8,
                                                    opacity: 0.6,
                                                  },
                                                  dimensions.width
                                                )}
                                              >
                                                {'Provider: '}
                                                {flashListData?.provider?.first_name} {flashListData?.provider?.last_name
                                                }
                                              </Text>
                                            </View>
                                            <View
                                              style={StyleSheet.applyWidth(
                                                {
                                                  flexDirection: 'row',
                                                  justifyContent: 'space-between',
                                                },
                                                dimensions.width
                                              )}
                                            >
                                              {/* status */}
                                              <Text
                                                accessible={true}
                                                selectable={false}
                                                numberOfLines={3}
                                                style={StyleSheet.applyWidth(
                                                  {
                                                    color:
                                                      palettes.App['Custom Color_18'],
                                                    fontFamily: 'Inter_400Regular',
                                                    fontSize: 13,
                                                    lineHeight: 16,
                                                    marginTop: 8,
                                                    opacity: 0.6,
                                                  },
                                                  dimensions.width
                                                )}
                                              >
                                                {'Clinic: '}
                                                {flashListData?.clinic?.name}
                                              </Text>
                                            </View>
                                            <View
                                              style={StyleSheet.applyWidth(
                                                {
                                                  flexDirection: 'row',
                                                  justifyContent: 'space-between',
                                                },
                                                dimensions.width
                                              )}
                                            >
                                              {/* status */}
                                              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Text
                                                  accessible={true}
                                                  selectable={false}
                                                  numberOfLines={3}
                                                  style={StyleSheet.applyWidth(
                                                    {
                                                      color:
                                                        palettes.App['Custom Color_18'],
                                                      fontFamily: 'Inter_400Regular',
                                                      fontSize: 13,
                                                      lineHeight: 16,
                                                      marginTop: 8,
                                                      opacity: 0.6,

                                                    },
                                                    dimensions.width
                                                  )}
                                                >
                                                  {'PT Bal: '}</Text>
                                                <Text
                                                  accessible={true}
                                                  selectable={false}
                                                  numberOfLines={3}
                                                  style={StyleSheet.applyWidth(
                                                    {
                                                      color:
                                                        palettes.App['Custom Color_18'],
                                                      fontFamily: 'Inter_400Regular',
                                                      fontSize: 13,
                                                      lineHeight: 16,
                                                      marginTop: 8,
                                                      opacity: 0.6,
                                                      textDecorationLine: flashListData?.balance > 0 && (flashListData?.status == 999 || flashListData?.status == 1000) ? 'line-through' : 'none',
                                                      fontStyle: flashListData?.balance > 0 && (flashListData?.status == 999 || flashListData?.status == 1000) ? 'italic' : 'normal'

                                                    },
                                                    dimensions.width
                                                  )}
                                                >
                                                  ${flashListData?.patient_responsibility_balance}
                                                </Text>
                                              </View>
                                              <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                                                <Text
                                                  accessible={true}
                                                  selectable={false}
                                                  numberOfLines={3}
                                                  style={StyleSheet.applyWidth(
                                                    {
                                                      color:
                                                        palettes.App['Custom Color_18'],
                                                      fontFamily: 'Inter_400Regular',
                                                      fontSize: 13,
                                                      lineHeight: 16,
                                                      marginTop: 8,
                                                      opacity: 0.6,
                                                    },
                                                    dimensions.width
                                                  )}
                                                >
                                                  {'INS Bal: '}</Text>

                                                <Text
                                                  accessible={true}
                                                  selectable={false}
                                                  numberOfLines={3}
                                                  style={StyleSheet.applyWidth(
                                                    {
                                                      color:
                                                        palettes.App['Custom Color_18'],
                                                      fontFamily: 'Inter_400Regular',
                                                      fontSize: 13,
                                                      lineHeight: 16,
                                                      marginTop: 8,
                                                      opacity: 0.6,
                                                      textDecorationLine: flashListData?.balance > 0 && (flashListData?.status == 999 || flashListData?.status == 1000) ? 'line-through' : 'none',
                                                      fontFamily: flashListData?.balance > 0 && (flashListData?.status == 999 || flashListData?.status == 1000) ? 'italic' : 'normal'

                                                    },
                                                    dimensions.width
                                                  )}
                                                >
                                                  ${flashListData?.insurer_responsibility_balance}
                                                </Text>
                                              </View>
                                            </View>

                                            {/* View 4 */}
                                            {/* <View
                                        style={StyleSheet.applyWidth(
                                          {
                                            alignItems: 'flex-start',
                                            alignSelf: 'flex-end',
                                            backgroundColor: getTaskStatusColor(
                                              Variables,
                                              flashListData?.status
                                            ),
                                            borderRadius: 5,
                                            marginTop: 5,
                                            paddingBottom: 2,
                                          },
                                          dimensions.width
                                        )}
                                      >
                                        <Text
                                          accessible={true}
                                          selectable={false}
                                          style={StyleSheet.applyWidth(
                                            {
                                              alignSelf: 'center',
                                              color: [
                                                {
                                                  minWidth: Breakpoints.Mobile,
                                                  value:
                                                    palettes.App[
                                                    'Custom Color_18'
                                                    ],
                                                },
                                                {
                                                  minWidth: Breakpoints.Mobile,
                                                  value:
                                                    flashListData?.tag?.color,
                                                },
                                              ],
                                              fontFamily: 'Inter_400Regular',
                                              fontSize: 12,
                                              marginLeft: 10,
                                              marginRight: 10,
                                              marginTop: 2,
                                              opacity: 0.7,
                                              paddingBottom: 4,
                                              paddingTop: 4,
                                              textAlign: 'center',
                                            },
                                            dimensions.width
                                          )}
                                        >
                                          {getTaskStatus(
                                            Variables,
                                            flashListData?.status
                                          )}
                                        </Text>
                                      </View> */}
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>

                                              <View
                                                style={StyleSheet.applyWidth(
                                                  {
                                                    // alignItems: 'flex-start',
                                                    // alignSelf: 'flex-end',
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    backgroundColor: getBillingStatusColor(
                                                      Variables,
                                                      flashListData?.status,
                                                      1
                                                    ),
                                                    borderRadius: 5,
                                                    marginTop: 5,
                                                    paddingBottom: 2,
                                                  },
                                                  dimensions.width

                                                )}
                                              >
                                                <View
                                                  style={StyleSheet.applyWidth(
                                                    {
                                                      // alignItems: 'flex-start',
                                                      // alignSelf: 'flex-end',
                                                      height: 10,
                                                      width: 10,
                                                      backgroundColor: getBillingStatusColor(
                                                        Variables,
                                                        flashListData?.status,
                                                        3
                                                      ),
                                                      borderRadius: 5,
                                                      marginLeft: 10,
                                                      marginVertical: 3,

                                                      // paddingBottom: 2,
                                                    },
                                                    dimensions.width

                                                  )}
                                                ></View>
                                                <Text
                                                  accessible={true}
                                                  selectable={false}
                                                  style={StyleSheet.applyWidth(
                                                    {
                                                      alignSelf: 'center',
                                                      color: [
                                                        {
                                                          minWidth: Breakpoints.Mobile,
                                                          value:
                                                            palettes.App[
                                                            'Custom Color_18'
                                                            ],
                                                        },
                                                        // {
                                                        //   minWidth: Breakpoints.Mobile,
                                                        //   value:
                                                        //   getBillingStatusColor(
                                                        //     Variables,
                                                        //     flashListData?.status,
                                                        //   2
                                                        //   ),
                                                        // },
                                                      ],
                                                      fontFamily: 'Inter_500Medium',
                                                      fontSize: 12,
                                                      marginLeft: 10,
                                                      marginRight: 10,
                                                      marginVertical: 3,
                                                      opacity: 0.7,
                                                      paddingBottom: 4,
                                                      paddingTop: 4,
                                                      textAlign: 'center',

                                                    },
                                                    dimensions.width
                                                  )}
                                                >
                                                  {getBillingStatus(
                                                    Variables,
                                                    flashListData?.status
                                                  )}
                                                </Text>
                                              </View>
                                              <Text
                                                accessible={true}
                                                selectable={false}
                                                numberOfLines={3}
                                                style={StyleSheet.applyWidth(
                                                  {
                                                    color:
                                                      palettes.App['Custom Color_18'],
                                                    fontFamily: 'Inter_400Regular',
                                                    fontSize: 13,
                                                    lineHeight: 16,
                                                    marginTop: 8,
                                                    opacity: 0.6,
                                                  },
                                                  dimensions.width
                                                )}
                                              >
                                                {'Created By: '}
                                                {flashListData?.created_by?.full_name}
                                              </Text>
                                              {/* <TouchableOpacity onPress={() => {
                                             const handler = async () => {

                                              try {
                            
                                                Alert.alert(
                                                  `Are you sure you want to delete this task?`,
                                                  `Delete ${flashListData?.title}`,
                                                  [
                                                    {
                                                      text: 'Cancel',
                                                      onPress: () => console.log('Cancel Pressed'),
                                                      style: 'cancel', // iOS bolds "Cancel"
                                                    },
                                                    {
                                                      text: 'Yes',
                                                      onPress: async () => {
                                                        setLoading(true);
                                                        const deleted = (
                                                          await sunoDeleteTaskDELETE.mutateAsync({
                                                            task_id: flashListData?.id,
                                                          })
                                                        )?.json;
                                                        await refetchGetMyAssigneeTasks();

                                                        // const alltaskData = (
                                                        //   await SunoApi.getTaskDetailsGET(Constants, {
                                                        //     query:
                                                        //       '{id,title,priority,status,description,due_at,completed_at,updated_at,created_at,patient{id,first_name,middle_name,last_name,title,suffix,preferred_name,photo},comments{id,text,user{id,full_name,photo},created_at,created_by},assignees{user{id,first_name,last_name,full_name,suffix,title,is_active,photo}},assignee{id,first_name,last_name,full_name,suffix,title,is_active,photo},created_by}',
                                                        //     task_id: (params?.taskData ?? defaultProps.taskData)?.id,
                                                        //   })
                                                        // )?.json;
                                                        // setTaskData(alltaskData);
                                                        // setValue(String(alltaskData?.status ?? ""));
                            
                                                        setLoading(false);
                            
                                                      }
                                                    }
                                                  ],
                                                  { cancelable: true } // ✅ Android back button closes alert
                                                );
                            
                            
                                              } catch (err) {
                                                logError(err);
                                              }
                                            };
                                            handler();
                                          }} style={{ height : 35, width : 40, alignItems : 'center', justifyContent  :'center'}}>
                                            <Icon
                                              color={'#032c2a'}
                                              name={'MaterialIcons/delete'}
                                              size={25}
                                            />
                                          </TouchableOpacity> */}
                                            </View>

                                          </View>

                                        </View>
                                      </Touchable>
                                    </Surface>
                                  );
                                }}
                                showsHorizontalScrollIndicator={true}
                                showsVerticalScrollIndicator={true}
                                style={StyleSheet.applyWidth(
                                  {
                                    borderRadius: 12,
                                    overflow: 'hidden',
                                    paddingBottom: 10,
                                    paddingTop: 10,
                                  },
                                  dimensions.width
                                )}
                              />
                            </>
                          </>
                        );
                      }}
                    </SunoApi.FetchBillingGET>
                  </View>
                </View>
              </View>
            </View>
          )}
        </>
        {/* Capture Visit */}

        <>
          {!(menuOption === 3) ? null : (
            <View
              accessible={false}
              style={StyleSheet.applyWidth(
                { flex: 1, position: 'relative' },
                dimensions.width
              )}
            >


              <View
                style={StyleSheet.applyWidth(
                  { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
                  dimensions.width
                )}
              >
                {/* Header */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 12,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        backgroundColor: '#E8EFED',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                      }}
                    >
                      <Icon
                        color={theme.colors.branding.secondary}
                        name={'MaterialCommunityIcons/microphone-outline'}
                        size={22}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontFamily: 'Inter_600SemiBold',
                          fontSize: 16,
                          color: palettes.App['Custom Color_18'],
                        }}
                      >
                        Ambient Scribe
                      </Text>
                      {status !== 'idle' && (
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginTop: 3,
                          }}
                        >
                          <View
                            style={{
                              width: 7,
                              height: 7,
                              borderRadius: 4,
                              backgroundColor:
                                status === 'recording' ? '#EF4444' : '#F59E0B',
                              marginRight: 6,
                            }}
                          />
                          <Text
                            style={{
                              fontFamily: 'Inter_400Regular',
                              fontSize: 12,
                              color: palettes.App.TextPlaceholder,
                            }}
                          >
                            {status === 'recording'
                              ? 'Recording'
                              : status === 'paused' || status === 'pause'
                                ? 'Paused'
                                : isConnecting
                                  ? 'Connecting'
                                  : 'Active'}
                            {' · '}
                            {`${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <Touchable
                    onPress={() => {
                      navigation.navigate(
                        'ScribeViewScreen',
                        { id: params?.id ?? defaultProps.id },
                        { pop: true }
                      );
                    }}
                    activeOpacity={0.8}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#E8EFED',
                        borderRadius: 10,
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                      }}
                    >
                      <Icon
                        color={theme.colors.branding.secondary}
                        name={'MaterialCommunityIcons/history'}
                        size={18}
                      />
                      <Text
                        style={{
                          fontFamily: 'Inter_500Medium',
                          fontSize: 13,
                          color: theme.colors.branding.secondary,
                          marginLeft: 6,
                        }}
                      >
                        History
                      </Text>
                    </View>
                  </Touchable>
                </View>

                {!scribes_enabled && (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      backgroundColor: '#FFF8ED',
                      borderColor: '#FDE6B8',
                      borderWidth: 1,
                      borderRadius: 12,
                      padding: 14,
                      marginBottom: 12,
                    }}
                  >
                    <Icon
                      name={'MaterialIcons/report-problem'}
                      size={20}
                      color={'#D97706'}
                    />
                    <Text
                      style={{
                        flex: 1,
                        marginLeft: 10,
                        fontFamily: 'Inter_400Regular',
                        fontSize: 13,
                        lineHeight: 19,
                        color: palettes.App.FilterTextColor,
                      }}
                    >
                      Ambient Scribe is not enabled for your account.
                    </Text>
                  </View>
                )}

                <ScribeControlBar
                  scribes_enabled={scribes_enabled}
                  status={status}
                  amplitude={amplitude}
                  isConnecting={isConnecting}
                  isPostponing={isPostponing}
                  selectedSOAPMain={selectedSOAPMain}
                  selectedChartNoteMain={selectedChartNoteMain}
                  onStart={startRecording}
                  onPause={pauseRecording}
                  onPostpone={postponeRecording}
                  onResume={resumeRecording}
                  onStop={stopRecording}
                  onSaveSettings={(data) => {
                    setSelectedChartNoteMain(data.chartNote)
                    setSelectedPreviewMain(data.preview)
                    setSelectedSOAPMain(data.soap)
                  }}
                  showSilenceModal={showSilenceModal}
                  countdown={countdown}
                  onSilencePause={pauseRecording}
                  onSilenceContinue={onSilenceContinue}
                />

                {selectedPreviewMain ? (
                  <Surface
                    elevation={2}
                    style={StyleSheet.applyWidth(
                      {
                        flex: 1,
                        backgroundColor: '#fff',
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: '#E8EEEC',
                        marginTop: 4,
                        marginBottom: 16,
                        padding: 16,
                      },
                      dimensions.width
                    )}
                  >
                    <Text
                      style={{
                        fontFamily: 'Inter_400Regular',
                        fontSize: 11,
                        letterSpacing: 0.6,
                        textTransform: 'uppercase',
                        color: palettes.App.TextPlaceholder,
                        marginBottom: 10,
                      }}
                    >
                      Live Transcript
                    </Text>
                    <SimpleStyleScrollView
                      bounces={true}
                      horizontal={false}
                      keyboardShouldPersistTaps={'handled'}
                      nestedScrollEnabled={true}
                      showsHorizontalScrollIndicator={false}
                      showsVerticalScrollIndicator={true}
                      style={StyleSheet.applyWidth({ flex: 1 }, dimensions.width)}
                    >
                      <Text
                        style={{
                          fontFamily: 'Inter_400Regular',
                          fontSize: 14,
                          lineHeight: 22,
                          color: transcript
                            ? palettes.App['Custom Color_18']
                            : palettes.App.TextPlaceholder,
                        }}
                      >
                        {transcript ||
                          'Transcription will appear here as you speak.'}
                      </Text>
                    </SimpleStyleScrollView>
                  </Surface>
                ) : null}
              </View>
            </View>
          )}
        </>

 {/* Tasks  */}
        <>
          {!(menuOption === 4) ? null : (
            <View
              accessible={false}
              style={StyleSheet.applyWidth(
                { flex: 1, position: 'relative' },
                dimensions.width
              )}
            >
              <View
                style={StyleSheet.applyWidth(
                  {
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    paddingHorizontal: 20,
                    paddingTop: 16,
                    paddingBottom: 4,
                  },
                  dimensions.width
                )}
              >
                <CustomAddBlock
                  title="New Task"
                  onPressEvent={() => {
                    try {
                      navigation.navigate(
                        'NewTaskScreen',
                        {
                          patientId: params?.id ?? defaultProps.id,
                          patientName: patientDetailsData?.full_name,
                        },
                        { pop: true }
                      );
                    } catch (err) {
                      logError(err);
                    }
                  }}
                />
              </View>
              <TaskListSection
                theme={theme}
                patientId={params?.id ?? defaultProps.id}
                showPatientLink={false}
                showSegmentTabs={false}
                contentPadding={20}
                listBottomPadding={24}
                listKeyPrefix="PatientDetailsTasks"
                emptyMessage="No tasks available for this patient"
              />
            </View>
          )}
        </>

        {/* Insurance Policy */}
        <>
          {!(menuOption === 5) ? null : (
            <View
              accessible={false}
              style={StyleSheet.applyWidth(
                { flex: 1, position: 'relative' },
                dimensions.width
              )}
            >


              <View
                style={StyleSheet.applyWidth({ flex: 1 }, dimensions.width)}
              >

                {/* Note */}
                <View
                  style={StyleSheet.applyWidth(
                    { paddingLeft: 20, paddingRight: 20 },
                    dimensions.width
                  )}
                >
                  <View
                    style={StyleSheet.applyWidth(
                      { borderRadius: 12, overflow: 'hidden' },
                      dimensions.width
                    )}
                  >
                    <SunoApi.FetchInsurancePolicyGET
                      patient={params?.id ?? defaultProps.id}
                      handlers={{
                        onData: fetchData => {
                          const handler = async () => {
                            try {
                              setInsurancePoliciesData(fetchData);
                              // console.log("===== fetchData : ",fetchData)
                              // await setGlobalVariableValue({
                              //   key: 'taskOffsetFilter',
                              //   value: Constants['taskOffsetFilter'] + patientLimit,
                              // });
                              /* hidden 'Set Variable' action */
                              // if (refreshing) setRefreshing(false);

                            } catch (err) {
                              logError(err);
                            }
                          };
                          handler();
                        },
                      }}
                      query={`{id,policyholder_member_id,plan_name,is_active,type,hearing_benefit,deductible,copay,has_hearing_aid,policyholder_relationship,policyholder_first_name,policyholder_last_name,policyholder_middle_name,policyholder_sex,policyholder_birthdate,policyholder_employer_name,policyholder_group_number,policyholder_street_address_1,policyholder_street_address_2,policyholder_city,policyholder_state,policyholder_country,policyholder_zip_code,policyholder_phone,notes,insurance_card_front,insurance_card_back,insurer_phone_number,coverage_type,insurer{id,name,payer_id,payer_name,email,fax_phone},effective_date,expiration_date,policy_type,verified,intake_form_submission}`}
                    >
                      {({ loading, error, data, refetchGetMyAssigneeTasks }) => {
                        const fetchData = data?.json;
                        if (loading) {
                          return <ActivityIndicator size="large" color="#066858" />;
                        }

                        if (error || data?.status < 200 || data?.status >= 300) {
                          return <ActivityIndicator size="large" color="#066858" />;
                        }
                        // if (listLoading) {
                        //   return <ActivityIndicator size="large" color="#066858" />;
                        // }
                        return (
                          <>
                            <>
                              {!(insurancePoliciesData?.length === 0) ? null : (
                                <EmptyListBlock
                                  message={'No existing insurance policies'}
                                />
                              )}
                            </>
                            <>
                              <SimpleStyleFlashList
                                data={insurancePoliciesData}
                                estimatedItemSize={50}
                                horizontal={false}
                                inverted={false}
                                keyExtractor={(flashListData, index) =>
                                  flashListData?.id ??
                                  flashListData?.uuid ??
                                  index?.toString() ??
                                  JSON.stringify(flashListData)
                                }
                                listKey={'Task->View->Task->Fetch->FlashList'}
                                numColumns={1}

                                // onRefresh={async () => {
                                //   setRefreshing(true);

                                //   try {
                                //     await refetchGetMyAssigneeTasks();   // ⬅️ re-fetch API
                                //   } catch (e) {
                                //     logError(e);
                                //   }

                                //   setRefreshing(false);
                                // }}

                                // refreshing={refreshing}
                                onEndReachedThreshold={0.5}
                                renderItem={({ item, index }) => {
                                  const flashListData = item;
                                  return (
                                    <Surface
                                      {...GlobalStyles.SurfaceStyles(theme)['Surface']
                                        .props}
                                      elevation={1}
                                      style={StyleSheet.applyWidth(
                                        StyleSheet.compose(
                                          GlobalStyles.SurfaceStyles(theme)['Surface']
                                            .style,
                                          {
                                            backgroundColor:
                                              palettes.App['Custom #ffffff'],
                                            borderColor: palettes.App.TagBorder,
                                            borderRadius: 10,
                                            borderWidth: 1,
                                            marginBottom: 10,
                                          }
                                        ),
                                        dimensions.width
                                      )}
                                    >
                                      <Touchable
                                        onPress={() => {
                                          try {
                                            navigation.navigate(
                                              'ViewInsurancePolicyScreen',
                                              { insuranceData: flashListData, patientID: params?.id ?? defaultProps.id },
                                              { pop: true }
                                            );
                                          } catch (err) {
                                            logError(err);
                                          }
                                        }}
                                      >
                                        <View
                                          style={StyleSheet.applyWidth(
                                            {
                                              alignItems: 'center',
                                              backgroundColor:
                                                palettes.App['Custom Color_15'],
                                              borderBottomLeftRadius: 10,
                                              borderBottomRightRadius: 10,
                                              borderTopLeftRadius: 10,
                                              borderTopRightRadius: 10,
                                              flexDirection: 'row',
                                              paddingBottom: 10,
                                              paddingLeft: 10,
                                              paddingRight: 10,
                                              paddingTop: 10,
                                            },
                                            dimensions.width
                                          )}
                                        >
                                          {/* Details */}
                                          <View
                                            style={StyleSheet.applyWidth(
                                              {
                                                flex: 1, marginLeft: 10
                                              },
                                              dimensions.width
                                            )}
                                          >
                                            {/* View 5 */}
                                            <View
                                              style={StyleSheet.applyWidth(
                                                { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
                                                dimensions.width
                                              )}
                                            >
                                              {/* Name */}
                                              <Text
                                                accessible={true}
                                                selectable={false}
                                                style={StyleSheet.applyWidth(
                                                  {
                                                    color:
                                                      palettes.App['Custom Color_18'],
                                                    fontFamily: 'Inter_500Medium',
                                                    fontSize: 16,
                                                    textAlign: 'left',
                                                  },
                                                  dimensions.width
                                                )}
                                              >
                                                {'Insurer: '}
                                                {flashListData?.insurer?.name === null
                                                  ? ''
                                                  : flashListData?.insurer?.name
                                                }
                                              </Text>

                                              {/* <Text
                                                accessible={true}
                                                selectable={false}
                                                style={StyleSheet.applyWidth(
                                                  {
                                                    color: flashListData?.balance > 0 ? '#ef4444' :
                                                      palettes.App['Custom Color_18'],
                                                    fontFamily: 'Inter_500Medium',
                                                    fontSize: 16,
                                                    textAlign: 'left',
                                                    textDecorationLine: flashListData?.balance > 0 && (flashListData?.status == 999 || flashListData?.status == 1000) ? 'line-through' : 'none',
                                                    fontStyle: flashListData?.balance > 0 && (flashListData?.status == 999 || flashListData?.status == 1000) ? 'italic' : 'normal'

                                                  },
                                                  dimensions.width
                                                )}
                                              >
                                                ${flashListData?.balance}
                                              </Text> */}

                                            </View>
                                            {/* View 2 */}
                                            <View
                                              style={StyleSheet.applyWidth(
                                                {
                                                  alignItems: 'center',
                                                  flexDirection: 'row',
                                                },
                                                dimensions.width
                                              )}
                                            >
                                              {/* Review */}
                                              <Text
                                                accessible={true}
                                                selectable={false}
                                                numberOfLines={3}
                                                style={StyleSheet.applyWidth(
                                                  {
                                                    color:
                                                      palettes.App['Custom Color_18'],
                                                    fontFamily: 'Inter_400Regular',
                                                    fontSize: 13,
                                                    lineHeight: 16,
                                                    marginTop: 8,
                                                    opacity: 0.6,
                                                  },
                                                  dimensions.width
                                                )}
                                              >
                                                {"Member ID : "} {flashListData?.policyholder_member_id}
                                              </Text>

                                              {/* <View
                                            style={StyleSheet.applyWidth(
                                              {
                                                backgroundColor:
                                                  getTaskPriorityColor(
                                                    Variables,
                                                    flashListData?.priority
                                                  ),
                                                borderRadius: 12,
                                                marginLeft: 10,
                                                marginTop: 5,
                                                paddingBottom: 2,
                                              },
                                              dimensions.width
                                            )}
                                          >
                                            <Text
                                              accessible={true}
                                              selectable={false}
                                              style={StyleSheet.applyWidth(
                                                {
                                                  alignSelf: 'center',
                                                  color: [
                                                    {
                                                      minWidth: Breakpoints.Mobile,
                                                      value:
                                                        palettes.App[
                                                        'Custom Color_18'
                                                        ],
                                                    },
                                                    {
                                                      minWidth: Breakpoints.Mobile,
                                                      value:
                                                        flashListData?.tag?.color,
                                                    },
                                                  ],
                                                  fontFamily: 'Inter_400Regular',
                                                  fontSize: 12,
                                                  marginLeft: 10,
                                                  marginRight: 10,
                                                  marginTop: 2,
                                                  opacity: 0.7,
                                                  textAlign: 'center',
                                                },
                                                dimensions.width
                                              )}
                                            >
                                              {getTaskPriority(
                                                Variables,
                                                flashListData?.priority
                                              )}
                                            </Text>
                                          </View> */}
                                            </View>
                                            {/* View 3 */}
                                            <View
                                              style={StyleSheet.applyWidth(
                                                {
                                                  flexDirection: 'row',
                                                  justifyContent: 'space-between',
                                                },
                                                dimensions.width
                                              )}
                                            >
                                              {/* status */}
                                              <Text
                                                accessible={true}
                                                selectable={false}
                                                numberOfLines={3}
                                                style={StyleSheet.applyWidth(
                                                  {
                                                    color:
                                                      palettes.App['Custom Color_18'],
                                                    fontFamily: 'Inter_400Regular',
                                                    fontSize: 13,
                                                    lineHeight: 16,
                                                    marginTop: 8,
                                                    opacity: 0.6,
                                                  },
                                                  dimensions.width
                                                )}
                                              >
                                                {'Payer ID: '}
                                                {flashListData?.insurer?.payer_id}
                                              </Text>
                                            </View>
                                            <View
                                              style={StyleSheet.applyWidth(
                                                {
                                                  flexDirection: 'row',
                                                  justifyContent: 'space-between',
                                                },
                                                dimensions.width
                                              )}
                                            >
                                              {/* status */}
                                              <Text
                                                accessible={true}
                                                selectable={false}
                                                numberOfLines={3}
                                                style={StyleSheet.applyWidth(
                                                  {
                                                    color:
                                                      palettes.App['Custom Color_18'],
                                                    fontFamily: 'Inter_400Regular',
                                                    fontSize: 13,
                                                    lineHeight: 16,
                                                    marginTop: 8,
                                                    opacity: 0.6,
                                                  },
                                                  dimensions.width
                                                )}
                                              >
                                                {'Category: '}
                                                {insuranceTypeMap[flashListData?.type] || ''}
                                              </Text>
                                            </View>

                                            {/* View 4 */}
                                            {/* <View
                                        style={StyleSheet.applyWidth(
                                          {
                                            alignItems: 'flex-start',
                                            alignSelf: 'flex-end',
                                            backgroundColor: getTaskStatusColor(
                                              Variables,
                                              flashListData?.status
                                            ),
                                            borderRadius: 5,
                                            marginTop: 5,
                                            paddingBottom: 2,
                                          },
                                          dimensions.width
                                        )}
                                      >
                                        <Text
                                          accessible={true}
                                          selectable={false}
                                          style={StyleSheet.applyWidth(
                                            {
                                              alignSelf: 'center',
                                              color: [
                                                {
                                                  minWidth: Breakpoints.Mobile,
                                                  value:
                                                    palettes.App[
                                                    'Custom Color_18'
                                                    ],
                                                },
                                                {
                                                  minWidth: Breakpoints.Mobile,
                                                  value:
                                                    flashListData?.tag?.color,
                                                },
                                              ],
                                              fontFamily: 'Inter_400Regular',
                                              fontSize: 12,
                                              marginLeft: 10,
                                              marginRight: 10,
                                              marginTop: 2,
                                              opacity: 0.7,
                                              paddingBottom: 4,
                                              paddingTop: 4,
                                              textAlign: 'center',
                                            },
                                            dimensions.width
                                          )}
                                        >
                                          {getTaskStatus(
                                            Variables,
                                            flashListData?.status
                                          )}
                                        </Text>
                                      </View> */}


                                          </View>

                                        </View>
                                      </Touchable>
                                    </Surface>
                                  );
                                }}
                                showsHorizontalScrollIndicator={true}
                                showsVerticalScrollIndicator={true}
                                style={StyleSheet.applyWidth(
                                  {
                                    borderRadius: 12,
                                    overflow: 'hidden',
                                    paddingBottom: 10,
                                    paddingTop: 10,
                                  },
                                  dimensions.width
                                )}
                              />
                            </>
                          </>
                        );
                      }}
                    </SunoApi.FetchInsurancePolicyGET>
                  </View>
                </View>
              </View>
            </View>
          )}
        </>

      </SimpleStyleScrollView>


      <Modal
        animationType={'none'}
        supportedOrientations={['portrait', 'landscape']}
        presentationStyle={'overFullScreen'}
        transparent={true}
        visible={Boolean(folderNameModel)}
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
          <TouchableWithoutFeedback>
            <View style={{
              width: '85%',
              backgroundColor: '#fff',
              borderRadius: 8,
              padding: 20,
            }}>

              <Text style={{
                fontSize: 14,
                marginBottom: 12,
                color: '#333',
              }}>
                Please enter a name
              </Text>

              <TextInput
                value={folderName}
                onChangeText={setFolderName}
                // onChangeText={(text) => setNewName(text.replace(/\s/g, ''))}

                style={{
                  borderWidth: 1,
                  borderColor: '#4A90E2',
                  borderRadius: 6,
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                  fontSize: 14,
                  marginBottom: 20,
                  marginTop: 10,
                  height: 40
                }}
                placeholder="Enter name"
              />

              <View style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
              }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: !folderName || !folderName.trim() ? '#1664D680' : '#1664D6',
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 6,
                    marginRight: 10,
                  }}
                  disabled={!folderName || !folderName.trim()}

                  onPress={async () => {

                    try {
                      setLoadingEdocs(true);
                      const lastItem = documentID[documentID.length - 1];

                      const parent = { id: lastItem };
                      // console.log("==== ",`${Constants.API_BOX_URL}/folders/${id == '' ? patientDetailsData?.box_folder_id ?? patientDetailsData?.box_folder_id : id}?fields=id,name,type,size,parent,extension,permissions,path_collection,modified_at,created_at,modified_by,has_collaborations,is_externally_owned,item_collection,authenticated_download_url,is_download_available,representations,url,file_version,sha1,shared_link,watermark_info&direction=desc&limit=50&offset=0&sort=date`)
                      const response = await fetch(`${Constants.API_BOX_URL}/folders?fields=id,name,type,size,parent,extension,permissions,path_collection,modified_at,created_at,modified_by,has_collaborations,is_externally_owned,item_collection,authenticated_download_url,is_download_available,representations,url`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${boxAccessToken}`,
                        },
                        body: JSON.stringify({
                          name: folderName,
                          parent: parent
                        }),
                      });

                      const result = await response.json();

                      if (response.ok) {
                        // console.log("===== result", result);
                        const lastItem = documentID[documentID.length - 1];
                        const lastIteName = documentNames[documentNames.length - 1];
                        getDocumentFolder(
                          boxAccessToken,
                          lastItem,
                          lastIteName,
                          true
                        );

                      } else {
                        // console.log("===== result else", result);
                        showToast(result?.message);
                      }

                    } catch (err) {
                      console.log('======= err :', err);
                    } finally {
                      setFolderNameModel(false)
                      setFolderName('')

                      setLoading(false);
                    }


                  }}
                >
                  <Text style={{
                    color: '#fff',
                    fontWeight: '600',
                  }}>Create</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    backgroundColor: '#E5E5E5',
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 6,
                  }}
                  onPress={() => {
                    setFolderNameModel(false)
                    setFolderName('')
                  }}
                >
                  <Text style={{
                    color: '#333',
                    fontWeight: '500',
                  }}>Cancel</Text>
                </TouchableOpacity>
              </View>

            </View>

          </TouchableWithoutFeedback>
        </View>
      </Modal>


      <Modal
        animationType={'none'}
        supportedOrientations={['portrait', 'landscape']}
        presentationStyle={'overFullScreen'}
        transparent={true}
        visible={Boolean(nameEdocShow)}
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
          <TouchableWithoutFeedback>
            <View style={{
              width: '85%',
              backgroundColor: '#fff',
              borderRadius: 8,
              padding: 20,
            }}>

              <Text style={{
                fontSize: 14,
                marginBottom: 12,
                color: '#333',
              }}>
                Please enter a name for document:
              </Text>

              <TextInput
                value={newName}
                // onChangeText={setNewName}
                onChangeText={(text) => setNewName(text.replace(/\s/g, ''))}

                style={{
                  borderWidth: 1,
                  borderColor: '#4A90E2',
                  borderRadius: 6,
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                  fontSize: 14,
                  marginBottom: 20,
                  marginTop: 10,
                  height: 40
                }}
                placeholder="Enter name"
              />

              <View style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
              }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: !newName || !newName.trim() ? '#1664D680' : '#1664D6',
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 6,
                    marginRight: 10,
                  }}
                  disabled={!newName || !newName.trim()}

                  onPress={async () => {

                    try {

                      if (documentID.length > 0) {
                        uploadImages(edocFilePath, newName)
                      } else {
                        uploadImagesMainFolder(edocFilePath, newName)
                      }


                    } catch (err) {

                      console.log('======= err :', err);
                    } finally {
                      setNameEdocShow(false)
                      setNewName('')

                      setLoading(false);
                    }


                  }}
                >
                  <Text style={{
                    color: '#fff',
                    fontWeight: '600',
                  }}>Save</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    backgroundColor: '#E5E5E5',
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 6,
                  }}
                  onPress={() => {
                    setNameEdocShow(false)
                    setNewName('')
                  }}
                >
                  <Text style={{
                    color: '#333',
                    fontWeight: '500',
                  }}>Cancel</Text>
                </TouchableOpacity>
              </View>

            </View>

          </TouchableWithoutFeedback>
        </View>
      </Modal>

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
          {isRenameFile && !showMoveModal &&
            <TouchableWithoutFeedback>
              <View style={{
                width: '85%',
                backgroundColor: '#fff',
                borderRadius: 8,
                padding: 20,
              }}>

                <Text style={{
                  fontSize: 14,
                  marginBottom: 12,
                  color: '#333',
                }}>
                  Please enter a new name for {selectedEdocItem?.name}:
                </Text>

                <TextInput
                  value={newName}
                  onChangeText={setNewName}
                  style={{
                    borderWidth: 1,
                    borderColor: '#4A90E2',
                    borderRadius: 6,
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                    fontSize: 14,
                    marginBottom: 20,
                    marginTop: 10,
                    height: 40
                  }}
                  placeholder="Enter new name"
                />

                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                }}>
                  <TouchableOpacity
                    style={{
                      backgroundColor: !newName || !newName.trim() ? '#1664D680' : '#1664D6',
                      paddingVertical: 10,
                      paddingHorizontal: 20,
                      borderRadius: 6,
                      marginRight: 10,
                    }}
                    disabled={!newName || !newName.trim()}

                    onPress={async () => {

                      try {
                        setIsLoaderVisible(true);
                        setLoadingEdocs(true);
                        const filename = selectedEdocItem?.type === 'file' ? 'files' : 'folders'
                        // console.log("==== ",`${Constants.API_BOX_URL}/folders/${id == '' ? patientDetailsData?.box_folder_id ?? patientDetailsData?.box_folder_id : id}?fields=id,name,type,size,parent,extension,permissions,path_collection,modified_at,created_at,modified_by,has_collaborations,is_externally_owned,item_collection,authenticated_download_url,is_download_available,representations,url,file_version,sha1,shared_link,watermark_info&direction=desc&limit=50&offset=0&sort=date`)
                        const response = await fetch(`${Constants.API_BOX_URL}/${filename}/${selectedEdocItem?.id}`, {
                          method: 'PUT',
                          headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${boxAccessToken}`,
                          },
                          body: JSON.stringify({
                            // name: selectedEdocItem?.type === 'file' ? `${newName}.${selectedEdocItem?.extension}` : newName,
                            name: selectedEdocItem?.type === 'file'
                              ? `${newName.trim()}.${selectedEdocItem?.extension}`
                              : newName.trim(),
                          }),
                        });

                        const result = await response.json();

                        if (response.ok) {
                          // console.log("===== result", result);
                          const lastItem = documentID[documentID.length - 1];
                          const lastIteName = documentNames[documentNames.length - 1];
                          getDocumentFolder(
                            boxAccessToken,
                            lastItem,
                            lastIteName,
                            true
                          );


                        } else {
                          // console.log("===== result else", result);
                          showToast("There is an issue with the rename functionality. It is failing with an 'Access denied insufficient permissions' error.")

                        }
                      } catch (err) {

                        console.log('======= err :', err);
                      } finally {
                        setIsRenameFile(false)
                        setMenuEdocShow(false)
                        setNewName('')

                        setIsLoaderVisible(false);
                        setLoadingEdocs(false);

                        setLoading(false);
                      }


                    }}
                  >
                    <Text style={{
                      color: '#fff',
                      fontWeight: '600',
                    }}>Rename</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      backgroundColor: '#E5E5E5',
                      paddingVertical: 10,
                      paddingHorizontal: 20,
                      borderRadius: 6,
                    }}
                    onPress={() => {
                      setIsRenameFile(false)
                      setMenuEdocShow(false)
                      setNewName('')
                    }}
                  >
                    <Text style={{
                      color: '#333',
                      fontWeight: '500',
                    }}>Cancel</Text>
                  </TouchableOpacity>
                </View>

              </View>

            </TouchableWithoutFeedback>
          }
          {!isRenameFile && !showMoveModal &&
            <View
              style={StyleSheet.applyWidth(
                {
                  alignItems: 'center',
                  backgroundColor: palettes.App['Custom #ffffff'],
                  borderRadius: 16,
                  justifyContent: 'center',
                  marginLeft: 24,
                  marginRight: 24,
                  width: '80%'
                },
                dimensions.width
              )}
            >
              {/* View section */}
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
                      const nameWithoutExtension = selectedEdocItem?.name.replace(/\.[^/.]+$/, "");

                      setNewName(nameWithoutExtension)
                      setIsRenameFile(true)
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
                          name={'MaterialIcons/drive-file-rename-outline'}
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
                        {'Rename'}
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
                      const filename = selectedEdocItem?.type === 'file' ? 'files' : 'folders'

                      Alert.alert(selectedEdocItem?.type === 'file' ? 'Delete file' : 'Delete folder', selectedEdocItem?.type === 'file' ? `Are you sure you want to delete ${selectedEdocItem?.name}?` : `Are you sure you want to delete ${selectedEdocItem?.name} and all its contents?`, [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Delete',
                          style: 'destructive',
                          onPress: async () => {
                            const response = await fetch(`${Constants.API_BOX_URL}/${filename}/${selectedEdocItem?.id}`, {
                              method: 'DELETE',
                              headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${boxAccessToken}`,
                              },

                            });

                            // const result = await response.json();

                            // console.log("===== result", result);
                            const lastItem = documentID[documentID.length - 1];
                            const lastIteName = documentNames[documentNames.length - 1];
                            getDocumentFolder(
                              boxAccessToken,
                              lastItem,
                              lastIteName,
                              true
                            );
                          },
                        },
                      ]);
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
                        {'Delete'}
                      </Text>
                    </View>
                  </Touchable>
                </View>
                {/* Flex Touchable */}
                {/* {selectedEdocItem?.type === 'file' && */}
                <View
                  style={StyleSheet.applyWidth(
                    { paddingBottom: 10 },
                    dimensions.width
                  )}
                >
                  <Touchable
                    onPress={() => {
                      setDocumentIDMove([])
                      setDocumentNamesMove([])
                      setItemsMoves([])
                      setSelectedFolder('')

                      const name = `${patientDetailsData?.full_name}`
                      getDocumentFolderForMove(boxAccessToken, patientDetailsData?.box_folder_id, name);
                      setShowMoveModal(true)
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
                          name={'MaterialIcons/drive-file-move-outline'}
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
                        {'Move'}
                      </Text>
                    </View>
                  </Touchable>
                </View>
                {/* } */}
              </View>
            </View>
          }
          {showMoveModal &&
            <View
              style={StyleSheet.applyWidth(
                {
                  backgroundColor: palettes.App['Custom #ffffff'],
                  borderRadius: 16,
                  justifyContent: 'center',
                  marginLeft: 24,
                  marginRight: 24,
                  width: '90%',
                  maxHeight: '90%',
                  paddingVertical: 15
                },
                dimensions.width
              )}
            >
              <View
                style={StyleSheet.applyWidth(
                  {
                    alignItems: 'flex-end',
                    borderBottomWidth: 1.5,
                    borderColor: palettes.App.Peoplebit_Light_Stone_Gray,
                    paddingBottom: 16,
                    paddingTop: 10,
                    justifyContent: 'space-between',
                    flexDirection: 'row',
                    paddingHorizontal: 10
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
                        fontSize: 16,
                        flex: 1
                      }
                    ),
                    dimensions.width
                  )}
                >
                  {'Select Destination Folder'}
                </Text>
                <IconButton
                  onPress={() => {
                    try {
                      setShowMoveModal(false)
                      setMenuEdocShow(false)
                    } catch (err) {
                      logError(err);
                    }
                  }}
                  color={theme.colors.branding.secondary}
                  icon={'MaterialCommunityIcons/close-circle-outline'}
                  size={28}
                />
              </View>

              {/* <Text style={styles.subTitle}>Root Folder</Text> */}

              {/* Folder List */}

              <BreadcrumbMove data={documentNamesMove} />
              <Surface
                {...GlobalStyles.SurfaceStyles(theme)['Surface'].props}
                elevation={2}
                style={StyleSheet.applyWidth(
                  StyleSheet.compose(
                    GlobalStyles.SurfaceStyles(theme)['Surface'].style,
                    { minHeight: 12, marginBottom: 10 }
                  ),
                  dimensions.width
                )}
              />

              <FlatList
                // style={{flex :1}}
                data={itemsMoves}
                renderItem={renderFolderItem}
                // keyExtractor={(item, index) => item?.key ?? index.toString()}
                ListEmptyComponent={
                  loadingEdocs ? (
                    <View style={{ alignItems: 'center', paddingTop: 30 }}>
                      <ActivityIndicator size="large" color="#066858" />
                    </View>
                  ) : (
                    <View style={{ alignItems: 'center', paddingVertical: 30, }}>
                      <Text>There are no items in this folder.</Text>
                    </View>
                  )
                }
              />

              {/* Confirm Button */}

              <View style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                paddingTop: 15,
                paddingRight: 15
              }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: !selectedFolder ? '#1664D680' : '#1664D6',
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 6,
                    marginRight: 10,
                  }}
                  disabled={!selectedFolder}

                  onPress={async () => {

                    try {

                      Alert.alert('Moving Files', `Are you sure you want to move these files to the selected folder (${selectedFolder.name})?`, [
                        {
                          text: 'Cancel',
                          style: 'cancel',
                        },
                        {
                          text: 'Ok',
                          onPress: async () => {

                            setIsLoaderVisible(true);
                            setLoadingEdocs(true);

                            const param = { "items": [{ "object_id": selectedEdocItem?.id, "type": selectedEdocItem?.type === 'file' ? 'file' : "folder" }], "destination_folder_id": selectedFolder?.id }

                            // console.log("==== ",`${Constants.API_BOX_URL}/folders/${id == '' ? patientDetailsData?.box_folder_id ?? patientDetailsData?.box_folder_id : id}?fields=id,name,type,size,parent,extension,permissions,path_collection,modified_at,created_at,modified_by,has_collaborations,is_externally_owned,item_collection,authenticated_download_url,is_download_available,representations,url,file_version,sha1,shared_link,watermark_info&direction=desc&limit=50&offset=0&sort=date`)
                            const response = await fetch(`${Constants.API_BASE_URL}/patients/${params?.id ?? defaultProps.id}/e-documents/move/`, {
                              method: 'PATCH',
                              headers: {
                                'Content-Type': 'application/json',
                                Authorization: Constants.AUTH_HEADER,
                              },
                              body: JSON.stringify(param),
                            });

                            const result = await response.json();
                            console.log("==== ", `${Constants.API_BASE_URL}/patients/${params?.id ?? defaultProps.id}/e-documents/move/`, param, result,)

                            if (response.ok) {
                              console.log("===== result", result);
                              const lastItem = documentID[documentID.length - 1];
                              const lastIteName = documentNames[documentNames.length - 1];
                              getDocumentFolder(
                                boxAccessToken,
                                lastItem,
                                lastIteName,
                                true
                              );

                              setShowMoveModal(false)
                              setMenuEdocShow(false)

                              setIsLoaderVisible(false);
                              setLoadingEdocs(false);

                              setLoading(false);
                            } else {
                              // console.log("===== result else", result);
                              showToast("There is an issue with the move functionality. It is failing with an 'Access denied insufficient permissions' error.")
                              setShowMoveModal(false)
                              setMenuEdocShow(false)

                              setIsLoaderVisible(false);
                              setLoadingEdocs(false);

                              setLoading(false);
                            }

                          },
                        },
                      ]);



                    } catch (err) {
                      setShowMoveModal(false)
                      setMenuEdocShow(false)

                      setIsLoaderVisible(false);
                      setLoadingEdocs(false);

                      setLoading(false);
                      console.log('======= err :', err);
                    } finally {

                    }


                  }}
                >
                  <Text style={{
                    color: '#fff',
                    fontWeight: '600',
                  }}>Confirm Move</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    backgroundColor: '#E5E5E5',
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 6,
                  }}
                  onPress={() => {
                    setShowMoveModal(false)
                    setMenuEdocShow(false)
                  }}
                >
                  <Text style={{
                    color: '#333',
                    fontWeight: '500',
                  }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>


          }
        </View>
      </Modal>


      <Modal
        animationType={'none'}
        supportedOrientations={['portrait', 'landscape']}
        presentationStyle={'overFullScreen'}
        transparent={true}
        visible={Boolean(isLoaderVisible)}
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
          <ActivityIndicator
            animating={true}
            hidesWhenStopped={true}
            {...GlobalStyles.ActivityIndicatorStyles(theme)[
              'Activity Indicator'
            ].props}
            color={theme.colors.branding.secondary}
            size={'large'}
            style={StyleSheet.applyWidth(
              GlobalStyles.ActivityIndicatorStyles(theme)['Activity Indicator']
                .style,
              dimensions.width
            )}
          />
        </View>
      </Modal>
    </ScreenContainer>
  );
};

export default withTheme(PatientDetailsScreen);