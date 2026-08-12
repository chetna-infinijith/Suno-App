const fetchInsurance = insuranceData => {
  const insurances =
    insuranceData.length > 0
      ? [
          ...insuranceData.map(item => ({
            label: item.name,
            value: item.id.toString(),
          })),
        ]
      : [];

  // { label: "All Insurance", value: "All Insurance" }
  return insurances;
};

export default fetchInsurance;
