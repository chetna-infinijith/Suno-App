import React from 'react';
import {
  Button,
  Divider,
  Icon,
  ScreenContainer,
  SimpleStyleScrollView,
  Spacer,
  Surface,
  Switch,
  TextInput,
  Touchable,
  withTheme,
} from '@draftbit/ui';
import { Modal, Platform, Text, View, Image } from 'react-native';
import * as GlobalStyles from '../GlobalStyles.js';
import CustomChildHeaderBlock from '../components/CustomChildHeaderBlock';
import * as GlobalVariables from '../config/GlobalVariableContext';
import * as CustomCode from '../custom-files/CustomCode';
import * as editProfileModal from '../custom-files/editProfileModal';
import palettes from '../themes/palettes';
import * as Utils from '../utils';
import Breakpoints from '../utils/Breakpoints';
import * as StyleSheet from '../utils/StyleSheet';
import imageSource from '../utils/imageSource';
import useNavigation from '../utils/useNavigation';
import useParams from '../utils/useParams';
import useWindowDimensions from '../utils/useWindowDimensions';
import { CommonActions } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
import { GetSendbirdSDK } from '../App.js';
import messaging from '@react-native-firebase/messaging';
import { logError } from '../index.js';
import crashlytics from '@react-native-firebase/crashlytics';

