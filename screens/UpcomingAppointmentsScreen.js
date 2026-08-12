import React from 'react';
import {
  ScreenContainer,
  SimpleStyleFlashList,
  Surface,
  withTheme,
} from '@draftbit/ui';
import { ActivityIndicator, Text, View } from 'react-native';
import { Fetch } from 'react-request';
import * as GlobalStyles from '../GlobalStyles.js';
import * as SunoApi from '../apis/SunoApi.js';
import CustomAddBlock from '../components/CustomAddBlock';
import CustomChildHeaderBlock from '../components/CustomChildHeaderBlock';
import EmptyListBlock from '../components/EmptyListBlock';
import formatTime from '../global-functions/formatTime';
import getCurrentTime from '../global-functions/getCurrentTime';
import palettes from '../themes/palettes';
import Breakpoints from '../utils/Breakpoints';
import * as DateUtils from '../utils/DateUtils';
import * as StyleSheet from '../utils/StyleSheet';
import useIsFocused from '../utils/useIsFocused';
import useNavigation from '../utils/useNavigation';
import useParams from '../utils/useParams';
import useWindowDimensions from '../utils/useWindowDimensions';

const defaultProps = { id: null };

const UpcomingAppointmentsScreen = props => {
  const { theme } = props;
  const dimensions = useWindowDimensions();
  const navigation = useNavigation();
  const params = useParams();
  const [patientDetailsData, setPatientDetailsData] = React.useState({});

  return (
    <ScreenContainer scrollable={false} hasSafeArea={true}>
      <CustomChildHeaderBlock name={'Upcoming Appointments'} />
      {/* Upcomming Appointment */}
      <View
        style={StyleSheet.applyWidth(
          { flex: 1, paddingLeft: 20, paddingRight: 20, paddingTop: 20 },
          dimensions.width
        )}
      >
        {/* reviews list */}
        <SunoApi.FetchPatientAppointmentsGET
          after_moment={getCurrentTime(undefined)}
          before_moment={''}
          id={params?.id ?? defaultProps.id}
          offset={'0'}
          ordering={'start_moment'}
          patient={params?.id ?? defaultProps.id}
          status={'0,1,2,5,99,7'}
        >
          {({ loading, error, data, refetchPatientAppointments }) => {
            const reviewsListData = data?.json;
            if (loading) {
              return <ActivityIndicator />;
            }

            if (error || data?.status < 200 || data?.status >= 300) {
              return <ActivityIndicator />;
            }

            return (
              <>
                <>
                  {!(reviewsListData?.results?.length === 0) ? null : (
                    <EmptyListBlock message={'No upcoming appointments'} />
                  )}
                </>
                <>
                  {!(reviewsListData?.results?.length === 0) ? null : (
                    <CustomAddBlock
                      onPressEvent={() => {
                        try {
                          navigation.navigate(
                            'WizardViewScreen',
                            {},
                            { pop: true }
                          );
                        } catch (err) {
                          console.log(err);
                        }
                      }}
                    />
                  )}
                </>
                <>
                  {reviewsListData?.results?.length === 0 ? null : (
                    <SimpleStyleFlashList
                      data={reviewsListData?.results}
                      estimatedItemSize={50}
                      horizontal={false}
                      inverted={false}
                      keyExtractor={(flashListData, index) =>
                        flashListData?.id ??
                        flashListData?.uuid ??
                        index?.toString() ??
                        JSON.stringify(flashListData)
                      }
                      listKey={'Upcomming Appointment->reviews list->FlashList'}
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
                            <View
                              style={StyleSheet.applyWidth(
                                {
                                  backgroundColor: palettes.App['Custom Color'],
                                  borderBottomLeftRadius: 10,
                                  borderBottomRightRadius: 10,
                                  borderTopLeftRadius: 10,
                                  borderTopRightRadius: 10,
                                  flexDirection: 'row',
                                  paddingBottom: 10,
                                  paddingLeft: 10,
                                  paddingRight: 10,
                                  paddingTop: 10,
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
                                        color: [
                                          {
                                            minWidth: Breakpoints.Mobile,
                                            value: theme.colors.text.strong,
                                          },
                                          {
                                            minWidth: Breakpoints.Mobile,
                                            value: flashListData?.tag?.color,
                                          },
                                        ],
                                        fontFamily: 'Inter_500Medium',
                                        fontSize: 16,
                                      },
                                      dimensions.width
                                    )}
                                  >
                                    {DateUtils.format(
                                      flashListData?.start_moment,
                                      'MM/DD/YYYY'
                                    )}
                                  </Text>
                                  {/* Name 2 */}
                                  <Text
                                    accessible={true}
                                    selectable={false}
                                    style={StyleSheet.applyWidth(
                                      {
                                        color: [
                                          {
                                            minWidth: Breakpoints.Mobile,
                                            value: theme.colors.text.strong,
                                          },
                                          {
                                            minWidth: Breakpoints.Mobile,
                                            value: flashListData?.tag?.color,
                                          },
                                        ],
                                        fontFamily: 'Inter_500Medium',
                                        fontSize: 16,
                                      },
                                      dimensions.width
                                    )}
                                  >
                                    {formatTime(
                                      flashListData?.start_moment,
                                      flashListData?.clinic?.timezone
                                    )}
                                  </Text>
                                </View>
                                {/* timestamp */}
                                <Text
                                  accessible={true}
                                  selectable={false}
                                  style={StyleSheet.applyWidth(
                                    {
                                      color: [
                                        {
                                          minWidth: Breakpoints.Mobile,
                                          value: theme.colors.text.strong,
                                        },
                                        {
                                          minWidth: Breakpoints.Mobile,
                                          value: flashListData?.tag?.color,
                                        },
                                      ],
                                      fontFamily: 'Inter_400Regular',
                                      fontSize: 12,
                                      marginTop: 8,
                                      opacity: 0.7,
                                    },
                                    dimensions.width
                                  )}
                                >
                                  {flashListData?.type?.name}
                                </Text>
                                {/* Review */}
                                <Text
                                  accessible={true}
                                  selectable={false}
                                  numberOfLines={3}
                                  style={StyleSheet.applyWidth(
                                    {
                                      color: [
                                        {
                                          minWidth: Breakpoints.Mobile,
                                          value: theme.colors.text.strong,
                                        },
                                        {
                                          minWidth: Breakpoints.Mobile,
                                          value: flashListData?.tag?.color,
                                        },
                                      ],
                                      fontFamily: 'Inter_400Regular',
                                      fontSize: 13,
                                      lineHeight: 16,
                                      marginTop: 8,
                                      opacity: 0.6,
                                    },
                                    dimensions.width
                                  )}
                                >
                                  {'Staff : '}
                                  {flashListData?.staff_member?.first_name ?? ''}{' '}
                                  {flashListData?.staff_member?.last_name ?? ''}
                                </Text>
                              </View>
                            </View>
                          </Surface>
                        );
                      }}
                      showsHorizontalScrollIndicator={true}
                      showsVerticalScrollIndicator={true}
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
                  )}
                </>
              </>
            );
          }}
        </SunoApi.FetchPatientAppointmentsGET>
      </View>
    </ScreenContainer>
  );
};

export default withTheme(UpcomingAppointmentsScreen);
