const getPatientTags = (Variables, setGlobalVariableValue) => {
  const arr = Variables.assigned_tags.split(',');
  const cleanArr = arr
    .filter(item => item !== '') // remove empty values
    .map(item => Number(item));
  console.log('====== arr :', cleanArr);

  return cleanArr;
};

export default getPatientTags;
