import React, { useMemo } from 'react';
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
} from '@draftbit/ui';
import {
  Text, View, Platform,
  Modal,
  Alert,
  ActivityIndicator, Image,
  Keyboard,
  Dimensions,
  TouchableOpacity, SafeAreaView
} from 'react-native';
import * as GlobalStyles from '../GlobalStyles.js';
import * as SunoApi from '../apis/SunoApi.js';
import CustomChildHeaderBlock from '../components/CustomChildHeaderBlock';
import * as GlobalVariables from '../config/GlobalVariableContext';
import * as CustomCode from '../custom-files/CustomCode';
import getTaskPriority from '../global-functions/getTaskPriority';
import getTaskPriorityColor from '../global-functions/getTaskPriorityColor';
import getTaskStatus from '../global-functions/getTaskStatus';
import getTaskStatusColor from '../global-functions/getTaskStatusColor';
import palettes from '../themes/palettes';
import Breakpoints from '../utils/Breakpoints';
import * as DateUtils from '../utils/DateUtils';
import * as StyleSheet from '../utils/StyleSheet';
import showAlertUtil from '../utils/showAlert';
import useNavigation from '../utils/useNavigation';
import useParams from '../utils/useParams';
import useWindowDimensions from '../utils/useWindowDimensions';
import { logError } from '../index.js';
import { RECORDING_STATUS } from './ScribeViewScreen.js';
import { DropDownBlock } from '../custom-files/DropDownBlock.js';
import * as Utils from '../utils';
import * as HtmlView from '../custom-files/HtmlView';
import AudioPlayer from './AudioPlayer.js';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Notifications from 'expo-notifications';
import ReactNativeBlobUtil from 'react-native-blob-util';
import EmptyListBlock from '../components/EmptyListBlock.js';
import DropDownPicker from 'react-native-dropdown-picker';
import useAmbientScribe from './useAmbientScribe.js';
import ScribeControlBar from './ScribeControlBar.js';
import * as ScribeContextEditor from '../custom-files/ScribeContextEditor.js';

const defaultProps = { scribeData: null };

const SCRIBE_DOWNLOADS_FOLDER = 'scribe-downloads';
const MIN_AUDIO_FILE_SIZE = 1024;
const AUDIO_EXTENSIONS = ['m4a', 'mp4', 'mp3', 'wav', 'aac', 'webm', 'ogg', 'caf'];

const getAudioExtensionFromUrl = (url = '') => {
  const pathWithoutQuery = (url || '').split('?')[0];
  try {
    const pathname = new URL(url).pathname;
    const match = pathname.match(/\.([a-zA-Z0-9]+)$/);
    const ext = match?.[1]?.toLowerCase();
    if (ext === 'mpeg') return 'mp3';
    if (AUDIO_EXTENSIONS.includes(ext)) return ext;
  } catch {
    const match = pathWithoutQuery.match(/\.([a-zA-Z0-9]+)$/);
    const ext = match?.[1]?.toLowerCase();
    if (ext === 'mpeg') return 'mp3';
    if (AUDIO_EXTENSIONS.includes(ext)) return ext;
  }
  return 'webm';
};

const getScribeFileName = (scribeId, extension = 'm4a') =>
  `scribe-recording-${scribeId}.${extension}`;

const getScribeDownloadsDir = () =>
  `${FileSystem.documentDirectory}${SCRIBE_DOWNLOADS_FOLDER}/`;

const getLocalFilePath = (scribeId, extension = 'm4a') =>
  `${getScribeDownloadsDir()}${getScribeFileName(scribeId, extension)}`;

const normalizePlaybackUri = uri => {
  if (!uri) return uri;
  if (uri.startsWith('file://')) return uri;
  if (uri.startsWith('/')) return `file://${uri}`;
  return uri;
};

const getAndroidPlaybackUri = uri => {
  const normalized = normalizePlaybackUri(uri);
  if (Platform.OS !== 'android' || !normalized?.startsWith('file://')) {
    return normalized;
  }
  // ExoPlayer expects a valid file URI on Android
  return normalized.startsWith('file:///') ? normalized : normalized.replace('file://', 'file:///');
};

const getDownloadHeaders = (audioUrl, constants) => {
  const headers = {};
  try {
    const apiHost = new URL(constants.API_BASE_URL || '').host;
    const audioHost = new URL(audioUrl).host;
    if (
      apiHost &&
      (audioHost === apiHost || audioUrl.startsWith(constants.API_BASE_URL))
    ) {
      headers.Authorization = constants.AUTH_HEADER;
    }
  } catch {
    // signed CDN URLs do not need auth headers
  }
  return headers;
};

const getShareMimeType = extension => {
  if (extension === 'mp3') return 'audio/mpeg';
  if (extension === 'webm') return 'video/webm';
  if (extension === 'ogg') return 'audio/ogg';
  return `audio/${extension}`;
};



const isWebmRecordingUrl = (url = '') =>
  getAudioExtensionFromUrl(url) === 'webm';

// Copies an already-downloaded (app-private) file into the device's public
// Downloads folder. On Android 10+ this uses MediaStore (no storage permission
// required); on older versions it copies directly into the public Downloads dir.
const saveToDeviceDownloads = async (sourceFsPath, fileName, mimeType) => {
  if (Platform.OS !== 'android') {
    return null;
  }
  try {
    if (Number(Platform.Version) >= 29) {
      const uri = await ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
        { name: fileName, parentFolder: '', mimeType },
        'Download',
        sourceFsPath
      );
      return uri;
    }

    const destPath = `${ReactNativeBlobUtil.fs.dirs.DownloadDir}/${fileName}`;
    await ReactNativeBlobUtil.fs.cp(sourceFsPath, destPath);
    return destPath;
  } catch (err) {
    logError('Save to device Downloads error:', err);
    return null;
  }
};

const SCRIBE_DOWNLOAD_NOTIFICATION_TYPE = 'scribe-download';

// Opens a downloaded audio file with the OS. On Android it fires a VIEW intent
// (served through the blob-util FileProvider); on iOS it presents the share
// sheet so the user can open or save the file.
const openDownloadedFile = async (filePath, mimeType) => {
  if (!filePath) {
    return;
  }
  try {
    if (Platform.OS === 'android') {
      await ReactNativeBlobUtil.android.actionViewIntent(
        filePath,
        mimeType || '*/*'
      );
    } else {
      const uri = filePath.startsWith('file://')
        ? filePath
        : `file://${filePath}`;
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType });
      }
    }
  } catch (err) {
    logError('Open downloaded file error:', err);
  }
};

const notifyDownloadComplete = async (fileName, filePath, mimeType) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Download complete',
        body: `${fileName} saved to your device. Tap to open.`,
        sound: 'default',
        data: {
          type: SCRIBE_DOWNLOAD_NOTIFICATION_TYPE,
          filePath,
          mimeType,
        },
      },
      trigger: null,
    });
  } catch (err) {
    logError('Schedule download notification error:', err);
  }
};

const SCRIBE_DETAILS_QUERY =
  '{id,summary,soap_notes,custom_context,has_transcription,transcription,is_generating_summary,is_generating_soap,status,created_at,updated_at,duration,recording,patient{id,first_name,middle_name,last_name,preferred_name,title,suffix},staff{id,first_name,last_name,suffix,title,is_active},clinic{id,name,timezone},ambient_scribe_template_id}';

const MAX_SOAP_NOTES_POLL_ATTEMPTS = 20;
const SOAP_NOTES_POLL_INTERVAL_MS = 3000;

const hasSoapNotes = data => {
  const notes = data?.soap_notes;
  return notes != null && String(notes).trim().length > 0;
};

