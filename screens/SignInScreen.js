import React from 'react';
import {
  Button,
  Checkbox,
  ExpoImage,
  Icon,
  KeyboardAvoidingView,
  ScreenContainer,
  Spacer,
  Surface,
  TextInput,
  Touchable,
  withTheme,
} from '@draftbit/ui';
import { ActivityIndicator, Text, View, Modal, Platform, Alert, Linking } from 'react-native';
import * as GlobalStyles from '../GlobalStyles.js';
import * as SunoApi from '../apis/SunoApi.js';
import * as SunoHealthcareManagementAPIApi from '../apis/SunoHealthcareManagementAPIApi.js';
import * as GlobalVariables from '../config/GlobalVariableContext';
import Images from '../config/Images';
import * as CustomCode from '../custom-files/CustomCode';
import palettes from '../themes/palettes';
import Breakpoints from '../utils/Breakpoints';
import * as StyleSheet from '../utils/StyleSheet';
import imageSource from '../utils/imageSource';
import showAlertUtil from '../utils/showAlert';
import useIsFocused from '../utils/useIsFocused';
import useNavigation from '../utils/useNavigation';
import useParams from '../utils/useParams';
import useWindowDimensions from '../utils/useWindowDimensions';
import crashlytics from '@react-native-firebase/crashlytics';
import * as Device from 'expo-device';
import { useConnection, useSendbirdChat } from '@sendbird/uikit-react-native';
import { SessionHandler } from '@sendbird/chat';
import { getToken } from '@react-native-firebase/messaging';
import messaging from '@react-native-firebase/messaging';
import * as Notifications from "expo-notifications";
import { notificationService } from '../global-functions/notificationService.js';
import analytics from '@react-native-firebase/analytics';
import { getSessionId } from '../global-functions/sessionManager.js';
import { logError } from '../index.js';
import { checkInternetAndProceed } from '../custom-files/InternetConnection.js';
// import {
//   useLDClient,
// } from '@launchdarkly/react-native-client-sdk';



