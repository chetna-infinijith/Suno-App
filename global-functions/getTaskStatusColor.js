const getTaskStatusColor = (Variables, status) => {
  const found = Variables.taskAssignStatus.find(
    s => s.value === String(status)
  );
  return found ? found.color : '#825eeb';
};

export default getTaskStatusColor;
