import analytics from '@react-native-firebase/analytics';

export const logEvent = async (eventName, params = {}) => {
  try {
    await analytics().logEvent(eventName, params);
  } catch (error) {
    console.log('Analytics Error:', error);
  }
};
