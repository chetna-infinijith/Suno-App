import React, { useRef } from 'react';
import { Icon, Touchable, useTheme } from '@draftbit/ui';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import {
  DefaultTheme,
  NavigationContainer,
  NavigationIndependentTree,
} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AppState, I18nManager, Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { systemWeights } from 'react-native-typography';
import LinkingConfiguration from './LinkingConfiguration';
import * as SunoHealthcareManagementAPIApi from './apis/SunoHealthcareManagementAPIApi.js';
import * as GlobalVariables from './config/GlobalVariableContext';
import getPatientTags from './global-functions/getPatientTags';
import AppSettingsScreen from './screens/AppSettingsScreen';
import CaptureVisitScreen from './screens/CaptureVisitScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen';
import ChartNotesScreen from './screens/ChartNotesScreen';
import CheckInScreen from './screens/CheckInScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import FilterAndSortScreen from './screens/FilterAndSortScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import HomeScreen from './screens/HomeScreen';
import InboxBackupScreen from './screens/InboxBackupScreen';
import InboxScreen from './screens/InboxScreen';
import InboxThreadsScreen from './screens/InboxThreadsScreen';
import LoginScreen from './screens/LoginScreen';
import NewNoteScreen from './screens/NewNoteScreen';
import NewPatientScreen from './screens/NewPatientScreen';
import NewTaskScreen from './screens/NewTaskScreen';
import NotificationScreen from './screens/NotificationScreen';
import NotificationPreferenceScreen from './screens/NotificationPreferenceScreen';
import PatientDetailsScreen from './screens/PatientDetailsScreen';
import PatientScreen from './screens/PatientScreen';
import PersonalClinicEventScreen from './screens/PersonalClinicEventScreen';
import ScanDocumentScreen from './screens/ScanDocumentScreen';
import ScheduleAppntScreen from './screens/ScheduleAppntScreen';
import ScheduleScreen from './screens/ScheduleScreen';
import SignInScreen from './screens/SignInScreen';
import TaskScreen from './screens/TaskScreen';
import TeleHealthScreen from './screens/TeleHealthScreen';
import UpcomingAppointmentsScreen from './screens/UpcomingAppointmentsScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import SplashScreen from './screens/SplashScreen.js';
import WizardViewScreen from './screens/WizardViewScreen';
import ViewTaskScreen from './screens/ViewTaskScreen';
import ChatScreen from './screens/ChatScreen.js';
import GroupChannelCreateScreen from './screens/GroupChannelCreateScreen.js';
import GroupChannelListScreen from './screens/GroupChannelListScreen.js';
import { useTotalUnreadMessageCount } from '@sendbird/uikit-chat-hooks';


import palettes from './themes/palettes';
import Breakpoints from './utils/Breakpoints';
import showAlertUtil from './utils/showAlert';
import useNavigation from './utils/useNavigation';
import useWindowDimensions from './utils/useWindowDimensions';
import { navigationRef } from './NavigationService.js';
import GroupChannelScreen from './screens/GroupChannelScreen.js';
import GroupChannelBannedUsersScreen from './screens/GroupChannelBannedUsersScreen.js';
import GroupChannelInviteScreen from './screens/GroupChannelInviteScreen.js';
import GroupChannelMembersScreen from './screens/GroupChannelMembersScreen.js';
import GroupChannelModerationScreen from './screens/GroupChannelModerationScreen.js';
import GroupChannelMutedMembersScreen from './screens/GroupChannelMutedMembersScreen.js';
import GroupChannelNotificationsScreen from './screens/GroupChannelNotificationsScreen.js';
import GroupChannelOperatorsScreen from './screens/GroupChannelOperatorsScreen.js';
import GroupChannelRegisterOperatorScreen from './screens/GroupChannelRegisterOperatorScreen.js';
import GroupChannelSettingsScreen from './screens/GroupChannelSettingsScreen.js';
import { useSendbirdChat } from '@sendbird/uikit-react-native';
import { onForeground } from './custom-files/Notification.js';
import * as Notifications from "expo-notifications";
import { GetSendbirdSDK } from './App.js';
import EditPatientScreen from './screens/EditPatientScreen.js';
import ViewBillingScreen from './screens/ViewBillingScreen';
import ScribeHistoryScreen from './screens/ScribeHistoryScreen.js';
import ViewInsurancePolicyScreen from './screens/ViewInsurancePolicyScreen.js';
import ViewHearingAidsScreen from './screens/ViewHearingAidsScreen.js';
import EditHearingAidScreen from './screens/EditHearingAidScreen.js';
import { logEvent } from './global-functions/analyticsService.js';
import analytics from '@react-native-firebase/analytics';
import { getSessionId } from './global-functions/sessionManager.js';
import ScribeViewScreen from './screens/ScribeViewScreen.js';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

