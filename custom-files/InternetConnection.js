import { Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

export const checkInternetAndProceed = async () => {
  const state = await NetInfo.fetch();

  if (!state.isConnected) {
    Alert.alert(
      'No Internet Connection',
      'Please check your internet connection and try again.'
    );
    return false;
  }

  return true;
};