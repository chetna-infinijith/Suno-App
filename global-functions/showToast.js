import { Alert } from "react-native";
import { Platform, ToastAndroid } from "react-native";
import Toast from "react-native-root-toast";

export const showToast = (message) => {
//   Toast.show(message, {
//     duration: Toast.durations.SHORT,
//     position: Toast.positions.BOTTOM,
//   });

if (Platform.OS === "android") {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert("", message);
  }

};