function DefaultAndroidBackIcon({ tintColor }) {
  return (
    <View style={[styles.headerContainer, styles.headerContainerLeft]}>
      <Icon
        name="AntDesign/arrowleft"
        size={24}
        color={tintColor}
        style={[styles.headerIcon, styles.headerIconLeft]}
      />
    </View>
  );
}

function DefaultDrawerIcon({ tintColor }) {
  const navigation = useNavigation();
  return (
    <Touchable
      onPress={() => navigation.toggleDrawer()}
      style={[styles.headerContainer, styles.headerContainerLeft]}
    >
      <Icon
        name="EvilIcons/navicon"
        size={27}
        color={tintColor}
        style={[styles.headerIcon, styles.headerIconLeft]}
      />
    </Touchable>
  );
}

function BottomTabNavigator() {
  const theme = useTheme();
  const { sdk } = useSendbirdChat();

  const totalUnreadMessages = useTotalUnreadMessageCount(sdk);
  Notifications.setBadgeCountAsync(totalUnreadMessages);

  const Constants = GlobalVariables.useValues();
  const setGlobalVariableValue = GlobalVariables.useSetValue();
  const { sendbird_chat_enabled } = Constants;
  const tabBarOrDrawerIcons = {
    HomeScreen: 'Feather/home',
    ScheduleScreen: 'AntDesign/calendar',
    PatientScreen: 'FontAwesome/user-o',
    InboxScreen: 'AntDesign/message1',
    TaskScreen: 'MaterialCommunityIcons/format-list-bulleted',
    ChatScreen: 'MaterialCommunityIcons/format-list-bulleted',

  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: palettes.App.White },
        headerTintColor: theme.colors.branding.secondary,
        headerTitleStyle: StyleSheet.compose(theme.typography.headline5, {
          fontFamily: 'Inter_700Bold',
        }),
        tabBarActiveBackgroundColor: palettes.Green[50],
        tabBarActiveTintColor: theme.colors.branding.secondary,
        tabBarInactiveTintColor: theme.colors.text.light,
        tabBarLabelStyle: StyleSheet.compose(theme.typography.caption, {
          fontFamily: 'Inter_600SemiBold',
          lineHeight: 16,
        }),
        tabBarShowLabel: true,
        tabBarStyle: { borderTopColor: 'transparent' },
      }}
    >
      {/* <Tab.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          headerLeft: ({ tintColor, canGoBack }) =>
            canGoBack ? null : (
              <View
                style={[styles.headerContainer, styles.headerContainerLeft]}
              >
                <Icon
                  name="Feather/home"
                  size={Platform.OS === 'ios' ? 21 : 24}
                  color={tintColor}
                  style={[styles.headerIcon, styles.headerIconLeft]}
                />
              </View>
            ),
          headerTitle: 'Home',
          headerTitleAlign: 'center',
          tabBarIcon: ({ focused, color }) => (
            <Icon
              name="Feather/home"
              size={24}
              color={
                focused
                  ? theme.colors.branding.secondary
                  : theme.colors.text.light
              }
            />
          ),
          tabBarLabel: 'Home',
          title: 'Home',
        }}
      /> */}
      <Tab.Screen
        name="ScheduleScreen"
        component={ScheduleScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Icon
              name="AntDesign/calendar"
              size={24}
              color={
                focused
                  ? theme.colors.branding.secondary
                  : theme.colors.text.light
              }
            />
          ),
          tabBarLabel: 'Schedule',
          title: 'Schedule',
        }}
      />
      <Tab.Screen
        name="PatientScreen"
        component={PatientScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Icon
              name="FontAwesome/user-o"
              size={24}
              color={
                focused
                  ? theme.colors.branding.secondary
                  : theme.colors.text.light
              }
            />
          ),
          tabBarLabel: 'Patients',
          title: 'PatientScreen',
        }}
      />
      <Tab.Screen
        name="InboxScreen"
        component={InboxScreen}
        options={{
          headerTitle: 'Scheduling',
          tabBarIcon: ({ focused, color }) => (
            <Icon
              name="AntDesign/message1"
              size={24}
              color={
                focused
                  ? theme.colors.branding.secondary
                  : theme.colors.text.light
              }
            />
          ),
          tabBarLabel: 'Messages',
          title: 'Inbox',
        }}
      />
      <Tab.Screen
        name="TaskScreen"
        component={TaskScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Icon
              name="MaterialCommunityIcons/format-list-bulleted"
              size={24}
              color={
                focused
                  ? theme.colors.branding.secondary
                  : theme.colors.text.light
              }
            />
          ),
          tabBarLabel: 'Task',
          title: 'TaskScreen',
        }}
      />
      {sendbird_chat_enabled &&
        <Tab.Screen
          name="ChatScreen"
          component={ChatScreen}
          options={{
            tabBarBadge: totalUnreadMessages === '0' ? undefined : totalUnreadMessages,
            tabBarIcon: ({ focused, color }) => (
              <Icon
                name="MaterialIcons/chat"
                size={24}
                color={
                  focused
                    ? theme.colors.branding.secondary
                    : theme.colors.text.light
                }
              />
            ),
            tabBarLabel: 'Chat',
            title: 'ChatScreen',
          }}
        />
      }
    </Tab.Navigator>
  );
}

