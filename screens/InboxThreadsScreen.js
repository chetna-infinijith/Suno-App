import React from 'react';
import {
  Circle,
  ExpoImage,
  Icon,
  IconButton,
  ScreenContainer,
  Surface,
  Touchable,
  withTheme,
} from '@draftbit/ui';
import * as Linking from 'expo-linking';
import { Modal, Text, View } from 'react-native';
import * as GlobalStyles from '../GlobalStyles.js';
import * as GlobalVariables from '../config/GlobalVariableContext';
import * as CustomCode from '../custom-files/CustomCode';
import * as messageThreads from '../custom-files/messageThreads';
import palettes from '../themes/palettes';
import * as Utils from '../utils';
import Breakpoints from '../utils/Breakpoints';
import * as StyleSheet from '../utils/StyleSheet';
import imageSource from '../utils/imageSource';
import useIsFocused from '../utils/useIsFocused';
import useNavigation from '../utils/useNavigation';
import useParams from '../utils/useParams';
import useWindowDimensions from '../utils/useWindowDimensions';
import { logError } from '../index.js';

const defaultProps = {
  Age: null,
  FirstName: null,
  LastName: null,
  MessageDetail: null,
  MessageId: null,
  PhoneNumber: null,
  fullName: null,
  photo: null,
};

