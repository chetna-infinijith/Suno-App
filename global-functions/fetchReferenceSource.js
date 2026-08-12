const fetchReferenceSource = (referenceData, type) => {
  const references =
    referenceData.length > 0
      ? [
          ...referenceData.map(item => ({
            label:
              type == 1 ? item.name : `${item.parent?.name} : ${item.name}`,
            value: item.id.toString(),
          })),
        ]
      : [];
  //{ label: "All Provider", value: "All Provider" }
  //   console.log('=====clinicData : ',clinicData);

  return references;
};

export default fetchReferenceSource;
