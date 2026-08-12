import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Animated,
  View,
  Image,
  StyleSheet,
  Dimensions,
  Easing,
  ActivityIndicator,
  Platform,
  Modal,
  Text,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as GlobalVariables from '../config/GlobalVariableContext';
import Images from './../config/Images';
import { CommonActions } from '@react-navigation/native';
import { useConnection, useSendbirdChat } from '@sendbird/uikit-react-native';
import { GetSendbirdSDK, isUpdateRequired, notificationService, openStore } from '../App';
import { getToken, requestPermission, onMessage } from '@react-native-firebase/messaging';
import messaging from '@react-native-firebase/messaging';
import * as Notifications from "expo-notifications";
import analytics from '@react-native-firebase/analytics';
import { logEvent } from '../global-functions/analyticsService';
import { getSessionId } from '../global-functions/sessionManager';
import { clearPendingNotification, getPendingNotification, setAppReady } from '../global-functions/notificationService';
import remoteConfig from '@react-native-firebase/remote-config';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import crashlytics from '@react-native-firebase/crashlytics';
import { logError } from '..';
import { checkInternetAndProceed } from './InternetConnection';

//   useLDClient,
// } from '@launchdarkly/react-native-client-sdk';
// const client = useLDClient();
const { width, height } = Dimensions.get('window');
const ANIMATION_DURATION = {
  FADE_IN: 800,
  SCALE_IN: 1200,
  BLINK_DURATION: 300,
  BLINK_DELAY: 200,
  BLINK_COUNT: 3,
  FINAL_FADE: 500,
  CHECK_USER_DELAY: 2000,
};

const NAVIGATION_ROUTES = {
  STACK: 'SignInScreen',
  BOTTOM_TAB: 'BottomTabNavigator',
};

