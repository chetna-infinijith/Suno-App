import { Linking } from 'react-native';
export const makePhoneCall = async phoneNumber => {
  if (!phoneNumber) return;

  const cleaned = phoneNumber.replace(/[^0-9]/g, ''); // remove dashes, spaces
  if (cleaned.length >= 10) {
    await Linking.openURL(`tel:${cleaned}`);
  }
};
