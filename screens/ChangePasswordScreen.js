import React from 'react';
import {
  Button,
  Checkbox,
  ExpoImage,
  Icon,
  KeyboardAvoidingView,
  ScreenContainer,
  SimpleStyleScrollView,
  Spacer,
  TextInput,
  Touchable,
  withTheme,
} from '@draftbit/ui';
import { Text, View } from 'react-native';
import * as GlobalStyles from '../GlobalStyles.js';
import * as SunoHealthcareManagementAPIApi from '../apis/SunoHealthcareManagementAPIApi.js';
import CustomChildHeaderBlock from '../components/CustomChildHeaderBlock';
import * as GlobalVariables from '../config/GlobalVariableContext';
import Images from '../config/Images';
import * as CustomCode from '../custom-files/CustomCode';
import * as customChangePassword from '../custom-files/customChangePassword';
import palettes from '../themes/palettes';
import * as Utils from '../utils';
import Breakpoints from '../utils/Breakpoints';
import * as StyleSheet from '../utils/StyleSheet';
import imageSource from '../utils/imageSource';
import useNavigation from '../utils/useNavigation';
import useParams from '../utils/useParams';
import useWindowDimensions from '../utils/useWindowDimensions';

const ChangePasswordScreen = props => {
  const { theme } = props;
  const dimensions = useWindowDimensions();
  const navigation = useNavigation();
  const Constants = GlobalVariables.useValues();
  const Variables = Constants;
  const [checkboxConfirmPass, setCheckboxConfirmPass] = React.useState(true);
  const [checkboxCurrentPass, setCheckboxCurrentPass] = React.useState(true);
  const [checkboxNewPass, setCheckboxNewPass] = React.useState(true);
  const [confirmPasswordInput, setConfirmPasswordInput] = React.useState('');
  const [currentPasswordInput, setCurrentPasswordInput] = React.useState('');
  const [newPasswordInput, setNewPasswordInput] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordMismatch, setPasswordMismatch] = React.useState(false);
  const [checkboxValue, setCheckboxValue] = React.useState(false);

  return (
    <ScreenContainer scrollable={false} hasSafeArea={true}>
      <CustomChildHeaderBlock
        isNotificationVisible={false}
        isSettingVisible={false}
        name={'Change Password'}
      />
      <KeyboardAvoidingView
        behavior={'padding'}
        enabled={true}
        keyboardVerticalOffset={0}
        style={StyleSheet.applyWidth({ flex: 1 }, dimensions.width)}
      >
        <SimpleStyleScrollView
          bounces={true}
          horizontal={false}
          keyboardShouldPersistTaps={'never'}
          nestedScrollEnabled={false}
          showsHorizontalScrollIndicator={true}
          showsVerticalScrollIndicator={true}
        >
          <View
            style={StyleSheet.applyWidth(
              {
                alignContent: 'flex-start',
                alignItems: 'center',
                alignSelf: 'auto',
                flex: 1,
                flexDirection: 'column',
                paddingBottom: 20,
                paddingLeft: 28,
                paddingRight: 28,
                paddingTop: 20,
              },
              dimensions.width
            )}
          >
            {/* View logo */}
            <View
              style={StyleSheet.applyWidth(
                { alignItems: 'center', alignSelf: 'center', marginTop: 6 },
                dimensions.width
              )}
            >
              {/* Logo */}
              <ExpoImage
                allowDownscaling={true}
                cachePolicy={'disk'}
                contentPosition={'center'}
                resizeMode={'cover'}
                transitionDuration={300}
                transitionEffect={'cross-dissolve'}
                transitionTiming={'ease-in-out'}
                source={imageSource(Images['resetpasswordamico'])}
                style={StyleSheet.applyWidth(
                  { height: 160, width: 160 },
                  dimensions.width
                )}
              />
              {/* Change Password */}
              <Text
                accessible={true}
                selectable={false}
                style={StyleSheet.applyWidth(
                  {
                    color: theme.colors.text.medium,
                    fontFamily: 'Inter_700Bold',
                    fontSize: 20,
                    paddingBottom: 10,
                    paddingTop: 10,
                  },
                  dimensions.width
                )}
              >
                {'Security & Password'}
              </Text>
            </View>
            {/* CustomChangePassword */}
            <Utils.CustomCodeErrorBoundary>
              <customChangePassword.ChangePasswordView />
            </Utils.CustomCodeErrorBoundary>
            {/* Spacer 3 */}
            <Spacer bottom={10} top={10} />
          </View>
        </SimpleStyleScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

export default withTheme(ChangePasswordScreen);
