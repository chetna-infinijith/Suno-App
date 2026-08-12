import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as GlobalVariables from '../config/GlobalVariableContext';
import { useNavigation } from '@react-navigation/native';
import { GetSendbirdSDK } from '../App';
import * as Notifications from "expo-notifications";
import messaging from '@react-native-firebase/messaging';
import { checkInternetAndProceed } from './InternetConnection';

export const NotificationPreferenceView = () => {
  const navigation = useNavigation();
  const globalValues = GlobalVariables.useValues();
  const { UserInfo, senderID, AUTH_HEADER } = globalValues;
  const setGlobalVariableValue = GlobalVariables.useSetValue();
  const USER_ID = senderID;
  const [isLoading, setIsLoading] = useState(false);
  const [chat_notification, setChat_notification] = useState(true);
  const sdk = GetSendbirdSDK();

  useEffect(() => {
    const checkPushStatus = async () => {
      try {
        if (!sdk) return;

        const pushStatus = await sdk.getPushTriggerOption();
        console.log('Push status:', pushStatus);
        if (pushStatus == 'all') {
          setChat_notification(true)
        } else {
          setChat_notification(false)
        }

      } catch (error) {
        console.log('Error getting push status:', error);
      }
    };

    checkPushStatus();
  }, []);

  const [preferences, setPreferences] = useState({
    touchpoint_notifications_enabled:
      UserInfo?.touchpoint_notifications_enabled ?? true,
    user_reminder_notifications_enabled:
      UserInfo?.user_reminder_notifications_enabled ?? true,
    payment_request_notifications_enabled:
      UserInfo?.payment_request_notifications_enabled ?? true,
    task_is_assigned_notifications_enabled:
      UserInfo?.task_is_assigned_notifications_enabled ?? true,
    onboarding_form_notifications_enabled:
      UserInfo?.onboarding_form_notifications_enabled ?? true,
    patient_arrived_sound_enabled:
      UserInfo?.patient_arrived_sound_enabled ?? true,
    chat_sound_notification: UserInfo?.chat_sound_notification ?? true,
    task_updates_notification:
      UserInfo?.user_preferences?.staff_tasks?.task_updates_notification ??
      true,
    task_comments_notification:
      UserInfo?.user_preferences?.staff_tasks?.task_comments_notification ??
      true,
    include_comment_text:
      UserInfo?.user_preferences?.staff_tasks?.include_comment_text ?? true,
  });

  const togglePreference = key => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const buildPayload = () => {
    const basePayload = {
      // Top-level user fields
      first_name: UserInfo?.first_name,
      last_name: UserInfo?.last_name,
      suffix: UserInfo?.suffix,
      npi: UserInfo?.npi,
      role: UserInfo?.role,
      color: UserInfo?.color,
      scheduler_select_all_staff: UserInfo?.scheduler_select_all_staff,
      scheduler_persist_per_clinic: UserInfo?.scheduler_persist_per_clinic,
      title: UserInfo?.title,
      email_signature: UserInfo?.email_signature || '',
      sync_with_google_calendar: UserInfo?.sync_with_google_calendar,
      native_pdf_tables_enabled: UserInfo?.native_pdf_tables_enabled,
      quick_sin_default_configuration:
        UserInfo?.quick_sin_default_configuration,

      // Notification preferences (top-level)
      touchpoint_notifications_enabled:
        preferences.touchpoint_notifications_enabled,
      user_reminder_notifications_enabled:
        preferences.user_reminder_notifications_enabled,
      payment_request_notifications_enabled:
        preferences.payment_request_notifications_enabled,
      task_is_assigned_notifications_enabled:
        preferences.task_is_assigned_notifications_enabled,
      onboarding_form_notifications_enabled:
        preferences.onboarding_form_notifications_enabled,
      patient_arrived_sound_enabled: preferences.patient_arrived_sound_enabled,
      chat_sound_notification: preferences.chat_sound_notification,

      // Other user fields
      license_number: UserInfo?.license_number,
      summary_paragraph_font_size: UserInfo?.summary_paragraph_font_size || 16,
      speech_audiometry_presentation: UserInfo?.speech_audiometry_presentation,
      speech_word_recognition_presentation:
        UserInfo?.speech_word_recognition_presentation,
      speech_speech_in_noise_method: UserInfo?.speech_speech_in_noise_method,
      auto_generate_summary: UserInfo?.auto_generate_summary ?? true,
      auto_generate_diagnosis: UserInfo?.auto_generate_diagnosis ?? true,
      noah_auto_sync: UserInfo?.noah_auto_sync ?? true,

      // Reporting preferences
      pure_tone_audiogram_report_selected:
        UserInfo?.pure_tone_audiogram_report_selected ?? true,
      speech_audiometry_word_recognition_report_selected:
        UserInfo?.speech_audiometry_word_recognition_report_selected ?? true,
      tympanometry_report_selected:
        UserInfo?.tympanometry_report_selected ?? true,
      acoustic_reflex_decay_report_selected:
        UserInfo?.acoustic_reflex_decay_report_selected ?? true,
      speech_in_noise_report_selected:
        UserInfo?.speech_in_noise_report_selected ?? true,
      otoacoustic_emissions_report_selected:
        UserInfo?.otoacoustic_emissions_report_selected ?? true,
      switch_audiogram_orientation:
        UserInfo?.switch_audiogram_orientation ?? false,

      // User preferences structure
      user_preferences: {
        staff_tasks: {
          task_updates_notification: preferences.task_updates_notification,
          task_comments_notification: preferences.task_comments_notification,
          include_comment_text: preferences.include_comment_text,
        },
        reporting: {
          pure_tone_audiogram_report_selected:
            UserInfo?.user_preferences?.reporting
              ?.pure_tone_audiogram_report_selected ?? true,
          speech_audiometry_word_recognition_report_selected:
            UserInfo?.user_preferences?.reporting
              ?.speech_audiometry_word_recognition_report_selected ?? true,
          tympanometry_report_selected:
            UserInfo?.user_preferences?.reporting
              ?.tympanometry_report_selected ?? true,
          acoustic_reflex_decay_report_selected:
            UserInfo?.user_preferences?.reporting
              ?.acoustic_reflex_decay_report_selected ?? true,
          speech_in_noise_report_selected:
            UserInfo?.user_preferences?.reporting
              ?.speech_in_noise_report_selected ?? true,
          otoacoustic_emissions_report_selected:
            UserInfo?.user_preferences?.reporting
              ?.otoacoustic_emissions_report_selected ?? true,
          switch_audiogram_orientation:
            UserInfo?.user_preferences?.reporting
              ?.switch_audiogram_orientation ?? false,
          auto_generate_summary:
            UserInfo?.user_preferences?.reporting?.auto_generate_summary ??
            true,
          auto_generate_diagnosis:
            UserInfo?.user_preferences?.reporting?.auto_generate_diagnosis ??
            true,
          noah_auto_sync:
            UserInfo?.user_preferences?.reporting?.noah_auto_sync ?? true,
          speech_audiometry: {
            presentation:
              UserInfo?.user_preferences?.reporting?.speech_audiometry
                ?.presentation,
          },
          word_recognition: {
            presentation:
              UserInfo?.user_preferences?.reporting?.word_recognition
                ?.presentation,
          },
          speech_in_noise: {
            method:
              UserInfo?.user_preferences?.reporting?.speech_in_noise?.method,
            quick_sin_default_configuration:
              UserInfo?.user_preferences?.reporting?.speech_in_noise
                ?.quick_sin_default_configuration,
          },
          summary: {
            paragraph_font_size:
              UserInfo?.user_preferences?.reporting?.summary
                ?.paragraph_font_size || 16,
          },
        },
        email_signature: UserInfo?.user_preferences?.email_signature || '',
      },
    };
    // console.log('Sending PATCH request with payload:', JSON.stringify(basePayload, null, 2));
    return basePayload;
  };
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

      console.log("====== enabled :", enabled)
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

      // console.log("FCM Token:", token);

      // return token;

    } catch (error) {
      console.log("Push Setup Error:", error);
      return null;
    }
  };
  const handleSave = async () => {
    try {
      const isConnected = await checkInternetAndProceed();
        if (!isConnected) {
          return;
        }
      setIsLoading(true);
      console.log("===== chat_notification", chat_notification)
      if (!chat_notification) {
        try {
          await sdk.setPushTriggerOption('off');
          if (Platform.OS === 'ios') {

            await sdk.unregisterAPNSPushTokenAllForCurrentUser();
          } else {
            await sdk.unregisterFCMPushTokenAllForCurrentUser();
          }
        } catch (error) {

        }

      } else {
        try {


          await sdk.setPushTriggerOption('all');
          const { status: existingStatus } = await Notifications.getPermissionsAsync();

          let finalStatus = existingStatus;

          // 2️⃣ If not granted, request permission
          if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
          }
          console.log("====== finalStatus :", finalStatus)
          if (finalStatus !== 'granted') {
            setupPushNotifications()
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
              // const token = await messaging().getToken();
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

      const payload = buildPayload();
      const url = `${globalValues.API_BASE_URL}/auth/users/${USER_ID}/`;
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: AUTH_HEADER,
        },
        body: JSON.stringify(payload),
      });
      const responseData = await response.json();
      // console.log('Update successful:::::', responseData,AUTH_HEADER,JSON.stringify(payload));

      if (response.ok) {
        // console.log('Update successful:', responseData);
        setGlobalVariableValue({ key: 'UserInfo', value: responseData });
        Alert.alert(
          'Success',
          'Your preferences settings have been updated successfully.',
          [{
            text: 'OK', onPress: () => {
              setupPushNotifications()
              navigation.goBack()
            }
          }]
        );


      } else {
        throw new Error('Failed to update Preferences');
      }
    } catch (err) {
      console.log('Error updating Preferences:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const CustomToggle = ({ value, onToggle, disabled }) => {
    const trackColor = { false: '#E0E0E0', true: '#066858' };
    const thumbColor = '#FFFFFF';

    return (
      <TouchableOpacity
        onPress={onToggle}
        disabled={disabled}
        activeOpacity={0.7}
        style={[
          styles.toggleContainer,
          { backgroundColor: value ? trackColor.true : trackColor.false },
          disabled && styles.toggleDisabled,
        ]}
      >
        <View
          style={[
            styles.toggleThumb,
            { backgroundColor: thumbColor },
            value ? styles.toggleThumbOn : styles.toggleThumbOff,
          ]}
        />
      </TouchableOpacity>
    );
  };

  const NotificationItem = ({ title, description, prefKey, icon, value }) => (
    <View style={styles.notificationItem}>
      <View style={styles.notificationHeader}>
        {icon && (
          <MaterialIcons
            name={icon}
            size={24}
            color="#066858"
            style={styles.icon}
          />
        )}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {description && <Text style={styles.description}>{description}</Text>}
        </View>
      </View>
      <CustomToggle
        value={value}
        onToggle={async () => {
          if (prefKey === 'chat_notification') {
            setChat_notification(!chat_notification)
          } else {
            togglePreference(prefKey)
          }
        }
        }
        disabled={isLoading}
      />
    </View>
  );

  const SectionHeader = ({ title, icon }) => (
    <View style={styles.sectionHeader}>
      <MaterialIcons name={icon} size={24} color="#333" />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Email Notifications Section */}
        <View style={styles.section}>
          <SectionHeader title="Email Notifications" icon="email" />

          <NotificationItem
            title="Touchpoint Assignment"
            description="Send Email notification when a touchpoint is assigned to me."
            prefKey="touchpoint_notifications_enabled"
            icon="assignment"
            value={preferences.touchpoint_notifications_enabled}
          />

          <NotificationItem
            title="Daily Reminders"
            description="Send daily email reminder for assigned touchpoints and tasks."
            prefKey="user_reminder_notifications_enabled"
            icon="notifications"
            value={preferences.user_reminder_notifications_enabled}
          />

          <NotificationItem
            title="Payment Completion"
            description="Send Email notification when an online payment request is completed."
            prefKey="payment_request_notifications_enabled"
            icon="payment"
            value={preferences.payment_request_notifications_enabled}
          />

          <NotificationItem
            title="Task Assignment"
            description="Send Email notification when a task is assigned to me."
            prefKey="task_is_assigned_notifications_enabled"
            icon="task"
            value={preferences.task_is_assigned_notifications_enabled}
          />

          <NotificationItem
            title="Onboarding Forms"
            description="Send Email notification when patient submits all onboarding forms requested by me."
            prefKey="onboarding_form_notifications_enabled"
            icon="description"
            value={preferences.onboarding_form_notifications_enabled}
          />
        </View>

        {/* App Notifications Section */}
        <View style={styles.section}>
          <SectionHeader title="App Notifications" icon="smartphone" />

          <NotificationItem
            title="Task Updates"
            description="Get App notification on task updates."
            prefKey="task_updates_notification"
            icon="update"
            value={preferences.task_updates_notification}
          />

          <NotificationItem
            title="Task Comments"
            description="Get App and Email notification on task comments."
            prefKey="task_comments_notification"
            icon="comment"
            value={preferences.task_comments_notification}
          />

          <NotificationItem
            title="Include Comment Text"
            description="Include comment text in emails"
            prefKey="include_comment_text"
            icon="format-quote"
            value={preferences.include_comment_text}
          />
        </View>

        {/* Sound Notifications Section */}
        <View style={styles.section}>
          <SectionHeader title="Sound Notifications" icon="volume-up" />

          <NotificationItem
            title="Patient Arrived"
            description="Enable sound notifications for patient arrived."
            prefKey="patient_arrived_sound_enabled"
            icon="person-add"
            value={preferences.patient_arrived_sound_enabled}
          />

          {/* <NotificationItem
            title="New Chat Messages"
            description="Enable sound notifications for new chat messages."
            prefKey="chat_sound_notification"
            icon="chat"
            value={preferences.chat_sound_notification}
          /> */}

          <NotificationItem
            title="Chat Messages"
            description="Enable sound notifications for chat messages."
            prefKey="chat_notification"
            icon="chat"
            value={chat_notification}
          />

        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Preferences</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 12,
  },
  icon: {
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  // Custom Toggle Styles
  toggleContainer: {
    width: 48,
    height: 27,
    borderRadius: 14,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  toggleThumbOn: {
    alignSelf: 'flex-end',
  },
  toggleThumbOff: {
    alignSelf: 'flex-start',
  },
  toggleDisabled: {
    opacity: 0.5,
  },
  // Save Button Styles
  saveButton: {
    backgroundColor: '#066858',
    borderRadius: 12,
    paddingVertical: 16,
    marginVertical: 24,
    alignItems: 'center',
    shadowColor: '#066858',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: '#9E9E9E',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NotificationPreferenceView;
