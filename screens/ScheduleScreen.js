import React from 'react';
import {
  Button,
  Checkbox,
  Circle,
  Icon,
  IconButton,
  ScreenContainer,
  Touchable,
  withTheme,
} from '@draftbit/ui';
import { Modal, Text, View } from 'react-native';
import * as CalendarBigView from '../CalendarBigView';
import * as GlobalStyles from '../GlobalStyles.js';
import CustomHeaderBlock from '../components/CustomHeaderBlock';
import * as CustomCode from '../custom-files/CustomCode';
import palettes from '../themes/palettes';
import * as Utils from '../utils';
import Breakpoints from '../utils/Breakpoints';
import * as StyleSheet from '../utils/StyleSheet';
import useNavigation from '../utils/useNavigation';
import useParams from '../utils/useParams';
import useWindowDimensions from '../utils/useWindowDimensions';
import * as SunoHealthcareManagementAPIApi from '../apis/SunoHealthcareManagementAPIApi.js';
import * as GlobalVariables from '../config/GlobalVariableContext';

const defaultProps = { patient_id: null };

const ScheduleScreen = props => {
  const { theme } = props;
  const dimensions = useWindowDimensions();
  const navigation = useNavigation();
  const params = useParams();
  const [checkboxValue, setCheckboxValue] = React.useState(false);
  const [datePickerValue, setDatePickerValue] = React.useState(new Date());
  const [datePickerValue2, setDatePickerValue2] = React.useState(new Date());
  const [fabOpen, setFabOpen] = React.useState(false);
  const [listExists, setListExists] = React.useState(true);
  const [listMissing, setListMissing] = React.useState(false);
  const [menuTab1, setMenuTab1] = React.useState(true);
  const [menuTab2, setMenuTab2] = React.useState(false);
  const [menuTab3, setMenuTab3] = React.useState(false);
  const setGlobalVariableValue = GlobalVariables.useSetValue();

  const [multiSelectOptionValue, setMultiSelectOptionValue] = React.useState([
    { label: 'Dr. Smith', value: 'smith' },
    { label: 'Dr. Johnson', value: 'johnson' },
    { label: 'Dr. Williams', value: 'williams' },
  ]);
  const [multiSelectPickerValue, setMultiSelectPickerValue] = React.useState(
    []
  );
  const [newApptModal, setNewApptModal] = React.useState(false);
  const [noContent, setNoContent] = React.useState(false);
  const [numberInputValue, setNumberInputValue] = React.useState('');
  const [openModal, setOpenModal] = React.useState(false);
  const [openModal2, setOpenModal2] = React.useState(false);
  const [pickerValue, setPickerValue] = React.useState('');
  const [stepperValue, setStepperValue] = React.useState('');
  const [usernameFollowed, setUsernameFollowed] = React.useState(false);

  // React.useEffect(() => {
  //   const handler = async () => {
  //     try {
  //       const HomeUserInfo = (
  //         await SunoHealthcareManagementAPIApi.gET$api$auth$users$me$GET(
  //           Constants
  //         )
  //       )?.json;
  //       const apiUserdata = HomeUserInfo;

  //       const apiErrMsg = (() => {
  //         const e = apiUserdata?.message;
  //         console.log(errorHandler, e);
  //         return e;
  //       })();
  //       setErrorHandler(apiErrMsg);
  //       if (errorHandler === 'Invalid token') {
  //         if (errorHandler === 'Invalid token') {
  //           navigation.navigate('SignInScreen', {}, { pop: true });
  //         }

  //         showAlertUtil({
  //           title: undefined,
  //           message: errorHandler,
  //           buttonText: 'Ok',
  //         });
  //       } else {
  //         if (apiUserdata !== null) {
  //           await setGlobalVariableValue({
  //             key: 'UserInfo',
  //             value: apiUserdata,
  //           });
  //           await setGlobalVariableValue({
  //             key: 'senderID',
  //             value: apiUserdata?.id,
  //           });
  //         } else {
  //           /* hidden 'Set Variable' action */
  //         }
  //       }

  //       const unreadMessageCount = (
  //         await SunoApi.getUnreadMessagesCountGET(Constants, {
  //           clinics: Constants['clinic_pk_id'],
  //         })
  //       )?.json;
  //       const unReadResCount = unreadMessageCount;
  //       setErrorHandlerMsg(unReadResCount?.message);
  //       if (unReadResCount !== null) {
  //         setUnreadMsgCount(unReadResCount);
  //       } else {
  //       }
  //     } catch (err) {
  //       console.log(err);
  //     }
  //   };
  //   handler();
  // }, []);

  return (
    <ScreenContainer
      scrollable={false}
      hasSafeArea={false}
      hasBottomSafeArea={false}
      hasTopSafeArea={true}
      style={StyleSheet.applyWidth(
        { backgroundColor: palettes.App['Custom Color_15'] },
        dimensions.width
      )}
    >
      <CustomHeaderBlock />
      <Utils.CustomCodeErrorBoundary>
        <CalendarBigView.CalendarBigView />
      </Utils.CustomCodeErrorBoundary>
      {/* Fab Button View */}
      <View
        style={StyleSheet.applyWidth(
          {
            alignItems: 'flex-end',
            bottom: 20,
            flexDirection: 'column-reverse',
            position: 'absolute',
            right: 20,
          },
          dimensions.width
        )}
      >
        <Touchable
          onPress={() => {
            try {
              /* hidden 'Navigate' action */
              setFabOpen(true);
            } catch (err) {
              console.log(err);
            }
          }}
        >
          <Circle
            bgColor={palettes.App['Custom Color_5']}
            size={50}
            style={StyleSheet.applyWidth(
              { backgroundColor: theme.colors.branding.secondary },
              dimensions.width
            )}
          >
            <Checkbox
              onPress={newCheckboxValue => {
                try {
                  setFabOpen(newCheckboxValue);
                } catch (err) {
                  console.log(err);
                }
              }}
              checkedIcon={'Entypo/minus'}
              color={palettes.App['Custom #ffffff']}
              status={fabOpen}
              uncheckedColor={palettes.App['Custom #ffffff']}
              uncheckedIcon={'AntDesign/plus'}
            />
          </Circle>
        </Touchable>
        {/* FabOptions */}
        <>
          {!fabOpen ? null : (
            <View
              style={StyleSheet.applyWidth(
                {
                  alignItems: 'flex-end',
                  alignSelf: 'flex-end',
                  flexDirection: 'column',
                  marginBottom: 12,
                },
                dimensions.width
              )}
            >
              {/* AppointmentButton */}
              <Button
                accessible={true}
                iconPosition={'left'}
                onPress={() => {
                  try {
                    setFabOpen(false);
                    navigation.navigate('WizardViewScreen', {}, { pop: true });
                  } catch (err) {
                    console.log(err);
                  }
                }}
                {...GlobalStyles.ButtonStyles(theme)['Button'].props}
                icon={'FontAwesome/calendar-plus-o'}
                iconSize={20}
                style={StyleSheet.applyWidth(
                  StyleSheet.compose(
                    GlobalStyles.ButtonStyles(theme)['Button'].style,
                    theme.typography.button,
                    {
                      backgroundColor: theme.colors.branding.secondary,
                      borderRadius: 25,
                      fontFamily: 'Inter_600SemiBold',
                      fontSize: 16,
                      paddingBottom: 10,
                      paddingLeft: 14,
                      paddingRight: 14,
                      paddingTop: 10,
                    }
                  ),
                  dimensions.width
                )}
                title={'Appointment'}
              />
              {/* ClinicButton */}
              <Button
                accessible={true}
                iconPosition={'left'}
                onPress={() => {
                  try {
                    setFabOpen(false);
                    navigation.navigate(
                      'PersonalClinicEventScreen',
                      { personalEvent: false, clinicEvent: true },
                      { pop: true }
                    );
                  } catch (err) {
                    console.log(err);
                  }
                }}
                {...GlobalStyles.ButtonStyles(theme)['Button'].props}
                icon={'FontAwesome/user-md'}
                iconSize={24}
                style={StyleSheet.applyWidth(
                  StyleSheet.compose(
                    GlobalStyles.ButtonStyles(theme)['Button'].style,
                    theme.typography.button,
                    {
                      backgroundColor: theme.colors.branding.secondary,
                      borderRadius: 25,
                      fontFamily: 'Inter_600SemiBold',
                      fontSize: 16,
                      marginTop: 12,
                      paddingBottom: 10,
                      paddingLeft: 14,
                      paddingRight: 14,
                      paddingTop: 10,
                    }
                  ),
                  dimensions.width
                )}
                title={'Clinic Event'}
              />
              {/* PersonalButton */}
              <Button
                accessible={true}
                iconPosition={'left'}
                onPress={() => {
                  try {
                    setFabOpen(false);
                    navigation.navigate(
                      'PersonalClinicEventScreen',
                      { personalEvent: true, clinicEvent: false },
                      { pop: true }
                    );
                  } catch (err) {
                    console.log(err);
                  }
                }}
                {...GlobalStyles.ButtonStyles(theme)['Button'].props}
                icon={'Feather/user-plus'}
                iconSize={24}
                style={StyleSheet.applyWidth(
                  StyleSheet.compose(
                    GlobalStyles.ButtonStyles(theme)['Button'].style,
                    theme.typography.button,
                    {
                      backgroundColor: theme.colors.branding.secondary,
                      borderRadius: 25,
                      fontFamily: 'Inter_600SemiBold',
                      fontSize: 16,
                      marginTop: 12,
                      paddingBottom: 10,
                      paddingLeft: 12,
                      paddingRight: 12,
                      paddingTop: 10,
                    }
                  ),
                  dimensions.width
                )}
                title={'Personal Event'}
              />
            </View>
          )}
        </>
      </View>
    </ScreenContainer>
  );
};

export default withTheme(ScheduleScreen);
