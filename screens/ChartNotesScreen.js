import React from 'react';
import {
  IconButton,
  ScreenContainer,
  SimpleStyleFlashList,
  Surface,
  Pressable,
  withTheme,
  Icon,
} from '@draftbit/ui';
import { ActivityIndicator, Alert, Modal, Text, TouchableOpacity, View } from 'react-native';
import { Fetch } from 'react-request';
import * as GlobalStyles from '../GlobalStyles.js';
import * as SunoApi from '../apis/SunoApi.js';
import CustomAddBlock from '../components/CustomAddBlock';
import CustomChildHeaderBlock from '../components/CustomChildHeaderBlock';
import EmptyListBlock from '../components/EmptyListBlock';
import * as GlobalVariables from '../config/GlobalVariableContext';
import * as CustomCode from '../custom-files/CustomCode';
import * as HtmlView from '../custom-files/HtmlView';
import hasTextInHTML from '../global-functions/hasTextInHTML';
import palettes from '../themes/palettes';
import * as Utils from '../utils';
import Breakpoints from '../utils/Breakpoints';
import * as DateUtils from '../utils/DateUtils';
import * as StyleSheet from '../utils/StyleSheet';
import useIsFocused from '../utils/useIsFocused';
import useNavigation from '../utils/useNavigation';
import useParams from '../utils/useParams';
import useWindowDimensions from '../utils/useWindowDimensions';
import { logError } from '../index.js';

const defaultProps = { id: null };

