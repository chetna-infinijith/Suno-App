import * as Notifications from 'expo-notifications';

export const notificationService = {
  hasPushPermission: async () => {
    const { status } = await Notifications.getPermissionsAsync();
    console.log("===== hasPushPermission : ", status)

    return status === 'granted';
  },

  requestPushPermission: async () => {
   
    return status === 'granted';
  },

  getPushToken: async () => {
    console.log("===== getPushToken : ====")
    const { status } = await Notifications.getPermissionsAsync();
    console.log("===== hasPushPermission : ", status)
    
    const permission = await Notifications.requestPermissionsAsync();
    console.log("FULL permission object:", permission);
    

    const tokenData = await Notifications.getDevicePushTokenAsync();
    console.log("===== getPushToken : ", tokenData)
    return tokenData?.data;
  },
};

let isAppReady = false;
let pendingNotification = null;

export const setAppReady = (value) => {
  isAppReady = value;
};

export const getAppReady = () => isAppReady;

export const setPendingNotification = (notification) => {
  pendingNotification = notification;
};

export const getPendingNotification = () => pendingNotification;

export const clearPendingNotification = () => {
  pendingNotification = null;
};