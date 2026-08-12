const patientPagination = (patientPagingData, patientListData) => {
  const combined = [...patientListData, ...patientPagingData];

  // console.log("===== combined : ", patientPagingData)
  const unique = combined.filter(
    (item, index, self) => index === self.findIndex(t => t.id === item.id)
  );

  return unique;
};

export default patientPagination;