const AppSettingsScreen = props => {
  const { theme } = props;
  const version = DeviceInfo.getVersion();      // "1.2.3"
const build = DeviceInfo.getBuildNumber(); 
console.log('Version:', version);
console.log('Build:', build);



  const dimensions = useWindowDimensions();
  const navigation = useNavigation();
  const Constants = GlobalVariables.useValues();
  const Variables = Constants;
  const setGlobalVariableValue = GlobalVariables.useSetValue();
  const [LogoutModal, setLogoutModal] = React.useState(false);
  const [formattedDate, setFormattedDate] = React.useState('');
  const [switchValue, setSwitchValue] = React.useState(false);
  const [usernameFollowed, setUsernameFollowed] = React.useState(false);
  const [photoError, setPhotoError] = React.useState(false);

  const DEFAULT_AVATAR =
    'https://master-app.suno.tech/assets/user-CXthF0zB.png';
  const profilePhotoUri =
    !photoError && Constants['UserInfo']?.photo
      ? Constants['UserInfo'].photo
      : DEFAULT_AVATAR;

  React.useEffect(() => {
    setPhotoError(false);
  }, [Constants['UserInfo']?.photo]);

  return (
    <ScreenContainer
      hasBottomSafeArea={false}
      hasSafeArea={true}
      scrollable={true}
    >
      <CustomChildHeaderBlock
        isNotificationVisible={false}
        isSettingVisible={false}
        name={'Settings'}
      />
      {/* ScrollView Container */}
      <SimpleStyleScrollView
        bounces={true}
        horizontal={false}
        keyboardShouldPersistTaps={'never'}
        nestedScrollEnabled={false}
        showsHorizontalScrollIndicator={true}
        showsVerticalScrollIndicator={true}
        style={StyleSheet.applyWidth({ width: '100%' }, dimensions.width)}
      >
        {/* Content Wrapper */}
        <View
          style={StyleSheet.applyWidth(
            { marginLeft: 24, marginRight: 24 },
            dimensions.width
          )}
        >
          {/* Card Surface */}
          <Surface
            {...GlobalStyles.SurfaceStyles(theme)['Surface'].props}
            elevation={3}
            style={StyleSheet.applyWidth(
              StyleSheet.compose(
                GlobalStyles.SurfaceStyles(theme)['Surface'].style,
                {
                  backgroundColor: palettes.App.White,
                  borderRadius: 16,
                  marginBottom: 8,
                  marginLeft: -10,
                  marginTop: 16,
                  paddingBottom: 20,
                  paddingLeft: 12,
                  paddingRight: 12,
                  paddingTop: 20,
                  width: '106%',
                }
              ),
              dimensions.width
            )}
          >
            {/* User Details */}
            <View
              style={StyleSheet.applyWidth(
                {
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                },
                dimensions.width
              )}
            >
              <View
                style={StyleSheet.applyWidth(
                  { flexDirection: 'row' },
                  dimensions.width
                )}
              >
                <Touchable>
                  <Surface
                    elevation={3}
                    style={StyleSheet.applyWidth(
                      {
                        borderRadius: 25,
                        justifyContent: 'center',
                        minHeight: 56,
                        overflow: 'hidden',
                      },
                      dimensions.width
                    )}
                  >
                    <Image
                      source={imageSource(profilePhotoUri)}
                      resizeMode="cover"
                      onError={() => setPhotoError(true)}
                      style={StyleSheet.applyWidth(
                        {
                          width: 56,
                          height: 56,
                          borderRadius: 28,
                          backgroundColor: '#f0f0f0',
                        },
                        dimensions.width
                      )}
                    />
                  </Surface>
                </Touchable>

                <View
                  style={StyleSheet.applyWidth(
                    { justifyContent: 'space-evenly', marginLeft: 12 },
                    dimensions.width
                  )}
                >
                  {/* Full Name */}
                  <Text
                    accessible={true}
                    selectable={false}
                    style={StyleSheet.applyWidth(
                      {
                        color: theme.colors.text.medium,
                        fontFamily: 'Inter_600SemiBold',
                        fontSize: 18,
                        textTransform: 'capitalize',
                      },
                      dimensions.width
                    )}
                  >
                    {[
                      Constants?.UserInfo?.suffix,
                      Constants?.UserInfo?.first_name,
                      Constants?.UserInfo?.last_name
                    ].filter(Boolean).join(" ")}
                  </Text>
                  {/* username */}
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
                    {Constants['UserInfo']?.role}
                  </Text>
                </View>
              </View>

              <Touchable
                onPress={() => {
                  const handler = async () => {
                    try {
                      await setGlobalVariableValue({
                        key: 'EditProfile',
                        value: true,
                      });
                    } catch (err) {
                      logError(err);
                    }
                  };
                  handler();
                }}
              >
                <View
                  style={StyleSheet.applyWidth(
                    {
                      alignItems: 'center',
                      height: 48,
                      justifyContent: 'center',
                      marginRight: -8,
                      width: 48,
                    },
                    dimensions.width
                  )}
                >
                  <Icon
                    color={theme.colors.branding.secondary}
                    name={'MaterialCommunityIcons/square-edit-outline'}
                    size={24}
                  />
                </View>
              </Touchable>
            </View>
          </Surface>
          {/* Security */}
          <View
            style={StyleSheet.applyWidth(
              { marginTop: 8, paddingBottom: 12 },
              dimensions.width
            )}
          >
            {/* Section Heading */}
            <Text
              accessible={true}
              selectable={false}
              style={StyleSheet.applyWidth(
                {
                  color: palettes.App.TextPlaceholder,
                  fontFamily: 'Inter_400Regular',
                  fontSize: 15,
                  marginBottom: 6,
                  textTransform: 'capitalize',
                },
                dimensions.width
              )}
            >
              {'security'}
            </Text>
            {/* Change Password */}
            <Touchable
              onPress={() => {
                try {
                  navigation.navigate(
                    'ChangePasswordScreen',
                    {},
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
                    flexDirection: 'row',
                    height: 58,
                    justifyContent: 'space-between',
                    paddingLeft: 10,
                    paddingRight: 8,
                  },
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
                    size={24}
                    color={theme.colors.branding.secondary}
                    name={'MaterialIcons/password'}
                  />
                  <Text
                    accessible={true}
                    selectable={false}
                    style={StyleSheet.applyWidth(
                      {
                        color: theme.colors.text.medium,
                        fontFamily: 'Inter_500Medium',
                        fontSize: 16,
                        paddingLeft: 12,
                        textTransform: 'capitalize',
                      },
                      dimensions.width
                    )}
                  >
                    {'Change password'}
                  </Text>
                </View>
                <Icon
                  size={24}
                  color={theme.colors.branding.secondary}
                  name={'Feather/chevron-right'}
                />
              </View>
              <Divider
                color={palettes.App.Studily_White_Shade_2}
                height={1}
                style={StyleSheet.applyWidth({ height: 1 }, dimensions.width)}
              />
            </Touchable>
            {/* Notification Preference */}
            <Touchable
              onPress={() => {
                try {
                  navigation.push('NotificationPreferenceScreen', {});
                } catch (err) {
                  logError(err);
                }
              }}
            >
              <View
                style={StyleSheet.applyWidth(
                  {
                    alignItems: 'center',
                    flexDirection: 'row',
                    height: 58,
                    justifyContent: 'space-between',
                    paddingLeft: 10,
                    paddingRight: 8,
                  },
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
                    size={24}
                    color={theme.colors.branding.secondary}
                    name={'MaterialIcons/notifications-active'}
                  />
                  <Text
                    accessible={true}
                    selectable={false}
                    style={StyleSheet.applyWidth(
                      {
                        color: theme.colors.text.medium,
                        fontFamily: 'Inter_500Medium',
                        fontSize: 16,
                        paddingLeft: 12,
                        textTransform: 'capitalize',
                      },
                      dimensions.width
                    )}
                  >
                    {'Notification Preferences'}
                  </Text>
                </View>
                <Icon
                  size={24}
                  color={theme.colors.branding.secondary}
                  name={'Feather/chevron-right'}
                />
              </View>
              <Divider
                color={palettes.App.Studily_White_Shade_2}
                height={1}
                style={StyleSheet.applyWidth({ height: 1 }, dimensions.width)}
              />
            </Touchable>

            {/* <Text
                    accessible={true}
                    selectable={false}
                    style={StyleSheet.applyWidth(
                      {
                        color: theme.colors.text.medium,
                        fontSize: 1,
                        paddingVertical: 12,
                      },
                      dimensions.width
                    )}
                  >
                    {'Version '}{version}
                  </Text> */}

          </View>
        </View>
      </SimpleStyleScrollView>
      {/* Footer Wrapper */}
      <View
        style={StyleSheet.applyWidth(
          { flexGrow: 1, flexShrink: 0 , },
          dimensions.width
        )}
      >

        {/* Footer Button */}
        <View
          style={StyleSheet.applyWidth(
            {
              alignItems: 'center',
              flexDirection: 'column',
              marginTop: 28,
              paddingBottom: 25,
              flex: 1
            },
            dimensions.width
          )}
        >
        

          {/* Log Out */}
          <Button
            accessible={true}
            iconPosition={'left'}
            onPress={() => {
              try {
                setLogoutModal(true);
              } catch (err) {
                logError(err);
              }
            }}
            icon={'Feather/log-out'}
            style={StyleSheet.applyWidth(
              {
                backgroundColor: palettes.App['Custom Color'],
                borderBottomWidth: 1.5,
                borderColor: theme.colors.text.danger,
                borderLeftWidth: 1.5,
                borderRadius: 32,
                borderRightWidth: 1.5,
                borderTopWidth: 1.5,
                color: theme.colors.text.danger,
                fontFamily: 'Inter_700Bold',
                fontSize: 16,
                height: 45,
                textAlign: 'center',
                width: '45%',
              },
              dimensions.width
            )}
            title={'Log Out'}
          />
        </View>

        <View style={{ paddingBottom: 0 }}>
    <Text
      accessible={true}
      selectable={false}
      style={StyleSheet.applyWidth(
        {
          color: theme.colors.text.light,
          fontFamily: 'Inter_500Medium',
          fontSize: 14,
          // paddingLeft: 12,
          textTransform: 'capitalize',
          alignSelf: 'center',
        },
        dimensions.width
      )}
    >
      {'Version '}{version}  {'Build '}{build}
    </Text>
  </View>
      </View>

      <Modal
        animationType={'none'}
        supportedOrientations={['portrait', 'landscape']}
        transparent={true}
        visible={Boolean(LogoutModal)}
      >
        <View
          style={StyleSheet.applyWidth(
            { height: '100%', justifyContent: 'center' },
            dimensions.width
          )}
        >
          <View
            style={StyleSheet.applyWidth(
              {
                backgroundColor: palettes.App.Studily_Snow_White,
                height: '100%',
                opacity: 0.7,
                position: 'absolute',
                top: 0,
                width: '100%',
              },
              dimensions.width
            )}
          />
          <View
            style={StyleSheet.applyWidth(
              {
                alignItems: 'center',
                backgroundColor: palettes.App.Studily_White_Shade_3,
                borderRadius: 16,
                height: 352,
                justifyContent: 'center',
                marginLeft: 24,
                marginRight: 24,
              },
              dimensions.width
            )}
          >
            <Icon
              color={theme.colors.text.danger}
              name={'AntDesign/questioncircleo'}
              size={70}
            />
            <Text
              accessible={true}
              selectable={false}
              style={StyleSheet.applyWidth(
                {
                  color: theme.colors.text.medium,
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 21,
                  marginBottom: 20,
                  marginTop: 25,
                },
                dimensions.width
              )}
            >
              {'Are you sure want to logout?'}
            </Text>

            <View
              style={StyleSheet.applyWidth(
                {
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'space-evenly',
                  marginTop: 20,
                  width: '100%',
                },
                dimensions.width
              )}
            >
              <Touchable
                onPress={() => {
                  const handler = async () => {
                    try {

                      const responseFirebase = await fetch(
                        `${Constants.API_BASE_URL}/mobile/firebase-token/`,
                        {
                          method: 'DELETE',
                          headers: {
                            'Content-Type': 'application/json',
                            Authorization: Constants.AUTH_HEADER,
                          },
                          
                        }
                      );
                      const sdk = GetSendbirdSDK();

                      // const firebaseToken = await messaging().getToken();
                    
                      // if (firebaseToken) {
                      //   await sdk.push.unregisterPushToken(firebaseToken);
                      //   console.log('Push token removed successfully');
                      // }

                      if (Platform.OS === 'ios') {

                        await sdk.unregisterAPNSPushTokenAllForCurrentUser();
                      } else {
                        await sdk.unregisterFCMPushTokenAllForCurrentUser();
                      }
                    
                      await sdk.disconnect();

                      const data = await responseFirebase.json();
                      
                      console.log('Delete Firebase token response:', data);

                      await crashlytics().setUserId('');
                      await setGlobalVariableValue({
                        key: 'AUTH_HEADER',
                        value: '' || null,
                      });
                      setLogoutModal(false);
                      await setGlobalVariableValue({
                        key: 'Authenticated',
                        value: false,
                      });
                      navigation.dispatch(
                        CommonActions.reset({
                          index: 0,
                          routes: [{ name: 'SignInScreen' }],
                        })
                      );
                    } catch (err) {
                      console.log("==== error", err)
                      // logError(err);
                    }
                  };
                  handler();
                }}
                style={StyleSheet.applyWidth(
                  { width: '40%' },
                  dimensions.width
                )}
              >
                <View
                  style={StyleSheet.applyWidth(
                    {
                      alignItems: 'center',
                      borderColor: theme.colors.foreground.danger,
                      borderRadius: 20,
                      borderWidth: 1.6,
                      height: 46,
                      justifyContent: 'center',
                    },
                    dimensions.width
                  )}
                >
                  <Text
                    accessible={true}
                    selectable={false}
                    style={StyleSheet.applyWidth(
                      {
                        color: theme.colors.text.danger,
                        fontFamily: 'Inter_500Medium',
                      },
                      dimensions.width
                    )}
                  >
                    {'Log Out'}
                  </Text>
                </View>
              </Touchable>

              <Touchable
                onPress={() => {
                  try {
                    setLogoutModal(false);
                  } catch (err) {
                    logError(err);
                  }
                }}
                style={StyleSheet.applyWidth(
                  { width: '40%' },
                  dimensions.width
                )}
              >
                <View
                  style={StyleSheet.applyWidth(
                    {
                      alignItems: 'center',
                      backgroundColor: theme.colors.branding.secondary,
                      borderRadius: 20,
                      height: 46,
                      justifyContent: 'center',
                    },
                    dimensions.width
                  )}
                >
                  <Text
                    accessible={true}
                    selectable={false}
                    style={StyleSheet.applyWidth(
                      {
                        color: palettes.App['Custom Color_2'],
                        fontFamily: 'Inter_500Medium',
                      },
                      dimensions.width
                    )}
                  >
                    {'Cancel'}
                  </Text>
                </View>
              </Touchable>
            </View>
          </View>
        </View>
      </Modal>
      {/* EditModal */}
      <Modal
        animationType={'none'}
        supportedOrientations={['portrait', 'landscape']}
        transparent={true}
        visible={Boolean(Constants['EditProfile'])}
      >
        <View
          style={StyleSheet.applyWidth(
            {
              backgroundColor: palettes.App.Studily_White_Shade_2,
              height: '100%',
              justifyContent: 'center',
            },
            dimensions.width
          )}
        >
          {/* EditDetails */}
          <Utils.CustomCodeErrorBoundary>
            <editProfileModal.EditProfileDetails />
          </Utils.CustomCodeErrorBoundary>
        </View>
      </Modal>
    </ScreenContainer>
  );
};

export default withTheme(AppSettingsScreen);
