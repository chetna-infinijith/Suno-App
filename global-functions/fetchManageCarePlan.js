const fetchManageCarePlan = careData => {
  const care =
    careData.length > 0
      ? [
          ...careData.map(item => ({
            label: item.name,
            value: item.id.toString(),
          })),
        ]
      : [];
  //{ label: "All Provider", value: "All Provider" }
  //   console.log('=====clinicData : ',clinicData);

  return care;
};

export default fetchManageCarePlan;