const InboxThreadsScreen = props => {
  const { theme } = props;
  const dimensions = useWindowDimensions();
  const navigation = useNavigation();
  const params = useParams();
  const Constants = GlobalVariables.useValues();
  const Variables = Constants;
  const setGlobalVariableValue = GlobalVariables.useSetValue();
  const [datePickerValue, setDatePickerValue] = React.useState(new Date());
  const [datePickerValue2, setDatePickerValue2] = React.useState(new Date());
  const [isPriority, setIsPriority] = React.useState(false);
  const [newApptModal, setNewApptModal] = React.useState(false);
  const [optionsMenu, setOptionsMenu] = React.useState(false);
  const [pickerValue, setPickerValue] = React.useState('');
  const [quickModal, setQuickModal] = React.useState(false);
  const [quickOptModal, setQuickOptModal] = React.useState(false);
  React.useEffect(() => {
    try {
      console.log(
        params?.fullName ?? defaultProps.fullName,
        params?.MessageId ?? defaultProps.MessageId
      );
    } catch (err) {
      logError(err);
    }
  }, []);
  const isFocused = useIsFocused();
  React.useEffect(() => {
    try {
      if (!isFocused) {
        return;
      }
      /* hidden 'Set Variable' action */
    } catch (err) {
      logError(err);
    }
  }, [isFocused]);

  return (
    <ScreenContainer
      scrollable={false}
      hasSafeArea={false}
      hasTopSafeArea={true}
      hasBottomSafeArea={false}
    >
      {/* Main Header */}
      <View>
        {/* Main Top Header */}
        <Surface
          {...GlobalStyles.SurfaceStyles(theme)['Surface'].props}
          elevation={3}
          style={StyleSheet.applyWidth(
            GlobalStyles.SurfaceStyles(theme)['Surface'].style,
            dimensions.width
          )}
        >
          {/* Main Header */}
          <View
            style={StyleSheet.applyWidth(
              {
                alignItems: 'center',
                backgroundColor: 'rgb(255, 255, 255)',
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 8,
                paddingBottom: 12,
                paddingLeft: 2,
                paddingRight: 2,
                paddingTop: 12,
              },
              dimensions.width
            )}
          >
            {/* Left View */}
            <View
              style={StyleSheet.applyWidth(
                { alignItems: 'center', flexDirection: 'row' },
                dimensions.width
              )}
            >
              {/* Back Click */}
              <View
                style={StyleSheet.applyWidth(
                  {
                    alignItems: 'center',
                    height: 48,
                    justifyContent: 'center',
                    width: 48,
                  },
                  dimensions.width
                )}
              >
                <Touchable
                  onPress={() => {
                    try {
                      navigation.goBack();
                    } catch (err) {
                      logError(err);
                    }
                  }}
                >
                  <Icon
                    size={24}
                    color={theme.colors.text.medium}
                    name={'AntDesign/arrowleft'}
                  />
                </Touchable>
              </View>

              <Circle
                {...GlobalStyles.CircleStyles(theme)['Circle'].props}
                style={StyleSheet.applyWidth(
                  StyleSheet.compose(
                    GlobalStyles.CircleStyles(theme)['Circle'].style,
                    { backgroundColor: null }
                  ),
                  dimensions.width
                )}
              >
                <ExpoImage
                  allowDownscaling={true}
                  cachePolicy={'disk'}
                  contentPosition={'center'}
                  resizeMode={'cover'}
                  transitionDuration={300}
                  transitionEffect={'cross-dissolve'}
                  transitionTiming={'ease-in-out'}
                  {...GlobalStyles.ExpoImageStyles(theme)['Image'].props}
                  source={imageSource(
                    `${
                      (params?.photo ?? defaultProps.photo) ||
                      'https://master-app.suno.tech/assets/user-CXthF0zB.png'
                    }`
                  )}
                  style={StyleSheet.applyWidth(
                    StyleSheet.compose(
                      GlobalStyles.ExpoImageStyles(theme)['Image'].style,
                      { borderRadius: 28, height: 45, width: 45 }
                    ),
                    dimensions.width
                  )}
                />
              </Circle>

              <View>
                {/* Head Name View */}
                <View
                  style={StyleSheet.applyWidth(
                    { maxWidth: 165 },
                    dimensions.width
                  )}
                >
                  {/* Screen Heading */}
                  <Text
                    accessible={true}
                    selectable={false}
                    disabled={false}
                    ellipsizeMode={'tail'}
                    numberOfLines={1}
                    style={StyleSheet.applyWidth(
                      {
                        color: theme.colors.text.medium,
                        fontFamily: 'Inter_500Medium',
                        fontSize: 18,
                        marginLeft: 10,
                        paddingBottom: 4,
                      },
                      dimensions.width
                    )}
                  >
                    {params?.fullName ?? defaultProps.fullName}
                  </Text>
                </View>
                {/* Sub Name View */}
                <View>
                  {/* Sub Heading */}
                  <Text
                    accessible={true}
                    selectable={false}
                    {...GlobalStyles.TextStyles(theme)['Text 2'].props}
                    style={StyleSheet.applyWidth(
                      StyleSheet.compose(
                        GlobalStyles.TextStyles(theme)['Text 2'].style,
                        theme.typography.body1,
                        {
                          color: theme.colors.text.light,
                          fontFamily: 'Inter_400Regular',
                          fontSize: 12,
                          marginLeft: 10,
                        }
                      ),
                      dimensions.width
                    )}
                  >
                    {params?.Age ?? defaultProps.Age}
                    {' yrs • '}
                    {params?.PhoneNumber ?? defaultProps.PhoneNumber}
                  </Text>
                </View>
              </View>
            </View>
            {/* Right View */}
            <View
              style={StyleSheet.applyWidth(
                { alignItems: 'center', flexDirection: 'row' },
                dimensions.width
              )}
            >
              {/* Phone call */}
              <View
                style={StyleSheet.applyWidth(
                  {
                    alignItems: 'center',
                    height: 48,
                    justifyContent: 'center',
                    width: 42,
                  },
                  dimensions.width
                )}
              >
                <Touchable
                  onPress={() => {
                    try {
                      Linking.openURL(
                        `tel:${params?.PhoneNumber ?? defaultProps.PhoneNumber}`
                      );
                    } catch (err) {
                      logError(err);
                    }
                  }}
                >
                  <Icon
                    color={theme.colors.branding.secondary}
                    name={'Ionicons/call-outline'}
                    size={24}
                  />
                </Touchable>
              </View>
              {/* Menu */}
              <View
                style={StyleSheet.applyWidth(
                  {
                    alignItems: 'center',
                    height: 48,
                    justifyContent: 'center',
                    width: 46,
                  },
                  dimensions.width
                )}
              >
                <Touchable
                  onPress={() => {
                    try {
                      setQuickOptModal(true);
                    } catch (err) {
                      logError(err);
                    }
                  }}
                >
                  <Icon
                    color={theme.colors.branding.secondary}
                    name={'Entypo/dots-three-vertical'}
                    size={22}
                  />
                </Touchable>
              </View>
            </View>
          </View>
        </Surface>
      </View>
      {/* Container View */}
      <View style={StyleSheet.applyWidth({ flex: 1 }, dimensions.width,)}>
        {/* Custom Message Threads  */}
        <Utils.CustomCodeErrorBoundary>
          <messageThreads.MessageThreadsView />
        </Utils.CustomCodeErrorBoundary>
      </View>
      {/* QuickOptModal */}
      <Modal
        animationType={'none'}
        supportedOrientations={['portrait', 'landscape']}
        transparent={true}
        visible={Boolean(quickOptModal)}
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
                backgroundColor: palettes.App.Studily_White_Shade_2,
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
                backgroundColor: palettes.App['Custom #ffffff'],
                borderRadius: 16,
                height: 235,
                justifyContent: 'center',
                marginLeft: 24,
                marginRight: 24,
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
                  },
                  dimensions.width
                )}
              >
                <IconButton
                  onPress={() => {
                    try {
                      setQuickOptModal(!quickOptModal);
                    } catch (err) {
                      logError(err);
                    }
                  }}
                  color={theme.colors.branding.secondary}
                  icon={'AntDesign/closecircleo'}
                  size={22}
                />
                {/* headerTitle */}
                <View
                  style={StyleSheet.applyWidth(
                    { alignSelf: 'flex-start', marginTop: -22 },
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
                    {'Quick Actions'}
                  </Text>
                </View>
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
                    try {
                      navigation.push('WizardViewScreen', {
                        fullname: (() => {
                          const e = params?.fullName ?? defaultProps.fullName;
                          console.log(e);
                          return e;
                        })(),
                        firstname: (() => {
                          const e = params?.FirstName ?? defaultProps.FirstName;
                          console.log(e);
                          return e;
                        })(),
                        lastname: (() => {
                          const e = params?.LastName ?? defaultProps.LastName;
                          console.log(e);
                          return e;
                        })(),
                        inboxRoute: (() => {
                          const e = true;
                          console.log(e);
                          return e;
                        })(),
                      });
                      setQuickOptModal(false);
                    } catch (err) {
                      logError(err);
                    }
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
                        name={'AntDesign/calendar'}
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
                      {'Schedule Appointment'}
                    </Text>
                  </View>
                </Touchable>
              </View>
              {/* Flex Touchable */}
              <View
                style={StyleSheet.applyWidth(
                  { paddingBottom: 10 },
                  dimensions.width
                )}
              >
                {/* Touchable 2 */}
                <Touchable
                  onPress={() => {
                    try {
                      navigation.navigate(
                        'PatientDetailsScreen',
                        {
                          id: Constants['MessageId'],
                          box_folder_id: (
                            params?.MessageDetail ?? defaultProps.MessageDetail
                          )?.box_folder_id,
                          clientID: (() => {
                            const e = (
                              params?.MessageDetail ??
                              defaultProps.MessageDetail
                            )?.preferred_clinic?.id;
                            console.log(e);
                            return e;
                          })(),
                        },
                        { pop: true }
                      );
                      setQuickOptModal(false);
                    } catch (err) {
                      logError(err);
                    }
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
                      {/* icon */}
                      <Icon
                        color={theme.colors.text.warning}
                        name={'Ionicons/document-text-outline'}
                        size={22}
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
                      {'Patient Details'}
                    </Text>
                  </View>
                </Touchable>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
};

export default withTheme(InboxThreadsScreen);
