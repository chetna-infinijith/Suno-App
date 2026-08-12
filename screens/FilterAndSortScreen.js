import React from 'react';
import {
  Button,
  Icon,
  Pressable,
  ScreenContainer,
  SimpleStyleFlatList,
  Surface,
  Touchable,
  withTheme,
} from '@draftbit/ui';
import { ScrollView, Text, View } from 'react-native';
import * as GlobalStyles from '../GlobalStyles.js';
import * as SunoApi from '../apis/SunoApi.js';
import * as GlobalVariables from '../config/GlobalVariableContext';
import * as CustomCode from '../custom-files/CustomCode';
import * as DropDownBlock from '../custom-files/DropDownBlock';
import fetchAppointments from '../global-functions/fetchAppointments';
import fetchInsurance from '../global-functions/fetchInsurance';
import fetchProviders from '../global-functions/fetchProviders';
import fetchSelectedTags from '../global-functions/fetchSelectedTags';
import getPatientTags from '../global-functions/getPatientTags';
import getSelectedTagColor from '../global-functions/getSelectedTagColor';
import setPatientApplyFilter from '../global-functions/setPatientApplyFilter';
import setPatientResetFilter from '../global-functions/setPatientResetFilter';
import palettes from '../themes/palettes';
import * as Utils from '../utils';
import Breakpoints from '../utils/Breakpoints';
import * as StyleSheet from '../utils/StyleSheet';
import useIsFocused from '../utils/useIsFocused';
import useNavigation from '../utils/useNavigation';
import useParams from '../utils/useParams';
import useWindowDimensions from '../utils/useWindowDimensions';

