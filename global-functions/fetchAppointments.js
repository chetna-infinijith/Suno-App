const fetchAppointments = appointmentsData => {
  const appointments =
    appointmentsData.length > 0
      ? [
          ...appointmentsData.map(item => ({
            label: item.name,
            value: item.id.toString(),
          })),
        ]
      : [];
  // { label: "All Types", value: "All Types" }
  return appointments;
};

export default fetchAppointments;