const SignInScreen = props => {
  const { theme } = props;
  const dimensions = useWindowDimensions();
  const navigation = useNavigation();
  const { connect } = useConnection();
  const { sdk, currentUser } = useSendbirdChat();
  // const client = useLDClient();

  const Constants = GlobalVariables.useValues();
  const Variables = Constants;
  const setGlobalVariableValue = GlobalVariables.useSetValue();
  const validationform = () => {
    var emailPattern = /\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b/;
    var passwordPattern = /^.{6,}$/;
    // var passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;÷

    // if (!textInputValue.match(emailPattern)) {
    if (!textInputValue || textInputValue.trim() === '') {

      setErrorMessage('*Please enter email address!');
      return false;
    }


    if (!passwordInput.match(passwordPattern)) {
      // setErrorMessage(
      //   '*Password must be at least 8 characters, and contain at least one lowercase letter, one uppercase letter, and one digit.'
      // );
      setErrorMessage(
        '*Password length must be at least 6 characters.'
      );
      return false;
    }

    logError('Validation Error :', errorMessage);
    setErrorMessage('');
    return true;
  };
  const [apiAuthCode, setApiAuthCode] = React.useState('');
  const [apiError, setApiError] = React.useState('');
  const [auth_tokens, setAuth_tokens] = React.useState('');
  const [checkboxRowValue, setCheckboxRowValue] = React.useState('');
  const [checkboxValue, setCheckboxValue] = React.useState(true);
  const [errorHandler, setErrorHandler] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [passwordInput, setPasswordInput] = React.useState('');
  const [textInputValue, setTextInputValue] = React.useState('');
  const sunoHealthcareManagementAPIDELETE$api$adjustments$$id$$DELETE =
    SunoHealthcareManagementAPIApi.useDELETE$api$adjustments$$id$$DELETE();


  const setupPushNotifications = async () => {
    try {
      // 1️⃣ Register device (Required for iOS)
      await messaging().registerDeviceForRemoteMessages();

      // 2️⃣ Check current permission status
      const currentStatus = await messaging().hasPermission?.();

      // 3️⃣ Request permission if needed
      const authStatus = await messaging().requestPermission();

      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        Alert.alert(
          "Notification Permission Required",
          "Please enable notifications in Settings.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() }
          ]
        );
        return null;
      }

      // 4️⃣ Get FCM token
      // const token = await messaging().getToken();

      // logError("FCM Token:", token);

      // return token;

    } catch (error) {
      logError("Push Notification Setup Error: ", error);
      return null;
    }
  };

  React.useEffect(() => {
    setupPushNotifications();
  }, []);

  const fetchUnreadNotificationCount = async (authHeader, clinicId, userId) => {
    try {
      if (!authHeader || !clinicId || !userId) {
        logError('Missing auth header, clinic ID, or user ID, skipping notification count fetch');
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
        // logError('Unread notification count:', unreadCount);

        await setGlobalVariableValue({
          key: 'UnreadNotifyCount',
          value: unreadCount,
        });

        return unreadCount;
      } else {
        await setGlobalVariableValue({
          key: 'UnreadNotifyCount',
          value: 0,
        });
        return 0;
      }
    } catch (err) {
      logError('Error fetching unread notifications:', err);
      await setGlobalVariableValue({
        key: 'UnreadNotifyCount',
        value: 0,
      });
      return 0;
    }
  };
  // React.useEffect(() => {
  //   const handler = async () => {
  //     try {
  //       const userInfo = (
  //         await SunoHealthcareManagementAPIApi.gET$api$auth$users$me$GET(
  //           Constants
  //         )
  //       )?.json;
  //       const userInfoResult = userInfo;

  //       const apiErrMsg = userInfoResult?.message;
  //       setErrorHandler(apiErrMsg);

  //       setIsLoading(true);
  //       if (apiErrMsg === 'Invalid token') {
  //         navigation.navigate('StackNavigator', {}, { pop: true });

  //         showAlertUtil({
  //           title: undefined,
  //           message: apiErrMsg,
  //           buttonText: 'Ok',
  //         });
  //       } else {
  //         if (userInfoResult) {
  //           await setGlobalVariableValue({
  //             key: 'UserInfo',
  //             value: userInfoResult,
  //           });
  //           await setGlobalVariableValue({
  //             key: 'senderID',
  //             value: userInfoResult?.id,
  //           });
  //         } else {
  //         }
  //       }

  //       setIsLoading(false);
  //     } catch (err) {
  //       logError(err);
  //     }
  //   };
  //   handler();
  // }, []);
  // const isFocused = useIsFocused();
  // React.useEffect(() => {
  //   const handler = async () => {
  //     try {
  //       if (!isFocused) {
  //         return;
  //       }
  //       setIsLoading(true);
  //       if (
  //         (() => {
  //           const e = Constants['AUTH_HEADER'];
  //           logError(e);
  //           return e;
  //         })()
  //       ) {
  //         /* hidden 'API Request' action */

  //         navigation.navigate('BottomTabNavigator', {}, { pop: true });
  //       } else {
  //         navigation.navigate(
  //           'StackNavigator',
  //           { screen: 'SignInScreen' },
  //           { pop: true }
  //         );
  //       }

  //       setIsLoading(false);
  //     } catch (err) {
  //       logError(err);
  //     }
  //   };
  //   handler();
  // }, [isFocused]);

  const handler = async () => {
    try {
      if (!validationform()) {
        return;
      }

      const isConnected = await checkInternetAndProceed();
      if (!isConnected) {
        return;
      }

      setIsLoading(true);
      setApiError('');
      setErrorMessage('');
      setApiAuthCode('');
      const LoginResponse = (
        await SunoHealthcareManagementAPIApi.pOST$api$auth$token$login$POST(
          Constants,
          {
            email: textInputValue,
            password: passwordInput,
          }
        )
      )?.json;

      // Check for error response
      if (LoginResponse?.non_field_errors?.length > 0) {
        const errorMessage = LoginResponse?.non_field_errors[0]?.message || 'Login failed';
        setIsLoading(false);

        showAlertUtil({
          title: 'Login Failed',
          message: errorMessage,
          buttonText: 'OK',
        });
        return;
      }

      if (LoginResponse?.auth_token) {
        const auth_token = LoginResponse?.auth_token;

        await setGlobalVariableValue({
          key: 'AUTH_HEADER',
          value: `Token ${auth_token}`,
        });
        setAuth_tokens(auth_token)
        // logError(" =====auth_token : ", LoginResponse)

        try {
          // 1️⃣ Register device
          await messaging().registerDeviceForRemoteMessages();

          // 2️⃣ Request permission (iOS required)
          const authStatus = await messaging().requestPermission();

          const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

          if (!enabled) {
            // logError("Notification permission not granted");
          } else {
            const firebase_token = await getToken(messaging());

            const responseFirebase = await fetch(
              `${Constants.API_BASE_URL}/mobile/firebase-token/`, // provider
              {
                method: 'POST', // ✅ Add POST method
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Token ${auth_token}`,
                },
                body: JSON.stringify({
                  token: firebase_token,          // your FCM token
                  device_type: Platform.OS === 'ios' ? 'ios' : 'android',
                }),
              }
            );
            const firebaseData = await responseFirebase.json();
            // logError("===== firebaseData : ", firebaseData)

          }


        } catch (error) {
        }
        try {

          const response = await fetch(
            `${Constants.API_BASE_URL}/auth/users/me/`, // provider
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Token ${auth_token}`,
              },
            }
          );
          const apiUserData = await response.json();
          // const context = { kind: 'user', key: apiUserData?.id.toString() };
          // await client.identify(context);

          // await client.identify({
          //   key: apiUserData?.id.toString(),
          //   name: `${apiUserData.first_name} ${apiUserData.last_name}`,
          //   email: apiUserData?.email,
          // });
          // client.waitForInitialization()
          // client.variation()

          // Fetch user info
          // const response = await SunoHealthcareManagementAPIApi.gET$api$auth$users$me$GET(Constants);
          // const apiUserData = response?.json;
          // logError("==== HomeUserInfo:", apiUserData, Constants?.AUTH_HEADER);
          if (response?.status === 200 || response?.status === 201) {
            try {


              if (apiUserData) {
                await setGlobalVariableValue({ key: 'UserInfo', value: apiUserData });
                await setGlobalVariableValue({ key: 'senderID', value: apiUserData?.id });
                await setGlobalVariableValue({ key: 'clinic_pk_id', value: apiUserData?.default_clinic?.id });
                await setGlobalVariableValue({ key: 'regionId', value: apiUserData?.default_clinic?.region?.id });
                await setGlobalVariableValue({ key: 'typeId', value: apiUserData?.default_clinic?.type });
                await setGlobalVariableValue({ key: 'clinic_display_name', value: apiUserData?.default_clinic?.display_name })
                await setGlobalVariableValue({ key: 'business_name', value: apiUserData?.default_clinic?.business_name })
                await setGlobalVariableValue({ key: 'practice_name', value: apiUserData?.practice?.name })
                await setGlobalVariableValue({ key: 'practice', value: apiUserData?.practice?.id })
                await setGlobalVariableValue({ key: 'clinic_timezone', value: apiUserData?.default_clinic?.timezone }),

                  await setGlobalVariableValue({ key: 'clinic_name', value: apiUserData?.default_clinic?.name })
                await setGlobalVariableValue({ key: 'groups', value: apiUserData?.groups })
                await setGlobalVariableValue({ key: 'sendbird_chat_enabled', value: apiUserData?.sendbird_chat_enabled })
                await setGlobalVariableValue({ key: 'sendbird_user_id', value: String(apiUserData?.sendbird_user_id) })
                await setGlobalVariableValue({ key: 'scribes_enabled', value: apiUserData?.practice?.scribes_enabled })


                const type = await Device.getDeviceTypeAsync();
                await Promise.all([
                  crashlytics().setUserId(String(apiUserData?.id)),
                  // crashlytics().setAttribute('UserInfo', apiUserData),
                  crashlytics().setAttributes({
                    email: textInputValue,
                    DeviceName: Device.deviceName,
                    osVersion: Device.osVersion,
                    osName: Device.osName,
                    modelName: Device.modelName,
                    firstName: apiUserData?.first_name,
                    lastName: apiUserData?.last_name,
                    id: String(apiUserData?.id),
                  }),
                ]);
                // logError(" =====auth_token : ", apiUserData)

                await analytics().logEvent('user_login', {
                  login_method: 'email', // google / apple
                  success: true,

                });

                await analytics().logLogin({
                  method: 'email',
                });
                await analytics().setUserId(apiUserData?.id.toString());
                let modules = ['appointments', 'patients', 'messages', 'tasks'];
                if (apiUserData?.practice?.scribes_enabled) {
                  modules.push('scribes');
                }

                if (apiUserData?.sendbird_chat_enabled) {
                  modules.push('sendbird_chat');
                }

                const modulesEnabled = modules.join(',');

                await analytics().setUserProperties({
                  user_role: apiUserData?.groups.map(group => group.name).join(', '),
                  practice_id: String(apiUserData?.practice?.id),
                  // clinic_Id: apiUserData?.default_clinic?.id,    // "small"
                  modules_enabled: modulesEnabled
                });

                // await analytics().logEvent('session_start', {
                //   user_role: apiUserData?.groups.map(group => group.name).join(', '),
                //   session_id: getSessionId(),
                // });
                if (apiUserData?.sendbird_chat_enabled) {
                  try {


                    const responseSenbdbird = await fetch(
                      `${Constants.API_BASE_URL}/auth/users/me/sendbird/`, // provider
                      {
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Token ${auth_token}`,
                        },
                      }
                    );
                    const apiSenbdbirdData = await responseSenbdbird.json();
                    // logError("Access apiSenbdbirdData:", apiSenbdbirdData);

                    await setGlobalVariableValue({ key: 'SendBirdInfo', value: apiSenbdbirdData });

                    await connect(String(apiSenbdbirdData?.user_id), { nickname: String(apiSenbdbirdData?.nickname), accessToken: apiSenbdbirdData?.access_token });

                  } catch (error) {

                  }
                  // logError("Access Token:", token,apiSenbdbirdData);

                  // const tokenExpo = await Notifications.getExpoPushTokenAsync();
                  // logError("tokenExpo:", tokenExpo);

                  // const token = await notificationService.getPushToken();
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
                        // const token = await messaging().getAPNSToken();
                        try {
                          const tokenData = await Notifications.getDevicePushTokenAsync();
                          // logError("tokenData:", tokenData);

                          const token = tokenData?.data
                          await sdk.registerAPNSPushTokenForCurrentUser(token);
                        } catch (error) {

                        }
                      } else {
                        // const token = await messaging().getToken();
                        try {
                          const tokenData = await Notifications.getDevicePushTokenAsync();
                          // logError("tokenData:", tokenData);

                          const token = tokenData?.data
                          // logError("tokenData:", token);

                          await sdk.registerFCMPushTokenForCurrentUser(token);
                        } catch (error) {

                        }

                      }

                    }

                  } catch (error) {

                  }
                }


                // logError("==== Constants :", Constants.UserInfo);
                const authHeader = `Token ${auth_token}`;
                const clinicId = apiUserData?.default_clinic?.id;
                const userId = apiUserData?.id;

                setTimeout(async () => {
                  if (clinicId && userId) {
                    await fetchUnreadNotificationCount(authHeader, clinicId, userId);
                  } else {
                    await setGlobalVariableValue({
                      key: 'UnreadNotifyCount',
                      value: 0,
                    });
                  }
                }, 100);

                navigation.replace('BottomTabNavigator', {});
              }
            } catch (error) {
              logError("==== API and Logic Error:", Constants.UserInfo);
            }
          } else {
            await analytics().logEvent('user_login', {
              login_method: 'email', // google / apple
              success: false,
            });
            setIsLoading(false);
            showAlertUtil({
              title: "Error",
              message: "Something went wrong. Please try again.",
              buttonText: "Ok",
            });
          }
        } catch (err) {
          setIsLoading(false);
          logError("Error in auth check:", err);
          await analytics().logEvent('user_login', {
            login_method: 'email', // google / apple
            success: false,
          });
          showAlertUtil({
            title: "Error",
            message: "Something went wrong. Please try again.",
            buttonText: "Ok",
          });
        }
      } else {
        setApiError(apiErrMsg);
        setIsLoading(false);
        if (!apiError) {
          return;
        }
      }

      setIsLoading(false);
    } catch (err) {
      logError("API and Logic Handler Error : ", err);
    }
  };
  return (
    <ScreenContainer scrollable={false} hasSafeArea={true}>
      <>
        <Modal transparent visible={isLoading} animationType="fade">
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

        {/* {isLoading ? null : ( */}
        <KeyboardAvoidingView
          behavior={'padding'}
          enabled={true}
          keyboardVerticalOffset={0}
          style={StyleSheet.applyWidth({ flex: 1 }, dimensions.width)}
        >
          {/* Main Container */}
          <View
            style={StyleSheet.applyWidth(
              {
                alignItems: 'center',
                flex: 1,
                flexDirection: 'column',
                marginTop: 26,
                paddingBottom: 20,
                paddingLeft: 20,
                paddingRight: 20,
                paddingTop: 20,
              },
              dimensions.width
            )}
          >
            <Spacer bottom={10} top={10} />
            <ExpoImage
              allowDownscaling={true}
              cachePolicy={'disk'}
              contentPosition={'center'}
              transitionDuration={300}
              transitionEffect={'cross-dissolve'}
              transitionTiming={'ease-in-out'}
              {...GlobalStyles.ExpoImageStyles(theme)['Image'].props}
              resizeMode={'contain'}
              source={imageSource(Images['sunopurplebannerlogo'])}
              style={StyleSheet.applyWidth(
                StyleSheet.compose(
                  GlobalStyles.ExpoImageStyles(theme)['Image'].style,
                  { height: 60, width: 240 }
                ),
                dimensions.width
              )}
            />
            {/* Welcome */}
            <Text
              accessible={true}
              selectable={false}
              style={StyleSheet.applyWidth(
                {
                  color: palettes.App['Custom Color_18'],
                  fontFamily: 'Inter_700Bold',
                  fontSize: 26,
                  paddingBottom: 8,
                  paddingTop: 16,
                },
                dimensions.width
              )}
            >
              {'Welcome Back!'}
            </Text>

            <View
              style={StyleSheet.applyWidth(
                {
                  alignContent: 'flex-start',
                  flexDirection: 'row',
                  paddingBottom: 20,
                },
                dimensions.width
              )}
            >
              <Text
                accessible={true}
                selectable={false}
                {...GlobalStyles.TextStyles(theme)['Text'].props}
                style={StyleSheet.applyWidth(
                  StyleSheet.compose(
                    GlobalStyles.TextStyles(theme)['Text'].style,
                    theme.typography.body1,
                    {
                      color: palettes['#551658']['Custom Text'],
                      fontFamily: 'Inter_400Regular',
                      fontSize: 16,
                    }
                  ),
                  dimensions.width
                )}
              >
                {'Signin to your account to continue'}
              </Text>
            </View>
            {/* Spacer 2 */}
            <Spacer bottom={10} top={10} />
            {/* Email */}
            <View
              style={StyleSheet.applyWidth(
                {
                  alignItems: 'center',
                  backgroundColor: 'rgb(248, 250, 252)',
                  borderColor: 'rgb(226, 232, 240)',
                  borderRadius: 16,
                  borderWidth: 2,
                  flexDirection: 'row',
                  height: 60,
                  justifyContent: 'center',
                  paddingLeft: 18,
                  paddingRight: 18,
                  width: '100%',
                },
                dimensions.width
              )}
            >
              <Icon
                size={24}
                color={palettes['#551658']['Custom Text']}
                name={'MaterialCommunityIcons/email'}
              />
              <View
                style={StyleSheet.applyWidth(
                  { flex: 1, paddingLeft: 10, paddingRight: 10 },
                  dimensions.width
                )}
              >
                <TextInput
                  autoCapitalize={'none'}
                  autoCorrect={true}
                  changeTextDelay={500}
                  onChangeText={newTextInputValue => {
                    try {
                      setTextInputValue(newTextInputValue);
                    } catch (err) {
                      logError(err);
                    }
                  }}
                  webShowOutline={true}
                  editable={true}
                  placeholder={'Email'}
                  placeholderTextColor={palettes['#551658']['Custom Text']}
                  returnKeyType={'next'}
                  style={StyleSheet.applyWidth(
                    {
                      borderRadius: 8,
                      fontFamily: 'Inter_400Regular',
                      fontSize: 16,
                      paddingBottom: 8,
                      paddingLeft: 4,
                      paddingRight: 4,
                      paddingTop: 8,
                    },
                    dimensions.width
                  )}
                  value={textInputValue}
                />
              </View>
            </View>
            {/* Spacer 4 */}
            <Spacer bottom={10} top={10} />
            {/* Password */}
            <View
              style={StyleSheet.applyWidth(
                {
                  alignItems: 'center',
                  backgroundColor: 'rgb(248, 250, 252)',
                  borderColor: 'rgb(226, 232, 240)',
                  borderRadius: 16,
                  borderWidth: 2,
                  flexDirection: 'row',
                  height: 60,
                  justifyContent: 'space-between',
                  paddingLeft: 18,
                  paddingRight: 18,
                  width: '100%',
                },
                dimensions.width
              )}
            >
              <Icon
                size={24}
                color={palettes['#551658']['Custom Text']}
                name={'FontAwesome/lock'}
              />
              <View
                style={StyleSheet.applyWidth(
                  { flex: 1, paddingLeft: 10, paddingRight: 10 },
                  dimensions.width
                )}
              >
                <TextInput
                  autoCapitalize={'none'}
                  autoCorrect={true}
                  changeTextDelay={500}
                  onChangeText={newTextInputValue => {
                    try {
                      setPasswordInput(newTextInputValue);
                    } catch (err) {
                      logError(err);
                    }
                  }}
                  webShowOutline={true}
                  editable={true}
                  placeholder={'Password'}
                  placeholderTextColor={palettes['#551658']['Custom Text']}
                  returnKeyType={'done'}
                  secureTextEntry={Boolean(checkboxValue)}
                  style={StyleSheet.applyWidth(
                    {
                      fontFamily: 'Inter_400Regular',
                      fontSize: 16,
                      paddingBottom: 8,
                      paddingLeft: 4,
                      paddingRight: 4,
                      paddingTop: 8,
                    },
                    dimensions.width
                  )}
                  value={passwordInput}
                />
              </View>
              <Checkbox
                onPress={newCheckboxValue => {
                  const checkboxValue = newCheckboxValue;
                  try {
                    setCheckboxValue(newCheckboxValue);
                  } catch (err) {
                    logError(err);
                  }
                }}
                checkedIcon={'Ionicons/eye-outline'}
                color={palettes['#551658']['Custom Text']}
                status={checkboxValue}
                uncheckedColor={palettes['#551658']['Custom Text']}
                uncheckedIcon={'Ionicons/eye-off-outline'}
              />
            </View>
            {/* Spacer 3 */}
            <Spacer bottom={8} top={8} />
            {/* ErrorMessage */}
            <>
              {!errorMessage ? null : (
                <Text
                  accessible={true}
                  selectable={false}
                  {...GlobalStyles.TextStyles(theme)['Text 2'].props}
                  disabled={true}
                  style={StyleSheet.applyWidth(
                    StyleSheet.compose(
                      GlobalStyles.TextStyles(theme)['Text 2'].style,
                      theme.typography.body1,
                      {
                        alignSelf: 'flex-start',
                        color: theme.colors.foreground.danger,
                        fontFamily: 'Inter_400Regular',
                        fontSize: 14,
                        marginTop: -2,
                        paddingTop: 2,
                      }
                    ),
                    dimensions.width
                  )}
                >
                  {errorMessage}
                </Text>
              )}
            </>
            {/* API Error Message */}
            <>
              {!apiError ? null : (
                <Text
                  accessible={true}
                  selectable={false}
                  {...GlobalStyles.TextStyles(theme)['Text 2'].props}
                  disabled={true}
                  style={StyleSheet.applyWidth(
                    StyleSheet.compose(
                      GlobalStyles.TextStyles(theme)['Text 2'].style,
                      theme.typography.body1,
                      {
                        alignSelf: 'flex-start',
                        color: theme.colors.foreground.danger,
                        fontFamily: 'Inter_400Regular',
                        fontSize: 14,
                        marginTop: -2,
                        paddingTop: 2,
                      }
                    ),
                    dimensions.width
                  )}
                >
                  {apiError}
                </Text>
              )}
            </>
            {/* Forgot Password */}
            <Touchable
              onPress={() => {
                try {
                  navigation.push('StackNavigator', {
                    screen: 'ForgotPasswordScreen',
                  });
                } catch (err) {
                  logError("Navigation Error", err);
                }
              }}
              style={StyleSheet.applyWidth(
                { width: '100%' },
                dimensions.width
              )}
            >
              <View
                style={StyleSheet.applyWidth(
                  {
                    alignContent: 'flex-end',
                    alignItems: 'flex-end',
                    alignSelf: 'flex-end',
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    paddingBottom: 6,
                    paddingTop: 6,
                  },
                  dimensions.width
                )}
              >
                <Text
                  accessible={true}
                  selectable={false}
                  style={StyleSheet.applyWidth(
                    {
                      color: theme.colors.branding.secondary,
                      fontFamily: 'Inter_500Medium',
                      fontSize: 15,
                      marginLeft: 10,
                    },
                    dimensions.width
                  )}
                >
                  {'Forgot Password?'}
                </Text>
              </View>
            </Touchable>
            {/* Spacer 2 */}
            <Spacer bottom={8} top={8} />
            <Surface
              {...GlobalStyles.SurfaceStyles(theme)['Surface'].props}
              elevation={3}
              style={StyleSheet.applyWidth(
                StyleSheet.compose(
                  GlobalStyles.SurfaceStyles(theme)['Surface'].style,
                  { borderRadius: 16, width: '100%' }
                ),
                dimensions.width
              )}
            >
              <View
                style={StyleSheet.applyWidth(
                  { width: '100%' },
                  dimensions.width
                )}
              >
                <Touchable
                  onPress={() => {
                    logError('Touchable ON_PRESS Start');
                    let error = null;
                    try {
                      handler()
                    } catch (err) {
                      logError(err);
                      error = err.message ?? err;
                    }
                    logError(
                      'Touchable ON_PRESS Complete',
                      error ? { error } : 'no error'
                    );
                  }}
                >
                  {/* Sign in */}
                  <Button
                    accessible={true}
                    iconPosition={'left'}
                    onPress={() => {
                      logError("======")

                      handler();
                    }}
                    disabled={Boolean(passwordInput?.length < 8)}
                    icon={'AntDesign/login'}
                    iconSize={18}
                    style={StyleSheet.applyWidth(
                      {
                        backgroundColor: 'rgb(6, 104, 88)',
                        borderRadius: 16,
                        fontFamily: 'Inter_600SemiBold',
                        fontSize: 16,
                        height: 58,
                        textAlign: 'center',
                        width: '100%',
                      },
                      dimensions.width
                    )}
                    title={'Sign in'}
                  />
                </Touchable>
              </View>
            </Surface>
            {/* Spacer 5 */}
            <Spacer bottom={10} top={10} />
          </View>
        </KeyboardAvoidingView>
        {/* )} */}
      </>
      <>
        {/* {!isLoading ? null : (
          <View
            style={StyleSheet.applyWidth(
              { alignSelf: 'center', flex: 1, justifyContent: 'center' },
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
                GlobalStyles.ActivityIndicatorStyles(theme)[
                  'Activity Indicator'
                ].style,
                dimensions.width
              )}
            />
          </View>
        )} */}
      </>
    </ScreenContainer>
  );
};

export default withTheme(SignInScreen);