const getRecordingStatus = status =>
  RECORDING_STATUS[status] ?? {
    label: 'Unknown',
    color: '#9E9E9E',
    icon: 'MaterialIcons/help-outline',
  };

const SegmentTabs = ({ tabs, activeIndex, onChange, theme, tabWidth }) => (
  <View
    style={{
      flexDirection: 'row',
      backgroundColor: '#E8EFED',
      borderRadius: 12,
      padding: 4,
      marginBottom: 4,
    }}
  >
    {tabs.map((tab, index) => {
      const isActive = index === activeIndex;
      return (
        <Touchable
          key={tab}
          onPress={() => onChange(index)}
          activeOpacity={0.85}
          style={{
            flex: tabWidth ? undefined : 1,
            width: tabWidth,
            paddingVertical: 11,
            paddingHorizontal: 12,
            borderRadius: 10,
            alignItems: 'center',
            backgroundColor: isActive ? '#fff' : 'transparent',
            ...(isActive
              ? {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.08,
                shadowRadius: 3,
                elevation: 2,
              }
              : {}),
          }}
        >
          <Text
            style={{
              fontFamily: isActive ? 'Inter_600SemiBold' : 'Inter_400Regular',
              fontSize: 13,
              color: isActive
                ? theme.colors.branding.secondary
                : palettes.App.TextPlaceholder,
            }}
          >
            {tab}
          </Text>
        </Touchable>
      );
    })}
  </View>
);

const AlertBanner = ({ type = 'info', message }) => {
  const styles = {
    info: { bg: '#E6F7F1', border: '#B8E8D8', icon: '#066858', iconName: 'Octicons/info' },
    warning: { bg: '#FFF8ED', border: '#FDE6B8', icon: '#D97706', iconName: 'MaterialIcons/report-problem' },
    error: { bg: '#FEF2F2', border: '#FECACA', icon: '#DC2626', iconName: 'MaterialIcons/error-outline' },
  };
  const s = styles[type] || styles.info;
  return (
    <View
      style={{
        padding: 14,
        backgroundColor: s.bg,
        borderColor: s.border,
        borderWidth: 1,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
      }}
    >
      <Icon name={s.iconName} size={20} color={s.icon} />
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
        {message}
      </Text>
    </View>
  );
};

const InfoCard = ({ children, style }) => (
  <Surface
    elevation={2}
    style={[
      {
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E8EEEC',
        padding: 18,
        marginBottom: 16,
      },
      style,
    ]}
  >
    {children}
  </Surface>
);

const MetaRow = ({ label, value, valueColor, onPress, accent }) => (
  <View style={{ marginBottom: 14 }}>
    <Text
      style={{
        fontFamily: 'Inter_400Regular',
        fontSize: 11,
        letterSpacing: 0.6,
        textTransform: 'uppercase',
        color: palettes.App.TextPlaceholder,
        marginBottom: 4,
      }}
    >
      {label}
    </Text>
    {onPress ? (
      <Touchable onPress={onPress}>
        <Text
          style={{
            fontFamily: 'Inter_600SemiBold',
            fontSize: 15,
            color: accent || valueColor || palettes.App.FilterTextColor,
            textDecorationLine: 'underline',
          }}
        >
          {value}
        </Text>
      </Touchable>
    ) : (
      <Text
        style={{
          fontFamily: 'Inter_600SemiBold',
          fontSize: 15,
          color: valueColor || palettes.App.FilterTextColor,
        }}
      >
        {value}
      </Text>
    )}
  </View>
);

const StatusBadge = ({ status }) => {
  const info = getRecordingStatus(status);
  const isSuccess = status === 3 || status === 4;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: isSuccess ? '#ECFDF5' : status == 8 ? 'rgba(18, 20, 44, 0.08)' : `${info.color}18`,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
      }}
    >
      <Icon name={info.icon} size={16} color={info.color} />
      <Text
        style={{
          marginLeft: 6,
          fontFamily: 'Inter_500Medium',
          fontSize: 12,
          color: isSuccess ? '#065f46' : info.color,
        }}
      >
        {info.label}
      </Text>
    </View>
  );
};

const ActionButton = ({
  label,
  icon,
  onPress,
  loading,
  variant = 'outline',
  theme,
  style,
  disabled,
}) => {
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  const color = isPrimary ? '#fff' : isDanger ? '#DC2626' : theme.colors.branding.secondary;
  const bg = isPrimary ? theme.colors.branding.secondary : 'transparent';
  const borderColor = isDanger ? '#FECACA' : theme.colors.branding.secondary;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          borderColor,
          borderWidth: isPrimary ? 0 : 1.5,
          borderRadius: 10,
          paddingVertical: 11,
          paddingHorizontal: 16,
          backgroundColor: bg,
          opacity: disabled || loading ? 0.6 : 1,
          flex: 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={color} />
      ) : (
        <Icon name={icon} size={18} color={color} />
      )}
      <Text
        style={{
          color,
          fontFamily: 'Inter_500Medium',
          fontSize: 13,
          marginLeft: 8,
        }}
      >
        {loading ? 'Please wait...' : label}
      </Text>
    </TouchableOpacity>
  );
};

const SectionTitle = ({ title, subtitle }) => (
  <View style={{ marginBottom: 14 }}>
    <Text
      style={{
        fontFamily: 'Inter_600SemiBold',
        fontSize: 16,
        color: palettes.App.FilterTextColor,
      }}
    >
      {title}
    </Text>
    {subtitle ? (
      <Text
        style={{
          fontFamily: 'Inter_400Regular',
          fontSize: 12,
          color: palettes.App.TextPlaceholder,
          marginTop: 4,
        }}
      >
        {subtitle}
      </Text>
    ) : null}
  </View>
);

