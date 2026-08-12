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
import Images from '../config/Images';
import * as CustomCode from '../custom-files/CustomCode';
import palettes from '../themes/palettes';
import Breakpoints from '../utils/Breakpoints';
import * as StyleSheet from '../utils/StyleSheet';
import imageSource from '../utils/imageSource';
import useNavigation from '../utils/useNavigation';
import useWindowDimensions from '../utils/useWindowDimensions';

const defaultProps = {
  count: '',
  desc: '',
  isBackVisible: true,
  isNotificationVisible: true,
  isSettingVisible: true,
  name: null,
};

const CustomChildHeaderBlock = props => {
  const { theme } = props;
  const dimensions = useWindowDimensions();
  const navigation = useNavigation();
  const Constants = GlobalVariables.useValues();
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
                  console.log(err);
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
          {/* View 2 */}
          <View
            style={StyleSheet.applyWidth(
              { alignItems: 'flex-end', justifyContent: 'flex-end' },
              dimensions.width
            )}
          >
            {/* Text 2 */}
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
                    fontFamily: 'Inter_700Bold',
                    fontSize: 18,
                  }
                ),
                dimensions.width
              )}
            >
              {props.name ?? defaultProps.name}
            </Text>
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
            {/* <>
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
                      console.log(err);
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
                  </View>
                </Touchable>
              )}
            </> */}
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
                      console.log(err);
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

export default withTheme(CustomChildHeaderBlock);