function DrawerNavigator() {
  const theme = useTheme();

  const Constants = GlobalVariables.useValues();

  const tabBarOrDrawerIcons = { FilterAndSortScreen: '' };

  return (
    <Drawer.Navigator
      screenOptions={{
        drawerActiveTintColor: theme.colors.branding.primary,
        drawerInactiveTintColor: theme.colors.text.light,
        drawerLabelStyle: theme.typography.subtitle2,
        drawerPosition: 'right',
        drawerStyle: {
          backgroundColor: theme.colors.background.base,
          width: '100%',
        },
        drawerType: 'slide',
        headerLeft: () => null,
        headerMode: 'screen',
        headerRight: ({ tintColor }) => (
          <DefaultDrawerIcon tintColor={tintColor} />
        ),
        headerShown: false,
        headerStyle: {
          backgroundColor: theme.colors.background.base,
          borderBottomColor: 'transparent',
        },
        headerTintColor: theme.colors.text.strong,
        headerTitleStyle: theme.typography.headline5,
      }}
    >
      <Drawer.Screen
        name="FilterAndSortScreen"
        component={FilterAndSortScreen}
        options={{
          title: 'Filter and Sort',
        }}
      />
    </Drawer.Navigator>
  );
}

function StackNavigator() {
  const theme = useTheme();

  const Constants = GlobalVariables.useValues();

  return (
    <Stack.Navigator
      initialRouteName="SplashScreen"
      screenOptions={{
        cardStyle: { flex: 1 },
        headerBackImage:
          Platform.OS === 'android' ? DefaultAndroidBackIcon : null,
        headerStyle: {
          backgroundColor: theme.colors.background.base,
          borderBottomColor: 'transparent',
        },
        headerTintColor: theme.colors.text.strong,
        headerTitleStyle: theme.typography.headline5,
      }}
    >
      <Stack.Screen
        name="ForgotPasswordScreen"
        component={ForgotPasswordScreen}
        options={{
          headerShown: false,
          title: 'ForgotPassword',
        }}
      />
      <Stack.Screen
        name="SignInScreen"
        component={SignInScreen}
        options={{
          headerShown: false,
          title: 'SignIn',
        }}
      />

      <Stack.Screen
        name="SplashScreen"
        component={SplashScreen}
        options={{
          headerShown: false,
          title: 'Splash',
        }}
      />
    </Stack.Navigator>
  );
}

