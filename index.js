import { registerRootComponent } from 'expo';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Logger, parseSendbirdNotification, SendbirdChatSDK } from "@sendbird/uikit-utils";
import analytics from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';

export const logError = (context= '', error ) => {
  // console.log("====== crashlytics context and error", context, error)
  crashlytics().recordError(
    new Error(`${context}: ${error}`)
  );
};

analytics().setAnalyticsCollectionEnabled(true);

// Background handler (MUST be in index.js)
if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('default', {
    name: 'High Priority Notifications',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
    sound: 'default',
  });

  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log("Message handled !", remoteMessage);

    // if (remoteMessage?.notification) {
    //   if(Number(remoteMessage?.data?.notification_type) === 1) {
    //     const type = Number(remoteMessage?.data?.notification_type);

    //     if (type === 1) {
    //       setTimeout(() => {
    //         navigate('PatientDetailsScreen', {
    //           id: remoteMessage?.data?.patient_id,
    //         });
    //       }, 500);
    //     }
    //     // Alert.alert(
    //     //   remoteMessage?.notification?.title,
    //     //   remoteMessage?.notification?.body,
    //     //   [
    //     //     {
    //     //       text: 'Cancel',
    //     //       onPress: () => console.log('Cancel Pressed'),
    //     //       style: 'cancel', // iOS bolds "Cancel"
    //     //     },
    //     //     {
    //     //       text: 'Open Patient',
    //     //       onPress: () => {
    //     //         navigate(
    //     //           'PatientDetailsScreen',
    //     //           {
    //     //             id: remoteMessage?.data?.patient_id,
    //     //           },
    //     //           { pop: true }
    //     //         );
    //     //       }, // 👈 navigate back
    //     //     },
    //     //   ],
    //     //   { cancelable: true }
    //     // );
    //   }

    // } else if (remoteMessage?.data) {

    const sendbird = parseSendbirdNotification(remoteMessage?.data);
    // console.log("==== sendbird :",sendbird)

    const channelUrl = sendbird?.channel.channel_url;
    if (!channelUrl) {
      console.log("❌ channelUrl missing");
    } else {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: remoteMessage.data?.message,
          body: sendbird?.message,
          // data: remoteMessage.data,
          sound: 'default',
          data: {
            channelUrl: channelUrl,
          },
        },
        trigger: null, // immediate
      });
    }

    // }
  });

}


// messaging().setBackgroundMessageHandler(async (message) => {
//   const isSendbirdNotification = Boolean(message.data.sendbird);
//   if (!isSendbirdNotification) return;

//   const payload = JSON.parse(message.data.sendbird);
// console.log("===== payload : ",payload)

// const sendbird = parseSendbirdNotification(remoteMessage?.data);
// console.log("==== sendbird :",sendbird)

// const channelUrl = sendbird?.channel.channel_url;
// console.log("==== channelUrl :",channelUrl)

// // console.log("===== navigationRef.getCurrentRoute()?.name : ", navigationRef.getCurrentRoute()?.name)
// navigationRef.current?.navigate('GroupChannel', {channelUrl});


// The following is required for compatibility with Android 8.0 (API level 26)
// and higher. Refer to Notifee's reference page for more information.
// const channelId = await notifee.createChannel({
//   id: 'NOTIFICATION_CHANNEL_ID',
//   name: 'NOTIFICATION_CHANNEL_NAME',
//   importance: AndroidImportance.HIGH,
// });

// await notifee.displayNotification({
//   id: message.messageId,
//   title: 'New message has arrived!',
//   subtitle: `Number of unread messages: ${payload.unread_message_count}`,
//   body: payload.message,
//   data: payload,
//   android: {
//     channelId,
//     smallIcon: NOTIFICATION_ICON_RESOURCE_ID,
//     importance: AndroidImportance.HIGH,
//   },
// });
// })

registerRootComponent(App);
