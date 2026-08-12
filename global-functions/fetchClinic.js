const fetchClinic = clinicData => {
  const clinics =
    clinicData.length > 0
      ? [
          ...clinicData.map(item => ({
            label: item.name,
            value: item.id.toString(),
          })),
        ]
      : [];
  //{ label: "All Provider", value: "All Provider" }
  //   console.log('=====clinicData : ',clinicData);

  return clinics;
};

export default fetchClinic;