export default function RootAppNavigator() {
  const theme = useTheme();
  const { sdk, currentUser } = useSendbirdChat();
  const appState = useRef(AppState.currentState);
  const isColdStart = useRef(true);

  const routeNameRef = React.useRef();
  
  const Constants = GlobalVariables.useValues();
  React.useEffect(() => {
    const unsubscribe = onForeground();
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    const sub = AppState.addEventListener("change", async () => {

      if (state === "active") {
        const sdk = GetSendbirdSDK();
        if (sdk && sdk.connectionState !== "OPEN") {
          await sdk.connect(USER_ID);
        }
      }

      const count = await sdk.groupChannel.getTotalUnreadMessageCount();
      // console.log("==== count : ", count)

      // Notifications.setBadgeCountAsync(0);
    });
    return () => sub.remove();
  }, []);

  React.useEffect(() => {
    try {

      const subscription = AppState.addEventListener(
        'change',
        async (nextAppState) => {

          if (
            appState.current.match(/inactive|background/) &&
            nextAppState === 'active'
          ) {
            console.log("=======app_open",isColdStart.current)
            await logEvent('app_open', {
              start_type: isColdStart.current ? 'cold' : 'warm',
              session_id: getSessionId(),
            });
  
            isColdStart.current = false;
          }
  
          appState.current = nextAppState;
        }
      );
      return () => subscription.remove();

    } catch (error) {
      console.log("=== error : ", error)
    }
   

  }, []);

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: theme.colors.background.base,
        },
      }}
      linking={LinkingConfiguration}
      navigationInChildEnabled={true}
      onReady={() => {
    routeNameRef.current = navigationRef.getCurrentRoute().name;
  }}
  onStateChange={async () => {
    const currentRouteName = navigationRef.getCurrentRoute().name;
    if (routeNameRef.current !== currentRouteName) {

      await analytics().logScreenView({
        screen_name: currentRouteName,
        screen_class: currentRouteName,
      });

      await logEvent('screen_view', {
        screen_name: currentRouteName,
        screen_class: currentRouteName,
      });
    }

    routeNameRef.current = currentRouteName;
  }}
    >
      <Stack.Navigator
        initialRouteName="StackNavigator"
        screenOptions={{
          cardStyle: { flex: 1 },
          headerBackImage:
            Platform.OS === 'android' ? DefaultAndroidBackIcon : null,
          headerShown: false,
          headerStyle: {
            backgroundColor: theme.colors.background.base,
            borderBottomColor: 'transparent',
          },
          headerTintColor: theme.colors.text.strong,
          headerTitleStyle: theme.typography.headline5,
        }}
      >
        <Stack.Screen
          name="WelcomeScreen"
          component={WelcomeScreen}
          options={{
            headerShown: false,
            title: 'Welcome',
          }}
        />
        <Stack.Screen
          name="SignInScreen"
          component={SignInScreen}
          options={{
            headerShown: false,
            title: 'SignIn',
          }}
        />
        <Stack.Screen
          name="AppSettingsScreen"
          component={AppSettingsScreen}
          options={{
            headerTitle: 'Setting',
            title: 'App Settings',
          }}
        />
        <Stack.Screen
          name="CaptureVisitScreen"
          component={CaptureVisitScreen}
          options={{
            title: 'CaptureVisit',
          }}
        />
        <Stack.Screen
          name="ChatScreen"
          component={ChatScreen}
          options={{
            title: 'Chat',
            
          }}
        />
        <Stack.Screen
          name="ChangePasswordScreen"
          component={ChangePasswordScreen}
          options={{
            title: 'ChangePassword',
          }}
        />
        <Stack.Screen
          name="ChartNotesScreen"
          component={ChartNotesScreen}
          options={{
            title: 'ChartNotes',
          }}
        />
        <Stack.Screen
          name="CheckInScreen"
          component={CheckInScreen}
          options={{
            title: 'CheckIn',
          }}
        />
        <Stack.Screen
          name="EditProfileScreen"
          component={EditProfileScreen}
          options={{
            title: 'EditProfile',
          }}
        />
        <Stack.Screen
          name="InboxBackupScreen"
          component={InboxBackupScreen}
          options={{
            title: 'Inbox Backup',
          }}
        />
        <Stack.Screen
          name="InboxThreadsScreen"
          component={InboxThreadsScreen}
          options={{
            title: 'InboxThreads',
          }}
        />
        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen}
          options={{
            title: 'login',
          }}
        />
        <Stack.Screen
          name="NewNoteScreen"
          component={NewNoteScreen}
          options={{
            title: 'NewNote',
          }}
        />
        <Stack.Screen
          name="NewPatientScreen"
          component={NewPatientScreen}
          options={{
            headerShown: false,
            title: 'NewPatient',
          }}
        />
        <Stack.Screen
          name="EditPatientScreen"
          component={EditPatientScreen}
          options={{
            headerShown: false,
            title: 'EditPatient',
          }}
        />
        
        <Stack.Screen
          name="NewTaskScreen"
          component={NewTaskScreen}
          options={{
            title: 'NewTask',
          }}
        />
        <Stack.Screen
          name="ViewTaskScreen"
          component={ViewTaskScreen}
          options={{
            title: 'ViewTask',
          }}
        />
        <Stack.Screen
          name="NotificationScreen"
          component={NotificationScreen}
          options={{
            title: 'Notification',
          }}
        />
        <Stack.Screen
          name="NotificationPreferenceScreen"
          component={NotificationPreferenceScreen}
          options={{
            title: 'NotificationPreference',
          }}
        />
        <Stack.Screen
          name="PatientDetailsScreen"
          component={PatientDetailsScreen}
          options={{
            title: 'Patient Details',
          }}
        />
        <Stack.Screen
          name="GroupChannelCreate"
          component={GroupChannelCreateScreen}
          options={{
            title: 'Group Channel Create',
          }}
        />
        <Stack.Screen
          name="GroupChannelList"
          component={GroupChannelListScreen}
          options={{
            title: 'Group Channel List',
          }}
        />