const ChartNotesScreen = props => {
  const { theme } = props;
  const dimensions = useWindowDimensions();
  const navigation = useNavigation();
  const params = useParams();
  const Constants = GlobalVariables.useValues();
  const Variables = Constants;
  const [reloadChart, setReloadChart] = React.useState(0);
  const sunoDeleteNoteDELETE = SunoApi.useDeleteNoteDELETE();
  const sunoUpdateNoteStatusPATCH = SunoApi.useUpdateNoteStatusPATCH();

  return (
    <ScreenContainer scrollable={false} hasSafeArea={true}>
      <CustomChildHeaderBlock name={'Chart Note'} />


      {/* Recent Chart */}
      <View
        style={StyleSheet.applyWidth(
          { flex: 1, paddingLeft: 20, paddingRight: 20, paddingTop: 20 },
          dimensions.width
        )}
      >
        {/* reviews list */}
        <SunoApi.FetchPatientChartNoteGET
          limit={'100'}
          offset={'0'}
          ordering={'-pinned,-display_moment,-id'}
          patient={params?.id ?? defaultProps.id}
          query={
            '{id,type,created_by,created_at,updated_at,display_moment,updated_by,text,pinned,appointment{id,start_moment,type{id,name}},status,icd10_codes,clinic{id},patient{first_name,last_name}}'
          }
          refreshKey={reloadChart}
        >
          {({ loading, error, data, refetchPatientChartNote }) => {
            const reviewsListData = data?.json;
           
            if (loading) {
              return <ActivityIndicator color={theme.colors.branding.secondary}
              size={'large'}/>;
            }

            if (error || data?.status < 200 || data?.status >= 300) {
              return <ActivityIndicator color={theme.colors.branding.secondary}
              size={'large'}/>;
            }

            return (
              <>
                <>
                  {!(reviewsListData?.results?.length === 0) ? null : (
                    <EmptyListBlock message={'No recent chart notes'} />
                  )}
                </>
                <>
                  {!(reviewsListData?.results?.length === 0) ? null : (
                    <CustomAddBlock
                      onPressEvent={() => {
                        try {
                          navigation.navigate(
                            'NewNoteScreen',
                            {},
                            { pop: true }
                          );
                        } catch (err) {
                          logError(err);
                        }
                      }}
                      title={'Add New Chart Note'}
                    />
                  )}
                </>
                <SimpleStyleFlashList
                  data={reviewsListData}
                  estimatedItemSize={50}
                  horizontal={false}
                  inverted={false}
                  keyExtractor={(flashListData, index) =>
                    flashListData?.id ??
                    flashListData?.uuid ??
                    index?.toString() ??
                    JSON.stringify(flashListData)
                  }
                  listKey={'Recent Chart->reviews list->FlashList'}
                  numColumns={1}
                  onEndReachedThreshold={0.5}
                  renderItem={({ item, index }) => {
                    const flashListData = item;
                    return (
                      <Surface
                        {...GlobalStyles.SurfaceStyles(theme)['Surface'].props}
                        elevation={1}
                        style={StyleSheet.applyWidth(
                          StyleSheet.compose(
                            GlobalStyles.SurfaceStyles(theme)['Surface'].style,
                            {
                              borderColor: palettes.App.TagBorder,
                              borderRadius: 10,
                              borderWidth: 1,
                              marginBottom: 10,
                            }
                          ),
                          dimensions.width
                        )}
                      >
                        {/* <View style={{flexDirection : 'row',flex :1}}> */}
                        {/* Icon Button 2 */}

                        <TouchableOpacity
                          onPress={() => {
                            try {
                              navigation.navigate(
                                'NewNoteScreen',
                                {
                                  id: params?.id ?? defaultProps.id,
                                  chartNoteData: flashListData,
                                },
                                { pop: true }
                              );
                            } catch (err) {
                              logError(err);
                            }
                          }}
                        >
                          <View
                            style={StyleSheet.applyWidth(
                              {
                                backgroundColor:
                                  flashListData?.status === 2
                                    ? 'rgba(207, 207, 207, 0.1)'
                                    : '#ef44441a',
                                borderColor: palettes.App.TagBorder,
                                borderRadius: 10,
                                flexDirection: 'row',
                                paddingBottom: 10,
                                paddingLeft: 10,
                                paddingRight: 10,
                                paddingTop: 10,
                                flex: 1,
                                justifyContent: 'space-between'
                              },
                              dimensions.width
                            )}
                          >

                            {/* Details */}
                            <View
                              style={StyleSheet.applyWidth(
                                { flex: 1 },
                                dimensions.width
                              )}
                            >
                              <View
                                style={StyleSheet.applyWidth(
                                  {
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItem: 'center',
                                    flex: 1,
                                  },
                                  dimensions.width
                                )}
                              >
                                {/* Name */}
                                <Text
                                  accessible={true}
                                  selectable={false}
                                  style={StyleSheet.applyWidth(
                                    {
                                      color: palettes.App['Custom Color_18'],
                                      fontFamily: 'Inter_500Medium',
                                      fontSize: 16,
                                      flex: 1
                                    },
                                    dimensions.width
                                  )}
                                >
                                  {flashListData?.appointment === null
                                    ? flashListData?.type === 1
                                      ? 'General Note'
                                      : flashListData?.type === 2
                                        ? 'Patient Visit'
                                        : 'Billing Note'
                                    : flashListData?.appointment?.type?.name}
                                </Text>

                                {!(hasTextInHTML(flashListData?.text)
                                  ? flashListData?.status !== 2
                                  : undefined) ? null : (
                                  <TouchableOpacity style={{ width: 50, alignItems: 'flex-end' }} onPress={() => {
                                    const handler = async () => {
                                      // setVisible(true)
                                      Alert.alert(
                                        'Confirmation',
                                        'Are you sure you want to mark this chart note as completed?',
                                        [
                                          {
                                            text: 'Cancel',
                                            style: 'cancel',
                                            onPress: () => {
                                              // handle cancel action
                                              console.log('User cancelled');
                                            },
                                          },
                                          {
                                            text: 'Yes',
                                            onPress: async () => {
                                              let error = null;
                                              try {
                                                const chartData = (
                                                  await sunoUpdateNoteStatusPATCH.mutateAsync(
                                                    {
                                                      id: flashListData?.id,
                                                      note: flashListData?.text,
                                                    }
                                                  )
                                                )?.json;

                                                setReloadChart(reloadChart + 1);
                                                Alert.alert(
                                                  '',
                                                  'This chart note has been marked as completed successfully.'
                                                );

                                              } catch (err) {
                                                logError(err);
                                                error = err.message ?? err;
                                              }

                                            },
                                          },
                                        ],
                                        { cancelable: true }
                                      );

                                    }
                                    handler();
                                  }}>

                                    <Icon

                                      color={palettes.App.FilterTextColor}
                                      name={'MaterialCommunityIcons/checkbox-blank-outline'}
                                      size={30}
                                    />
                                  </TouchableOpacity>

                                )}



                              </View>
                              {/* Date */}
                              <Text
                                accessible={true}
                                selectable={false}
                                style={StyleSheet.applyWidth(
                                  {
                                    color: palettes.App['Custom Color_18'],
                                    fontFamily: 'Inter_400Regular',
                                    fontSize: 12,
                                  },
                                  dimensions.width
                                )}
                              >
                                {flashListData?.appointment === null ? flashListData?.created_at === null
                                  ? undefined
                                  : DateUtils.format(
                                    flashListData?.created_at,
                                    'MMM DD, YYYY'
                                  ) : DateUtils.format(
                                    flashListData?.appointment?.start_moment,
                                    'MMM DD, YYYY'
                                  )}
                              </Text>
                              {/* View 2 */}
                              <View
                                style={StyleSheet.applyWidth(
                                  {
                                    alignContent: 'center',
                                    alignSelf: 'auto',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                  },
                                  dimensions.width
                                )}
                              >
                                {/* timestamp */}
                                <Text
                                  accessible={true}
                                  selectable={false}
                                  style={StyleSheet.applyWidth(
                                    {
                                      color: palettes.App['Custom Color_18'],
                                      fontFamily: 'Inter_400Regular',
                                      fontSize: 12,
                                      marginBottom: 8,
                                      marginTop: 8,
                                      opacity: 0.7,
                                    },
                                    dimensions.width
                                  )}
                                >
                                  {'By: '}
                                  {flashListData?.updated_by === null
                                    ? flashListData?.created_by?.full_name
                                    : flashListData?.updated_by?.full_name}
                                  {' at '}
                                  {DateUtils.format(
                                    flashListData?.updated_at,
                                    'MM/DD/YYYY hh:mm a'
                                  )}
                                </Text>

                                <View
                                  style={StyleSheet.applyWidth(
                                    { flexDirection: 'row' },
                                    dimensions.width
                                  )}
                                >
                                  {/* <>
                                  {!(
                                    flashListData?.created_by?.id ===
                                    Constants['UserInfo']?.id
                                  ) ? null : (
                                    <IconButton
                                      onPress={() => {
                                        const handler = async () => {
                                          try {
                                            const chartData = (
                                              await sunoDeleteNoteDELETE.mutateAsync(
                                                { id: flashListData?.id }
                                              )
                                            )?.json;
                                            setReloadChart(reloadChart + 1);
                                          } catch (err) {
                                            logError(err);
                                          }
                                        };
                                        handler();
                                      }}
                                      color={palettes.App.FilterTextColor}
                                      icon={'MaterialIcons/delete'}
                                      size={25}
                                      style={StyleSheet.applyWidth(
                                        { right: 5 },
                                        dimensions.width
                                      )}
                                    />
                                  )}
                                </> */}
                                  {/* Icon Button 2 */}
                                  {/* <>
                                    {!(hasTextInHTML(flashListData?.text)
                                      ? flashListData?.status !== 2
                                      : undefined) ? null : (
                                      <IconButton
                                        onPress={() => {
                                          const handler = async () => {

                                            let error = null;
                                            try {

                                              const chartData = (
                                                await sunoUpdateNoteStatusPATCH.mutateAsync(
                                                  {
                                                    id: flashListData?.id,
                                                    note: flashListData?.text,
                                                  }
                                                )
                                              )?.json;

                                              setReloadChart(reloadChart + 1);

                                            } catch (err) {
                                              logError(err);
                                              error = err.message ?? err;
                                            }

                                          };
                                          handler();
                                        }}
                                        color={palettes.App.FilterTextColor}
                                        icon={'MaterialCommunityIcons/file-check'}
                                        size={25}
                                      />
                                    )}
                                  </> */}
                                </View>
                              </View>
                              <Utils.CustomCodeErrorBoundary>
                                <HtmlView.HtmlView
                                  htmlContent={flashListData?.text}
                                  patientData={flashListData}
                                  fontSize={13}
                                  color={palettes.App['Custom Color_18']}
                                />
                              </Utils.CustomCodeErrorBoundary>

                            </View>
                          </View>
                        </TouchableOpacity>


                      </Surface>
                    );
                  }}
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                  style={StyleSheet.applyWidth(
                    {
                      borderRadius: 12,
                      overflow: 'hidden',
                      paddingBottom: 10,
                      paddingTop: 10,
                    },
                    dimensions.width
                  )}
                />
              </>
            );
          }}
        </SunoApi.FetchPatientChartNoteGET>
      </View>
    </ScreenContainer>
  );
};

export default withTheme(ChartNotesScreen);