export const SplashScreenView = ({ onAnimationEnd }) => {
  const navigation = useNavigation();
  const { connect } = useConnection();
  // const client = useLDClient();

  const Constants = GlobalVariables.useValues();
  const setGlobalVariableValue = GlobalVariables.useSetValue();
  const { AUTH_HEADER: authHeader, Authenticated: authenticated } = Constants;

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const logoFadeAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const hasNavigatedRef = useRef(false);
  const [showLoader, setShowLoader] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showOptionalModal, setShowOptionalModal] = useState(false);

  const setAppVersion = async () => {
    try {
      const version = DeviceInfo.getVersion(); // e.g. 2.10.0

      await analytics().setUserProperty('app_version', version);
      console.log("======app_version : ", version)
    } catch (error) {
      console.log("====== app_version Error: ", error)

    }


  };

  useEffect(() => {
    setAppVersion();
  }, []);

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
        // console.log("===== currentVersion :", currentVersion, latestVersion, forceUpdate)
        if (isUpdateRequired(currentVersion, latestVersion)) {
          if (forceUpdate) {
            setShowUpdateModal(true);   // no cancel
            // Alert.alert(
            //   'Update Required',
            //   'A new version of the app is available. Please update to continue.',
            //   [
            //     {
            //       text: 'Update Now',
            //       onPress: () => {
            //         openStore();

            //         // 🔁 Re-show alert if user comes back without updating
            //         // setTimeout(() => {
            //         //   setShowUpdateModal(true); 
            //         // }, 1500);
            //       },
            //     },
            //   ],
            //   {
            //     cancelable: false, // ❗ cannot dismiss
            //   }
            // );

          } else {
            const skippedVersion = await AsyncStorage.getItem('skip_update_version');
            if (skippedVersion !== latestVersion) {
              // setShowOptionalModal(true); // update + cancel
            }
          }
        }
      } catch (e) {
        console.log('Remote config error', e);
      }
    };

    checkVersion();
  }, []);


  const fetchUnreadCount = useCallback(async (clinicId, userId) => {
    try {
      if (!authHeader || !clinicId || !userId) {
        console.log('Missing auth header, clinic ID, or user ID, skipping notification count fetch');
        return 0;
      }

      const query = encodeURIComponent('{id,is_read}');
      const url = `${Constants.API_BASE_URL}/notifications/?clinic=${clinicId}&provider=${userId}&query=${query}&is_active=true&is_read=false`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const unreadCount = data.length;
        // console.log('Unread notification count:', unreadCount);

        setGlobalVariableValue({
          key: 'UnreadNotifyCount',
          value: unreadCount,
        });

        return unreadCount;
      } else {
        setGlobalVariableValue({
          key: 'UnreadNotifyCount',
          value: 0,
        });
        return 0;
      }
    } catch (err) {
      setGlobalVariableValue({
        key: 'UnreadNotifyCount',
        value: 0,
      });
      return 0;
    }
  }, [authHeader, setGlobalVariableValue]);

  const createBlinkSequence = useCallback(() => {
    const blinkSequences = [];
    for (let i = 0; i < ANIMATION_DURATION.BLINK_COUNT; i++) {
      blinkSequences.push(
        Animated.timing(blinkAnim, {
          toValue: 0,
          duration: ANIMATION_DURATION.BLINK_DURATION,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: ANIMATION_DURATION.BLINK_DURATION,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(ANIMATION_DURATION.BLINK_DELAY)
      );
    }
    return Animated.sequence(blinkSequences);
  }, [blinkAnim]);

  useEffect(() => {
    const runAnimationSequence = () => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: ANIMATION_DURATION.FADE_IN,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: ANIMATION_DURATION.SCALE_IN,
            easing: Easing.in(Easing.back(1.2)),
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(400),
        ...(imageLoaded
          ? [createBlinkSequence(), Animated.delay(300)]
          : [Animated.delay(300)]),
        Animated.parallel([
          Animated.timing(logoFadeAnim, {
            toValue: 0,
            duration: ANIMATION_DURATION.FINAL_FADE,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: ANIMATION_DURATION.FINAL_FADE,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        setShowLoader(true);
        onAnimationEnd?.();
      });
    };

    if (Platform.OS === 'web') {
      if (imageLoaded) runAnimationSequence();
    } else {
      runAnimationSequence();
    }
  }, [
    fadeAnim,
    scaleAnim,
    blinkAnim,
    logoFadeAnim,
    createBlinkSequence,
    onAnimationEnd,
    imageLoaded,
  ]);

  const navigateToScreen = useCallback(
    (routeName, options = {}) => {
      if (showLoader) return;

      if (hasNavigatedRef.current) return;
      setShowLoader(false);
      hasNavigatedRef.current = true;
      navigation.navigate(routeName, {}, { pop: true, ...options });
    },
    [navigation]
  );
  const { sdk, currentUser } = useSendbirdChat();
  // console.log("sdk:", sdk);

  const getUserInfo = useCallback(async () => {
    try {

      //   console.log("Push enabled:", await sdk.getPushTriggerOption());
      // console.log("Device token:", token);
      const isConnected = await checkInternetAndProceed();
      if (!isConnected) {
        return;
      }

      console.log("SDK state:", sdk.connectionState);

      if (!authHeader) throw new Error('No authentication header available');

      try {
        // 1️⃣ Register device
        await messaging().registerDeviceForRemoteMessages();

        // 2️⃣ Request permission (iOS required)
        const authStatus = await messaging().requestPermission();

        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          console.log("Push permission not granted");
        } else {
          const firebase_token = await getToken(messaging());

          const responseFirebase = await fetch(
            `${Constants.API_BASE_URL}/mobile/firebase-token/`, // provider
            {
              method: 'POST', // ✅ Add POST method
              headers: {
                'Content-Type': 'application/json',
                Authorization: authHeader,
              },
              body: JSON.stringify({
                token: firebase_token,          // your FCM token
                device_type: Platform.OS === 'ios' ? 'ios' : 'android',
              }),
            }
          );
          const firebaseData = await responseFirebase.json();
          // console.log("===== firebaseData : ", firebaseData)

        }


      } catch (error) {
      }


      const response = await fetch(`${Constants.API_BASE_URL}/auth/users/me/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
      });
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const userData = await response.json();
      // console.log("====userData :  ",userData)
      const userId = userData?.id;
      const clinicId = userData?.default_clinic?.id;
      await analytics().logLogin({
        method: 'email',
      });
      // await logEvent('session_start', {
      //   user_role: userData?.groups.map(group => group.name).join(', '),
      //   session_id: getSessionId(),
      // });
      // await client.identify({
      //   key: userData?.id.toString(),
      //   name: `${userData.first_name} ${userData.last_name}`,
      //   email: userData?.email,
      // });
      // client.waitForInitialization()
      // client.variation()

      // const context = { kind: 'user', key: userData?.id.toString() };
      // await client.identify(context);


      await Promise.all([
        setGlobalVariableValue({ key: 'UserInfo', value: userData }),
        setGlobalVariableValue({ key: 'senderID', value: userData?.id }),
        setGlobalVariableValue({ key: 'clinic_pk_id', value: userData?.default_clinic?.id }),
        setGlobalVariableValue({ key: 'regionId', value: userData?.default_clinic?.region?.id }),
        setGlobalVariableValue({ key: 'typeId', value: userData?.default_clinic?.type }),
        setGlobalVariableValue({ key: 'clinic_display_name', value: userData?.default_clinic?.display_name }),
        setGlobalVariableValue({ key: 'business_name', value: userData?.default_clinic?.business_name }),
        setGlobalVariableValue({ key: 'practice_name', value: userData?.practice?.name }),
        setGlobalVariableValue({ key: 'practice', value: userData?.practice?.id }),
        setGlobalVariableValue({ key: 'clinic_timezone', value: userData?.default_clinic?.timezone }),

        setGlobalVariableValue({ key: 'clinic_name', value: userData?.default_clinic?.name }),
        setGlobalVariableValue({ key: 'groups', value: userData?.groups }),
        setGlobalVariableValue({ key: 'sendbird_chat_enabled', value: userData?.sendbird_chat_enabled }),
        setGlobalVariableValue({ key: 'sendbird_user_id', value: String(userData?.sendbird_user_id) }),
        setGlobalVariableValue({ key: 'scribes_enabled', value: userData?.practice?.scribes_enabled })


      ]);
      // navigateToScreen(NAVIGATION_ROUTES.BOTTOM_TAB);

      if (userData?.sendbird_chat_enabled) {
        try {


          const responseSenbdbird = await fetch(
            `${Constants.API_BASE_URL}/auth/users/me/sendbird/`, // provider
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: authHeader,
              },
            }
          );
          const apiSenbdbirdData = await responseSenbdbird.json();
          await setGlobalVariableValue({ key: 'SendBirdInfo', value: apiSenbdbirdData });



          await connect(String(apiSenbdbirdData?.user_id), { nickname: String(apiSenbdbirdData?.nickname), accessToken: apiSenbdbirdData?.access_token });
          // await sdk.registerPushToken( apiSenbdbirdData?.access_token);
          console.log("SDK State:", GetSendbirdSDK()?.connectionState);

        } catch (error) {

        }

        // const token = await notificationService.getToken();

        // const token = await getToken(messaging());
        // console.log("Access Token:", token ,apiSenbdbirdData);
        try {


          const { status: existingStatus } = await Notifications.getPermissionsAsync();

          let finalStatus = existingStatus;

          // 2️⃣ If not granted, request permission
          if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
          }
          if (finalStatus !== 'granted') {
          } else {

            if (Platform.OS === 'ios') {
              try {
                const tokenData = await Notifications.getDevicePushTokenAsync();
                const token = tokenData?.data
                // const token = await messaging().getAPNSToken();
                await sdk.registerAPNSPushTokenForCurrentUser(token);
              } catch (error) {

              }

            } else {
              try {
                const tokenData = await Notifications.getDevicePushTokenAsync();
                const token = tokenData?.data
                await sdk.registerFCMPushTokenForCurrentUser(token);
              } catch (error) {

              }

            }
          }
        } catch (error) {

        }
      }

      let modules = ['appointments', 'patients', 'messages', 'tasks'];
      if (userData?.practice?.scribes_enabled) {
        modules.push('scribes');
      }

      if (userData?.sendbird_chat_enabled) {
        modules.push('sendbird_chat');
      }

      const modulesEnabled = modules.join(',');
      await Promise.all([
        crashlytics().setUserId(String(userData?.id)),
        // crashlytics().setAttribute('UserInfo', apiUserData),
        crashlytics().setAttributes({
          email: userData?.email,
          DeviceName: Device.deviceName,
          osVersion: Device.osVersion,
          osName: Device.osName,
          modelName: Device.modelName,
          firstName: userData?.first_name,
          lastName: userData?.last_name,
          id: String(userData?.id)
        }),
      ]);

      await analytics().setUserProperties({
        user_role: userData?.groups.map(group => group.name).join(', '),
        practice_id: String(userData?.practice?.id),
        // clinic_Id: userData?.default_clinic?.id,    // "small"
        modules_enabled: modulesEnabled
      });

      setTimeout(async () => {
        if (userId && clinicId) {
          await fetchUnreadCount(clinicId, userId);
        } else {
          setGlobalVariableValue({
            key: 'UnreadNotifyCount',
            value: 0,
          });
        }
      }, 100);
      setAppReady(true);

      // ✅ handle pending notification
      const notification = getPendingNotification();
      if (!showUpdateModal) {
        if (notification) {
          const patientId = notification?.data?.patient_id;
          if (!patientId) {
            navigation.dispatch(
              CommonActions.reset({
                index: 0, // The index of the active route in the new state
                routes: [
                  { name: NAVIGATION_ROUTES.BOTTOM_TAB }, // The initial route in the new state
                  // Add more routes as needed
                ],
              })
            );
          } else {


            navigation.dispatch(
              CommonActions.reset({
                index: 1,
                routes: [
                  { name: NAVIGATION_ROUTES.BOTTOM_TAB },
                  {
                    name: 'PatientDetailsScreen',
                    params: { id: patientId },
                  },
                ],
              })
            );
          }
          clearPendingNotification();

        } else {

          navigation.dispatch(
            CommonActions.reset({
              index: 0, // The index of the active route in the new state
              routes: [
                { name: NAVIGATION_ROUTES.BOTTOM_TAB }, // The initial route in the new state
                // Add more routes as needed
              ],
            })
          );
        }
      }
    } catch (error) {
      console.log('Error fetching user info:', error);
      logError('Error fetching user info : ', error)
      navigateToScreen(NAVIGATION_ROUTES.STACK);
    }
  }, [authHeader, setGlobalVariableValue, navigateToScreen]);

  useEffect(() => {
    if (hasNavigatedRef.current) return;
    const checkUserAuthentication = async () => {
      try {
        const shouldFetchUserInfo = authHeader || authenticated === true;
        if (shouldFetchUserInfo) await getUserInfo();
        else navigateToScreen(NAVIGATION_ROUTES.STACK);
      } catch (error) {
        console.log('Authentication check failed:', error);
        logError('Authentication check failed:', error);

        if (!showUpdateModal) {
          navigateToScreen(NAVIGATION_ROUTES.STACK);
        }
      }
    };

    const timer = setTimeout(
      checkUserAuthentication,
      Platform.OS === 'web'
        ? imageLoaded
          ? ANIMATION_DURATION.CHECK_USER_DELAY
          : ANIMATION_DURATION.CHECK_USER_DELAY + 1000
        : ANIMATION_DURATION.CHECK_USER_DELAY
    );
    return () => clearTimeout(timer);
  }, [authHeader, authenticated, getUserInfo, navigateToScreen, imageLoaded]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const resolveImageSource = src => {
    try {
      if (!src) return null;
      if (typeof src === 'number') return src;
      if (typeof src === 'string') return { uri: src };
      if (src?.uri && typeof src.uri === 'string') return { uri: src.uri };
      if (src?.original?.uri) return { uri: src.original.uri };
      return null;
    } catch (e) {
      console.warn('Invalid image source:', e);
      return null;
    }
  };

  return (
    <LinearGradient
      colors={['#551658', '#d435d4']}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Animated.Image
          source={resolveImageSource(Images.sunowhitelogo)}
          style={[
            styles.logo,
            { opacity: Animated.multiply(blinkAnim, logoFadeAnim) },
          ]}
          resizeMode="contain"
          onLoad={handleImageLoad}
          onError={error => {
            console.log('Image load error:', error.nativeEvent);
            logError('Image load error :', error.nativeEvent);

            setImageLoaded(true);
          }}
        />
      </Animated.View>

      {showLoader && (
        <Animated.View
          style={[
            styles.loaderContainer,
            {
              opacity: logoFadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0],
              }),
            },
          ]}
        >
          <ActivityIndicator
            size="large"
            color="#FFFFFF"
            style={styles.loader}
          />
        </Animated.View>
      )}
      {/* <Modal visible={showOptionalModal} transparent animationType="fade">
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

              <TouchableOpacity
                onPress={openStore}
                style={{
                  backgroundColor: '#007bff',
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
      </Modal> */}
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
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: width * 0.6,
    height: width * 0.6,
    maxWidth: 300,
    maxHeight: 300,
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  loaderContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    transform: [{ scale: 1.2 }],
  },
});

export default SplashScreenView;