const FilterAndSortScreen = props => {
  const { theme } = props;
  const dimensions = useWindowDimensions();
  const navigation = useNavigation();
  const Constants = GlobalVariables.useValues();
  const Variables = Constants;
  const setGlobalVariableValue = GlobalVariables.useSetValue();
  const [appoinmentTypes, setAppoinmentTypes] = React.useState([]);
  const [globalTags, setGlobalTags] = React.useState([]);
  const [insuranceTypes, setInsuranceTypes] = React.useState([]);
  const [patientType, setPatientType] = React.useState(false);
  const [providers, setProviders] = React.useState([]);
  const [radioButtonFilterValue, setRadioButtonFilterValue] = React.useState(1);
  const [radioButtonGroupValue, setRadioButtonGroupValue] = React.useState('');
  const [selectedAppointmentTypes, setSelectedAppointmentTypes] =
    React.useState('');
  const [selectedID, setSelectedID] = React.useState('');
  const [selectedInsuranceTypes, setSelectedInsuranceTypes] =
    React.useState('');
  const [selectedProvider, setSelectedProvider] = React.useState('');
  const [selectedTags, setSelectedTags] = React.useState([]);
  const [selectedoption, setSelectedoption] = React.useState(
    'Recommended For You'
  );
  const isFocused = useIsFocused();
  React.useEffect(() => {
    const handler = async () => {
      try {
        if (!isFocused) {
          return;
        }
        setRadioButtonFilterValue(Constants['is_active_patient']);
        setSelectedProvider(Constants['selectedProvider']);
        setSelectedInsuranceTypes(Constants['selectedInsurance']);
        setSelectedAppointmentTypes(Constants['selectedAppointments']);
        setSelectedTags(getPatientTags(Variables, setGlobalVariableValue));
        const AllGlobalTags = (
          await SunoApi.getGlobalTagsGET(Constants, {
            is_active: true,
            limit: 300,
            type: 'Patient',
          })
        )?.json;
        const GlobalTagsData = AllGlobalTags;
        setGlobalTags(GlobalTagsData);
        const allProviderData = (
          await SunoApi.getProvidersGET(Constants, {
            is_active: true,
            limit: 300,
            query: '{*}',
          })
        )?.json;
        const providersData = fetchProviders(allProviderData);
        setProviders(providersData);
        setSelectedProvider(Constants['selectedProvider']);
        const allAppointmentData = (
          await SunoApi.getAppointmentTypesGET(Constants, {
            exclude_type: 4,
            is_active: true,
            limit: 300,
            query: '{*}',
          })
        )?.json;
        const appointmentData = fetchAppointments(allAppointmentData);
        setAppoinmentTypes(appointmentData);
        const allInsurenceData = (
          await SunoApi.getInsurersGET(Constants, {
            country: 'United States of America',
            is_active: true,
            limit: 300,
            offset: 0,
            query: '{*}',
          })
        )?.json;
        const insurenceData = fetchInsurance(allInsurenceData);
        setInsuranceTypes(insurenceData);
      } catch (err) {
        console.log(err);
      }
    };
    handler();
  }, [isFocused]);

  return (
    <ScreenContainer scrollable={false} hasSafeArea={true}>
      {/* Header */}
      <View
        style={StyleSheet.applyWidth(
          {
            alignItems: 'center',
            flexDirection: 'row',
            height: 48,
            marginTop: 12,
            paddingLeft: 10,
            paddingRight: 16,
          },
          dimensions.width
        )}
      >
        {/* Back Click */}
        <View
          style={StyleSheet.applyWidth(
            {
              alignItems: 'center',
              height: 48,
              justifyContent: 'center',
              width: 48,
            },
            dimensions.width
          )}
        >
          <Touchable
            onPress={() => {
              try {
                navigation.goBack();
              } catch (err) {
                console.log(err);
              }
            }}
          >
            <Icon
              size={24}
              color={theme.colors.text.normal}
              name={'Ionicons/close'}
            />
          </Touchable>
        </View>
        {/* Screen Heading */}
        <Text
          accessible={true}
          selectable={false}
          style={StyleSheet.applyWidth(
            {
              color: palettes.App.FilterTextColor,
              fontFamily: 'Inter_600SemiBold',
              fontSize: 20,
              marginLeft: 16,
            },
            dimensions.width
          )}
        >
          {'Filter & Patient'}
        </Text>
      </View>

      <ScrollView
        bounces={true}
        horizontal={false}
        keyboardShouldPersistTaps={'never'}
        nestedScrollEnabled={false}
        showsHorizontalScrollIndicator={true}
        showsVerticalScrollIndicator={true}
      >
        {/* Search */}
        <View
          style={StyleSheet.applyWidth(
            { paddingLeft: 20, paddingRight: 20, paddingTop: 20, zIndex: 0 },
            dimensions.width
          )}
        >
          {/* Title */}
          <Text
            accessible={true}
            selectable={false}
            style={StyleSheet.applyWidth(
              {
                color: palettes.App.FilterTextColor,
                fontFamily: 'Inter_600SemiBold',
                fontSize: 15,
              },
              dimensions.width
            )}
          >
            {'Patient Status'}
          </Text>
          {/* RadioView */}
          <View>
            {/* Pressable 2 */}
            <Pressable
              onPress={() => {
                try {
                  setRadioButtonFilterValue(true);
                } catch (err) {
                  console.log(err);
                }
              }}
              style={StyleSheet.applyWidth(
                { marginBottom: 10, marginTop: 10 },
                dimensions.width
              )}
            >
              <View
                style={StyleSheet.applyWidth(
                  { alignItems: 'center', flexDirection: 'row' },
                  dimensions.width
                )}
              >
                {/* Icon 2 */}
                <Icon
                  color={
                    radioButtonFilterValue === true
                      ? '#3b82f6'
                      : palettes.App.ButtonColor
                  }
                  name={
                    radioButtonFilterValue === true
                      ? 'MaterialIcons/radio-button-checked'
                      : 'MaterialIcons/radio-button-off'
                  }
                  size={22}
                />
                <Text
                  accessible={true}
                  selectable={false}
                  {...GlobalStyles.TextStyles(theme)['Text 2'].props}
                  style={StyleSheet.applyWidth(
                    StyleSheet.compose(
                      GlobalStyles.TextStyles(theme)['Text 2'].style,
                      theme.typography.body1,
                      { color: palettes.App.ButtonColor, marginLeft: 10 }
                    ),
                    dimensions.width
                  )}
                >
                  {'Active Patients'}
                </Text>
              </View>
            </Pressable>
            {/* Pressable 3 */}
            <Pressable
              onPress={() => {
                try {
                  setRadioButtonFilterValue(false);
                } catch (err) {
                  console.log(err);
                }
              }}
            >
              <View
                style={StyleSheet.applyWidth(
                  { alignItems: 'center', flexDirection: 'row' },
                  dimensions.width
                )}
              >
                {/* Icon 2 */}
                <Icon
                  color={
                    radioButtonFilterValue === false
                      ? '#3b82f6'
                      : palettes.App.ButtonColor
                  }
                  name={
                    radioButtonFilterValue === false
                      ? 'MaterialIcons/radio-button-checked'
                      : 'MaterialIcons/radio-button-off'
                  }
                  size={22}
                />
                <Text
                  accessible={true}
                  selectable={false}
                  {...GlobalStyles.TextStyles(theme)['Text 2'].props}
                  style={StyleSheet.applyWidth(
                    StyleSheet.compose(
                      GlobalStyles.TextStyles(theme)['Text 2'].style,
                      theme.typography.body1,
                      { color: palettes.App.ButtonColor, marginLeft: 10 }
                    ),
                    dimensions.width
                  )}
                >
                  {'Inactive Patients'}
                </Text>
              </View>
            </Pressable>
          </View>
          {/* Title */}
          <Text
            accessible={true}
            selectable={false}
            style={StyleSheet.applyWidth(
              {
                color: palettes.App.FilterTextColor,
                fontFamily: 'Inter_600SemiBold',
                fontSize: 15,
                marginBottom: 7,
                marginTop: 30,
              },
              dimensions.width
            )}
          >
            {'Provider'}
          </Text>

          <View
            style={StyleSheet.applyWidth({ zIndex: 600 }, dimensions.width)}
          >
            <>
              {!(providers?.length > 0) ? null : (
                <Utils.CustomCodeErrorBoundary>
                  <DropDownBlock.DropDownBlock
                    dropdownData={providers}
                    value={selectedProvider}
                    setValue={setSelectedProvider}
                  />
                </Utils.CustomCodeErrorBoundary>
              )}
            </>
          </View>
          {/* Insurance */}
          <Text
            accessible={true}
            selectable={false}
            style={StyleSheet.applyWidth(
              {
                color: palettes.App.FilterTextColor,
                fontFamily: 'Inter_600SemiBold',
                fontSize: 15,
                paddingBottom: 7,
              },
              dimensions.width
            )}
          >
            {'Insurance'}
          </Text>
          {/* View  */}
          <View
            style={StyleSheet.applyWidth({ zIndex: 300 }, dimensions.width)}
          >
            {/* Custom Code 2 */}
            <>
              {!(insuranceTypes?.length > 0) ? null : (
                <Utils.CustomCodeErrorBoundary>
                  <DropDownBlock.DropDownBlock
                    dropdownData={insuranceTypes}
                    value={selectedInsuranceTypes}
                    setValue={setSelectedInsuranceTypes}
                  />
                </Utils.CustomCodeErrorBoundary>
              )}
            </>
          </View>
          {/* Title 4 */}
          <Text
            accessible={true}
            selectable={false}
            style={StyleSheet.applyWidth(
              {
                color: palettes.App.FilterTextColor,
                fontFamily: 'Inter_600SemiBold',
                fontSize: 15,
              },
              dimensions.width
            )}
          >
            {'Tags'}
          </Text>
          {/* Tags Container */}
          <View
            style={StyleSheet.applyWidth(
              { gap: 6, marginTop: 20 },
              dimensions.width
            )}
          >
            <SimpleStyleFlatList
              data={globalTags}
              decelerationRate={'normal'}
              horizontal={false}
              inverted={false}
              keyExtractor={(listData, index) =>
                listData?.id ??
                listData?.uuid ??
                index?.toString() ??
                JSON.stringify(listData)
              }
              keyboardShouldPersistTaps={'never'}
              listKey={'Scroll View->Search->Tags Container->List'}
              nestedScrollEnabled={false}
              numColumns={1}
              onEndReachedThreshold={0.5}
              pagingEnabled={false}
              renderItem={({ item, index }) => {
                const listData = item;
                return (
                  <Pressable
                    onPress={() => {
                      try {
                        const GetselectedTags = fetchSelectedTags(
                          selectedTags,
                          listData
                        );
                        setSelectedTags(GetselectedTags);
                      } catch (err) {
                        console.log(err);
                      }
                    }}
                    activeOpacity={0.3}
                  >
                    <Surface
                      {...GlobalStyles.SurfaceStyles(theme)['Surface'].props}
                      elevation={0}
                      style={StyleSheet.applyWidth(
                        StyleSheet.compose(
                          GlobalStyles.SurfaceStyles(theme)['Surface'].style,
                          {
                            backgroundColor: [
                              {
                                minWidth: Breakpoints.Mobile,
                                value: theme.colors.branding.secondary,
                              },
                              {
                                minWidth: Breakpoints.Mobile,
                                value: getSelectedTagColor(
                                  selectedTags,
                                  listData
                                ),
                              },
                            ],
                            borderColor: [
                              {
                                minWidth: Breakpoints.Mobile,
                                value: palettes.App.TagBorder,
                              },
                              { minWidth: Breakpoints.Mobile, value: listData },
                            ],
                            borderRadius: 20,
                            borderWidth: 1,
                            justifyContent: 'center',
                            paddingBottom: 6,
                            paddingLeft: 12,
                            paddingRight: 12,
                            paddingTop: 6,
                          }
                        ),
                        dimensions.width
                      )}
                    >
                      <Text
                        accessible={true}
                        selectable={false}
                        {...GlobalStyles.TextStyles(theme)['Text'].props}
                        style={StyleSheet.applyWidth(
                          StyleSheet.compose(
                            GlobalStyles.TextStyles(theme)['Text'].style,
                            {
                              color: [
                                {
                                  minWidth: Breakpoints.Mobile,
                                  value: theme.colors.text.normal,
                                },
                                {
                                  minWidth: Breakpoints.Mobile,
                                  value:
                                    selectedID === listData?.id
                                      ? palettes.Slate[50]
                                      : theme.colors.text.normal,
                                },
                              ],
                              fontFamily: 'Poppins_500Medium',
                            }
                          ),
                          dimensions.width
                        )}
                      >
                        {listData?.name}
                      </Text>
                    </Surface>
                  </Pressable>
                );
              }}
              showsHorizontalScrollIndicator={true}
              showsVerticalScrollIndicator={true}
              snapToAlignment={'start'}
              style={StyleSheet.applyWidth(
                { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
                dimensions.width
              )}
            />
          </View>
        </View>
      </ScrollView>
      {/* Actions */}
      <View
        style={StyleSheet.applyWidth(
          {
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingBottom: 20,
            paddingLeft: 20,
            paddingRight: 20,
            paddingTop: 20,
          },
          dimensions.width
        )}
      >
        {/* Reset */}
        <Button
          accessible={true}
          iconPosition={'left'}
          onPress={() => {
            const handler = async () => {
              try {
                await setGlobalVariableValue({
                  key: 'isApplyFilter',
                  value: false,
                });
                setSelectedTags([]);
                setSelectedProvider('');
                setSelectedInsuranceTypes('');
                setSelectedAppointmentTypes('');
                setRadioButtonFilterValue(true);
                setPatientResetFilter(Variables, setGlobalVariableValue);
                navigation.goBack();
              } catch (err) {
                console.log(err);
              }
            };
            handler();
          }}
          style={StyleSheet.applyWidth(
            {
              backgroundColor: palettes.App['Custom #ffffff'],
              borderColor: palettes.App.TagBorder,
              borderRadius: 8,
              borderWidth: 2,
              color: palettes.App.FilterTextColor,
              fontFamily: 'Inter_500Medium',
              fontSize: 15,
              height: 58,
              textAlign: 'center',
              width: '48%',
            },
            dimensions.width
          )}
          title={'Reset'}
        />
        {/* Apply */}
        <Button
          accessible={true}
          iconPosition={'left'}
          onPress={() => {
            const handler = async () => {
              try {
                await setGlobalVariableValue({
                  key: 'isApplyFilter',
                  value: true,
                });
                await setGlobalVariableValue({
                  key: 'selectedInsurance',
                  value: selectedInsuranceTypes,
                });
                await setGlobalVariableValue({
                  key: 'selectedProvider',
                  value: selectedProvider,
                });
                await setGlobalVariableValue({
                  key: 'is_active_patient',
                  value: radioButtonFilterValue,
                });
                navigation.goBack();
                setPatientApplyFilter(
                  Variables,
                  setGlobalVariableValue,
                  radioButtonFilterValue,
                  selectedTags,
                  undefined,
                  undefined,
                  undefined,
                  undefined,
                  undefined,
                  undefined,
                  undefined,
                  undefined,
                  undefined,
                  undefined,
                  undefined
                );
              } catch (err) {
                console.log(err);
              }
            };
            handler();
          }}
          style={StyleSheet.applyWidth(
            {
              backgroundColor: theme.colors.branding.secondary,
              borderColor: theme.colors.branding.secondary,
              borderRadius: 8,
              borderWidth: 1,
              fontFamily: 'Inter_500Medium',
              fontSize: 15,
              height: 58,
              textAlign: 'center',
              width: '48%',
            },
            dimensions.width
          )}
          title={'Apply Filters'}
        />
      </View>
    </ScreenContainer>
  );
};

export default withTheme(FilterAndSortScreen);
