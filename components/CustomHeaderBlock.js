import React from 'react';
import {
  Circle,
  CircleImage,
  Icon,
  Surface,
  Touchable,
  withTheme,
} from '@draftbit/ui';
import { Text, View } from 'react-native';
import * as GlobalStyles from '../GlobalStyles.js';
import * as GlobalVariables from '../config/GlobalVariableContext';
import * as CustomCode from '../custom-files/CustomCode';
import palettes from '../themes/palettes';
import Breakpoints from '../utils/Breakpoints';
import * as StyleSheet from '../utils/StyleSheet';
import imageSource from '../utils/imageSource';
import useNavigation from '../utils/useNavigation';
import useWindowDimensions from '../utils/useWindowDimensions';
import { logError } from '../index.js';

const defaultProps = {
  isBackVisible: false,
  isNotificationVisible: true,
  isSettingVisible: true,
  name: null,
};

const CustomHeaderBlock = props => {
  const { theme } = props;
  const dimensions = useWindowDimensions();
  const navigation = useNavigation();
  const Constants = GlobalVariables.useValues();
  const { clinic_display_name, practice_name } = Constants;
  const Variables = Constants;
  const formatPhoneNumber = phoneNumber => {
    // Type the code for the body of your function or hook here.
    // Functions can be triggered via Button/Touchable actions.
    // Hooks are run per ReactJS rules.

    /* String line breaks are accomplished with backticks ( example: `line one
line two` ) and will not work with special characters inside of quotes ( example: "line one line two" ) */

    if (phoneNumber.length === 10) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(
        3,
        6
      )}-${phoneNumber.slice(6)}`;
    }
    return phoneNumber; // Or handle other lengths as needed
  };

  return (
    <Surface elevation={3}>
      {/* Top Navigation Header */}
      <View
        style={StyleSheet.applyWidth(
          {
            alignItems: 'stretch',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            marginTop: 8,
            paddingBottom: 10,
            paddingLeft: 16,
            paddingRight: 16,
            paddingTop: 10,
          },
          dimensions.width
        )}
      >
        {/* Back btn */}
        <>
          {!(props.isBackVisible ?? defaultProps.isBackVisible
            ? true
            : false) ? null : (
            <Touchable
              onPress={() => {
                try {
                  navigation.goBack();
                } catch (err) {
                  logError(err);
                  logError("Navigation Fail :", err)
                }
              }}
            >
              <View
                style={StyleSheet.applyWidth(
                  {
                    alignItems: 'flex-start',
                    height: 44,
                    justifyContent: 'center',
                    width: 42,
                  },
                  dimensions.width
                )}
              >
                <Icon
                  size={24}
                  color={theme.colors.text.medium}
                  name={'AntDesign/arrowleft'}
                />
              </View>
            </Touchable>
          )}
        </>
        <View
          style={StyleSheet.applyWidth(
            {
              alignItems: 'center',
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'space-between',
            },
            dimensions.width
          )}
        >
          {/* Left Section */}
          <View
            style={StyleSheet.applyWidth(
              { alignItems: 'flex-start', justifyContent: 'center' },
              dimensions.width
            )}
          >
            <Text
              accessible={true}
              selectable={false}
              style={StyleSheet.applyWidth(
                {
                  color: theme.colors.branding.primary,
                  // fontFamily: 'Inter_700Bold',
                  fontSize: 17,
                  paddingBottom: 3,
                  fontWeight: '600'
                },
                dimensions.width
              )}
            >
              {practice_name}
              {/* {'Hearing Care Clinic'} */}
            </Text>

            <View
              style={StyleSheet.applyWidth(
                { alignItems: 'center', flexDirection: 'row' },
                dimensions.width
              )}
            >
              {/* Touchable 2 */}
              <Touchable
                onPress={() => {
                  try {
                    // navigation.navigate('EditProfileScreen', {}, { pop: true });
                  } catch (err) {
                    logError(err);
                    logError("Navigation Fail :", err)

                  }
                }}
              >
                <Surface
                  elevation={3}
                  style={StyleSheet.applyWidth(
                    {
                      borderRadius: 25,
                      justifyContent: 'center',
                      minHeight: 25,
                      overflow: 'hidden',
                    },
                    dimensions.width
                  )}
                >
                  <CircleImage
                    size={25}
                    source={imageSource(
                      `${Constants['UserInfo']?.photo ||
                      'https://master-app.suno.tech/assets/user-CXthF0zB.png'
                      }`
                    )}
                  />
                </Surface>
              </Touchable>

              <Text
                accessible={true}
                selectable={false}
                style={StyleSheet.applyWidth(
                  {
                    color: theme.colors.text.medium,
                    fontFamily: 'Inter_500Medium',
                    fontSize: 15,
                    paddingLeft: 8,
                    paddingRight: 5,
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
            </View>
          </View>
          {/* Right Section */}
          <View
            style={StyleSheet.applyWidth(
              {
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'flex-end',
              },
              dimensions.width
            )}
          >
            <>
              {!(
                props.isNotificationVisible ??
                defaultProps.isNotificationVisible
              ) ? null : (
                <Touchable
                  onPress={() => {
                    try {
                      navigation.navigate(
                        'NotificationScreen',
                        {},
                        { pop: true }
                      );
                    } catch (err) {
                      logError(err);
                      logError("Navigation Fail :", err)

                    }
                  }}
                >
                  <View
                    style={StyleSheet.applyWidth(
                      {
                        alignItems: 'center',
                        borderRadius: 25,
                        height: 40,
                        justifyContent: 'center',
                        marginRight: -2,
                        width: 40,
                      },
                      dimensions.width
                    )}
                  >
                    <Icon
                      color={theme.colors.branding.secondary}
                      name={'Ionicons/notifications-outline'}
                      size={25}
                    />
                    <>
                      {!Constants['UnreadNotifyCount'] ? null : (
                        <Circle
                          bgColor={theme.colors.branding.primary}
                          size={20}
                          style={StyleSheet.applyWidth(
                            {
                              alignItems: 'center',
                              alignSelf: 'flex-end',
                              backgroundColor: theme.colors.branding.secondary,
                              position: 'absolute',
                              right: 0,
                              top: -1,
                              zIndex: 1,
                            },
                            dimensions.width
                          )}
                        >
                          {/* Unread count */}
                          <Text
                            accessible={true}
                            selectable={false}
                            style={StyleSheet.applyWidth(
                              {
                                color: palettes.App['Custom Color_2'],
                                fontFamily: 'Inter_500Medium',
                                fontSize: 11,
                                lineHeight: 20,
                                marginLeft: -2,
                                opacity: 1,
                              },
                              dimensions.width
                            )}
                          >
                            {' '}
                            {Constants['UnreadNotifyCount'] || ''}
                          </Text>
                        </Circle>
                      )}
                    </>
                  </View>
                </Touchable>
              )}
            </>
            <>
              {!(
                props.isSettingVisible ?? defaultProps.isSettingVisible
              ) ? null : (
                <Touchable
                  onPress={() => {
                    try {
                      navigation.navigate(
                        'AppSettingsScreen',
                        {},
                        { pop: true }
                      );
                    } catch (err) {
                      logError(err);
                      logError("Navigation Fail :", err)

                    }
                  }}
                  style={StyleSheet.applyWidth(
                    { marginLeft: 12 },
                    dimensions.width
                  )}
                >
                  {/* View 2 */}
                  <View
                    style={StyleSheet.applyWidth(
                      {
                        alignItems: 'center',
                        borderRadius: 25,
                        height: 40,
                        justifyContent: 'center',
                        marginRight: 4,
                        width: 40,
                      },
                      dimensions.width
                    )}
                  >
                    <Icon
                      color={theme.colors.branding.secondary}
                      name={'Feather/settings'}
                      size={24}
                    />
                  </View>
                </Touchable>
              )}
            </>
          </View>
        </View>
      </View>
    </Surface>
  );
};

export default withTheme(CustomHeaderBlock);