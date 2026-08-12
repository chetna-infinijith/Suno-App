const getTaskPriorityColor = (Variables, status) => {
  const found = Variables.taskStatus.find(s => s.value === String(status));
  return found ? found.color : '#bfc2c1';
};

export default getTaskPriorityColor;
