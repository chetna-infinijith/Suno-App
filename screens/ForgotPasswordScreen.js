import React from 'react';
import {
  Button,
  ExpoImage,
  Icon,
  KeyboardAvoidingView,
  Link,
  ScreenContainer,
  Spacer,
  TextInput,
  Touchable,
  withTheme,
} from '@draftbit/ui';
import { ActivityIndicator, Text, View } from 'react-native';
import * as GlobalStyles from '../GlobalStyles.js';
import * as SunoHealthcareManagementAPIApi from '../apis/SunoHealthcareManagementAPIApi.js';
import * as GlobalVariables from '../config/GlobalVariableContext';
import Images from '../config/Images';
import * as CustomCode from '../custom-files/CustomCode';
import palettes from '../themes/palettes';
import Breakpoints from '../utils/Breakpoints';
import * as StyleSheet from '../utils/StyleSheet';
import imageSource from '../utils/imageSource';
import showAlertUtil from '../utils/showAlert';
import useNavigation from '../utils/useNavigation';
import useParams from '../utils/useParams';
import useWindowDimensions from '../utils/useWindowDimensions';
import { logError } from '../index.js';

const ForgotPasswordScreen = props => {
  const { theme } = props;
  const dimensions = useWindowDimensions();
  const navigation = useNavigation();
  const Constants = GlobalVariables.useValues();
  const Variables = Constants;
  const [apiError, setApiError] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [textInputValue, setTextInputValue] = React.useState('');
  const emailFormInput = () => {
    var emailPattern = /\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b/;

    if (!textInputValue || textInputValue.trim() === '') {

      setErrorMessage('*Please enter email address!');
      return false;
    }

    setErrorMessage('');
    return true;
  };
  const sunoHealthcareManagementAPIPOST$api$auth$users$resetPassword$POST =
    SunoHealthcareManagementAPIApi.usePOST$api$auth$users$resetPassword$POST();

  return (
    <ScreenContainer hasSafeArea={false} scrollable={false}>
      <>
        {isLoading ? null : (
          <KeyboardAvoidingView
            behavior={'padding'}
            enabled={true}
            keyboardVerticalOffset={0}
            style={StyleSheet.applyWidth({ flex: 1 }, dimensions.width)}
          >
            <View
              style={StyleSheet.applyWidth(
                {
                  alignContent: 'flex-start',
                  alignItems: 'center',
                  alignSelf: 'auto',
                  flex: 1,
                  flexDirection: 'column',
                  paddingBottom: 20,
                  paddingLeft: 20,
                  paddingRight: 20,
                  paddingTop: 20,
                },
                dimensions.width
              )}
            >
              {/* View logo */}
              <View
                style={StyleSheet.applyWidth(
                  {
                    alignItems: 'center',
                    alignSelf: 'center',
                    marginTop: 24,
                    paddingTop: 24,
                  },
                  dimensions.width
                )}
              >
                {/* Logo */}
                <ExpoImage
                  allowDownscaling={true}
                  cachePolicy={'disk'}
                  contentPosition={'center'}
                  resizeMode={'cover'}
                  transitionDuration={300}
                  transitionEffect={'cross-dissolve'}
                  transitionTiming={'ease-in-out'}
                  source={imageSource(Images['forgotpassword2'])}
                  style={StyleSheet.applyWidth(
                    { height: 220, width: 250 },
                    dimensions.width
                  )}
                />
                {/* Forgot Password */}
                <Text
                  accessible={true}
                  selectable={false}
                  style={StyleSheet.applyWidth(
                    {
                      color: palettes.App['Custom Color_18'],
                      fontFamily: 'Inter_700Bold',
                      fontSize: 24,
                      paddingBottom: 8,
                      paddingTop: 16,
                    },
                    dimensions.width
                  )}
                >
                  {'Forgot Your Password?'}
                </Text>
              </View>

              <View
                style={StyleSheet.applyWidth(
                  {
                    alignContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    paddingBottom: 18,
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
                        alignSelf: 'center',
                        color: palettes['#551658']['Custom Text'],
                        fontFamily: 'Inter_400Regular',
                        fontSize: 16,
                        textAlign: 'center',
                      }
                    ),
                    dimensions.width
                  )}
                >
                  {'We’ll send you a link to create a new password'}
                </Text>
              </View>
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
                    style={StyleSheet.applyWidth(
                      {
                        borderRadius: 8,
                        flexShrink: 0,
                        fontFamily: 'Inter_400Regular',
                        fontSize: 16,
                        height: 50,
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
              {/* Spacer 2 */}
              <Spacer bottom={10} top={10} />
              {/* Error Message */}
              <>
                {!errorMessage ? null : (
                  <Text
                    accessible={true}
                    selectable={false}
                    {...GlobalStyles.TextStyles(theme)['Text 2'].props}
                    style={StyleSheet.applyWidth(
                      StyleSheet.compose(
                        GlobalStyles.TextStyles(theme)['Text 2'].style,
                        theme.typography.body1,
                        {
                          alignSelf: 'flex-start',
                          color: theme.colors.foreground.danger,
                          fontFamily: 'Inter_400Regular',
                          fontSize: 14,
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
              {/* View Button */}
              <View
                style={StyleSheet.applyWidth(
                  { paddingTop: 14, width: '100%' },
                  dimensions.width
                )}
              >
                <Touchable>
                  {/* forgotPassword */}
                  <Button
                    accessible={true}
                    iconPosition={'left'}
                    onPress={() => {
                      const handler = async () => {
                        try {
                          if (!emailFormInput()) {
                            return;
                          }
                          setIsLoading(true);
                          const resetPassword = (
                            await sunoHealthcareManagementAPIPOST$api$auth$users$resetPassword$POST.mutateAsync(
                              { email: textInputValue }
                            )
                          )?.json;

                          console.log("==== ", resetPassword)
                          // const forgotResult = resetPassword;
                          // if (forgotResult) {
                            if (navigation.canGoBack()) {
                              navigation.popToTop();
                            }
                            navigation.replace('StackNavigator', {
                              screen: 'SignInScreen',
                            });

                            showAlertUtil({
                              title: 'Alert',
                              message:
                                'If the email you entered is associated with a Suno account, you should receive a link to create a new password shortly.',
                              buttonText: 'Ok',
                            });
                          // } else {
                          //   /* hidden 'Extract Key' action */
                          //   setApiError('Please enter valid Email.');
                          //   if (!apiError) {
                          //     return;
                          //   }
                          // }

                          setIsLoading(false);
                        } catch (err) {
                          logError(err);
                        }
                      };
                      handler();
                    }}
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
                    title={'Send'}
                  />
                </Touchable>
              </View>
              {/* Spacer 3 */}
              <Spacer bottom={10} top={10} />
              {/* View 2 */}
              <View
                style={StyleSheet.applyWidth(
                  {
                    flexDirection: 'row',
                    justifyContent: 'center',
                    paddingTop: 6,
                  },
                  dimensions.width
                )}
              >
                <Text accessible={true} selectable={false}>
                  {'Back to'}
                </Text>
                <Spacer left={2} right={2} />
                {/* Sign In Link */}
                <Link
                  accessible={true}
                  onPress={() => {
                    try {
                      navigation.goBack();
                    } catch (err) {
                      logError(err);
                    }
                  }}
                  selectable={false}
                  style={StyleSheet.applyWidth(
                    { color: 'rgb(6, 104, 88)', fontFamily: 'Inter_700Bold' },
                    dimensions.width
                  )}
                  title={'Sign In'}
                />
              </View>
            </View>
            {/* View loader */}
            <>
              {!isLoading ? null : (
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
              )}
            </>
          </KeyboardAvoidingView>
        )}
      </>
    </ScreenContainer>
  );
};

export default withTheme(ForgotPasswordScreen);
