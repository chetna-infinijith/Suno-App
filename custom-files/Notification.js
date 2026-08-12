import { Platform } from "react-native";
// import * as TaskManager from "expo-task-manager";
import * as Notifications from "expo-notifications";

import {
  isSendbirdNotification,
  parseSendbirdNotification,
} from "@sendbird/uikit-utils";

import { navigationRef } from "../NavigationService";

export const runAfterAppReady = (callback) => {
    const id = setInterval(async () => {
      if (
        navigationRef.isReady() &&
        authManager.hasAuthentication() &&
        GetSendbirdSDK()
      ) {
        const sdk = GetSendbirdSDK();
  
        if (sdk.connectionState === "OPEN") {
          clearInterval(id);
          callback(sdk, navigationActions);
        }
      }
    }, 250);
  };

  
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const onForeground = () => {
  const onNotification = (notification) => {
    console.log("==== onNotification", notification,   JSON.stringify(notification?.notification?.request?.content))
  

    const data =
      notification?.notification?.request?.trigger?.payload;
      // console.log("==== data :", JSON.stringify(data))

    if (data && isSendbirdNotification(data)) {

      const sendbird = parseSendbirdNotification(data);
      // console.log("==== data :",sendbird)

    //   runAfterAppReady(async (_, actions) => {
        const channelUrl = sendbird.channel.channel_url;
        if (!channelUrl) {
          console.log("❌ channelUrl missing");
          return;
        }
        // console.log("==== channelUrl :",channelUrl)

        // console.log("===== navigationRef.getCurrentRoute()?.name : ", navigationRef.getCurrentRoute()?.name)
        navigationRef.current?.navigate('GroupChannel', {channelUrl});

        // if (Routes.Home === navigationRef.getCurrentRoute()?.name) {
        //   actions.push(Routes.GroupChannelTabs, { channelUrl });
        // } else {
        //   actions.navigate(Routes.GroupChannel, { channelUrl });
        // }
    //   });
    } else {
      const data =
      notification?.notification?.request?.content;
      // console.log("==== data :", JSON.stringify(data))
      if (data) {

        const channelUrl = data?.data?.channelUrl;
        if (!channelUrl) {
          console.log("❌ channelUrl missing");
          return;
        }

          console.log("==== channelUrl :",channelUrl)
  
          // console.log("===== navigationRef.getCurrentRoute()?.name : ", navigationRef.getCurrentRoute()?.name)
          navigationRef.current?.navigate('GroupChannel', {channelUrl});
  
          // if (Routes.Home === navigationRef.getCurrentRoute()?.name) {
          //   actions.push(Routes.GroupChannelTabs, { channelUrl });
          // } else {
          //   actions.navigate(Routes.GroupChannel, { channelUrl });
          // }
      //   });
      }
    }
  };

  const checkAppOpenedWithNotification = async () => {
    const response =
      await Notifications.getLastNotificationResponseAsync();
      console.log("===== checkAppOpenedWithNotification :", response)
    if (response) {
      onNotification(response);
    }
  };

  checkAppOpenedWithNotification();

  return Notifications.addNotificationResponseReceivedListener(
    onNotification
  ).remove;
};

if (Platform.OS === "android") {
  // Set notification channel
  const channelId = "default";
  Notifications.setNotificationChannelAsync(channelId, {
    name: "Default Channel",
    importance: Notifications.AndroidImportance.HIGH,
  });

  // Background notification task
  const BACKGROUND_NOTIFICATION_TASK =
    "BACKGROUND-NOTIFICATION-TASK";

//   TaskManager.defineTask(
//     BACKGROUND_NOTIFICATION_TASK,
//     ({ data }) => {
//       if (!data) return;

//       console.log("Background notification task", data);

//       if (isSendbirdNotification(data)) {
//         const sendbird = parseSendbirdNotification(data);

//         Notifications.scheduleNotificationAsync({
//           identifier: String(sendbird.message_id),
//           content: {
//             title: `[RN]${
//               sendbird.channel?.name ||
//               sendbird.sender?.name ||
//               "Message received"
//             }`,
//             body: sendbird.message,
//             data,
//           },
//           trigger: null,
//         });
//       }
//     }
//   );

  Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);
}
