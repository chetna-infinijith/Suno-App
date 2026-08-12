import React from 'react';
import {
  Icon,
  ScreenContainer,
  SimpleStyleScrollView,
  Surface,
  Touchable,
  withTheme,
} from '@draftbit/ui';
import { RefreshControl, Text, View } from 'react-native';
import * as GlobalStyles from '../GlobalStyles.js';
import * as SunoApi from '../apis/SunoApi.js';
import * as SunoHealthcareManagementAPIApi from '../apis/SunoHealthcareManagementAPIApi.js';
import CustomHeaderBlock from '../components/CustomHeaderBlock';
import * as GlobalVariables from '../config/GlobalVariableContext';
import * as CustomCode from '../custom-files/CustomCode';
import palettes from '../themes/palettes';
import Breakpoints from '../utils/Breakpoints';
import * as StyleSheet from '../utils/StyleSheet';
import showAlertUtil from '../utils/showAlert';
import useIsFocused from '../utils/useIsFocused';
import useNavigation from '../utils/useNavigation';
import useParams from '../utils/useParams';
import useWindowDimensions from '../utils/useWindowDimensions';
import { logError } from '../index.js';

const HomeScreen = props => {
  const { theme } = props;
  const dimensions = useWindowDimensions();
  const navigation = useNavigation();
  const Constants = GlobalVariables.useValues();
  const Variables = Constants;
  const setGlobalVariableValue = GlobalVariables.useSetValue();
  const [errorHandler, setErrorHandler] = React.useState('');
  const [errorHandlerMsg, setErrorHandlerMsg] = React.useState('');
  const [formattedDate, setFormattedDate] = React.useState('');
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [selectedTab, setSelectedTab] = React.useState('');
  const [starRatingValue, setStarRatingValue] = React.useState(0);
  const [switchValue, setSwitchValue] = React.useState(false);
  const [unreadMsgCount, setUnreadMsgCount] = React.useState(0);
  const [usernameFollowed, setUsernameFollowed] = React.useState(false);
  const [refreshingScrollView, setRefreshingScrollView] = React.useState(false);
  const getFormattedDate = () => {
    const date = new Date();
    const options = {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  };
  React.useEffect(() => {
    try {
      /* hidden 'API Request' action */
      /* hidden 'Extract Key' action */
      /* hidden 'Set Variable' action */
      /* hidden 'If/Else' action */
      /* hidden 'API Request' action */
      /* hidden 'Extract Key' action */
      /* hidden 'Set Variable' action */
      /* hidden 'If/Else' action */
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
      /* hidden 'Log to Console' action */
    } catch (err) {
      logError(err);
    }
  }, [isFocused]);

  return (
    <ScreenContainer
      scrollable={false}
      hasBottomSafeArea={false}
      hasSafeArea={true}
      hasTopSafeArea={false}
      style={StyleSheet.applyWidth({ height: '100%' }, dimensions.width)}
    >
      <CustomHeaderBlock />
      <SimpleStyleScrollView
        horizontal={false}
        keyboardShouldPersistTaps={'never'}
        nestedScrollEnabled={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshingScrollView}
            onRefresh={() => {
              const handler = async () => {
                try {
                  setRefreshingScrollView(true);
                  setIsRefreshing(true);
                  await setGlobalVariableValue({
                    key: 'UserInfo',
                    value: '',
                  });
                  const homeScreenRes = (
                    await SunoHealthcareManagementAPIApi.gET$api$auth$users$me$GET(
                      Constants
                    )
                  )?.json;
                  const userData = homeScreenRes;
                  const apiErrMsg = userData?.message;
                  await setGlobalVariableValue({
                    key: 'UserInfo',
                    value: userData,
                  });
                  await setGlobalVariableValue({
                    key: 'senderID',
                    value: userData?.id,
                  });
                  setIsRefreshing(false);
                  /* hidden 'Show Alert' action */ setRefreshingScrollView(
                    false
                  );
                } catch (err) {
                  logError(err);
                  setRefreshingScrollView(false);
                }
              };
              handler();
            }}
          />
        }
        showsHorizontalScrollIndicator={true}
        showsVerticalScrollIndicator={true}
        bounces={true}
        style={StyleSheet.applyWidth(
          { paddingLeft: 12, paddingRight: 12, width: '100%' },
          dimensions.width
        )}
      >
        {/* Section top */}
        <View
          onLayout={event => {
            try {
              getFormattedDate();
            } catch (err) {
              logError(err);
            }
          }}
          style={StyleSheet.applyWidth(
            {
              alignItems: 'flex-start',
              justifyContent: 'center',
              paddingTop: 20,
            },
            dimensions.width
          )}
        >
          <Text
            accessible={true}
            selectable={false}
            style={StyleSheet.applyWidth(
              {
                color: theme.colors.text.medium,
                fontFamily: 'Inter_600SemiBold',
                fontSize: 18,
              },
              dimensions.width
            )}
          >
            {getFormattedDate()}
          </Text>

          <View
            style={StyleSheet.applyWidth(
              { alignItems: 'center', flexDirection: 'row', marginTop: 6 },
              dimensions.width
            )}
          >
            <Text
              accessible={true}
              selectable={false}
              style={StyleSheet.applyWidth(
                {
                  color: theme.colors.branding.secondary,
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 14,
                  paddingLeft: 2,
                  paddingRight: 5,
                  textTransform: 'capitalize',
                },
                dimensions.width
              )}
            >
              {'Welcome,'}
              {Constants['UserInfo']?.suffix}{' '}
              {Constants['UserInfo']?.first_name}{' '}
              {Constants['UserInfo']?.last_name}
            </Text>
          </View>
        </View>
        {/* Scroll View Horizontal */}
        <SimpleStyleScrollView
          bounces={true}
          keyboardShouldPersistTaps={'never'}
          nestedScrollEnabled={false}
          showsHorizontalScrollIndicator={true}
          showsVerticalScrollIndicator={true}
          horizontal={true}
          style={StyleSheet.applyWidth(
            { flexDirection: 'row', flexGrow: 0, flexShrink: 0 },
            dimensions.width
          )}
        >
          {/* Cards View */}
          <View
            style={StyleSheet.applyWidth({ marginTop: 8 }, dimensions.width)}
          >
            {/* Plans */}
            <View
              style={StyleSheet.applyWidth(
                {
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingTop: 14,
                },
                dimensions.width
              )}
            >
              {/* Todays Appointment */}
              <View
                style={StyleSheet.applyWidth(
                  { flex: 1, paddingRight: 10 },
                  dimensions.width
                )}
              >
                <Touchable
                  onPress={() => {
                    try {
                      navigation.navigate(
                        'BottomTabNavigator',
                        { screen: 'ScheduleScreen' },
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
                        alignItems: 'flex-start',
                        backgroundColor: 'rgb(219, 233, 254)',
                        borderBottomWidth: 1.5,
                        borderColor: palettes.App.Studily_Primary,
                        borderLeftWidth: 1.5,
                        borderRadius: 16,
                        borderRightWidth: 1.5,
                        borderTopWidth: 1.5,
                        height: 110,
                        justifyContent: 'center',
                        paddingLeft: 10,
                        paddingRight: 10,
                        width: 200,
                      },
                      dimensions.width
                    )}
                  >
                    <Text
                      accessible={true}
                      selectable={false}
                      style={StyleSheet.applyWidth(
                        {
                          color: palettes.App.Studily_Primary,
                          fontFamily: 'Inter_600SemiBold',
                          fontSize: 15,
                        },
                        dimensions.width
                      )}
                    >
                      {'Todays Appointments'}
                    </Text>
                    {/* Text 2 */}
                    <Text
                      accessible={true}
                      selectable={false}
                      style={StyleSheet.applyWidth(
                        {
                          color: palettes.App.Studily_Primary,
                          fontFamily: 'Inter_700Bold',
                          fontSize: 20,
                          paddingBottom: 6,
                          paddingTop: 6,
                        },
                        dimensions.width
                      )}
                    >
                      {'8'}
                    </Text>

                    <View
                      style={StyleSheet.applyWidth(
                        {
                          alignContent: 'center',
                          alignItems: 'flex-end',
                          alignSelf: 'flex-end',
                          height: 48,
                          justifyContent: 'center',
                          marginTop: -10,
                          position: 'absolute',
                          width: 48,
                        },
                        dimensions.width
                      )}
                    >
                      <Icon
                        color={palettes.App.Studily_Primary}
                        name={'AntDesign/calendar'}
                        size={20}
                        style={StyleSheet.applyWidth(
                          { marginRight: 10, marginTop: 10 },
                          dimensions.width
                        )}
                      />
                    </View>

                    <Text
                      accessible={true}
                      selectable={false}
                      style={StyleSheet.applyWidth(
                        {
                          color: palettes.App.Studily_Primary,
                          fontFamily: 'Inter_400Regular',
                          fontSize: 12,
                          marginTop: 4,
                        },
                        dimensions.width
                      )}
                    >
                      {'Next: 10.30 AM - John Davies'}
                    </Text>
                  </View>
                </Touchable>
              </View>
              {/* Urgent Tasks */}
              <View
                style={StyleSheet.applyWidth(
                  { flex: 1, marginLeft: 5, marginRight: 5, paddingRight: 4 },
                  dimensions.width
                )}
              >
                <Touchable>
                  <View
                    style={StyleSheet.applyWidth(
                      {
                        alignItems: 'flex-start',
                        backgroundColor: 'rgb(254, 252, 232)',
                        borderBottomWidth: 1.5,
                        borderColor: 'rgb(113, 63, 17)',
                        borderLeftWidth: 1.5,
                        borderRadius: 16,
                        borderRightWidth: 1.5,
                        borderTopWidth: 1.5,
                        height: 110,
                        justifyContent: 'center',
                        paddingLeft: 10,
                        paddingRight: 10,
                        width: 200,
                      },
                      dimensions.width
                    )}
                  >
                    <Text
                      accessible={true}
                      selectable={false}
                      style={StyleSheet.applyWidth(
                        {
                          color: 'rgb(113, 63, 17)',
                          fontFamily: 'Inter_600SemiBold',
                          fontSize: 15,
                        },
                        dimensions.width
                      )}
                    >
                      {'Urgent Tasks'}
                    </Text>
                    {/* Text 2 */}
                    <Text
                      accessible={true}
                      selectable={false}
                      style={StyleSheet.applyWidth(
                        {
                          color: 'rgb(113, 63, 17)',
                          fontFamily: 'Inter_700Bold',
                          fontSize: 20,
                          paddingBottom: 6,
                          paddingTop: 6,
                        },
                        dimensions.width
                      )}
                    >
                      {'12'}
                    </Text>

                    <View
                      style={StyleSheet.applyWidth(
                        {
                          alignItems: 'flex-end',
                          alignSelf: 'flex-end',
                          height: 48,
                          justifyContent: 'center',
                          marginTop: -10,
                          position: 'absolute',
                          width: 48,
                        },
                        dimensions.width
                      )}
                    >
                      <Icon
                        color={theme.colors.text.warning}
                        name={'AntDesign/exclamationcircleo'}
                        size={20}
                        style={StyleSheet.applyWidth(
                          { marginRight: 10, marginTop: 10 },
                          dimensions.width
                        )}
                      />
                    </View>

                    <Text
                      accessible={true}
                      selectable={false}
                      style={StyleSheet.applyWidth(
                        {
                          color: 'rgb(113, 63, 17)',
                          fontFamily: 'Inter_400Regular',
                          fontSize: 12,
                          marginTop: 4,
                        },
                        dimensions.width
                      )}
                    >
                      {'2 Test results pending review'}
                    </Text>
                  </View>
                </Touchable>
              </View>
              {/* Unread Messages */}
              <View
                style={StyleSheet.applyWidth(
                  { flex: 1, marginLeft: 5 },
                  dimensions.width
                )}
              >
                <Touchable>
                  <View
                    style={StyleSheet.applyWidth(
                      {
                        alignItems: 'flex-start',
                        backgroundColor: 'rgb(239, 253, 250)',
                        borderBottomWidth: 1.5,
                        borderColor: 'rgb(18, 78, 74)',
                        borderLeftWidth: 1.5,
                        borderRadius: 16,
                        borderRightWidth: 1.5,
                        borderTopWidth: 1.5,
                        height: 110,
                        justifyContent: 'center',
                        paddingLeft: 10,
                        paddingRight: 10,
                        width: 200,
                      },
                      dimensions.width
                    )}
                  >
                    <Text
                      accessible={true}
                      selectable={false}
                      style={StyleSheet.applyWidth(
                        {
                          color: 'rgb(18, 78, 74)',
                          fontFamily: 'Inter_600SemiBold',
                          fontSize: 15,
                        },
                        dimensions.width
                      )}
                    >
                      {'Unread Messages'}
                    </Text>
                    {/* Text 2 */}
                    <Text
                      accessible={true}
                      selectable={false}
                      style={StyleSheet.applyWidth(
                        {
                          color: 'rgb(18, 78, 74)',
                          fontFamily: 'Inter_700Bold',
                          fontSize: 20,
                          paddingBottom: 6,
                          paddingTop: 6,
                        },
                        dimensions.width
                      )}
                    >
                      {unreadMsgCount}
                    </Text>

                    <View
                      style={StyleSheet.applyWidth(
                        {
                          alignItems: 'flex-end',
                          alignSelf: 'flex-end',
                          height: 48,
                          justifyContent: 'center',
                          marginTop: -10,
                          position: 'absolute',
                          width: 48,
                        },
                        dimensions.width
                      )}
                    >
                      <Icon
                        color={theme.colors.branding.secondary}
                        name={'MaterialCommunityIcons/message-text-outline'}
                        size={20}
                        style={StyleSheet.applyWidth(
                          { marginRight: 10, marginTop: 10 },
                          dimensions.width
                        )}
                      />
                    </View>

                    <Text
                      accessible={true}
                      selectable={false}
                      style={StyleSheet.applyWidth(
                        {
                          color: 'rgb(18, 78, 74)',
                          fontFamily: 'Inter_400Regular',
                          fontSize: 12,
                          marginTop: 4,
                        },
                        dimensions.width
                      )}
                    >
                      {'3 Patient inquiries'}
                    </Text>
                  </View>
                </Touchable>
              </View>
            </View>
          </View>
        </SimpleStyleScrollView>
        {/* Quick Actions */}
        <View
          style={StyleSheet.applyWidth(
            { marginTop: 4, paddingBottom: 6, width: '100%' },
            dimensions.width
          )}
        >
          {/* Header */}
          <View
            style={StyleSheet.applyWidth(
              {
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 15,
                paddingBottom: 8,
                width: '100%',
              },
              dimensions.width
            )}
          >
            {/* Heading */}
            <Text
              accessible={true}
              selectable={false}
              style={StyleSheet.applyWidth(
                {
                  color: theme.colors.text.medium,
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 18,
                },
                dimensions.width
              )}
            >
              {'Quick Actions'}
            </Text>
          </View>
          {/* Actions Frame */}
          <View
            style={StyleSheet.applyWidth(
              {
                flexDirection: 'row',
                maxWidth: '100%',
                minWidth: '100%',
                paddingBottom: 12,
                paddingLeft: 2,
                paddingRight: 2,
                paddingTop: 12,
                width: '100%',
              },
              dimensions.width
            )}
          >
            {/* Flex Touchable */}
            <View
              style={StyleSheet.applyWidth(
                { flexGrow: 1, flexShrink: 0, marginLeft: 5, marginRight: 5 },
                dimensions.width
              )}
            >
              <Touchable
                onPress={() => {
                  try {
                    /* hidden 'Set Variable' action */
                    navigation.navigate('WizardViewScreen', {}, { pop: true });
                  } catch (err) {
                    logError(err);
                  }
                }}
              >
                {/* Button Frame */}
                <View
                  style={StyleSheet.applyWidth(
                    {
                      alignItems: 'center',
                      backgroundColor: theme.colors.branding.secondary,
                      borderBottomWidth: 2,
                      borderColor: theme.colors.branding.secondary,
                      borderLeftWidth: 2,
                      borderRadius: 36,
                      borderRightWidth: 2,
                      borderTopWidth: 2,
                      flexDirection: 'row',
                      justifyContent: 'center',
                    },
                    dimensions.width
                  )}
                >
                  {/* Icon Frame */}
                  <View
                    style={StyleSheet.applyWidth(
                      { paddingBottom: 12, paddingLeft: 10, paddingTop: 12 },
                      dimensions.width
                    )}
                  >
                    {/* plus Icon */}
                    <Icon
                      color={palettes.App.Internal_White}
                      name={'AntDesign/pluscircleo'}
                      size={18}
                    />
                  </View>
                  {/* Button Label */}
                  <Text
                    accessible={true}
                    selectable={false}
                    style={StyleSheet.applyWidth(
                      {
                        color: palettes.App.Internal_White,
                        fontFamily: 'OpenSans_600SemiBold',
                        fontSize: 12,
                        lineHeight: 16,
                        paddingBottom: 12,
                        paddingLeft: 6,
                        paddingRight: 16,
                        paddingTop: 12,
                      },
                      dimensions.width
                    )}
                  >
                    {'New '}
                  </Text>
                </View>
              </Touchable>
            </View>
            {/* Flex Touchable */}
            <View
              style={StyleSheet.applyWidth(
                { flexGrow: 1, flexShrink: 0, marginLeft: 5, marginRight: 5 },
                dimensions.width
              )}
            >
              <Touchable
                onPress={() => {
                  try {
                    navigation.navigate(
                      'BottomTabNavigator',
                      { screen: 'PatientScreen' },
                      { pop: true }
                    );
                  } catch (err) {
                    logError(err);
                  }
                }}
              >
                {/* Button Frame */}
                <View
                  style={StyleSheet.applyWidth(
                    {
                      alignItems: 'center',
                      backgroundColor: palettes.App.Internal_White,
                      borderBottomWidth: 2,
                      borderColor: theme.colors.branding.secondary,
                      borderLeftWidth: 2,
                      borderRadius: 36,
                      borderRightWidth: 2,
                      borderTopWidth: 2,
                      flexDirection: 'row',
                      justifyContent: 'center',
                    },
                    dimensions.width
                  )}
                >
                  {/* Icon Frame */}
                  <View
                    style={StyleSheet.applyWidth(
                      { paddingBottom: 12, paddingLeft: 10, paddingTop: 12 },
                      dimensions.width
                    )}
                  >
                    {/* Search Icon */}
                    <Icon
                      color={theme.colors.branding.secondary}
                      name={'Feather/search'}
                      size={18}
                    />
                  </View>
                  {/* Button Label */}
                  <Text
                    accessible={true}
                    selectable={false}
                    style={StyleSheet.applyWidth(
                      {
                        color: theme.colors.branding.secondary,
                        fontFamily: 'OpenSans_600SemiBold',
                        fontSize: 12,
                        lineHeight: 16,
                        paddingBottom: 12,
                        paddingLeft: 6,
                        paddingRight: 16,
                        paddingTop: 12,
                      },
                      dimensions.width
                    )}
                  >
                    {'Search'}
                  </Text>
                </View>
              </Touchable>
            </View>
            {/* Flex Touchable 2 */}
            <View
              style={StyleSheet.applyWidth(
                { flexGrow: 1, flexShrink: 0, marginLeft: 5, marginRight: 5 },
                dimensions.width
              )}
            >
              <Touchable
                onPress={() => {
                  try {
                    /* hidden 'Navigate' action */
                  } catch (err) {
                    logError(err);
                  }
                }}
              >
                {/* Button Frame */}
                <View
                  style={StyleSheet.applyWidth(
                    {
                      alignItems: 'center',
                      backgroundColor: palettes.App.Internal_White,
                      borderBottomWidth: 2,
                      borderColor: theme.colors.branding.secondary,
                      borderLeftWidth: 2,
                      borderRadius: 36,
                      borderRightWidth: 2,
                      borderTopWidth: 2,
                      flexDirection: 'row',
                      justifyContent: 'center',
                    },
                    dimensions.width
                  )}
                >
                  {/* Icon Frame */}
                  <View
                    style={StyleSheet.applyWidth(
                      { paddingBottom: 12, paddingLeft: 10, paddingTop: 12 },
                      dimensions.width
                    )}
                  >
                    {/* Mic Icon */}
                    <Icon
                      color={theme.colors.branding.secondary}
                      name={'Entypo/mic'}
                      size={18}
                    />
                  </View>
                  {/* Button Label */}
                  <Text
                    accessible={true}
                    selectable={false}
                    style={StyleSheet.applyWidth(
                      {
                        color: theme.colors.branding.secondary,
                        fontFamily: 'OpenSans_600SemiBold',
                        fontSize: 12,
                        lineHeight: 16,
                        paddingBottom: 12,
                        paddingLeft: 6,
                        paddingRight: 16,
                        paddingTop: 12,
                      },
                      dimensions.width
                    )}
                  >
                    {'Capture Visit'}
                  </Text>
                </View>
              </Touchable>
            </View>
          </View>
        </View>
        {/* Recent Activity */}
        <View
          style={StyleSheet.applyWidth(
            { paddingBottom: 12, width: '100%' },
            dimensions.width
          )}
        >
          <View
            style={StyleSheet.applyWidth(
              { paddingTop: 12, width: '100%' },
              dimensions.width
            )}
          >
            {/* Header */}
            <View
              style={StyleSheet.applyWidth(
                { alignItems: 'flex-start', flexDirection: 'row' },
                dimensions.width
              )}
            >
              {/* Heading */}
              <Text
                accessible={true}
                selectable={false}
                style={StyleSheet.applyWidth(
                  {
                    color: theme.colors.text.medium,
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 18,
                  },
                  dimensions.width
                )}
              >
                {'Recent Activity'}
              </Text>
            </View>
            {/* Left Header */}
            <View
              style={StyleSheet.applyWidth(
                {
                  alignItems: 'flex-end',
                  bottom: 25,
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  position: 'relative',
                },
                dimensions.width
              )}
            >
              <Touchable
                onPress={() => {
                  try {
                    /* hidden 'Navigate' action */
                  } catch (err) {
                    logError(err);
                  }
                }}
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
                        color: theme.colors.branding.secondary,
                        fontFamily: 'Inter_600SemiBold',
                        fontSize: 14,
                      }
                    ),
                    dimensions.width
                  )}
                >
                  {'View All'}
                </Text>
              </Touchable>
            </View>
          </View>
          {/* Record */}
          <Touchable
            onPress={() => {
              try {
                /* hidden 'Navigate' action */
              } catch (err) {
                logError(err);
              }
            }}
          >
            <Surface
              elevation={3}
              style={StyleSheet.applyWidth(
                {
                  borderColor: palettes.App.ViewBG,
                  borderLeftWidth: 1,
                  borderRadius: 12,
                  borderRightWidth: 1,
                  marginBottom: 6,
                  marginTop: 4,
                  paddingBottom: 2,
                  paddingTop: 2,
                },
                dimensions.width
              )}
            >
              <View
                style={StyleSheet.applyWidth(
                  {
                    flex: 1,
                    flexDirection: 'row',
                    paddingLeft: 14,
                    paddingRight: 14,
                    width: '100%',
                  },
                  dimensions.width
                )}
              >
                <View
                  style={StyleSheet.applyWidth(
                    {
                      alignItems: 'center',
                      alignSelf: 'center',
                      backgroundColor: theme.colors.background.success,
                      borderColor: theme.colors.branding.secondary,
                      borderRadius: 25,
                      height: 40,
                      justifyContent: 'center',
                      width: '14%',
                    },
                    dimensions.width
                  )}
                >
                  <Icon
                    size={24}
                    color={theme.colors.branding.secondary}
                    name={'AntDesign/checkcircleo'}
                  />
                </View>
                {/* View sub */}
                <View
                  style={StyleSheet.applyWidth(
                    {
                      alignItems: 'flex-start',
                      flexDirection: 'column',
                      flexWrap: 'wrap',
                      marginLeft: 8,
                      marginRight: 8,
                      paddingBottom: 10,
                      paddingLeft: 4,
                      paddingRight: 4,
                      paddingTop: 10,
                      width: '86%',
                    },
                    dimensions.width
                  )}
                >
                  {/* Head Title */}
                  <Text
                    accessible={true}
                    selectable={false}
                    style={StyleSheet.applyWidth(
                      {
                        color: theme.colors.text.medium,
                        fontFamily: 'Inter_500Medium',
                        fontSize: 16,
                        paddingBottom: 10,
                        textAlign: 'auto',
                      },
                      dimensions.width
                    )}
                  >
                    {'Sarah Johnson - Appointment Completed'}
                  </Text>
                  {/* Sub head */}
                  <Text
                    accessible={true}
                    selectable={false}
                    style={StyleSheet.applyWidth(
                      {
                        color: palettes.App.TextPlaceholder,
                        fontFamily: 'Inter_400Regular',
                        fontSize: 14,
                        marginTop: 2,
                        paddingBottom: 6,
                        textTransform: 'capitalize',
                      },
                      dimensions.width
                    )}
                  >
                    {'Hearing aid fitting completed'}
                  </Text>
                  {/* Timing */}
                  <Text
                    accessible={true}
                    selectable={false}
                    style={StyleSheet.applyWidth(
                      {
                        color: palettes.App.TextPlaceholder,
                        fontFamily: 'Inter_400Regular',
                        fontSize: 12,
                        opacity: 0.8,
                      },
                      dimensions.width
                    )}
                  >
                    {'Today, 9:15 AM'}
                  </Text>
                </View>
              </View>
            </Surface>
          </Touchable>
          {/* Record 2 */}
          <Touchable
            onPress={() => {
              try {
                /* hidden 'Navigate' action */
              } catch (err) {
                logError(err);
              }
            }}
          >
            <Surface
              elevation={3}
              style={StyleSheet.applyWidth(
                {
                  borderColor: palettes.App.ViewBG,
                  borderLeftWidth: 1,
                  borderRadius: 12,
                  borderRightWidth: 1,
                  marginBottom: 6,
                  marginTop: 10,
                  paddingBottom: 2,
                  paddingTop: 2,
                },
                dimensions.width
              )}
            >
              <View
                style={StyleSheet.applyWidth(
                  {
                    flex: 1,
                    flexDirection: 'row',
                    paddingLeft: 14,
                    paddingRight: 14,
                    width: '100%',
                  },
                  dimensions.width
                )}
              >
                <View
                  style={StyleSheet.applyWidth(
                    {
                      alignItems: 'center',
                      alignSelf: 'center',
                      backgroundColor: 'rgb(219, 233, 254)',
                      borderColor: theme.colors.branding.secondary,
                      borderRadius: 25,
                      height: 40,
                      justifyContent: 'center',
                      width: '14%',
                    },
                    dimensions.width
                  )}
                >
                  <Icon
                    size={24}
                    color={palettes.App.Studily_Primary}
                    name={'Feather/file-text'}
                  />
                </View>
                {/* View sub */}
                <View
                  style={StyleSheet.applyWidth(
                    {
                      alignItems: 'flex-start',
                      flexDirection: 'column',
                      flexWrap: 'wrap',
                      marginLeft: 8,
                      marginRight: 8,
                      paddingBottom: 10,
                      paddingLeft: 4,
                      paddingRight: 4,
                      paddingTop: 10,
                      width: '86%',
                    },
                    dimensions.width
                  )}
                >
                  {/* Head Title */}
                  <Text
                    accessible={true}
                    selectable={false}
                    style={StyleSheet.applyWidth(
                      {
                        alignSelf: 'auto',
                        color: theme.colors.text.medium,
                        fontFamily: 'Inter_500Medium',
                        fontSize: 16,
                        paddingBottom: 10,
                        textAlign: 'auto',
                      },
                      dimensions.width
                    )}
                  >
                    {'Robert Miller - Note Added'}
                  </Text>
                  {/* Sub Head */}
                  <Text
                    accessible={true}
                    selectable={false}
                    style={StyleSheet.applyWidth(
                      {
                        color: palettes.App.TextPlaceholder,
                        fontFamily: 'Inter_400Regular',
                        fontSize: 14,
                        marginTop: 2,
                        paddingBottom: 6,
                        textTransform: 'capitalize',
                      },
                      dimensions.width
                    )}
                  >
                    {'Follow-up notes from audiogram test'}
                  </Text>
                  {/* Timing */}
                  <Text
                    accessible={true}
                    selectable={false}
                    style={StyleSheet.applyWidth(
                      {
                        color: palettes.App.TextPlaceholder,
                        fontFamily: 'Inter_400Regular',
                        fontSize: 12,
                        opacity: 0.8,
                      },
                      dimensions.width
                    )}
                  >
                    {'Today, 8:45 AM'}
                  </Text>
                </View>
              </View>
            </Surface>
          </Touchable>
          {/* Record 3 */}
          <Touchable
            onPress={() => {
              try {
                /* hidden 'Navigate' action */
              } catch (err) {
                logError(err);
              }
            }}
          >
            <Surface
              elevation={3}
              style={StyleSheet.applyWidth(
                {
                  borderColor: palettes.App.ViewBG,
                  borderLeftWidth: 1,
                  borderRadius: 12,
                  borderRightWidth: 1,
                  marginBottom: 6,
                  marginTop: 10,
                  paddingBottom: 2,
                  paddingTop: 2,
                },
                dimensions.width
              )}
            >
              <View
                style={StyleSheet.applyWidth(
                  {
                    flex: 1,
                    flexDirection: 'row',
                    paddingLeft: 14,
                    paddingRight: 14,
                    width: '100%',
                  },
                  dimensions.width
                )}
              >
                <View
                  style={StyleSheet.applyWidth(
                    {
                      alignItems: 'center',
                      alignSelf: 'center',
                      backgroundColor: 'rgb(254, 243, 199)',
                      borderColor: theme.colors.branding.secondary,
                      borderRadius: 25,
                      height: 40,
                      justifyContent: 'center',
                      width: '14%',
                    },
                    dimensions.width
                  )}
                >
                  <Icon
                    size={24}
                    color={theme.colors.foreground.warning}
                    name={'Feather/clock'}
                  />
                </View>
                {/* View sub */}
                <View
                  style={StyleSheet.applyWidth(
                    {
                      alignItems: 'flex-start',
                      flexDirection: 'column',
                      flexWrap: 'wrap',
                      marginLeft: 8,
                      marginRight: 8,
                      paddingBottom: 10,
                      paddingLeft: 4,
                      paddingRight: 4,
                      paddingTop: 10,
                      width: '86%',
                    },
                    dimensions.width
                  )}
                >
                  {/* Head Title */}
                  <Text
                    accessible={true}
                    selectable={false}
                    style={StyleSheet.applyWidth(
                      {
                        alignSelf: 'auto',
                        color: theme.colors.text.medium,
                        fontFamily: 'Inter_500Medium',
                        fontSize: 16,
                        paddingBottom: 10,
                        textAlign: 'auto',
                      },
                      dimensions.width
                    )}
                  >
                    {'David Thompson - Appointment Rescheduled'}
                  </Text>
                  {/* Sub Head */}
                  <Text
                    accessible={true}
                    selectable={false}
                    style={StyleSheet.applyWidth(
                      {
                        color: palettes.App.TextPlaceholder,
                        fontFamily: 'Inter_400Regular',
                        fontSize: 14,
                        marginTop: 2,
                        paddingBottom: 6,
                        textTransform: 'capitalize',
                      },
                      dimensions.width
                    )}
                  >
                    {'Moved to tomorrow at 2:00 PM'}
                  </Text>
                  {/* Timing */}
                  <Text
                    accessible={true}
                    selectable={false}
                    style={StyleSheet.applyWidth(
                      {
                        color: palettes.App.TextPlaceholder,
                        fontFamily: 'Inter_400Regular',
                        fontSize: 12,
                        opacity: 0.8,
                      },
                      dimensions.width
                    )}
                  >
                    {'Yesterday, 4:30 PM'}
                  </Text>
                </View>
              </View>
            </Surface>
          </Touchable>
        </View>
      </SimpleStyleScrollView>
    </ScreenContainer>
  );
};

export default withTheme(HomeScreen);