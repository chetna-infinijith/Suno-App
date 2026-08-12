import React from 'react';
import { Surface, Touchable, withTheme } from '@draftbit/ui';
import { Text, View, ScrollView } from 'react-native';
import palettes from '../themes/palettes';
import * as StyleSheet from '../utils/StyleSheet';
import useWindowDimensions from '../utils/useWindowDimensions';

const CalendarGrid = props => {
  const {
    theme,
    appointments = [], // Pass appointments as props
    providers = ['Dr. Smith', 'Dr. Johnson', 'Dr. Williams'], // Pass providers as props
    timeSlots = [
      '8:00 AM',
      '8:30 AM',
      '9:00 AM',
      '9:30 AM',
      '10:00 AM',
      '10:30 AM',
      '11:00 AM',
      '11:30 AM',
      '12:00 PM',
    ], // Pass time slots as props
    onAppointmentPress = () => {}, // Callback for appointment press
    appointmentColors = {
      AUD: palettes.App['Custom Color_3'] || '#E8F5E8',
      HA: palettes.App['Custom Color_4'] || '#E3F2FD',
      CONS: palettes.App['Custom Color_5'] || '#FFF3E0',
    },
  } = props;

  const dimensions = useWindowDimensions();

  const getAppointmentForSlot = (time, provider) => {
    return appointments.find(
      apt => apt.time && apt.time.includes(time) && apt.provider === provider
    );
  };

  return (
    <View style={StyleSheet.applyWidth({ flex: 1 }, dimensions.width)}>
      {/* Calendar Header */}
      <Surface
        elevation={1}
        style={StyleSheet.applyWidth(
          {
            backgroundColor: theme.colors.background.screen,
            borderBottomColor: theme.colors.border.brand,
            borderBottomWidth: 1,
          },
          dimensions.width
        )}
      >
        <View
          style={StyleSheet.applyWidth(
            {
              flexDirection: 'row',
              paddingVertical: 12,
            },
            dimensions.width
          )}
        >
          {/* Time Column Header */}
          <View
            style={StyleSheet.applyWidth(
              {
                flex: 1,
                paddingHorizontal: 8,
              },
              dimensions.width
            )}
          >
            <Text
              style={StyleSheet.applyWidth(
                {
                  color: theme.colors.text.medium,
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 10,
                  textAlign: 'center',
                },
                dimensions.width
              )}
            >
              {'TIME'}
            </Text>
          </View>

          {/* Provider Headers */}
          {providers.map((provider, index) => (
            <View
              key={provider}
              style={StyleSheet.applyWidth(
                {
                  borderLeftColor: theme.colors.border.brand,
                  borderLeftWidth: index === 0 ? 1 : 0,
                  flex: 1,
                  paddingHorizontal: 8,
                },
                dimensions.width
              )}
            >
              <Text
                style={StyleSheet.applyWidth(
                  {
                    color: theme.colors.text.strong,
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 10,
                    textAlign: 'center',
                  },
                  dimensions.width
                )}
              >
                {provider}
              </Text>
            </View>
          ))}
        </View>
      </Surface>

      {/* Calendar Grid */}
      <ScrollView
        style={StyleSheet.applyWidth({ flex: 1 }, dimensions.width)}
        showsVerticalScrollIndicator={false}
      >
        {timeSlots.map((time, timeIndex) => (
          <View
            key={time}
            style={StyleSheet.applyWidth(
              {
                borderBottomColor: theme.colors.border.brand,
                borderBottomWidth: 0.5,
                flexDirection: 'row',
                minHeight: 60,
              },
              dimensions.width
            )}
          >
            {/* Time Column */}
            <View
              style={StyleSheet.applyWidth(
                {
                  borderRightColor: theme.colors.border.brand,
                  borderRightWidth: 1,
                  flex: 1,
                  justifyContent: 'flex-start',
                  paddingHorizontal: 8,
                  paddingVertical: 8,
                },
                dimensions.width
              )}
            >
              <Text
                style={StyleSheet.applyWidth(
                  {
                    color: theme.colors.text.medium,
                    fontFamily: 'Inter_500Medium',
                    fontSize: 10,
                  },
                  dimensions.width
                )}
              >
                {time}
              </Text>
            </View>

            {/* Provider Columns */}
            {providers.map((provider, providerIndex) => {
              const appointment = getAppointmentForSlot(time, provider);
              return (
                <View
                  key={provider}
                  style={StyleSheet.applyWidth(
                    {
                      borderLeftColor: theme.colors.border.brand,
                      borderLeftWidth: providerIndex === 0 ? 1 : 0,
                      flex: 1,
                      padding: 4,
                    },
                    dimensions.width
                  )}
                >
                  {appointment && (
                    <Touchable onPress={() => onAppointmentPress(appointment)}>
                      <Surface
                        elevation={2}
                        style={StyleSheet.applyWidth(
                          {
                            backgroundColor:
                              appointmentColors[appointment.type] ||
                              appointmentColors['AUD'],
                            borderRadius: 6,
                            padding: 8,
                          },
                          dimensions.width
                        )}
                      >
                        <Text
                          style={StyleSheet.applyWidth(
                            {
                              color: theme.colors.text.strong,
                              fontFamily: 'Inter_600SemiBold',
                              fontSize: 10,
                              marginBottom: 2,
                            },
                            dimensions.width
                          )}
                        >
                          {appointment.patient}
                        </Text>
                        <Text
                          style={StyleSheet.applyWidth(
                            {
                              color: theme.colors.text.medium,
                              fontFamily: 'Inter_500Medium',
                              fontSize: 9,
                              marginBottom: 2,
                            },
                            dimensions.width
                          )}
                        >
                          {appointment.type}
                        </Text>
                        <Text
                          style={StyleSheet.applyWidth(
                            {
                              color: theme.colors.text.medium,
                              fontFamily: 'Inter_400Regular',
                              fontSize: 8,
                            },
                            dimensions.width
                          )}
                        >
                          {appointment.time}
                        </Text>
                      </Surface>
                    </Touchable>
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default withTheme(CalendarGrid);