<Stack.Screen
          name="GroupChannel"
          component={GroupChannelScreen}
          options={{
            title: 'Group Channel',
          }}
        />

<Stack.Screen
          name="GroupChannelBannedUsers"
          component={GroupChannelBannedUsersScreen}
          options={{
            title: 'Group Channel Banned Users',
          }}
        />
        <Stack.Screen
          name="GroupChannelInvite"
          component={GroupChannelInviteScreen}
          options={{
            title: 'Group Channel Invite',
          }}
        />
        <Stack.Screen
          name="GroupChannelMembers"
          component={GroupChannelMembersScreen}
          options={{
            title: 'Group Channel Members',
          }}
        />
        <Stack.Screen
          name="GroupChannelModeration"
          component={GroupChannelModerationScreen}
          options={{
            title: 'Group Channel Moderation',
          }}
        />
        <Stack.Screen
          name="GroupChannelMutedMembers"
          component={GroupChannelMutedMembersScreen}
          options={{
            title: 'Group Channel Muted Members',
          }}
        />
        <Stack.Screen
          name="GroupChannelNotifications"
          component={GroupChannelNotificationsScreen}
          options={{
            title: 'Group Channel Notifications',
          }}
        />
        <Stack.Screen
          name="GroupChannelOperators"
          component={GroupChannelOperatorsScreen}
          options={{
            title: 'Group Channel Operators',
          }}
        />
        <Stack.Screen
          name="GroupChannelRegisterOperator"
          component={GroupChannelRegisterOperatorScreen}
          options={{
            title: 'Group Channel Register Operator',
          }}
        />
        <Stack.Screen
          name="ScribeViewScreen"
          component={ScribeViewScreen}
          options={{
            title: 'Scribe View',
          }}
        />
        <Stack.Screen
          name="GroupChannelSettings"
          component={GroupChannelSettingsScreen}
          options={{
            title: 'Group Channel Settings',
          }}
        />
        <Stack.Screen
          name="ScribeHistoryScreen"
          component={ScribeHistoryScreen}
          options={{
            title: 'Scribe History',
          }}
        />
        <Stack.Screen
          name="PersonalClinicEventScreen"
          component={PersonalClinicEventScreen}
          options={{
            title: 'PersonalClinicEvent',
          }}
        />
        <Stack.Screen
          name="ScanDocumentScreen"
          component={ScanDocumentScreen}
          options={{
            title: 'ScanDocumentScreen',
          }}
        />
        <Stack.Screen
          name="ScheduleAppntScreen"
          component={ScheduleAppntScreen}
          options={{
            title: 'ScheduleAppnt',
          }}
        />
        <Stack.Screen
          name="TeleHealthScreen"
          component={TeleHealthScreen}
          options={{
            title: 'TeleHealth',
          }}
        />
         <Stack.Screen
          name="ViewBillingScreen"
          component={ViewBillingScreen}
          options={{
            title: 'ViewBilling',
          }}
        />
         <Stack.Screen
          name="ViewInsurancePolicyScreen"
          component={ViewInsurancePolicyScreen}
          options={{
            title: 'ViewBilling',
          }}
        />
        <Stack.Screen
          name="ViewHearingAidsScreen"
          component={ViewHearingAidsScreen}
          options={{
            title: 'ViewHearingAids',
          }}
        />
        <Stack.Screen
          name="EditHearingAidScreen"
          component={EditHearingAidScreen}
          options={{
            title: 'EditHearingAid',
          }}
        />
        <Stack.Screen
          name="UpcomingAppointmentsScreen"
          component={UpcomingAppointmentsScreen}
          options={{
            title: 'UpcomingAppointments',
          }}
        />
        <Stack.Screen
          name="WizardViewScreen"
          component={WizardViewScreen}
          options={{
            title: 'wizardView',
          }}
        />
        <Stack.Screen
          name="BottomTabNavigator"
          component={BottomTabNavigator}
          options={{
            headerShown: false,
            title: 'Bottom Tab Navigator',
          }}
        />
        <Stack.Screen
          name="DrawerNavigator"
          component={DrawerNavigator}
          options={{
            title: 'Drawer Navigator',
          }}
        />
        <Stack.Screen
          name="StackNavigator"
          component={StackNavigator}
          options={{
            title: 'Stack Navigator',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    ...Platform.select({
      ios: null,
      default: {
        marginVertical: 3,
        marginHorizontal: 11,
      },
    }),
  },
  headerContainerLeft: Platform.select({ ios: { marginLeft: 8 } }),
  headerIcon: Platform.select({
    ios: {
      marginVertical: 12,
      resizeMode: 'contain',
      transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }],
    },
    default: {
      margin: 3,
      resizeMode: 'contain',
      transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }],
    },
  }),
  headerIconLeft: Platform.select({ ios: { marginRight: 6 } }),
});
