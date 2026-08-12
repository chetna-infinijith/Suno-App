const getTaskStatus = (Variables, status) => {
  const found = Variables.taskAssignStatus.find(
    s => s.value === String(status)
  );
  return found ? found.label : 'To Do';
};

export default getTaskStatus;
