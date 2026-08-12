import React from 'react';
import {
  Button,
  ExpoImage,
  LinearGradient,
  ScreenContainer,
  Touchable,
  withTheme,
} from '@draftbit/ui';
import { ImageBackground, Text, View } from 'react-native';
import * as GlobalStyles from '../GlobalStyles.js';
import * as GlobalVariables from '../config/GlobalVariableContext';
import Images from '../config/Images';
import setPatientResetFilter from '../global-functions/setPatientResetFilter';
import palettes from '../themes/palettes';
import Breakpoints from '../utils/Breakpoints';
import * as StyleSheet from '../utils/StyleSheet';
import imageSource from '../utils/imageSource';
import useIsFocused from '../utils/useIsFocused';
import useNavigation from '../utils/useNavigation';
import useParams from '../utils/useParams';
import useWindowDimensions from '../utils/useWindowDimensions';
import * as SunoHealthcareManagementAPIApi from '../apis/SunoHealthcareManagementAPIApi.js';
import { CommonActions } from '@react-navigation/native';

const WelcomeScreen = props => {
  const { theme } = props;
  const dimensions = useWindowDimensions();
  const navigation = useNavigation();
  const Constants = GlobalVariables.useValues();
  const Variables = Constants;
  const setGlobalVariableValue = GlobalVariables.useSetValue();
  const isFocused = useIsFocused();
  const [errorHandler, setErrorHandler] = React.useState('');
  React.useEffect(() => {
    const handler = async () => {
      try {
      
        // Fetch user info
        const response = await SunoHealthcareManagementAPIApi.gET$api$auth$users$me$GET(Constants);
        const apiUserData = response?.json;
        console.log("==== HomeUserInfo:", apiUserData);
        if (response?.status === 200 || response?.status === 201 ) {
          if (apiUserData) {
            await setGlobalVariableValue({ key: 'UserInfo', value: apiUserData });
            await setGlobalVariableValue({ key: 'senderID', value: apiUserData?.id });
            console.log("==== Constants :", Constants.UserInfo);
  
               // Fetch unread messages count
        // const unreadResponse = await SunoApi.getUnreadMessagesCountGET(Constants, {
        //   clinics: Constants['clinic_pk_id'],
        // });
      
        // const unreadCountData = unreadResponse?.json;
        // if (unreadCountData) {
        //   setUnreadMsgCount(unreadCountData);
        // }

            navigation.navigate('BottomTabNavigator', {}, { pop: true });
          }
        } else {
          navigation.navigate('StackNavigator', {}, { pop: true });
          return; // stop further 
        }        
       
      
     
      
      } catch (err) {
        console.log("Error in auth check:", err);
        showAlertUtil({
          title: "Error",
          message: "Something went wrong. Please try again.",
          buttonText: "Ok",
        });
      }
      
    };

    const authHeader = Constants?.AUTH_HEADER;

console.log("==== check auth:", authHeader);

if (authHeader) {
  handler();
} else {
  navigation.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'SignInScreen' }], // set SignInScreen as root
    })
  );
  // navigation.navigate('StackNavigator', {
  //   screen: 'SignInScreen',
  // });
}

   
  }, []);

  React.useEffect(() => {
    try {
      if (!isFocused) {
        return;
      }
      setPatientResetFilter(Variables, setGlobalVariableValue);
    } catch (err) {
      console.log(err);
    }
  }, [isFocused]);

  return (
    <ScreenContainer hasSafeArea={false} scrollable={false}>
    <View
      style={StyleSheet.applyWidth(
        {
          backgroundColor: theme.colors.branding.primary,
          borderColor: theme.colors.branding.primary,
          flex: 1,
        },
        dimensions.width
      )}
    >
      <View
        style={StyleSheet.applyWidth(
          {
            alignContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
            flex: 1,
            justifyContent: 'center',
          },
          dimensions.width
        )}
      >
        <ExpoImage
          allowDownscaling={true}
          cachePolicy={'disk'}
          contentPosition={'center'}
          transitionDuration={300}
          transitionEffect={'cross-dissolve'}
          transitionTiming={'ease-in-out'}
          resizeMode={'contain'}
          source={imageSource(Images['whitelogo'])}
          style={StyleSheet.applyWidth(
            { borderStyle: 'solid', height: 300, minWidth: 225, width: 100 },
            dimensions.width
          )}
        />
      </View>
    </View>
  </ScreenContainer>
  );
};

export default withTheme(WelcomeScreen);
