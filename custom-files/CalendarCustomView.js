import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

// const CalendarAppointments = (props) => {
function CalendarAppointments(props) {
  const defaultAppointments = [
    {
      id: 1,
      patientName: 'Mary Johnson',
      type: 'AUD',
      startTime: '9:00 AM',
      endTime: '10:00 AM',
      doctor: 'Dr. Johnson',
    },
    {
      id: 2,
      patientName: 'John Davis',
      type: 'HA',
      startTime: '10:30 AM',
      endTime: '11:00 AM',
      doctor: 'Dr. Smith',
    },
  ];

  const defaultDoctors = ['Dr. Smith', 'Dr. Johnson', 'Dr. Williams'];
  const defaultTimeSlots = [
    '8:00 AM',
    '8:30 AM',
    '9:00 AM',
    '9:30 AM',
    '10:00 AM',
    '10:30 AM',
    '11:00 AM',
    '11:30 AM',
  ];

  const appointments = props.appointments ?? defaultAppointments;
  const doctors = props.doctors ?? defaultDoctors;
  const timeSlots = props.timeSlots ?? defaultTimeSlots;

  const handleAppointmentPress = appointment => {
    if (props.onAppointmentPress) {
      props.onAppointmentPress(appointment);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8f9fa', padding: 16 }}>
      <View style={{ backgroundColor: 'white', borderRadius: 12 }}>
        {/* Header Row with Doctor Names */}
        <View
          style={{
            flexDirection: 'row',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: '#e9ecef',
          }}
        >
          <View style={{ width: 80 }} />
          {doctors.map((doctor, index) => (
            <View
              key={`doctor-${index}`}
              style={{ flex: 1, alignItems: 'center' }}
            >
              <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{doctor}</Text>
            </View>
          ))}
        </View>

        {/* Calendar Slots */}
        <ScrollView style={{ maxHeight: 400 }}>
          {timeSlots.map((timeSlot, timeIndex) => (
            <View
              key={`timeslot-${timeIndex}`}
              style={{
                flexDirection: 'row',
                minHeight: 60,
                borderBottomWidth: 1,
                borderBottomColor: '#f1f3f4',
              }}
            >
              <View
                style={{
                  width: 80,
                  padding: 12,
                  backgroundColor: '#fafbfc',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 14, color: '#6c757d' }}>
                  {timeSlot}
                </Text>
              </View>

              {doctors.map((doctor, doctorIndex) => {
                const appointment = appointments.find(
                  apt => apt.startTime === timeSlot && apt.doctor === doctor
                );

                return (
                  <View
                    key={`doctor-slot-${doctorIndex}`}
                    style={{
                      flex: 1,
                      borderLeftWidth: 1,
                      borderLeftColor: '#e9ecef',
                      padding: 6,
                    }}
                  >
                    {appointment ? (
                      <TouchableOpacity
                        key={`appointment-${appointment.id}`}
                        style={{
                          backgroundColor:
                            appointment.doctor === 'Dr. Johnson'
                              ? '#d4edda'
                              : '#cce7ff',
                          borderLeftWidth: 4,
                          borderLeftColor:
                            appointment.doctor === 'Dr. Johnson'
                              ? '#28a745'
                              : '#007bff',
                          borderRadius: 8,
                          padding: 10,
                        }}
                        onPress={() => handleAppointmentPress(appointment)}
                      >
                        <Text
                          style={{
                            fontWeight: 'bold',
                            fontSize: 13,
                            marginBottom: 2,
                          }}
                        >
                          {appointment.patientName}
                        </Text>
                        <Text
                          style={{
                            fontSize: 11,
                            color: '#6c757d',
                            marginBottom: 2,
                          }}
                        >
                          {appointment.type}
                        </Text>
                        <Text style={{ fontSize: 11, color: '#495057' }}>
                          {appointment.startTime} - {appointment.endTime}
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                );
              })}
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

// };

export default CalendarAppointments;
