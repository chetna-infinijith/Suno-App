import * as React from 'react';
import { Provider as ThemeProvider } from '@draftbit/ui';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import {
  ActivityIndicator,
  AppState,
  Appearance,
  Linking,
  Platform,
  StatusBar,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import {
  SafeAreaFrameContext,
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from 'react-query';
import AppNavigator from './AppNavigator';
import Fonts from './config/Fonts.js';
import { GlobalVariableProvider } from './config/GlobalVariableContext';
import cacheAssetsAsync from './config/cacheAssetsAsync';
import DraftbitDefault from './themes/DraftbitDefault';
import useWindowDimensions from './utils/useWindowDimensions';
import { initializeApp, getApps, getApp } from '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';
import { getToken, requestPermission, onMessage } from '@react-native-firebase/messaging';
import { SendbirdUIKitContainer, useSendbirdChat } from '@sendbird/uikit-react-native';

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Logger, parseSendbirdNotification, SendbirdChatSDK } from "@sendbird/uikit-utils";
// import Notifee, { EventType } from '@notifee/react-native';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import remoteConfig from '@react-native-firebase/remote-config';
import DeviceInfo from 'react-native-device-info';
import {
  getCrashlytics,
  log,
  crash,
  recordError,
  setUserId,
} from '@react-native-firebase/crashlytics';
import analytics from '@react-native-firebase/analytics';


// Handle data from '@react-native-community/push-notification-ios'.
const onNotificationIOS = (notification) => {
  const data = notification?.getData();
  if (data && data.userInteraction === 1 && Boolean(data.sendbird)) {
    // Navigate to channel.
    // const channelUrl = data.sendbird.channel.channel_url;
  }
};

// Handle data from '@notifee/react-native'.
const onNotificationAndroid = async (event) => {
  if (event.type === EventType.PRESS && Boolean(event.detail.notification?.data?.sendbird)) {
    // Navigate to channel.
    // const channelUrl = event.detail.notification.data.sendbird.channel.channel_url;
  }
};

// import crashlytics from '@react-native-firebase/crashlytics';

// if (getApps().length === 0) {
//   console.log("=== initializeApp ====")
//   initializeApp();
// }

// crashlytics().log('App started');


import { Alert } from 'react-native';
import { navigate, navigationRef } from './NavigationService.js';

import * as ExpoClipboard from "expo-clipboard";
import * as ExpoDocumentPicker from "expo-document-picker";
import * as ExpoFS from "expo-file-system";
import * as ExpoImagePicker from "expo-image-picker";
import * as ExpoMediaLibrary from "expo-media-library";
import * as ExpoNotifications from "expo-notifications";
import * as ExpoAV from "expo-av";
import * as ExpoVideoThumbnail from "expo-video-thumbnails";
import * as ExpoImageManipulator from "expo-image-manipulator";
import {
  createExpoClipboardService,
  createExpoFileService,
  createExpoMediaService,
  createExpoNotificationService,
  createExpoPlayerService,
  createExpoRecorderService,
  SendbirdUIKitContainerProps,
} from "@sendbird/uikit-react-native";
import { onForeground } from './custom-files/Notification.js';
import { generateSessionId } from './global-functions/sessionManager.js';
import { setPendingNotification } from './global-functions/notificationService.js';
// import {
//   AutoEnvAttributes,
//   LDProvider,
//   ReactNativeLDClient,
// } from '@launchdarkly/react-native-client-sdk';

let AppSendbirdSDK;
export const GetSendbirdSDK = () => AppSendbirdSDK;
export const SetSendbirdSDK = (sdk) => (AppSendbirdSDK = sdk);

export const notificationService = {
  // Ask user permission
  async requestPermission() {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  },

  // Get push token
  async getToken() {
    const token = await Notifications.getDevicePushTokenAsync();
    return token?.data;
  },

  // Listen foreground notifications
  onMessageReceived(handler) {
    const subscription =
      Notifications.addNotificationReceivedListener((notification) => {
        handler(notification.request.content.data);
      });

    return () => subscription.remove();
  },
};
export const platformServices =
{
  clipboard: createExpoClipboardService(ExpoClipboard),
  // notification: createExpoNotificationService(ExpoNotifications),
  notification: notificationService, // 🔔 IMPORTANT

  file: createExpoFileService({
    fsModule: ExpoFS,
    imagePickerModule: ExpoImagePicker,
    mediaLibraryModule: ExpoMediaLibrary,
    documentPickerModule: ExpoDocumentPicker,
  }),
  media: createExpoMediaService({
    avModule: ExpoAV,
    thumbnailModule: ExpoVideoThumbnail,
    imageManipulator: ExpoImageManipulator,
    fsModule: ExpoFS,
  }),
  player: createExpoPlayerService({
    avModule: ExpoAV,
  }),
  recorder: createExpoRecorderService({
    avModule: ExpoAV,
  }),
};

// 🔹 Initialize Firebase only once
if (getApps().length === 0) {
  console.log('=== Initializing Firebase App ===');
  initializeApp();
}

// 🔹 Get Crashlytics instance safely
const crashlytics = getCrashlytics(getApp());

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const queryClient = new QueryClient();

// On web, Appearance.setColorScheme is not implemented
// See https://github.com/necolas/react-native-web/issues/2703
//
// This reimplementation is a workaround to allow the app to switch between light and dark schemes
// by storing the selection in the data-theme attribute of the document element.
if (Platform.OS === 'web') {
  Appearance.setColorScheme = scheme => {
    document.documentElement.setAttribute('data-theme', scheme);
  };

  Appearance.getColorScheme = () => {
    const systemValue = window.matchMedia('(prefers-color-scheme: dark)')
      .matches
      ? 'dark'
      : 'light';
    const userValue = document.documentElement.getAttribute('data-theme');
    return userValue && userValue !== 'null' ? userValue : systemValue;
  };

  Appearance.addChangeListener = listener => {
    // Listen for changes of system value
    const systemValueListener = e => {
      const newSystemValue = e.matches ? 'dark' : 'light';
      const userValue = document.documentElement.getAttribute('data-theme');
      listener({
        colorScheme:
          userValue && userValue !== 'null' ? userValue : newSystemValue,
      });
    };
    const systemValue = window.matchMedia('(prefers-color-scheme: dark)');
    systemValue.addEventListener('change', systemValueListener);

    // Listen for changes of user set value
    const observer = new MutationObserver(mutationsList => {
      for (const mutation of mutationsList) {
        if (mutation.attributeName === 'data-theme') {
          listener({ colorScheme: Appearance.getColorScheme() });
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true });

    function remove() {
      systemValue.removeEventListener('change', systemValueListener);
      observer.disconnect();
    }

    return { remove };
  };
}
export const isUpdateRequired = (current, latest) => {
  const c = current.split('.').map(Number);
  const l = latest.split('.').map(Number);

  for (let i = 0; i < l.length; i++) {
    if ((c[i] || 0) < l[i]) return true;
    if ((c[i] || 0) > l[i]) return false;
  }
  return false;
};
export const openStore = () => {
  const android_link = remoteConfig()
    .getValue('android_app_link')
    .asString();

  const url =
    Platform.OS === 'android'
      ? android_link
      : 'https://apps.apple.com/us/app/suno-software/id6448741301';

  Linking.openURL(url).catch(() => {
    // Linking.openURL(
    //   'https://play.google.com/store/apps/details?id=com.suno.app'
    // );
  });
};
const App = () => {
  const [areAssetsCached, setAreAssetsCached] = React.useState(false);
  let openedFromNotification = false;
  let isAppReady = false;
  let pendingNotification = null;

  React.useEffect(() => {
    const initializeAnalytics = async () => {
      // 1. Enable analytics collection
      await analytics().setAnalyticsCollectionEnabled(true);
      
      // 2. Log a specific test event to "wake up" the DebugView
      await analytics().logEvent('debug_session_start', {
        platform: Platform.OS,
        time: new Date().toISOString(),
      });
      
      console.log("Firebase Analytics Collection Enabled");
    };

    initializeAnalytics();
  }, []);

  React.useEffect(() => {
    generateSessionId(); // generate once on app start

  }, []);

  const [fontsLoaded] = useFonts({
    Inter_400Regular: Fonts.Inter_400Regular,
    Inter_500Medium: Fonts.Inter_500Medium,
    Inter_600SemiBold: Fonts.Inter_600SemiBold,
    Inter_700Bold: Fonts.Inter_700Bold,
    Inter_800ExtraBold: Fonts.Inter_800ExtraBold,
    Inter_300Light: Fonts.Inter_300Light,
    OpenSans_500Medium: Fonts.OpenSans_500Medium,
    OpenSans_600SemiBold: Fonts.OpenSans_600SemiBold,
    Poppins_500Medium: Fonts.Poppins_500Medium,
    Poppins_600SemiBold: Fonts.Poppins_600SemiBold,
    Poppins_400Regular: Fonts.Poppins_400Regular,
    Rubik_400Regular: Fonts.Rubik_400Regular,
    Rubik_500Medium: Fonts.Rubik_500Medium,
  });
  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log("Permission granted");
      getFcmToken();
    }
  };



  // 2. Get FCM Token
  const getFcmToken = async () => {
    // const token = await messaging().getToken();
    const token = await getToken(messaging());
    console.log("FCM Token:", token);
  };

  // React.useEffect(() => {
  //   PushNotificationIOS.getInitialNotification().then(onNotificationIOS);
  //   PushNotificationIOS.addEventListener('localNotification', onNotificationIOS);

  //   const unsubscribe = Notifee.onForegroundEvent(onNotificationAndroid);
  //   return () => {
  //     PushNotificationIOS.removeEventListener('localNotification');
  //     unsubscribe();
  //   };
  // }, []);
  // 3. Foreground message
  const handleUpdateNavigation = async (remoteMessage, isFromKill = false) => {
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
        // if (forceUpdate) {
          // setShowUpdateModal(true);   // no cancel
        // } else {
          const skippedVersion = await AsyncStorage.getItem('skip_update_version');
          // console.log("===== skippedVersion dashboard:", skippedVersion, latestVersion)

          if (skippedVersion !== latestVersion) {
            // setShowOptionalModal(true); // update + cancel
            Alert.alert(
              remoteMessage?.notification?.title,
              remoteMessage?.notification?.body,
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
        // }
      }
    } catch (e) {
      console.log('Remote config error', e);
    }

  }
  const handleNavigation = (remoteMessage, isFromKill = false) => {
    const type = Number(remoteMessage?.data?.notification_type);
    const notification_type = Number(remoteMessage?.data?.type);

    if (type === 1) {

      const patientId = remoteMessage?.data?.patient_id;
      if (!patientId) {
        return;
      }
console.log("===== patientId :", patientId)
      setTimeout(() => {
        if (!navigationRef.isReady()) return;

        const currentRoute = navigationRef.getCurrentRoute();

        if (!currentRoute) {
          // App just opened → create stack
          navigationRef.current?.reset({
            index: 1,
            routes: [
              { name: 'BottomTabNavigator' },
              {
                name: 'PatientDetailsScreen',
                params: { id: patientId },
              },
            ],
          });
        } else {
          // App already running → push
          navigationRef.current?.navigate('PatientDetailsScreen', {
            id: patientId,
          });
        }
      }, 500);

      // setTimeout(() => {
      //   console.log("====== navigationRef :", navigationRef)
      //   navigationRef.current?.navigate('PatientDetailsScreen', {
      //     id: remoteMessage?.data?.patient_id,
      //   });
      // }, 500);
    } else if (notification_type) {
      handleUpdateNavigation(remoteMessage)
    }
  };
  
  React.useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      if (openedFromNotification) {
        openedFromNotification = false;
        return;
      }
      //       1 - Appointment
      // 2 - Message
      // 3 - Report
      // 4 - Intake Form
      // 5 - Task
      // 6 - Noah
      // 7 - Touchpoint
      // 8 - Ambient Scribe

      // {"contentAvailable": true, "data": {"clinic_id": "1", "notification_id": "343202", "notification_type": "8", "patient_id": "1436346"}, "from": "97561643825", "messageId": "1771590994218707", "notification": {"body": "SOAP notes have been generated for Chetna Kundariya's ambient scribe recording.", "sound": "default", "title": "SOAP notes generated"}}
      console.log("Foreground Message:", remoteMessage);
      if (remoteMessage?.notification) {
        console.log("Foreground notification:", remoteMessage?.notification);

        if (Number(remoteMessage?.data?.notification_type) === 1) {

          Alert.alert(
            remoteMessage?.notification?.title,
            remoteMessage?.notification?.body,
            [
              {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel', // iOS bolds "Cancel"
              },
              {
                text: 'Open Patient',
                onPress: () => {
                  handleNavigation(remoteMessage)

                  // navigate(
                  //   'PatientDetailsScreen',
                  //   {
                  //     id: remoteMessage?.data?.patient_id,
                  //   },
                  //   { pop: true }
                  // );
                }, // 👈 navigate back
              },
            ],
            { cancelable: true }
          );
        } else if (Number(remoteMessage?.data?.type) === 1) {
          handleUpdateNavigation(remoteMessage)
        }

      } else if (remoteMessage?.data) {
        try {

         
          // const sdk = GetSendbirdSDK();

          // console.log('Sendbird User ID:', sdk?.userId);
          const sendbird = parseSendbirdNotification(remoteMessage?.data);
          // console.log("==== sendbird :",sendbird)

          Alert.alert(
            remoteMessage?.data?.message,
            remoteMessage?.data?.sendbird?.message,
            [
              {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel', // iOS bolds "Cancel"
              },
              {
                text: 'Open Chat',
                onPress: () => {

                  const channelUrl = sendbird?.channel.channel_url;
                  console.log("==== channelUrl :", channelUrl)
                  if (!channelUrl) {
                    console.log("❌ channelUrl missing");
                    return;
                  }
                  // console.log("===== navigationRef.getCurrentRoute()?.name : ", navigationRef.getCurrentRoute()?.name)
                  navigationRef.current?.navigate('GroupChannel', { channelUrl });

                }, // 👈 navigate back
              },
            ],
            { cancelable: true }
          );
        } catch (error) {
          console.log('Sendbird error:', error);

        }
      }

    });

    return unsubscribe;
  }, []);

  // 4. App opened by notification
  React.useEffect(() => {


    async function requestPermissions() {
      if (Platform.OS === "android" && Platform.Version >= 33) {
        const settings = await Notifications.requestPermissionsAsync();
        console.log("Permission status:", settings);
      }
    }

    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log("Opened from background:", remoteMessage);
      openedFromNotification = true;

      handleNavigation(remoteMessage)


      // Alert.alert(
      //   remoteMessage?.notification?.title,
      //   remoteMessage?.notification?.body,
      //   [
      //     {
      //       text: 'Cancel',
      //       onPress: () => console.log('Cancel Pressed'),
      //       style: 'cancel', // iOS bolds "Cancel"
      //     },
      //     {
      //       text: 'Open Patient',
      //       onPress: () => {
      //         navigate(
      //           'PatientDetailsScreen',
      //           {
      //             id: remoteMessage?.data?.patient_id,
      //           },
      //           { pop: true }
      //         );
      //       }, // 👈 navigate back
      //     },
      //   ],
      //   { cancelable: true }
      // );

    });

    messaging().getInitialNotification().then(remoteMessage => {
      if (remoteMessage) {
        openedFromNotification = true;
        setPendingNotification(remoteMessage);
        console.log("Opened from quit state:", remoteMessage);
        // handleNavigation(remoteMessage, true)
      }
    });
    requestPermissions()
  }, []);

  // Call permission request on app load
  React.useEffect(() => {
    requestUserPermission();
  }, []);

  React.useEffect(() => {
    async function prepare() {
      //       await messaging().registerDeviceForRemoteMessages();
      // const token = await messaging().getToken();
      // console.log("===== token", token)

      try {
        await cacheAssetsAsync();
      } catch (e) {
        console.warn(e);
      } finally {
        setAreAssetsCached(true);
      }
    }

    prepare();
  }, []);

  const dimensions = useWindowDimensions();
  const colorScheme = useColorScheme();

  // SafeAreaProvider sets the 'frame' once and does not update when the window size changes (on web).
  // This is particularly problematic for drawer navigators that depend on the frame size to render the drawer.
  // This overrides the value of the frame to match the current window size which addresses the issue.
  //
  // The Drawer snippet that relies on useSafeAreaFrame: https://github.com/react-navigation/react-navigation/blob/bddcc44ab0e0ad5630f7ee0feb69496412a00217/packages/drawer/src/views/DrawerView.tsx#L112
  // Issue regarding broken useSafeAreaFrame: https://github.com/th3rdwave/react-native-safe-area-context/issues/184
  const SafeAreaFrameContextProvider =
    Platform.OS === 'web' ? SafeAreaFrameContext.Provider : React.Fragment;

  const isReady = areAssetsCached && fontsLoaded;
  const onLayoutRootView = React.useCallback(async () => {
    if (isReady) {
      await SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }
  const handleCreateChannel = async (userId) => {
    // Create a 1-on-1 channel with this user
    // You can use Sendbird SDK directly here
    // Example:
    // const channel = await sb.GroupChannel.createChannelWithUserIds([userId], false);
    console.log('Create channel with user:', userId);
  };

  // const client = new ReactNativeLDClient('mob-25606682-101d-46a3-9fc0-6d28757dd240', {
  //   key: 'Chetna', // unique user id
  //   name: 'Chetna',
  //   email: 'chetna.k@infifnijith.com',
  //   // anonymous: true,

  // });

  // const client = new ReactNativeLDClient('mob-25606682-101d-46a3-9fc0-6d28757dd240', AutoEnvAttributes.Enabled, {
  //   debug: true,
  //   applicationInfo: {
  //     id: 'ld-rn-test-app',
  //     version: '0.0.1',
  //   },
  // });

  return (
    <>
      {Platform.OS === 'ios' ? (
        <StatusBar
          barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        />
      ) : null}
      {Platform.OS === 'android' ? (
        <StatusBar
          barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        />
      ) : null}
      <ThemeProvider
        themes={[DraftbitDefault]}
        breakpoints={{}}
        initialThemeName={'Draftbit Default'}
      >

        <SafeAreaProvider
          initialMetrics={initialWindowMetrics}
          onLayout={onLayoutRootView}
        >
          <SafeAreaFrameContextProvider
            value={{
              x: 0,
              y: 0,
              width: dimensions.width,
              height: dimensions.height,
            }}
          >
            <GlobalVariableProvider>
              <QueryClientProvider client={queryClient}>
                {/* <LDProvider client={client}> */}

                <SendbirdUIKitContainer
                  appId={'3DF0E5C5-271A-4B6C-995C-E18AEF3D809E'} //3DF0E5C5-271A-4B6C-995C-E18AEF3D809E
                  uikitOptions={{
                    common: {
                      enableUsingDefaultUserProfile: true,
                    },
                    groupChannel: {
                      enableMention: true,
                    },
                    groupChannelList: {
                      enableTypingIndicator: true,
                      enableMessageReceiptStatus: true,
                    },
                    groupChannelSettings: {
                      enableMessageSearch: true,
                    },
                  }}
                  chatOptions={{
                    localCacheStorage: AsyncStorage,
                    onInitialized: SetSendbirdSDK,
                    enableAutoPushTokenRegistration: true,
                  }}
                  platformServices={platformServices}
                  // styles={{
                  //   defaultHeaderTitleAlign: "left", //'center',
                  //   theme: isLightTheme ? LightUIKitTheme : DarkUIKitTheme,
                  //   statusBarTranslucent: GetTranslucent(),
                  // }}
                  // errorBoundary={{ ErrorInfoComponent: ErrorInfoScreen }}
                  userProfile={{
                    onCreateChannel: (channel) => {
                      const params = { channelUrl: channel.url };
                      console.log("==== params ", params)
                      if (channel.isGroupChannel()) {
                        // navigationActions.push(Routes.GroupChannel, params);
                      }

                      if (channel.isOpenChannel()) {
                        // navigationActions.push(Routes.OpenChannel, params);
                      }
                    },
                  }}
                >

                  <AppNavigator />
                </SendbirdUIKitContainer>
                {/* </LDProvider> */}
              </QueryClientProvider>
            </GlobalVariableProvider>
          </SafeAreaFrameContextProvider>
        </SafeAreaProvider>

      </ThemeProvider>
    </>
  );
};
// Notifee.onBackgroundEvent(onNotificationAndroid);

export default App;
