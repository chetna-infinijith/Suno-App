import React from 'react';
import {
  Button,
  Checkbox,
  Circle,
  CircleImage,
  Divider,
  Icon,
  IconButton,
  Picker,
  ScreenContainer,
  SimpleStyleScrollView,
  Surface,
  Touchable,
  withTheme,
} from '@draftbit/ui';
import { Modal, Text, View } from 'react-native';
import * as GlobalStyles from '../GlobalStyles.js';
import Images from '../config/Images';
import * as CustomCode from '../custom-files/CustomCode';
import * as WizardCustomView from '../custom-files/WizardCustomView';
import palettes from '../themes/palettes';
import * as Utils from '../utils';
import Breakpoints from '../utils/Breakpoints';
import * as StyleSheet from '../utils/StyleSheet';
import imageSource from '../utils/imageSource';
import useNavigation from '../utils/useNavigation';
import useParams from '../utils/useParams';
import useWindowDimensions from '../utils/useWindowDimensions';

const ScheduleAppntScreen = props => {
  const { theme } = props;
  const dimensions = useWindowDimensions();
  const navigation = useNavigation();
  const [datePickerValue, setDatePickerValue] = React.useState(new Date());
  const [datePickerValue2, setDatePickerValue2] = React.useState(new Date());
  const [fabOpen, setFabOpen] = React.useState(false);
  const [listExists, setListExists] = React.useState(true);
  const [listMissing, setListMissing] = React.useState(false);
  const [menuTab1, setMenuTab1] = React.useState(true);
  const [menuTab2, setMenuTab2] = React.useState(false);
  const [menuTab3, setMenuTab3] = React.useState(false);
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

  return (
    <ScreenContainer
      scrollable={false}
      hasSafeArea={true}
      hasTopSafeArea={true}
      style={StyleSheet.applyWidth(
        { backgroundColor: palettes.App['Custom Color_15'] },
        dimensions.width
      )}
    >
      {/* Top Navigation Header */}
      <View
        style={StyleSheet.applyWidth(
          {
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 8,
            paddingBottom: 8,
            paddingLeft: 12,
            paddingRight: 12,
            paddingTop: 8,
          },
          dimensions.width
        )}
      >
        {/* Left Section */}
        <View
          style={StyleSheet.applyWidth(
            { alignItems: 'flex-start', justifyContent: 'center' },
            dimensions.width
          )}
        >
          <Text
            accessible={true}
            selectable={false}
            style={StyleSheet.applyWidth(
              {
                color: theme.colors.text.strong,
                fontFamily: 'Inter_800ExtraBold',
                fontSize: 20,
                letterSpacing: 0.5,
              },
              dimensions.width
            )}
          >
            {'Hearing Care Clinic'}
          </Text>
        </View>
        {/* Right Section */}
        <View
          style={StyleSheet.applyWidth(
            {
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'flex-end',
            },
            dimensions.width
          )}
        >
          <Touchable>
            <View
              style={StyleSheet.applyWidth(
                {
                  alignItems: 'center',
                  height: 46,
                  justifyContent: 'center',
                  width: 40,
                },
                dimensions.width
              )}
            >
              <Icon
                color={theme.colors.branding.secondary}
                name={'Ionicons/notifications'}
                size={24}
                style={StyleSheet.applyWidth(
                  { marginTop: 14 },
                  dimensions.width
                )}
              />
              <View
                style={StyleSheet.applyWidth(
                  {
                    backgroundColor: theme.colors.text.strong,
                    borderBottomWidth: 3,
                    borderColor: palettes.App['Custom Color_2'],
                    borderLeftWidth: 3,
                    borderRadius: 7,
                    borderRightWidth: 3,
                    borderTopWidth: 3,
                    height: 14,
                    left: 6,
                    top: -30,
                    width: 14,
                  },
                  dimensions.width
                )}
              />
            </View>
          </Touchable>
          {/* Touchable settings */}
          <Touchable>
            <View
              style={StyleSheet.applyWidth(
                {
                  alignItems: 'center',
                  height: 46,
                  justifyContent: 'center',
                  width: 40,
                },
                dimensions.width
              )}
            >
              <Icon
                color={theme.colors.branding.secondary}
                name={'Feather/settings'}
                size={24}
                style={StyleSheet.applyWidth(
                  { marginTop: 14 },
                  dimensions.width
                )}
              />
              <View
                style={StyleSheet.applyWidth(
                  { height: 14, left: 6, top: -30, width: 14 },
                  dimensions.width
                )}
              />
            </View>
          </Touchable>

          <Touchable
            style={StyleSheet.applyWidth({ marginLeft: 8 }, dimensions.width)}
          >
            <Surface
              elevation={3}
              style={StyleSheet.applyWidth(
                {
                  borderRadius: 20,
                  justifyContent: 'center',
                  minHeight: 34,
                  overflow: 'hidden',
                },
                dimensions.width
              )}
            >
              <CircleImage size={32} source={Images.Avatar} />
            </Surface>
          </Touchable>
        </View>
      </View>
      {/* Top Sub Section Header */}
      <View
        style={StyleSheet.applyWidth(
          { paddingLeft: 12, paddingRight: 12 },
          dimensions.width
        )}
      >
        <View
          style={StyleSheet.applyWidth(
            {
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
            },
            dimensions.width
          )}
        >
          <View
            style={StyleSheet.applyWidth(
              {
                alignItems: 'center',
                flex: 1,
                flexDirection: 'row',
                paddingBottom: 20,
                paddingTop: 20,
              },
              dimensions.width
            )}
          >
            <Icon name={'AntDesign/left'} size={16} />
            <Text
              accessible={true}
              selectable={false}
              style={StyleSheet.applyWidth(
                {
                  color: theme.colors.text.medium,
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 18,
                  paddingLeft: 10,
                  paddingRight: 10,
                },
                dimensions.width
              )}
            >
              {'Thu, Jul 24'}
            </Text>
            {/* Icon 2 */}
            <Icon name={'AntDesign/right'} size={16} />
          </View>

          <Touchable>
            <View
              style={StyleSheet.applyWidth(
                {
                  borderColor: theme.colors.branding.secondary,
                  borderRadius: 12,
                  borderWidth: 2,
                  paddingBottom: 8,
                  paddingLeft: 8,
                  paddingRight: 8,
                  paddingTop: 8,
                  width: 100,
                },
                dimensions.width
              )}
            >
              <Text
                accessible={true}
                selectable={false}
                style={StyleSheet.applyWidth(
                  {
                    color: theme.colors.branding.secondary,
                    fontFamily: 'Inter_600SemiBold',
                    textAlign: 'center',
                  },
                  dimensions.width
                )}
              >
                {'Today'}
              </Text>
            </View>
          </Touchable>
        </View>
      </View>
      {/* Providers section */}
      <View
        style={StyleSheet.applyWidth(
          {
            alignItems: 'flex-end',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            paddingBottom: 6,
            paddingLeft: 12,
            paddingRight: 12,
            paddingTop: 6,
          },
          dimensions.width
        )}
      >
        <View
          style={StyleSheet.applyWidth(
            {
              backgroundColor: theme.colors.branding.secondary,
              borderRadius: 25,
              paddingLeft: 2,
              width: '50%',
            },
            dimensions.width
          )}
        >
          {/* Providers Picker */}
          <Picker
            autoDismissKeyboard={true}
            dropDownBorderRadius={8}
            onValueChange={newProvidersPickerValue => {
              const pickerValue = newProvidersPickerValue;
              try {
                setPickerValue(newProvidersPickerValue);
              } catch (err) {
                console.log(err);
              }
            }}
            selectedIconName={'Feather/check'}
            type={'solid'}
            {...GlobalStyles.PickerStyles(theme)['Picker'].props}
            dropDownBackgroundColor={theme.colors.background.base}
            dropDownBorderColor={theme.colors.branding.secondary}
            dropDownBorderWidth={2}
            dropDownTextColor={theme.colors.branding.secondary}
            dropdownOverlayColor={theme.colors.background.base}
            iconColor={theme.colors.background.base}
            iconSize={20}
            leftIconMode={'inset'}
            leftIconName={'Feather/users'}
            mode={'native'}
            options={multiSelectOptionValue}
            placeholder={'All Providers'}
            placeholderTextColor={theme.colors.background.base}
            selectedIconColor={theme.colors.background.base}
            selectedIconSize={20}
            style={StyleSheet.applyWidth(
              StyleSheet.compose(
                GlobalStyles.PickerStyles(theme)['Picker'].style,
                theme.typography.body2,
                {
                  borderColor: theme.colors.branding.secondary,
                  borderRadius: 25,
                  borderWidth: 2,
                  color: theme.colors.background.base,
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 15,
                  paddingBottom: 10,
                  paddingTop: 10,
                }
              ),
              dimensions.width
            )}
            value={pickerValue}
          />
        </View>
      </View>
      {/* Scroll Content View */}
      <SimpleStyleScrollView
        bounces={true}
        horizontal={false}
        keyboardShouldPersistTaps={'never'}
        nestedScrollEnabled={false}
        showsHorizontalScrollIndicator={true}
        showsVerticalScrollIndicator={true}
        style={StyleSheet.applyWidth(
          { flexGrow: 1, paddingBottom: 10, paddingLeft: 12, paddingRight: 12 },
          dimensions.width
        )}
      >
        {/* Content Frame Tab 1 */}
        <>
          {!menuTab1 ? null : (
            <View
              style={StyleSheet.applyWidth(
                { flex: 1, flexShrink: 1, paddingBottom: 20, paddingTop: 20 },
                dimensions.width
              )}
            >
              {/* Details */}
              <View
                style={StyleSheet.applyWidth(
                  { flexDirection: 'row', width: '100%' },
                  dimensions.width
                )}
              >
                {/* Timer */}
                <View
                  style={StyleSheet.applyWidth(
                    {
                      borderColor: theme.colors.text.normal,
                      flex: 1,
                      width: '15%',
                    },
                    dimensions.width
                  )}
                >
                  {/* space */}
                  <View
                    style={StyleSheet.applyWidth(
                      { marginTop: 12, paddingTop: 30 },
                      dimensions.width
                    )}
                  />
                  <View
                    style={StyleSheet.applyWidth(
                      {
                        height: 40,
                        justifyContent: 'space-between',
                        marginBottom: 20,
                        marginTop: 20,
                        paddingBottom: 5,
                        paddingTop: 5,
                      },
                      dimensions.width
                    )}
                  >
                    <Text
                      accessible={true}
                      selectable={false}
                      style={StyleSheet.applyWidth(
                        {
                          color: theme.colors.text.normal,
                          fontFamily: 'Inter_400Regular',
                          fontSize: 14,
                          textTransform: 'capitalize',
                        },
                        dimensions.width
                      )}
                    >
                      {'8.00 AM'}
                    </Text>
                  </View>

                  <View
                    style={StyleSheet.applyWidth(
                      {
                        height: 40,
                        justifyContent: 'space-between',
                        marginBottom: 20,
                        marginTop: 20,
                        paddingBottom: 5,
                        paddingTop: 5,
                      },
                      dimensions.width
                    )}
                  >
                    <Text
                      accessible={true}
                      selectable={false}
                      style={StyleSheet.applyWidth(
                        {
                          color: theme.colors.text.normal,
                          fontFamily: 'Inter_400Regular',
                          fontSize: 14,
                          textTransform: 'capitalize',
                        },
                        dimensions.width
                      )}
                    >
                      {'9.00 AM'}
                    </Text>
                  </View>

                  <View
                    style={StyleSheet.applyWidth(
                      {
                        height: 40,
                        justifyContent: 'space-between',
                        marginBottom: 20,
                        marginTop: 20,
                        paddingBottom: 5,
                        paddingTop: 5,
                      },
                      dimensions.width
                    )}
                  >
                    <Text
                      accessible={true}
                      selectable={false}
                      style={StyleSheet.applyWidth(
                        {
                          color: theme.colors.text.normal,
                          fontFamily: 'Inter_400Regular',
                          fontSize: 14,
                          textTransform: 'capitalize',
                        },
                        dimensions.width
                      )}
                    >
                      {'10.00 AM'}
                    </Text>
                  </View>
                  {/* View 2 */}
                  <View
                    style={StyleSheet.applyWidth(
                      {
                        height: 40,
                        justifyContent: 'space-between',
                        marginBottom: 20,
                        marginTop: 20,
                        paddingBottom: 5,
                        paddingTop: 5,
                      },
                      dimensions.width
                    )}
                  >
                    <Text
                      accessible={true}
                      selectable={false}
                      style={StyleSheet.applyWidth(
                        {
                          color: theme.colors.text.normal,
                          fontFamily: 'Inter_400Regular',
                          fontSize: 14,
                          textTransform: 'capitalize',
                        },
                        dimensions.width
                      )}
                    >
                      {'11.00 AM'}
                    </Text>
                  </View>
                  {/* View 3 */}
                  <View
                    style={StyleSheet.applyWidth(
                      {
                        height: 40,
                        justifyContent: 'space-between',
                        marginBottom: 20,
                        marginTop: 20,
                        paddingBottom: 5,
                        paddingTop: 5,
                      },
                      dimensions.width
                    )}
                  >
                    <Text
                      accessible={true}
                      selectable={false}
                      style={StyleSheet.applyWidth(
                        {
                          color: theme.colors.text.normal,
                          fontSize: 14,
                          textTransform: 'capitalize',
                        },
                        dimensions.width
                      )}
                    >
                      {'12.00 PM'}
                    </Text>
                  </View>
                  {/* View 3 2 */}
                  <View
                    style={StyleSheet.applyWidth(
                      {
                        height: 40,
                        justifyContent: 'space-between',
                        marginBottom: 20,
                        marginTop: 20,
                        paddingBottom: 5,
                        paddingTop: 5,
                      },
                      dimensions.width
                    )}
                  >
                    <Text
                      accessible={true}
                      selectable={false}
                      style={StyleSheet.applyWidth(
                        {
                          color: theme.colors.text.normal,
                          fontSize: 14,
                          textTransform: 'capitalize',
                        },
                        dimensions.width
                      )}
                    >
                      {'1.00 PM'}
                    </Text>
                  </View>
                  {/* View 3 3 */}
                  <View
                    style={StyleSheet.applyWidth(
                      {
                        height: 40,
                        justifyContent: 'space-between',
                        marginBottom: 20,
                        marginTop: 20,
                        paddingBottom: 5,
                        paddingTop: 5,
                      },
                      dimensions.width
                    )}
                  >
                    <Text
                      accessible={true}
                      selectable={false}
                      style={StyleSheet.applyWidth(
                        {
                          color: theme.colors.text.normal,
                          fontSize: 14,
                          textTransform: 'capitalize',
                        },
                        dimensions.width
                      )}
                    >
                      {'2.00 PM'}
                    </Text>
                  </View>
                  {/* View 3 4 */}
                  <View
                    style={StyleSheet.applyWidth(
                      {
                        height: 40,
                        justifyContent: 'space-between',
                        marginBottom: 20,
                        marginTop: 20,
                        paddingBottom: 5,
                        paddingTop: 5,
                      },
                      dimensions.width
                    )}
                  >
                    <Text
                      accessible={true}
                      selectable={false}
                      style={StyleSheet.applyWidth(
                        {
                          color: theme.colors.text.normal,
                          fontSize: 14,
                          textTransform: 'capitalize',
                        },
                        dimensions.width
                      )}
                    >
                      {'3.00 PM'}
                    </Text>
                  </View>
                  {/* View 3 5 */}
                  <View
                    style={StyleSheet.applyWidth(
                      {
                        height: 40,
                        justifyContent: 'space-between',
                        marginBottom: 20,
                        marginTop: 20,
                        paddingBottom: 5,
                        paddingTop: 5,
                      },
                      dimensions.width
                    )}
                  >
                    <Text
                      accessible={true}
                      selectable={false}
                      style={StyleSheet.applyWidth(
                        {
                          color: theme.colors.text.normal,
                          fontSize: 14,
                          textTransform: 'capitalize',
                        },
                        dimensions.width
                      )}
                    >
                      {'4.00 PM'}
                    </Text>
                  </View>
                  {/* View 3 6 */}
                  <View
                    style={StyleSheet.applyWidth(
                      {
                        height: 40,
                        justifyContent: 'space-between',
                        marginBottom: 20,
                        marginTop: 20,
                        paddingBottom: 5,
                        paddingTop: 5,
                      },
                      dimensions.width
                    )}
                  >
                    <Text
                      accessible={true}
                      selectable={false}
                      style={StyleSheet.applyWidth(
                        {
                          color: theme.colors.text.normal,
                          fontSize: 14,
                          textTransform: 'capitalize',
                        },
                        dimensions.width
                      )}
                    >
                      {'5.00 PM'}
                    </Text>
                  </View>
                  {/* View 3 7 */}
                  <View
                    style={StyleSheet.applyWidth(
                      {
                        height: 40,
                        justifyContent: 'space-between',
                        marginBottom: 20,
                        marginTop: 20,
                        paddingBottom: 5,
                        paddingTop: 5,
                      },
                      dimensions.width
                    )}
                  >
                    <Text
                      accessible={true}
                      selectable={false}
                      style={StyleSheet.applyWidth(
                        {
                          color: theme.colors.text.normal,
                          fontSize: 14,
                          textTransform: 'capitalize',
                        },
                        dimensions.width
                      )}
                    >
                      {'6.00 PM'}
                    </Text>
                  </View>
                </View>
                {/* Smith */}
                <View
                  style={StyleSheet.applyWidth(
                    { paddingLeft: 10, width: '80%' },
                    dimensions.width
                  )}
                >
                  {/* Header */}
                  <View
                    style={StyleSheet.applyWidth(
                      {
                        alignItems: 'center',
                        backgroundColor: theme.colors.background.base,
                        height: 50,
                        justifyContent: 'center',
                      },
                      dimensions.width
                    )}
                  >
                    <Text
                      accessible={true}
                      selectable={false}
                      style={StyleSheet.applyWidth(
                        {
                          color: theme.colors.text.medium,
                          fontFamily: 'Inter_600SemiBold',
                          fontSize: 14,
                          textTransform: 'capitalize',
                        },
                        dimensions.width
                      )}
                    >
                      {'Dr. Smith'}
                    </Text>
                  </View>
                  <Divider
                    {...GlobalStyles.DividerStyles(theme)['Divider'].props}
                    color={palettes.App['Custom Color_16']}
                    style={StyleSheet.applyWidth(
                      GlobalStyles.DividerStyles(theme)['Divider'].style,
                      dimensions.width
                    )}
                  />
                  <View
                    style={StyleSheet.applyWidth(
                      {
                        alignItems: 'center',
                        height: 65,
                        justifyContent: 'center',
                        marginBottom: 20,
                        marginTop: 20,
                        paddingBottom: 5,
                        paddingTop: 5,
                      },
                      dimensions.width
                    )}
                  />
                  {/* Divider 2 */}
                  <Divider
                    {...GlobalStyles.DividerStyles(theme)['Divider'].props}
                    color={palettes.App['Custom Color_16']}
                    style={StyleSheet.applyWidth(
                      GlobalStyles.DividerStyles(theme)['Divider'].style,
                      dimensions.width
                    )}
                  />
                  <View
                    style={StyleSheet.applyWidth(
                      {
                        alignItems: 'center',
                        height: 65,
                        justifyContent: 'center',
                        marginBottom: 20,
                        marginTop: 20,
                        paddingBottom: 5,
                        paddingTop: 5,
                      },
                      dimensions.width
                    )}
                  />
                  {/* Divider 3 */}
                  <Divider
                    {...GlobalStyles.DividerStyles(theme)['Divider'].props}
                    color={palettes.App['Custom Color_16']}
                    style={StyleSheet.applyWidth(
                      GlobalStyles.DividerStyles(theme)['Divider'].style,
                      dimensions.width
                    )}
                  />
                  <View
                    style={StyleSheet.applyWidth(
                      {
                        alignItems: 'center',
                        height: 65,
                        justifyContent: 'center',
                        marginBottom: 20,
                        marginTop: 20,
                        paddingBottom: 5,
                        paddingTop: 5,
                      },
                      dimensions.width
                    )}
                  />
                  {/* Divider 4 */}
                  <Divider
                    {...GlobalStyles.DividerStyles(theme)['Divider'].props}
                    color={palettes.App['Custom Color_16']}
                    style={StyleSheet.applyWidth(
                      GlobalStyles.DividerStyles(theme)['Divider'].style,
                      dimensions.width
                    )}
                  />
                  <Touchable
                    onPress={() => {
                      try {
                        setOpenModal2(true);
                      } catch (err) {
                        console.log(err);
                      }
                    }}
                  >
                    {/* View Value */}
                    <View
                      style={StyleSheet.applyWidth(
                        {
                          alignItems: 'flex-start',
                          backgroundColor: 'rgb(219, 233, 254)',
                          borderColor: palettes.App.Studily_Primary,
                          borderRadius: 12,
                          borderWidth: 1,
                          height: 65,
                          justifyContent: 'flex-start',
                          marginBottom: 20,
                          marginTop: 20,
                          paddingBottom: 10,
                          paddingLeft: 10,
                          paddingRight: 10,
                          paddingTop: 10,
                        },
                        dimensions.width
                      )}
                    >
                      {/* Text 2 */}
                      <Text
                        accessible={true}
                        selectable={false}
                        {...GlobalStyles.TextStyles(theme)['Text 2'].props}
                        style={StyleSheet.applyWidth(
                          StyleSheet.compose(
                            GlobalStyles.TextStyles(theme)['Text 2'].style,
                            theme.typography.body1,
                            {
                              color: 'rgb(49, 46, 129)',
                              fontFamily: 'Inter_500Medium',
                              fontSize: 14,
                            }
                          ),
                          dimensions.width
                        )}
                      >
                        {'John Davidson'}
                      </Text>

                      <Text
                        accessible={true}
                        selectable={false}
                        style={StyleSheet.applyWidth(
                          {
                            color: 'rgb(49, 46, 129)',
                            fontFamily: 'Inter_400Regular',
                            fontSize: 12,
                            paddingBottom: 5,
                            paddingTop: 5,
                            textTransform: 'capitalize',
                          },
                          dimensions.width
                        )}
                      >
                        {'Hearing Aid'}
                      </Text>
                      {/* Text 3 */}
                      <Text
                        accessible={true}
                        selectable={false}
                        {...GlobalStyles.TextStyles(theme)['Text 2'].props}
                        style={StyleSheet.applyWidth(
                          StyleSheet.compose(
                            GlobalStyles.TextStyles(theme)['Text 2'].style,
                            theme.typography.body1,
                            {
                              alignSelf: 'flex-end',
                              color: 'rgb(49, 46, 129)',
                              fontFamily: 'Inter_400Regular',
                              fontSize: 12,
                              marginTop: -20,
                            }
                          ),
                          dimensions.width
                        )}
                      >
                        {'12:00 PM - 12:30 PM'}
                      </Text>
                    </View>
                  </Touchable>
                  {/* Divider 5 */}
                  <Divider
                    {...GlobalStyles.DividerStyles(theme)['Divider'].props}
                    color={palettes.App['Custom Color_16']}
                    style={StyleSheet.applyWidth(
                      GlobalStyles.DividerStyles(theme)['Divider'].style,
                      dimensions.width
                    )}
                  />
                  <View
                    style={StyleSheet.applyWidth(
                      {
                        alignItems: 'center',
                        height: 65,
                        justifyContent: 'center',
                        marginBottom: 20,
                        marginTop: 20,
                        paddingBottom: 5,
                        paddingTop: 5,
                      },
                      dimensions.width
                    )}
                  />
                  {/* Divider 6 */}
                  <Divider
                    {...GlobalStyles.DividerStyles(theme)['Divider'].props}
                    color={palettes.App['Custom Color_16']}
                    style={StyleSheet.applyWidth(
                      GlobalStyles.DividerStyles(theme)['Divider'].style,
                      dimensions.width
                    )}
                  />
                  <Touchable>
                    {/* View Value 2 */}
                    <View
                      style={StyleSheet.applyWidth(
                        {
                          alignItems: 'flex-start',
                          backgroundColor: 'rgb(243, 244, 246)',
                          borderColor: 'rgb(209, 213, 219)',
                          borderRadius: 12,
                          borderWidth: 1,
                          height: 65,
                          justifyContent: 'flex-start',
                          marginBottom: 20,
                          marginTop: 20,
                          paddingBottom: 10,
                          paddingLeft: 10,
                          paddingRight: 10,
                          paddingTop: 10,
                        },
                        dimensions.width
                      )}
                    >
                      {/* Text 2 */}
                      <Text
                        accessible={true}
                        selectable={false}
                        {...GlobalStyles.TextStyles(theme)['Text 2'].props}
                        style={StyleSheet.applyWidth(
                          StyleSheet.compose(
                            GlobalStyles.TextStyles(theme)['Text 2'].style,
                            theme.typography.body1,
                            {
                              color: theme.colors.text.medium,
                              fontFamily: 'Inter_500Medium',
                              fontSize: 14,
                            }
                          ),
                          dimensions.width
                        )}
                      >
                        {'Sarah Thompson'}
                      </Text>

                      <Text
                        accessible={true}
                        selectable={false}
                        style={StyleSheet.applyWidth(
                          {
                            color: theme.colors.text.medium,
                            fontFamily: 'Inter_400Regular',
                            fontSize: 12,
                            paddingBottom: 5,
                            paddingTop: 5,
                            textTransform: 'capitalize',
                          },
                          dimensions.width
                        )}
                      >
                        {'Hearing Aid'}
                      </Text>
                      {/* Text 3 */}
                      <Text
                        accessible={true}
                        selectable={false}
                        {...GlobalStyles.TextStyles(theme)['Text 2'].props}
                        style={StyleSheet.applyWidth(
                          StyleSheet.compose(
                            GlobalStyles.TextStyles(theme)['Text 2'].style,
                            theme.typography.body1,
                            {
                              alignSelf: 'flex-end',
                              color: theme.colors.text.medium,
                              fontFamily: 'Inter_400Regular',
                              fontSize: 12,
                              marginTop: -20,
                            }
                          ),
                          dimensions.width
                        )}
                      >
                        {'3:00 PM - 3:30 PM'}
                      </Text>
                    </View>
                  </Touchable>
                  {/* Divider 7 */}
                  <Divider
                    {...GlobalStyles.DividerStyles(theme)['Divider'].props}
                    color={palettes.App['Custom Color_16']}
                    style={StyleSheet.applyWidth(
                      GlobalStyles.DividerStyles(theme)['Divider'].style,
                      dimensions.width
                    )}
                  />
                  {/* View 2 */}
                  <View
                    style={StyleSheet.applyWidth(
                      {
                        alignItems: 'center',
                        height: 65,
                        justifyContent: 'center',
                        marginBottom: 20,
                        marginTop: 20,
                        paddingBottom: 5,
                        paddingTop: 5,
                      },
                      dimensions.width
                    )}
                  />
                  {/* Divider 8 */}
                  <Divider
                    {...GlobalStyles.DividerStyles(theme)['Divider'].props}
                    color={palettes.App['Custom Color_16']}
                    style={StyleSheet.applyWidth(
                      GlobalStyles.DividerStyles(theme)['Divider'].style,
                      dimensions.width
                    )}
                  />
                  {/* View 3 */}
                  <View
                    style={StyleSheet.applyWidth(
                      {
                        alignItems: 'center',
                        height: 65,
                        justifyContent: 'center',
                        marginBottom: 20,
                        marginTop: 20,
                        paddingBottom: 5,
                        paddingTop: 5,
                      },
                      dimensions.width
                    )}
                  />
                  {/* Divider 9 */}
                  <Divider
                    {...GlobalStyles.DividerStyles(theme)['Divider'].props}
                    color={palettes.App['Custom Color_16']}
                    style={StyleSheet.applyWidth(
                      GlobalStyles.DividerStyles(theme)['Divider'].style,
                      dimensions.width
                    )}
                  />
                  {/* eventDetailsModal */}
                  <Modal
                    supportedOrientations={['portrait', 'landscape']}
                    animationType={'slide'}
                    presentationStyle={StyleSheet.getWidthValue(
                      [
                        { minWidth: Breakpoints.Laptop, value: 'pageSheet' },
                        { minWidth: Breakpoints.Tablet, value: 'pageSheet' },
                        { minWidth: Breakpoints.Mobile, value: 'fullScreen' },
                      ],
                      dimensions.width
                    )}
                    transparent={true}
                    visible={Boolean(openModal2)}
                  >
                    <View
                      style={StyleSheet.applyWidth(
                        { flex: 1, justifyContent: 'flex-end' },
                        dimensions.width
                      )}
                    >
                      <Touchable
                        onPress={() => {
                          try {
                            setOpenModal2(false);
                          } catch (err) {
                            console.log(err);
                          }
                        }}
                        style={StyleSheet.applyWidth(
                          { height: '30%' },
                          dimensions.width
                        )}
                      />
                      <View
                        style={StyleSheet.applyWidth(
                          {
                            alignItems: 'flex-end',
                            backgroundColor: palettes.App.Studily_White,
                            borderTopLeftRadius: 20,
                            borderTopRightRadius: 20,
                            height: '70%',
                          },
                          dimensions.width
                        )}
                      >
                        <IconButton
                          onPress={() => {
                            try {
                              setOpenModal2(!openModal2);
                            } catch (err) {
                              console.log(err);
                            }
                          }}
                          color={theme.colors.branding.secondary}
                          icon={'AntDesign/closecircleo'}
                          size={24}
                          style={StyleSheet.applyWidth(
                            { marginRight: 10, marginTop: 15 },
                            dimensions.width
                          )}
                        />
                        {/* headerTitle */}
                        <View
                          style={StyleSheet.applyWidth(
                            {
                              alignSelf: 'flex-start',
                              marginTop: -20,
                              paddingBottom: 20,
                              paddingLeft: 15,
                            },
                            dimensions.width
                          )}
                        >
                          <Text
                            accessible={true}
                            selectable={false}
                            {...GlobalStyles.TextStyles(theme)['Text 2'].props}
                            style={StyleSheet.applyWidth(
                              StyleSheet.compose(
                                GlobalStyles.TextStyles(theme)['Text 2'].style,
                                theme.typography.body1,
                                {
                                  color: theme.colors.text.medium,
                                  fontFamily: 'Inter_500Medium',
                                  fontSize: 20,
                                }
                              ),
                              dimensions.width
                            )}
                          >
                            {'Appointment Details'}
                          </Text>
                        </View>
                        {/* BodySection */}
                        <View
                          style={StyleSheet.applyWidth(
                            {
                              alignSelf: 'flex-start',
                              paddingLeft: 15,
                              paddingTop: 15,
                            },
                            dimensions.width
                          )}
                        >
                          <Text
                            accessible={true}
                            selectable={false}
                            {...GlobalStyles.TextStyles(theme)['Text 2'].props}
                            style={StyleSheet.applyWidth(
                              StyleSheet.compose(
                                GlobalStyles.TextStyles(theme)['Text 2'].style,
                                theme.typography.body1,
                                {
                                  color: theme.colors.text.medium,
                                  fontFamily: 'Inter_600SemiBold',
                                  fontSize: 24,
                                }
                              ),
                              dimensions.width
                            )}
                          >
                            {'John Davidson'}
                          </Text>
                          {/* Text 2 */}
                          <Text
                            accessible={true}
                            selectable={false}
                            {...GlobalStyles.TextStyles(theme)['Text 2'].props}
                            style={StyleSheet.applyWidth(
                              StyleSheet.compose(
                                GlobalStyles.TextStyles(theme)['Text 2'].style,
                                theme.typography.body1,
                                {
                                  color: theme.colors.text.normal,
                                  fontFamily: 'Inter_400Regular',
                                  fontSize: 14,
                                  paddingTop: 10,
                                }
                              ),
                              dimensions.width
                            )}
                          >
                            {'Hearing Aid 12:00 PM - 12:30 PM'}
                          </Text>
                          {/* View 2 */}
                          <View
                            style={StyleSheet.applyWidth(
                              {
                                alignItems: 'center',
                                alignSelf: 'auto',
                                backgroundColor: 'rgb(219, 233, 254)',
                                borderColor: 'rgb(49, 46, 129)',
                                borderRadius: 13,
                                borderWidth: 1,
                                gap: 5,
                                marginTop: 15,
                                opacity: 1,
                                padding: 7,
                                paddingBottom: 8,
                                paddingLeft: 8,
                                paddingRight: 8,
                                paddingTop: 8,
                                width: '50%',
                              },
                              dimensions.width
                            )}
                          >
                            <Text
                              accessible={true}
                              selectable={false}
                              style={StyleSheet.applyWidth(
                                {
                                  color: 'rgb(49, 46, 129)',
                                  fontFamily: 'Inter_400Regular',
                                  fontSize: 14,
                                },
                                dimensions.width
                              )}
                            >
                              {'Confirmed'}
                            </Text>
                          </View>
                        </View>
                        {/* Actions Frame first row */}
                        <View
                          style={StyleSheet.applyWidth(
                            {
                              alignSelf: 'flex-start',
                              flexDirection: 'row',
                              flexGrow: 1,
                              flexShrink: 0,
                              justifyContent: 'flex-start',
                              marginTop: 15,
                              paddingLeft: 15,
                              paddingRight: 15,
                              paddingTop: 15,
                              width: '100%',
                            },
                            dimensions.width
                          )}
                        >
                          {/* Flex Touchable */}
                          <View
                            style={StyleSheet.applyWidth(
                              { flexGrow: 1, flexShrink: 0 },
                              dimensions.width
                            )}
                          >
                            <Touchable>
                              {/* Button Frame */}
                              <View
                                style={StyleSheet.applyWidth(
                                  {
                                    backgroundColor:
                                      palettes.App['Custom #ffffff'],
                                    borderBottomWidth: 2,
                                    borderColor: theme.colors.text.normal,
                                    borderLeftWidth: 2,
                                    borderRadius: 12,
                                    borderRightWidth: 2,
                                    borderTopWidth: 2,
                                    flexDirection: 'row',
                                    flexGrow: 1,
                                    flexShrink: 0,
                                    justifyContent: 'center',
                                    marginLeft: 6,
                                    marginRight: 6,
                                    paddingBottom: 8,
                                    paddingTop: 8,
                                  },
                                  dimensions.width
                                )}
                              >
                                {/* Icon Frame */}
                                <View
                                  style={StyleSheet.applyWidth(
                                    {
                                      paddingBottom: 8,
                                      paddingLeft: 8,
                                      paddingTop: 8,
                                    },
                                    dimensions.width
                                  )}
                                >
                                  {/* Search Icon */}
                                  <Icon
                                    color={theme.colors.text.normal}
                                    name={'Feather/user'}
                                    size={18}
                                  />
                                </View>
                                {/* Button Label */}
                                <Text
                                  accessible={true}
                                  selectable={false}
                                  style={StyleSheet.applyWidth(
                                    {
                                      color: theme.colors.text.normal,
                                      fontFamily: 'OpenSans_600SemiBold',
                                      fontSize: 15,
                                      lineHeight: 18,
                                      paddingBottom: 8,
                                      paddingLeft: 6,
                                      paddingRight: 6,
                                      paddingTop: 8,
                                    },
                                    dimensions.width
                                  )}
                                >
                                  {'Patient Details'}
                                </Text>
                              </View>
                            </Touchable>
                          </View>
                          {/* Flex Touchable 2 */}
                          <View
                            style={StyleSheet.applyWidth(
                              { flexGrow: 1, flexShrink: 0 },
                              dimensions.width
                            )}
                          >
                            <Touchable>
                              {/* Button Frame */}
                              <View
                                style={StyleSheet.applyWidth(
                                  {
                                    backgroundColor:
                                      palettes.App.Internal_White,
                                    borderBottomWidth: 2,
                                    borderColor: theme.colors.text.normal,
                                    borderLeftWidth: 2,
                                    borderRadius: 12,
                                    borderRightWidth: 2,
                                    borderTopWidth: 2,
                                    flexDirection: 'row',
                                    flexGrow: 1,
                                    flexShrink: 0,
                                    justifyContent: 'center',
                                    marginLeft: 6,
                                    marginRight: 6,
                                    paddingBottom: 8,
                                    paddingTop: 8,
                                  },
                                  dimensions.width
                                )}
                              >
                                {/* Icon Frame */}
                                <View
                                  style={StyleSheet.applyWidth(
                                    {
                                      paddingBottom: 8,
                                      paddingLeft: 8,
                                      paddingTop: 8,
                                    },
                                    dimensions.width
                                  )}
                                >
                                  {/* Mic Icon */}
                                  <Icon
                                    color={theme.colors.text.normal}
                                    name={'AntDesign/check'}
                                    size={18}
                                  />
                                </View>
                                {/* Button Label */}
                                <Text
                                  accessible={true}
                                  selectable={false}
                                  style={StyleSheet.applyWidth(
                                    {
                                      color: theme.colors.text.normal,
                                      fontFamily: 'OpenSans_600SemiBold',
                                      fontSize: 15,
                                      lineHeight: 18,
                                      paddingBottom: 8,
                                      paddingLeft: 6,
                                      paddingRight: 6,
                                      paddingTop: 8,
                                    },
                                    dimensions.width
                                  )}
                                >
                                  {'Check In'}
                                </Text>
                              </View>
                            </Touchable>
                          </View>
                        </View>
                        {/* Actions Frame second row */}
                        <View
                          style={StyleSheet.applyWidth(
                            {
                              alignSelf: 'flex-start',
                              flexDirection: 'row',
                              flexGrow: 1,
                              flexShrink: 0,
                              justifyContent: 'flex-start',
                              paddingLeft: 15,
                              paddingRight: 15,
                              width: '100%',
                            },
                            dimensions.width
                          )}
                        >
                          {/* Flex Touchable */}
                          <View
                            style={StyleSheet.applyWidth(
                              { flexGrow: 1, flexShrink: 0 },
                              dimensions.width
                            )}
                          >
                            <Touchable>
                              {/* Button Frame */}
                              <View
                                style={StyleSheet.applyWidth(
                                  {
                                    backgroundColor:
                                      palettes.App['Custom #ffffff'],
                                    borderBottomWidth: 2,
                                    borderColor: theme.colors.text.normal,
                                    borderLeftWidth: 2,
                                    borderRadius: 12,
                                    borderRightWidth: 2,
                                    borderTopWidth: 2,
                                    flexDirection: 'row',
                                    flexGrow: 1,
                                    flexShrink: 0,
                                    justifyContent: 'center',
                                    marginLeft: 6,
                                    marginRight: 6,
                                    paddingBottom: 8,
                                    paddingTop: 8,
                                  },
                                  dimensions.width
                                )}
                              >
                                {/* Icon Frame */}
                                <View
                                  style={StyleSheet.applyWidth(
                                    {
                                      paddingBottom: 8,
                                      paddingLeft: 8,
                                      paddingTop: 8,
                                    },
                                    dimensions.width
                                  )}
                                >
                                  {/* Search Icon */}
                                  <Icon
                                    color={theme.colors.text.normal}
                                    name={'Feather/mic'}
                                    size={18}
                                  />
                                </View>
                                {/* Button Label */}
                                <Text
                                  accessible={true}
                                  selectable={false}
                                  style={StyleSheet.applyWidth(
                                    {
                                      color: theme.colors.text.normal,
                                      fontFamily: 'OpenSans_600SemiBold',
                                      fontSize: 15,
                                      lineHeight: 18,
                                      paddingBottom: 8,
                                      paddingLeft: 6,
                                      paddingRight: 6,
                                      paddingTop: 8,
                                    },
                                    dimensions.width
                                  )}
                                >
                                  {'Capture Visit'}
                                </Text>
                              </View>
                            </Touchable>
                          </View>
                          {/* Flex Touchable 2 */}
                          <View
                            style={StyleSheet.applyWidth(
                              { flexGrow: 1, flexShrink: 0 },
                              dimensions.width
                            )}
                          >
                            <Touchable>
                              {/* Button Frame */}
                              <View
                                style={StyleSheet.applyWidth(
                                  {
                                    backgroundColor:
                                      palettes.App.Internal_White,
                                    borderBottomWidth: 2,
                                    borderColor: theme.colors.text.normal,
                                    borderLeftWidth: 2,
                                    borderRadius: 12,
                                    borderRightWidth: 2,
                                    borderTopWidth: 2,
                                    flexDirection: 'row',
                                    flexGrow: 1,
                                    flexShrink: 0,
                                    justifyContent: 'center',
                                    marginLeft: 6,
                                    marginRight: 6,
                                    paddingBottom: 8,
                                    paddingTop: 8,
                                  },
                                  dimensions.width
                                )}
                              >
                                {/* Icon Frame */}
                                <View
                                  style={StyleSheet.applyWidth(
                                    {
                                      paddingBottom: 8,
                                      paddingLeft: 8,
                                      paddingTop: 8,
                                    },
                                    dimensions.width
                                  )}
                                >
                                  {/* Mic Icon */}
                                  <Icon
                                    color={theme.colors.text.normal}
                                    name={'Feather/calendar'}
                                    size={18}
                                  />
                                </View>
                                {/* Button Label */}
                                <Text
                                  accessible={true}
                                  selectable={false}
                                  style={StyleSheet.applyWidth(
                                    {
                                      color: theme.colors.text.normal,
                                      fontFamily: 'OpenSans_600SemiBold',
                                      fontSize: 15,
                                      lineHeight: 18,
                                      paddingBottom: 8,
                                      paddingLeft: 6,
                                      paddingRight: 6,
                                      paddingTop: 8,
                                    },
                                    dimensions.width
                                  )}
                                >
                                  {'Reschedule'}
                                </Text>
                              </View>
                            </Touchable>
                          </View>
                        </View>
                        {/* Actions Frame third row */}
                        <View
                          style={StyleSheet.applyWidth(
                            {
                              alignSelf: 'flex-start',
                              flexDirection: 'row',
                              flexGrow: 3,
                              flexShrink: 0,
                              justifyContent: 'flex-start',
                              paddingLeft: 15,
                              paddingRight: 15,
                              width: '50%',
                            },
                            dimensions.width
                          )}
                        >
                          {/* Flex Touchable 2 */}
                          <View
                            style={StyleSheet.applyWidth(
                              { flexGrow: 1, flexShrink: 0 },
                              dimensions.width
                            )}
                          >
                            <Touchable>
                              {/* Button Frame */}
                              <View
                                style={StyleSheet.applyWidth(
                                  {
                                    backgroundColor:
                                      palettes.App.Internal_White,
                                    borderBottomWidth: 2,
                                    borderColor: theme.colors.text.danger,
                                    borderLeftWidth: 2,
                                    borderRadius: 12,
                                    borderRightWidth: 2,
                                    borderTopWidth: 2,
                                    flexDirection: 'row',
                                    flexGrow: 1,
                                    flexShrink: 0,
                                    justifyContent: 'center',
                                    marginLeft: 6,
                                    marginRight: 6,
                                    paddingBottom: 8,
                                    paddingTop: 8,
                                  },
                                  dimensions.width
                                )}
                              >
                                {/* Icon Frame */}
                                <View
                                  style={StyleSheet.applyWidth(
                                    {
                                      paddingBottom: 8,
                                      paddingLeft: 8,
                                      paddingTop: 8,
                                    },
                                    dimensions.width
                                  )}
                                >
                                  {/* Mic Icon */}
                                  <Icon
                                    color={theme.colors.text.danger}
                                    name={'AntDesign/closecircleo'}
                                    size={18}
                                  />
                                </View>
                                {/* Button Label */}
                                <Text
                                  accessible={true}
                                  selectable={false}
                                  style={StyleSheet.applyWidth(
                                    {
                                      color: theme.colors.text.danger,
                                      fontFamily: 'OpenSans_600SemiBold',
                                      fontSize: 15,
                                      lineHeight: 18,
                                      paddingBottom: 8,
                                      paddingLeft: 6,
                                      paddingRight: 6,
                                      paddingTop: 8,
                                    },
                                    dimensions.width
                                  )}
                                >
                                  {'Cancel'}
                                </Text>
                              </View>
                            </Touchable>
                          </View>
                        </View>
                        {/* Action Frame fourth */}
                        <View
                          style={StyleSheet.applyWidth(
                            {
                              alignSelf: 'flex-start',
                              flexGrow: 1,
                              justifyContent: 'flex-start',
                              marginBottom: 10,
                              paddingLeft: 15,
                              paddingRight: 15,
                              position: 'relative',
                              width: '100%',
                            },
                            dimensions.width
                          )}
                        >
                          {/* Flex Touchable 2 */}
                          <View
                            style={StyleSheet.applyWidth(
                              { flexGrow: 1, flexShrink: 0 },
                              dimensions.width
                            )}
                          >
                            <Touchable
                              onPress={() => {
                                try {
                                  setOpenModal2(!openModal2);
                                } catch (err) {
                                  console.log(err);
                                }
                              }}
                            >
                              {/* Button Frame */}
                              <View
                                style={StyleSheet.applyWidth(
                                  {
                                    backgroundColor:
                                      palettes.App['Custom #d8d8d8'],
                                    borderRadius: 12,
                                    flexDirection: 'row',
                                    flexGrow: 1,
                                    flexShrink: 0,
                                    justifyContent: 'center',
                                    marginLeft: 6,
                                    marginRight: 6,
                                    paddingBottom: 8,
                                    paddingTop: 8,
                                  },
                                  dimensions.width
                                )}
                              >
                                {/* Icon Frame */}
                                <View
                                  style={StyleSheet.applyWidth(
                                    {
                                      paddingBottom: 8,
                                      paddingLeft: 8,
                                      paddingTop: 8,
                                    },
                                    dimensions.width
                                  )}
                                />
                                {/* Button Label */}
                                <Text
                                  accessible={true}
                                  selectable={false}
                                  style={StyleSheet.applyWidth(
                                    {
                                      color: theme.colors.text.normal,
                                      fontFamily: 'Inter_600SemiBold',
                                      fontSize: 16,
                                      lineHeight: 18,
                                      paddingBottom: 8,
                                      paddingLeft: 6,
                                      paddingRight: 6,
                                      paddingTop: 8,
                                    },
                                    dimensions.width
                                  )}
                                >
                                  {'Close'}
                                </Text>
                              </View>
                            </Touchable>
                          </View>
                        </View>
                      </View>
                    </View>
                  </Modal>
                </View>
              </View>
            </View>
          )}
        </>
      </SimpleStyleScrollView>
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
              {/* Button 2 */}
              <Button
                accessible={true}
                iconPosition={'left'}
                onPress={() => {
                  try {
                    setFabOpen(false);
                    navigation.navigate(
                      'PersonalClinicEventScreen',
                      {},
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
              {/* Button 3 */}
              <Button
                accessible={true}
                iconPosition={'left'}
                onPress={() => {
                  try {
                    /* 'Navigate' action requires configuration: choose a navigation destination */
                    setFabOpen(false);
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
      {/* newApptModal */}
      <Modal
        supportedOrientations={['portrait', 'landscape']}
        animationType={'slide'}
        presentationStyle={'fullScreen'}
        transparent={true}
        visible={Boolean(newApptModal)}
      >
        <View
          onLayout={event => {
            try {
              /* 'Set Variable' action requires configuration: choose a variable */
            } catch (err) {
              console.log(err);
            }
          }}
          style={StyleSheet.applyWidth({ flex: 1 }, dimensions.width)}
        >
          <Touchable
            onPress={() => {
              try {
                setNewApptModal(false);
              } catch (err) {
                console.log(err);
              }
            }}
          />
          {/* Main View */}
          <View
            style={StyleSheet.applyWidth(
              {
                backgroundColor: 'rgb(255, 255, 255)',
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                height: '100%',
                paddingRight: 15,
                paddingTop: 15,
              },
              dimensions.width
            )}
          >
            <View
              style={StyleSheet.applyWidth(
                { alignItems: 'flex-end' },
                dimensions.width
              )}
            >
              <IconButton
                onPress={() => {
                  try {
                    setNewApptModal(!newApptModal);
                  } catch (err) {
                    console.log(err);
                  }
                }}
                color={theme.colors.branding.secondary}
                icon={'AntDesign/closecircleo'}
                size={24}
              />
              {/* headerTitle */}
              <View
                style={StyleSheet.applyWidth(
                  {
                    alignSelf: 'flex-start',
                    marginTop: -20,
                    paddingBottom: 2,
                    paddingLeft: 15,
                  },
                  dimensions.width
                )}
              >
                <Text
                  accessible={true}
                  selectable={false}
                  {...GlobalStyles.TextStyles(theme)['Text 2'].props}
                  style={StyleSheet.applyWidth(
                    StyleSheet.compose(
                      GlobalStyles.TextStyles(theme)['Text 2'].style,
                      theme.typography.body1,
                      {
                        color: theme.colors.text.medium,
                        fontFamily: 'Inter_500Medium',
                        fontSize: 20,
                      }
                    ),
                    dimensions.width
                  )}
                >
                  {'New Appointment'}
                </Text>
              </View>
            </View>
            {/* View section */}
            <View
              style={StyleSheet.applyWidth(
                {
                  paddingBottom: 12,
                  paddingLeft: 12,
                  paddingRight: 12,
                  paddingTop: 12,
                },
                dimensions.width
              )}
            >
              {/* WizardView */}
              <Utils.CustomCodeErrorBoundary>
                <WizardCustomView.AppointmentWizard theme={theme}/>
              </Utils.CustomCodeErrorBoundary>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
};

export default withTheme(ScheduleAppntScreen);