const ScribeHistoryScreen = props => {
  const { theme } = props;
  const navigation = useNavigation();
  const dimensions = useWindowDimensions();
  const params = useParams();
  const Constants = GlobalVariables.useValues();
  const Variables = Constants;
  const [refreshData, setRefreshData] = React.useState(false);
  const [taskData, setTaskData] = React.useState({});
  const [textInputValue, setTextInputValue] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(String((params?.scribeData ?? defaultProps.scribeData)?.status ?? ""));
  const [menuOption, setMenuOption] = React.useState(-1);
  const [mainMenuOption, setMainMenuOption] = React.useState(0);
  const [audioRecordingsMenuOption, setAudioRecordingsMenuOption] = React.useState(0);
  const [showScribeContextModal, setShowScribeContextModal] = React.useState(false);

  React.useEffect(() => {
    const parent = navigation.getParent?.();
    if (!parent) {
      return undefined;
    }

    if (showScribeContextModal) {
      parent.setOptions({
        tabBarStyle: { display: 'none' },
      });
    } else {
      parent.setOptions({
        tabBarStyle: { borderTopColor: 'transparent' },
      });
    }

    return () => {
      parent.setOptions({
        tabBarStyle: { borderTopColor: 'transparent' },
      });
    };
  }, [showScribeContextModal, navigation]);

  const [selectedTag, setSelectedTag] = React.useState('');
  const [billingLineItemsData, setBillingLineItemsData] = React.useState([]);
  const [scribeDetailsData, setScribeDetailsData] = React.useState({});
  const [billingAdjustmentsData, setBillingAdjustmentsData] = React.useState([]);
  const [scribeTemplatesData, setScribeTemplatesData] = React.useState([]);
  const [templateType, setTemplateType] = React.useState('');
  const [isCallScribeTemplateGenerate, setIsCallScribeTemplateGenerate] = React.useState(0);
  const [progress, setProgress] = React.useState(0);
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [isCompleteScribe, setIsCompleteScribe] = React.useState(false);
  const [isResume, setIsResume] = React.useState(false);
  const [hasResumedRecording, setHasResumedRecording] = React.useState(false);

  const [downloadedFileUri, setDownloadedFileUri] = React.useState(null);
  const [downloadedFileExtension, setDownloadedFileExtension] =
    React.useState('webm');
  const [iosMp3RecordingUri, setIosMp3RecordingUri] = React.useState(null);
  const [isLoadingIosAudio, setIsLoadingIosAudio] = React.useState(false);
  const [loadingText, setLoadingText] = React.useState('');
  const [scribeAudioChunksData, setScribeAudioChunksData] = React.useState([]);
  const [scribesEnabled, setScribesEnabled] = React.useState(false);
  const [showCaptureVisit, setShowCaptureVisit] = React.useState(false);
  const [selectedPreviewMain, setSelectedPreviewMain] = React.useState(true);
  const [selectedSOAPMain, setSelectedSOAPMain] = React.useState(true);
  const [selectedChartNoteMain, setSelectedChartNoteMain] = React.useState(true);
  const wasRecordingRef = React.useRef(false);
  const recordingSessionEndHandledRef = React.useRef(false);

  const patientId =
    scribeDetailsData?.patient?.id ??
    params?.id ??
    (params?.scribeData ?? defaultProps.scribeData)?.patient?.id;
  const clinicId =
    scribeDetailsData?.clinic?.id ?? params?.clientID;

  const {
    status: captureStatus,
    transcript: captureTranscript,
    amplitude,
    isConnecting,
    isPostponing,
    resumeScribeSession,
    startRecording,
    pauseRecording,
    postponeRecording,
    resumeRecording,
    stopRecording,
    completeRecording,
    showSilenceModal,
    countdown,
    onSilenceContinue,
  } = useAmbientScribe(
    patientId,
    clinicId,
    selectedSOAPMain,
    selectedChartNoteMain
  );

  const recordingExtension = getAudioExtensionFromUrl(
    scribeDetailsData?.recording
  );
  const shouldUseIosMp3Playback =
    Platform.OS === 'ios' &&
    isWebmRecordingUrl(scribeDetailsData?.recording);
  const playbackRecordingUri = shouldUseIosMp3Playback
    ? iosMp3RecordingUri
    : scribeDetailsData?.recording;
  const playbackExtension =
    shouldUseIosMp3Playback && iosMp3RecordingUri
      ? 'mp3'
      : recordingExtension;
  const isIosAudioReady =
    !shouldUseIosMp3Playback || (!isLoadingIosAudio && !!iosMp3RecordingUri);

  const scribeStatus = scribeDetailsData?.status;
  const isCompletedScribe = scribeStatus === 4;
  const showCompleteScribeButton =
    scribeStatus === 8 ||
    scribeStatus === 0 ||
    (isCompletedScribe && hasResumedRecording);
  const showScribeActionRow =
    scribeStatus === 8 || scribeStatus === 4 || scribeStatus === 0;

  const TAB_WIDTH = Dimensions.get('window').width;
  const AUDIO_RECORDINGS_TAB_WIDTH = Dimensions.get('window').width / 2 - 26;

  const sunoScribeTemplateGeneratePOST = SunoApi.useScribeTemplateGeneratePOST();

  //   React.useEffect(() => {
  //     // const timer = setTimeout(() => {
  //       const handler = async () => {
  //         try {

  //       setLoading(true);

  //       const allscribeDetailsData = (
  //         await SunoApi.scribeDetailsGET(Constants, {
  //           query:
  //             '{id,summary,soap_notes,has_transcription,transcription,is_generating_summary,is_generating_soap,status,created_at,updated_at,duration,recording,patient{id,first_name,middle_name,last_name,preferred_name,title,suffix},staff{id,first_name,last_name,suffix,title,is_active},clinic{id,name,timezone},ambient_scribe_template_id}',
  //           id: (params?.scribeData ?? defaultProps.scribeData)?.id,
  //         })
  //       )?.json;
  //       setScribeDetailsData(allscribeDetailsData);

  // console.log("=========")
  //       setLoading(false);


  //     } catch (err) {
  //       logError("API Error getTaskDetails : ", err);
  //     }
  //     };
  //     handler();
  //   // }, 4000);

  //   // return () => clearTimeout(timer);
  //   }, [isCallScribeTemplateGenerate]);


  // console.log("========= :", scribeDetailsData?.transcription?.channels?.[0]?.alternatives?.[0]?.transcript)
  React.useEffect(() => {
    const handler = async () => {
      try {
        setLoading(true);

        const allscribeDetailsData = (
          await SunoApi.scribeDetailsGET(Constants, {
            query: SCRIBE_DETAILS_QUERY,
            id: (params?.scribeData ?? defaultProps.scribeData)?.id,
          })
        )?.json;
        setScribeDetailsData(allscribeDetailsData);
        (allscribeDetailsData?.status == 5 || allscribeDetailsData?.status == 7 || allscribeDetailsData?.status == 0) ? setMenuOption(-1) : setMenuOption(0)
        setTemplateType(allscribeDetailsData?.ambient_scribe_template_id?.toString());

        const allscribeTemplatesData = (
          await SunoApi.scribeTemplatesGET(Constants, {
            limit: 100,
            offset: 0,
            ordering: '-pk',
          })
        )?.json;
        const templatesData =
          allscribeTemplatesData.length > 0
            ? [
              ...allscribeTemplatesData.map(item => ({
                label: item.name,
                value: item.id.toString(),
              })),
            ]
            : [];

        setScribeTemplatesData(templatesData);


        const allscribeAudioChunksData = (
          await SunoApi.scribeAudioChunksGET(Constants, {
            id: (params?.scribeData ?? defaultProps.scribeData)?.id,
          })
        )?.json;
        setScribeAudioChunksData(allscribeAudioChunksData);
        setLoading(false);


      } catch (err) {
        logError("API Error getTaskDetails : ", err);
      }
    };
    handler();
  }, []);

  React.useEffect(() => {
    const fetchScribeFeatures = async () => {
      try {
        const response = await fetch(
          `${Constants.API_BASE_URL}/auth/users/me/features/`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: Constants.AUTH_HEADER,
            },
          }
        );
        if (!response.ok) return;
        const userData = await response.json();
        setScribesEnabled(!!userData?.ambient_scribe_users?.active);
      } catch (err) {
        logError('Fetch scribe features error:', err);
      }
    };
    fetchScribeFeatures();
  }, []);

  const fetchIosMp3RecordingUrl = async scribeId => {
    const maxAttempts = 5;
    const retryDelayMs = 1500;
    let lastError = new Error('Invalid audio response');

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        const response = await fetch(
          `${Constants.API_BASE_URL}/ai/ambient-scribes/${scribeId}/audio/?audio_format=mp3`,
          {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              Authorization: Constants.AUTH_HEADER,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          lastError = new Error(`Failed to fetch audio (${response.status})`);
        } else {
          const data = await response.json();
          if (data?.status === 'success' && data?.recording) {
            return data.recording;
          }

          lastError = new Error(
            data?.status
              ? `Audio status: ${data.status}`
              : 'Invalid audio response'
          );
        }
      } catch (error) {
        lastError = error;
      }

      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, retryDelayMs));
      }
    }

    throw lastError;
  };

  const refreshAudioChunks = async scribeId => {
    const id =
      scribeId ??
      scribeDetailsData?.id ??
      (params?.scribeData ?? defaultProps.scribeData)?.id;
    if (!id) return;
    try {
      const chunks = (
        await SunoApi.scribeAudioChunksGET(Constants, { id })
      )?.json;
      setScribeAudioChunksData(chunks);
    } catch (err) {
      logError('Refresh audio chunks error:', err);
    }
  };

  const getScribeDetailsData = async (options = {}) => {
    const { pollForSoapNotes = false, showLoader = true } = options;
    const scribeId =
      scribeDetailsData?.id ?? (params?.scribeData ?? defaultProps.scribeData)?.id;

    if (!scribeId) {
      return null;
    }

    const maxAttempts = pollForSoapNotes ? MAX_SOAP_NOTES_POLL_ATTEMPTS : 1;

    try {
      if (showLoader) {
        setLoading(true);
        if (pollForSoapNotes) {
          setLoadingText(
            'Generation in progress…\nThis may take a moment. The page will update automatically.'
          );
        }
      }

      let latestData = null;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        latestData = (
          await SunoApi.scribeDetailsGET(Constants, {
            query: SCRIBE_DETAILS_QUERY,
            id: scribeId,
          })
        )?.json;

        setScribeDetailsData(latestData);

        if (!pollForSoapNotes || hasSoapNotes(latestData)) {
          return latestData;
        }

        if (attempt < maxAttempts) {
          await new Promise(resolve =>
            setTimeout(resolve, SOAP_NOTES_POLL_INTERVAL_MS)
          );
        }
      }

      if (pollForSoapNotes && !hasSoapNotes(latestData)) {
        showAlertUtil({
          title: 'Still generating',
          message:
            'SOAP notes are not ready yet. Please try again in a moment.',
          buttonText: 'OK',
        });
      }

      return latestData;
    } catch (err) {
      logError('API Error getScribeDetails : ', err);
      return null;
    } finally {
      if (showLoader) {
        setLoading(false);
        setLoadingText('');
      }
    }
  };

  const refreshScribeAfterRecordingSession = async ({
    optimisticStatus,
    expectedStatus,
  } = {}) => {
    const scribeId =
      scribeDetailsData?.id ?? (params?.scribeData ?? defaultProps.scribeData)?.id;

    if (!scribeId) {
      return null;
    }

    if (optimisticStatus != null) {
      setScribeDetailsData(prev => ({
        ...prev,
        status: optimisticStatus,
      }));
      setHasResumedRecording(true);
    }

    const maxAttempts = expectedStatus != null ? 3 : 1;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const latestData = await getScribeDetailsData({ showLoader: false });

      if (
        latestData &&
        (expectedStatus == null ||
          latestData.status === expectedStatus ||
          attempt === maxAttempts)
      ) {
        if (
          expectedStatus != null &&
          latestData.status !== expectedStatus &&
          optimisticStatus != null
        ) {
          setScribeDetailsData(prev => ({
            ...prev,
            ...latestData,
            status: optimisticStatus,
          }));
        }
        break;
      }

      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    await refreshAudioChunks(scribeId);
    return scribeId;
  };

  const handlePostponeRecording = async () => {
    const scribeId = scribeDetailsData?.id;

    recordingSessionEndHandledRef.current = true;
    wasRecordingRef.current = false;

    const postponed = await postponeRecording(scribeId);
    setShowCaptureVisit(false);

    if (postponed) {
      await refreshScribeAfterRecordingSession({
        optimisticStatus: 8,
        expectedStatus: 8,
      });
    } else {
      await refreshScribeAfterRecordingSession();
    }

    recordingSessionEndHandledRef.current = false;
  };

  const handleStopRecording = async () => {
    recordingSessionEndHandledRef.current = true;
    stopRecording();
    setShowCaptureVisit(false);
    await refreshScribeAfterRecordingSession();
    recordingSessionEndHandledRef.current = false;
  };
  React.useEffect(() => {
    if (showCaptureVisit && captureStatus === 'recording') {
      wasRecordingRef.current = true;
    }

    if (
      showCaptureVisit &&
      wasRecordingRef.current &&
      captureStatus === 'idle' &&
      !isConnecting &&
      !recordingSessionEndHandledRef.current
    ) {
      wasRecordingRef.current = false;
      setShowCaptureVisit(false);
      refreshScribeAfterRecordingSession();
    }
  }, [captureStatus, isConnecting, showCaptureVisit]);

  const ensureDownloadsDir = async () => {
    const downloadsDir = getScribeDownloadsDir();
    const dirInfo = await FileSystem.getInfoAsync(downloadsDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(downloadsDir, {
        intermediates: true,
      });
    }
  };

  const checkDownloadedFile = async (scribeId, audioUrl) => {
    if (!scribeId) {
      setDownloadedFileUri(null);
      return;
    }
    try {
      const preferredExt = getAudioExtensionFromUrl(audioUrl);
      const extensionsToTry = [
        preferredExt,
        ...AUDIO_EXTENSIONS.filter(ext => ext !== preferredExt),
      ];

      for (const extension of extensionsToTry) {
        const filePath = getLocalFilePath(scribeId, extension);
        const fileInfo = await FileSystem.getInfoAsync(filePath);
        if (fileInfo.exists && (fileInfo.size ?? 0) >= MIN_AUDIO_FILE_SIZE) {
          setDownloadedFileExtension(extension);
          setDownloadedFileUri(getAndroidPlaybackUri(fileInfo.uri));
          return;
        }
      }

      setDownloadedFileUri(null);
    } catch (err) {
      logError('Check downloaded file error:', err);
      setDownloadedFileUri(null);
    }
  };

  React.useEffect(() => {
    const scribeId = scribeDetailsData?.id;
    const recordingUrl = scribeDetailsData?.recording;

    if (!shouldUseIosMp3Playback || !scribeId || !recordingUrl) {
      setIosMp3RecordingUri(null);
      setIsLoadingIosAudio(false);
      return;
    }

    let cancelled = false;

    const loadIosAudio = async () => {
      setIsLoadingIosAudio(true);
      try {
        const mp3Url = await fetchIosMp3RecordingUrl(scribeId);
        if (!cancelled) {
          setIosMp3RecordingUri(mp3Url);
        }
      } catch (err) {
        logError('Fetch MP3 audio error:', err);
        if (!cancelled) {
          setIosMp3RecordingUri(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingIosAudio(false);
        }
      }
    };

    loadIosAudio();

    return () => {
      cancelled = true;
    };
  }, [
    shouldUseIosMp3Playback,
    scribeDetailsData?.id,
    scribeDetailsData?.recording,
    Constants,
  ]);

  React.useEffect(() => {
    checkDownloadedFile(
      scribeDetailsData?.id,
      playbackRecordingUri || scribeDetailsData?.recording
    );
  }, [
    scribeDetailsData?.id,
    scribeDetailsData?.recording,
    playbackRecordingUri,
  ]);

  React.useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(
      response => {
        const data = response?.notification?.request?.content?.data;
        if (data?.type === SCRIBE_DOWNLOAD_NOTIFICATION_TYPE) {
          openDownloadedFile(data.filePath, data.mimeType);
        }
      }
    );
    return () => sub.remove();
  }, []);

  const downloadAudio = async audioUrl => {
    if (!audioUrl || !scribeDetailsData?.id) {
      return;
    }

    try {
      setIsDownloading(true);
      setProgress(0);
      await ensureDownloadsDir();

      const extension = getAudioExtensionFromUrl(audioUrl);
      const fileName = getScribeFileName(scribeDetailsData.id, extension);
      const filePath = getLocalFilePath(scribeDetailsData.id, extension);
      const fsPath = filePath.replace(/^file:\/\//, '');
      const downloadHeaders = getDownloadHeaders(audioUrl, Constants);

      await Promise.all(
        AUDIO_EXTENSIONS.filter(ext => ext !== extension).map(async ext => {
          const stalePath = getLocalFilePath(scribeDetailsData.id, ext);
          const staleInfo = await FileSystem.getInfoAsync(stalePath);
          if (staleInfo.exists) {
            await FileSystem.deleteAsync(stalePath, { idempotent: true });
          }
        })
      );

      // App-private path only. Android Download Manager cannot write to /data/data/...
      await ReactNativeBlobUtil.config({
        fileCache: true,
        path: fsPath,
      })
        .fetch('GET', audioUrl, downloadHeaders)
        .progress((received, total) => {
          if (total > 0) {
            setProgress(Math.round((received / total) * 100));
          }
        });

      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (!fileInfo.exists || (fileInfo.size ?? 0) < MIN_AUDIO_FILE_SIZE) {
        throw new Error('Downloaded file is empty or invalid');
      }

      setDownloadedFileExtension(extension);
      setDownloadedFileUri(getAndroidPlaybackUri(fileInfo.uri));

      const mimeType = getShareMimeType(extension);
      const savedToDownloads = await saveToDeviceDownloads(
        fsPath,
        fileName,
        mimeType
      );

      await notifyDownloadComplete(fileName, fsPath, mimeType);

      setProgress(100);
      showAlertUtil({
        title: 'Downloaded',
        message:
          Platform.OS === 'android'
            ? savedToDownloads
              ? 'Audio saved to your device Downloads folder.'
              : 'Audio saved to this device.'
            : extension === 'webm'
            ? 'WebM file saved. Use the player above to listen, or share the file.'
            : 'Audio saved to this device. Use Share to save it to Files.',
        buttonText: 'OK',
      });
    } catch (error) {
      logError('Download audio error:', error);
      showAlertUtil({
        title: 'Download failed',
        message: 'Could not download audio. Please try again.',
        buttonText: 'OK',
      });
    } finally {
      setIsDownloading(false);
    }
  };
  const finalizeScribeCompletion = async scribeId => {
    try {
      setIsCompleteScribe(true);
      setLoading(true);
      setLoadingText(
        selectedSOAPMain
          ? 'Generating SOAP notes…\nThis may take a moment.'
          : 'Refreshing scribe details...'
      );
      setShowCaptureVisit(false);

      await getScribeDetailsData({
        pollForSoapNotes: selectedSOAPMain,
        showLoader: true,
      });
      await refreshAudioChunks(scribeId);

      showAlertUtil({
        title: 'Scribe completed',
        message: selectedSOAPMain
          ? 'Your scribe is being processed. SOAP notes will update when ready.'
          : 'Your scribe has been completed successfully.',
        buttonText: 'OK',
      });

      setMainMenuOption(0);
      setHasResumedRecording(false);
    } catch (error) {
      logError('Finalize scribe completion error:', error);
      showAlertUtil({
        title: 'Complete scribe failed',
        message:
          error?.message || 'Could not refresh scribe details. Please try again.',
        buttonText: 'OK',
      });
    } finally {
      setIsCompleteScribe(false);
      setLoading(false);
      setLoadingText('');
    }
  };

  const completeScribe = async () => {
    const scribeId = scribeDetailsData?.id;

    if (!scribeId) {
      showAlertUtil({
        title: 'Complete scribe failed',
        message: 'Scribe ID is missing.',
        buttonText: 'OK',
      });
      return;
    }

    const hasActiveRecordingSession =
      showCaptureVisit &&
      (captureStatus === 'recording' ||
        captureStatus === 'paused' ||
        captureStatus === 'pause' ||
        captureStatus === 'ending');

    if (hasActiveRecordingSession) {
      const handledByWebSocket = completeRecording({
        onEnded: () => finalizeScribeCompletion(scribeId),
      });

      if (handledByWebSocket) {
        return;
      }
    }

    try {
      setIsCompleteScribe(true);
      setLoading(true);
      setLoadingText('Completing scribe...\nThis may take a moment.');

      const templateId =
        templateType || scribeDetailsData?.ambient_scribe_template_id;

      const response = await SunoApi.scribeCompletePOST(Constants, {
        id: scribeId,
      });
      if (
        !response?.status ||
        response.status < 200 ||
        response.status >= 300
      ) {
        throw new Error(
          response?.json?.error ||
          'Could not complete scribe. Please try again.'
        );
      }

      await finalizeScribeCompletion(scribeId);
    } catch (error) {
      logError('Complete scribe error:', error);
      showAlertUtil({
        title: '',
        message:
          error?.message ||
          'Could not complete scribe. Please try again.',
        buttonText: 'OK',
      });
      setIsCompleteScribe(false);
      setLoading(false);
      setLoadingText('');
    }
  };
  const resume = async () => {
    const scribeId = scribeDetailsData?.id;

    if (!scribeId) {
      showAlertUtil({
        title: 'Resume failed',
        message: 'Scribe ID is missing.',
        buttonText: 'OK',
      });
      return;
    }

    if (!scribesEnabled) {
      showAlertUtil({
        title: 'Unavailable',
        message: 'Ambient Scribe is not enabled for your account.',
        buttonText: 'OK',
      });
      return;
    }

    try {
      setIsResume(true);
      wasRecordingRef.current = false;
      setShowCaptureVisit(true);

      const started = await resumeScribeSession(scribeId);
      if (!started) {
        setShowCaptureVisit(false);
        showAlertUtil({
          title: 'Resume failed',
          message: 'Could not start capture visit. Please try again.',
          buttonText: 'OK',
        });
      } else {
        setHasResumedRecording(true);
      }
    } catch (error) {
      logError('Resume error:', error);
      setShowCaptureVisit(false);
      showAlertUtil({
        title: 'Resume failed',
        message: 'Could not resume. Please try again.',
        buttonText: 'OK',
      });
    } finally {
      setIsResume(false);
    }
  };
  const shareDownloadedFile = async () => {
    if (!downloadedFileUri) {
      return;
    }

    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        showAlertUtil({
          title: 'Unavailable',
          message: 'Sharing is not available on this device.',
          buttonText: 'OK',
        });
        return;
      }

      await Sharing.shareAsync(downloadedFileUri, {
        mimeType: getShareMimeType(downloadedFileExtension),
        UTI: 'public.audio',
      });
    } catch (err) {
      logError('Share audio error:', err);
      showAlertUtil({
        title: 'Share failed',
        message: 'Could not share the audio file.',
        buttonText: 'OK',
      });
    }
  };

  const deleteDownloadedFile = () => {
    Alert.alert(
      'Delete audio',
      'Remove the downloaded recording from this device?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await Promise.all(
                AUDIO_EXTENSIONS.map(async ext => {
                  const filePath = getLocalFilePath(scribeDetailsData?.id, ext);
                  await FileSystem.deleteAsync(filePath, { idempotent: true });
                })
              );
              setDownloadedFileUri(null);
              setProgress(0);
            } catch (err) {
              logError('Delete audio error:', err);
              showAlertUtil({
                title: 'Delete failed',
                message: 'Could not delete the audio file.',
                buttonText: 'OK',
              });
            }
          },
        },
      ]
    );
  };

  const deleteAudioRecording = async (id) => {
    Alert.alert(
      'Delete this audio recording',
      'This recording will be permanently deleted. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: async () => {
            try {
              const response = await fetch(
                `${Constants.API_BASE_URL}/ai/ambient-scribes/${scribeDetailsData?.id}/audio-chunks/${id}/`,
                {
                  method: 'DELETE',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: Constants.AUTH_HEADER,
                  },
                }
              );

              if (response.ok) {
                // showAlertUtil({
                //   title: 'Deleted',
                //   message: 'The audio recording has been deleted.',
                //   buttonText: 'OK',
                // });
                setScribeAudioChunksData(scribeAudioChunksData.filter(chunk => chunk.id !== id));


              } else {
                throw new Error('Failed to delete audio recording');
              }
            } catch (err) {
              logError('Delete audio recording error:', err);
              showAlertUtil({
                title: 'Delete failed',
                message: 'Could not delete the audio recording.',
                buttonText: 'OK',
              });
            }
          }
        },
      ],
      { cancelable: true }
    );
  }
  const patientName = `${scribeDetailsData?.patient?.first_name ?? ''} ${scribeDetailsData?.patient?.last_name ?? ''}`.trim() || '—';
  const createdLabel = loading ? '-' :
    scribeDetailsData?.created_at ==  null
      ? 'Future fitting'
      : DateUtils.format(scribeDetailsData?.created_at, 'MM/DD/YYYY hh:mm a');

  return (
    <ScreenContainer scrollable={false} hasSafeArea={true} style={{ backgroundColor: '#F3F6F5' }}>

      <Modal transparent visible={loading} animationType="fade">
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.55)',
          }}
        >
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 16,
              paddingVertical: 28,
              paddingHorizontal: 36,
              alignItems: 'center',
              minWidth: 160,
            }}
          >
            <ActivityIndicator size="large" color={theme.colors.branding.secondary} />
            {loadingText ? (
              <Text
                style={{
                  marginTop: 14,
                  fontFamily: 'Inter_500Medium',
                  fontSize: 14,
                  color: palettes.App.FilterTextColor,
                  textAlign: 'center',
                }}
              >
                {loadingText}
              </Text>
            ) : null}
          </View>
        </View>
      </Modal>
      <CustomChildHeaderBlock name={'Audio Record Details'} />

      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
        <SegmentTabs
          tabs={['View Scribe', 'Audio Recordings']}
          activeIndex={mainMenuOption}
          onChange={setMainMenuOption}
          theme={theme}
        />
      </View>

      {/* <View style={StyleSheet.applyWidth({ padding: 20, paddingHorizontal: 20, flex : 1 }, dimensions.width)}> */}
      {mainMenuOption === 0 ? (
        <SimpleStyleScrollView
          bounces={true}
          horizontal={false}
          keyboardShouldPersistTaps={'never'}
          nestedScrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          style={StyleSheet.applyWidth(
            { paddingHorizontal: 20, paddingBottom: 24, flex: 1 },
            dimensions.width
          )}
        >
          <InfoCard>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 18,
                    color: palettes.App.FilterTextColor,
                    marginBottom: 8,
                  }}
                >
                  {patientName}
                </Text>
                <StatusBadge status={scribeDetailsData?.status} />
              </View>
              <View
                style={{
                  backgroundColor: '#E6F7F1',
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  alignItems: 'center',
                }}
              >
                <Icon name="MaterialCommunityIcons/clock-outline" size={16} color={theme.colors.branding.secondary} />
                <Text
                  style={{
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 14,
                    color: theme.colors.branding.secondary,
                    marginTop: 4,
                  }}
                >
                  {scribeDetailsData?.duration || '—'}
                </Text>
              </View>
            </View>

            <View
              style={{
                height: 1,
                backgroundColor: '#EEF2F0',
                marginVertical: 16,
              }}
            />

            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              <View style={{ width: '70%', paddingRight: 8 }}>
                <MetaRow label="Created" value={createdLabel} />
              </View>
              <View style={{ width: '30%', paddingLeft: 8, alignItems: 'flex-end' }}>
                <MetaRow label="Scribe ID" value={String(scribeDetailsData?.id ?? '—')} />
              </View>
              <View style={{ width: '100%' }}>
                <MetaRow
                  label="Patient"
                  value={patientName}
                  accent={theme.colors.branding.secondary}
                  onPress={() => {
                    try {
                      navigation.navigate(
                        'PatientDetailsScreen',
                        {
                          id: scribeDetailsData?.patient?.id,
                          clientID: scribeDetailsData?.patient?.preferred_clinic?.id,
                        },
                        { pop: true }
                      );
                    } catch (err) {
                      logError('Navigation Error : ', err);
                    }
                  }}
                />
              </View>
            </View>
          </InfoCard>

          {scribeDetailsData?.recording != null && (
            <InfoCard>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: '#E6F7F1',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}
                  >
                    <Icon name="MaterialCommunityIcons/waveform" size={22} color={theme.colors.branding.secondary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: palettes.App.FilterTextColor }}>
                      {downloadedFileUri ? 'Downloaded Audio' : 'Audio Recording'}
                    </Text>
                    <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: palettes.App.TextPlaceholder, marginTop: 2 }}>
                      {playbackExtension.toUpperCase()} · {downloadedFileUri ? 'Saved on device' : 'Streaming'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => downloadAudio(playbackRecordingUri)}
                  disabled={
                    isDownloading ||
                    !playbackRecordingUri ||
                    (shouldUseIosMp3Playback && isLoadingIosAudio)
                  }
                  style={{
                    backgroundColor: '#E6F7F1',
                    borderRadius: 10,
                    padding: 10,
                    opacity: isDownloading ? 0.6 : 1,
                  }}
                >
                  {isDownloading ? (
                    <ActivityIndicator size="small" color={theme.colors.branding.secondary} />
                  ) : (
                    <Icon name="MaterialCommunityIcons/download" size={20} color={theme.colors.branding.secondary} />
                  )}
                </TouchableOpacity>
              </View>

              {isDownloading ? (
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: theme.colors.branding.secondary, marginBottom: 10 }}>
                  Downloading {progress}%
                </Text>
              ) : null}

              {shouldUseIosMp3Playback && isLoadingIosAudio ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.branding.secondary}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: palettes.App.TextPlaceholder }}>
                    Preparing audio...
                  </Text>
                </View>
              ) : null}

              {shouldUseIosMp3Playback && !isLoadingIosAudio && !iosMp3RecordingUri ? (
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: '#b45309', marginBottom: 10 }}>
                  Could not prepare audio.
                </Text>
              ) : null}

              {isIosAudioReady ? (
                <AudioPlayer
                  audioUri={downloadedFileUri}
                  fallbackUri={playbackRecordingUri}
                  audioFormat={playbackExtension}
                  theme={theme}
                />
              ) : null}

              {/* {downloadedFileUri != null ? (
                <View style={{ flexDirection: 'row', marginTop: 16, gap: 10 }}>
                  <ActionButton
                    label="Share"
                    icon="MaterialCommunityIcons/share-variant"
                    onPress={shareDownloadedFile}
                    theme={theme}
                  />
                  <ActionButton
                    label="Delete"
                    icon="MaterialCommunityIcons/delete-outline"
                    onPress={deleteDownloadedFile}
                    variant="danger"
                    theme={theme}
                  />
                </View>
              ) : null} */}
            </InfoCard>
          )}

          {showScribeActionRow && (
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              {scribeStatus != 0 && (
                <ActionButton
                  label="Resume"
                  icon="MaterialCommunityIcons/microphone"
                  onPress={() => resume()}
                  loading={isResume}
                  theme={theme}
                />
              )}
              {showCompleteScribeButton && (
                <ActionButton
                  label="Complete Scribe"
                  icon="MaterialCommunityIcons/square"
                  onPress={() => completeScribe()}
                  loading={isCompleteScribe}
                  variant="primary"
                  theme={theme}
                />
              )}
            </View>
          )}

          {scribeDetailsData?.status == 5 || scribeDetailsData?.status == 7 ? (

            <AlertBanner
              type="warning"
              message="No audio data was captured for this recording. Please check that your microphone is connected and selected correctly, then start a new recording."
            />
          ) : (
            <View style={{ marginTop: 4, marginBottom: 8 }}>
              {scribeDetailsData?.status != 0 &&

                <SegmentTabs
                  tabs={['Scribe', 'Transcript', 'Summary']}
                  activeIndex={menuOption}
                  onChange={index => {
                    setSelectedTag(index);
                    setMenuOption(index);
                  }}
                  theme={theme}
                />
              }
            </View>
          )}

          {!(menuOption === 0) ? null : (
            <InfoCard>

              <View style={{ zIndex: 9999, marginBottom: 14, }}>

                <DropDownPicker
                  open={open}
                  value={templateType}
                  items={scribeTemplatesData}
                  setOpen={setOpen}
                  setValue={setTemplateType}
                  setItems={setScribeTemplatesData}
                  placeholder={'Select Scribe Template'}
                  zIndex={5000} // Important for Android stacking
                  zIndexInverse={5000} // Needed if multiple dropdowns
                  dropDownContainerStyle={{
                    backgroundColor: 'white',
                    borderColor: '#D1D5DB',
                    borderRadius: 8,
                    width: TAB_WIDTH - 80,
                    // maxHeight: 225, // scrollable dropdown
                  }}
                  style={{
                    backgroundColor: 'white',
                    borderColor: '#D1D5DB',
                    borderRadius: 8,
                    width: TAB_WIDTH - 80,
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
              <ActionButton
                label="Generate"
                icon="MaterialCommunityIcons/auto-fix"
                variant="primary"
                theme={theme}
                onPress={async () => {
                  try {
                    setLoading(true);
                    await sunoScribeTemplateGeneratePOST.mutateAsync({
                      ambient_scribe_template_id: templateType,
                      format: 'html',
                      transform_type: 'soap',
                      id: scribeDetailsData?.id,
                      type: 'async',
                    });
                    setIsCallScribeTemplateGenerate(
                      prev => (typeof prev === 'number' ? prev + 1 : 1)
                    );
                    await getScribeDetailsData({ pollForSoapNotes: true });
                  } catch (err) {
                    logError(err);
                    setLoading(false);
                    showAlertUtil({
                      title: 'Generate failed',
                      message: 'Could not start SOAP note generation. Please try again.',
                      buttonText: 'OK',
                    });
                  }
                }}
                style={{ flex: 0, alignSelf: 'flex-start', paddingHorizontal: 24 }}
              />
              {scribeDetailsData?.soap_notes != null ? (
                <View style={{ marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#EEF2F0' }}>
                  <Utils.CustomCodeErrorBoundary>
                    <HtmlView.HtmlView
                      htmlContent={scribeDetailsData?.soap_notes}
                      patientData={scribeDetailsData}
                      fontSize={13}
                      color={palettes.App['Custom Color_18']}
                    />
                  </Utils.CustomCodeErrorBoundary>
                </View>
              ) : (
                <Text style={{ marginTop: 16, fontFamily: 'Inter_400Regular', fontSize: 13, color: palettes.App.TextPlaceholder }}>
                  No SOAP notes yet. Choose a template and tap Generate.
                </Text>
              )}
            </InfoCard>
          )}

          {!(menuOption === 1) ? null : (
            <InfoCard>
              {/* <SectionTitle title="Transcript" subtitle="Full transcription of the recording" /> */}
              {scribeDetailsData?.transcription?.channels?.[0]?.alternatives?.[0]?.transcript != null ? (
                <Utils.CustomCodeErrorBoundary>
                  <HtmlView.HtmlView
                    htmlContent={scribeDetailsData?.transcription?.channels?.[0]?.alternatives?.[0]?.transcript}
                    patientData={scribeDetailsData}
                    fontSize={13}
                    color={palettes.App['Custom Color_18']}
                  />
                </Utils.CustomCodeErrorBoundary>
              ) : (
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: palettes.App.TextPlaceholder }}>
                  Transcript is not available yet.
                </Text>
              )}
            </InfoCard>
          )}

          {!(menuOption === 2) ? null : (
            <InfoCard>
              {/* <SectionTitle title="Summary" subtitle="AI-generated visit summary" /> */}
              {scribeDetailsData?.summary != null ? (
                <Utils.CustomCodeErrorBoundary>
                  <HtmlView.HtmlView
                    htmlContent={scribeDetailsData?.summary}
                    patientData={scribeDetailsData}
                    fontSize={13}
                    color={palettes.App['Custom Color_18']}
                  />
                </Utils.CustomCodeErrorBoundary>
              ) : (
                <View>
                  <Text style={{ marginBottom: 16, fontFamily: 'Inter_400Regular', fontSize: 13, color: palettes.App.TextPlaceholder }}>
                    No summary available yet. Click the button to generate.
                  </Text>
                  <ActionButton
                    label="Generate Summary"
                    icon="MaterialCommunityIcons/text-box-outline"
                    variant="primary"
                    theme={theme}
                    onPress={async () => {
                      try {
                        setLoading(true);
                        await sunoScribeTemplateGeneratePOST.mutateAsync({
                          transform_type: 'summary',
                          id: scribeDetailsData?.id,
                          type: 'transform',
                        });
                        setIsCallScribeTemplateGenerate(
                          prev => (typeof prev === 'number' ? prev + 1 : 1)
                        );
                        await getScribeDetailsData({ pollForSoapNotes: true });
                      } catch (err) {
                        logError(err);
                        setLoading(false);
                        showAlertUtil({
                          title: 'Generate failed',
                          message: 'Could not start summary generation. Please try again.',
                          buttonText: 'OK',
                        });
                      }
                    }}
                    style={{ flex: 0, alignSelf: 'flex-start', paddingHorizontal: 24 }}
                  />
                </View>
              )}
            </InfoCard>
          )}

        </SimpleStyleScrollView>
      ) : null}
      {mainMenuOption === 1 ? (
        <SimpleStyleScrollView
          bounces={true}
          horizontal={false}
          keyboardShouldPersistTaps={'handled'}
          nestedScrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          style={StyleSheet.applyWidth(
            { paddingHorizontal: 20, paddingBottom: 24, flex: 1 },
            dimensions.width
          )}
        >
          <InfoCard>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <MetaRow label="Created" value={createdLabel} />
                <MetaRow
                  label="Scribe Template"
                  value={
                    scribeTemplatesData?.find(
                      item => item.value === String(scribeDetailsData?.ambient_scribe_template_id)
                    )?.label || '—'
                  }
                />
              </View>
              <StatusBadge status={scribeDetailsData?.status} />
            </View>
          </InfoCard>

          {scribeDetailsData?.status == 8 ? (
            <AlertBanner
              type="warning"
              message="Ambient Scribe is paused. Resume recording, add Scribe Context, or Complete Scribe when you are ready to generate."
            />
          ) : (
            <AlertBanner
              type="info"
              message="You can resume recording, add Scribe Context, or remove unwanted sessions before completing the scribe."
            />
          )}

          {(scribeStatus == 8 || scribeStatus == 4) && (
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              <ActionButton
                label="Resume"
                icon="MaterialCommunityIcons/microphone"
                onPress={() => resume()}
                loading={isResume}
                theme={theme}
              />
              {showCompleteScribeButton && (
                <ActionButton
                  label="Complete Scribe"
                  icon="MaterialCommunityIcons/square"
                  onPress={() => completeScribe()}
                  loading={isCompleteScribe}
                  variant="primary"
                  theme={theme}
                />
              )}
            </View>
          )}

          <View style={{ marginBottom: 12 }}>
            <SegmentTabs
              tabs={['Recording Sessions', 'Scribe Context']}
              activeIndex={audioRecordingsMenuOption}
              onChange={index => {
                setAudioRecordingsMenuOption(index);
                if (index === 1) {
                  setShowScribeContextModal(true);
                }
              }}
              theme={theme}
            />
          </View>

          {/* Overview */}
          {!(audioRecordingsMenuOption === 0) ? null : (
            <View style={{ flex: 1 }}>


              {!(scribeAudioChunksData?.length === 0) ? null : (
                <EmptyListBlock
                  message={'No recording sessions found'}
                />
              )}


              <SimpleStyleFlashList
                data={scribeAudioChunksData}
                estimatedItemSize={140}
                horizontal={false}
                inverted={false}
                scrollEnabled={false}
                keyExtractor={(flashListData, index) =>
                  flashListData?.id ??
                  flashListData?.uuid ??
                  index?.toString() ??
                  JSON.stringify(flashListData)
                }
                listKey={'Task->View->Task->Fetch->FlashList'}
                numColumns={1}
                renderItem={({ item, index }) => {
                  const flashListData = item;
                  const formattedDuration = `${Math.floor(flashListData?.duration_seconds / 60)
                    .toString()
                    .padStart(2, '0')}:${Math.floor(flashListData?.duration_seconds % 60)
                      .toString()
                      .padStart(2, '0')}`;

                  const transcriptionText =
                    flashListData?.transcription_chunks
                      ?.map(({ text }) => text)
                      .join(' ') || '';

                  return (
                    <InfoCard style={{ padding: 14, marginBottom: 10 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                        {/* <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: '#E6F7F1',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 12,
                          }}
                        >
                          <Icon
                            name="MaterialCommunityIcons/microphone"
                            size={18}
                            color={theme.colors.branding.secondary}
                          />
                        </View> */}
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text
                              style={{
                                fontFamily: 'Inter_600SemiBold',
                                fontSize: 14,
                                color: palettes.App.FilterTextColor,
                              }}
                            >
                              Audio ({formattedDuration})
                            </Text>
                            
                            <View
                              style={{
                                // backgroundColor: '#F3F6F5',
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                borderRadius: 8,
                              }}
                            >
                              <TouchableOpacity disabled={scribeAudioChunksData.length <= 1} onPress={() => deleteAudioRecording(flashListData?.id)}>
                                <Icon
                                  name="MaterialCommunityIcons/delete"
                                  size={20}
                                  color={scribeAudioChunksData.length <= 1 ? palettes.App.TextPlaceholder : theme.colors.branding.secondary}
                                  disabled={scribeAudioChunksData.length <= 1}
                                />
                              </TouchableOpacity>
                            </View>
                
                          </View>
                          <Text
                            style={{
                              fontFamily: 'Inter_400Regular',
                              fontSize: 13,
                              lineHeight: 18,
                              color: palettes.App.TextPlaceholder,
                              marginTop: 8,
                            }}
                          >
                            {transcriptionText || 'No transcript for this session yet.'}
                          </Text>
                        </View>
                      </View>
                    </InfoCard>
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

            </View>
          )}

        </SimpleStyleScrollView>
      ) : null}

      <Modal
        visible={showScribeContextModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => {
          setShowScribeContextModal(false);
          setAudioRecordingsMenuOption(0);
        }}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F6F5' }} edges={['top', 'left', 'right', 'bottom']}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: '#E8EEEC',
              backgroundColor: '#fff',
            }}
          >
            <Text
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 18,
                color: palettes.App.FilterTextColor,
              }}
            >
              Scribe Context
            </Text>
            <TouchableOpacity
              onPress={() => {
                Keyboard.dismiss();
                setShowScribeContextModal(false);
                setAudioRecordingsMenuOption(0);
              }}
            >
              <Icon name="MaterialIcons/close" size={24} color={palettes.App.FilterTextColor} />
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1 }}>
            <Utils.CustomCodeErrorBoundary>
              <ScribeContextEditor.ScribeContextEditor
                key={`scribe-context-${scribeDetailsData?.id}`}
                scribeId={scribeDetailsData?.id}
                initialContent={scribeDetailsData?.custom_context ?? ''}
                theme={theme}
                onSaved={html => {
                  setScribeDetailsData(prev => ({
                    ...prev,
                    custom_context: html,
                  }));
                }}
              />
            </Utils.CustomCodeErrorBoundary>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showCaptureVisit}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          if (captureStatus === 'recording' || captureStatus === 'paused') {
            Alert.alert(
              'Recording in progress',
              'Please pause or stop the recording before closing capture visit.'
            );
            return;
          }
          setShowCaptureVisit(false);
        }}
      >
        <View style={{ flex: 1, backgroundColor: '#F3F6F5' }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              paddingTop: 16,
              paddingBottom: 12,
              borderBottomWidth: 1,
              borderBottomColor: '#E8EEEC',
              backgroundColor: '#fff',
            }}
          >
            <Text
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 18,
                color: palettes.App.FilterTextColor,
              }}
            >
              Capture Visit
            </Text>
            <TouchableOpacity
              onPress={() => {
                if (captureStatus === 'recording' || captureStatus === 'paused') {
                  Alert.alert(
                    'Recording in progress',
                    'Please pause or stop the recording before closing.'
                  );
                  return;
                }
                setShowCaptureVisit(false);
              }}
            >
              <Icon name="MaterialIcons/close" size={24} color={palettes.App.FilterTextColor} />
            </TouchableOpacity>
          </View>

          <SimpleStyleScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
          >
            <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
              <Text
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 13,
                  color: palettes.App.TextPlaceholder,
                  marginBottom: 12,
                }}
              >
                Resuming scribe #{scribeDetailsData?.id} for {patientName}
              </Text>

              <ScribeControlBar
                scribes_enabled={scribesEnabled}
                status={captureStatus}
                amplitude={amplitude}
                isConnecting={isConnecting}
                isPostponing={isPostponing}
                selectedSOAPMain={selectedSOAPMain}
                selectedChartNoteMain={selectedChartNoteMain}
                onStart={startRecording}
                onPause={pauseRecording}
                onPostpone={handlePostponeRecording}
                onResume={resumeRecording}
                onStop={handleStopRecording}
                onSaveSettings={data => {
                  setSelectedChartNoteMain(data.chartNote);
                  setSelectedPreviewMain(data.preview);
                  setSelectedSOAPMain(data.soap);
                }}
                showSilenceModal={showSilenceModal}
                countdown={countdown}
                onSilencePause={pauseRecording}
                onSilenceContinue={onSilenceContinue}
              />

              {selectedPreviewMain && captureTranscript ? (
                <InfoCard style={{ marginTop: 16 }}>
                  <SectionTitle title="Live Transcript" />
                  <Text
                    style={{
                      fontFamily: 'Inter_400Regular',
                      fontSize: 13,
                      lineHeight: 20,
                      color: palettes.App['Custom Color_18'],
                    }}
                  >
                    {captureTranscript.trim()}
                  </Text>
                </InfoCard>
              ) : null}
            </View>
          </SimpleStyleScrollView>
        </View>
      </Modal>

    </ScreenContainer>
  );
};

export default withTheme(ScribeHistoryScreen);
