const getTaskPriority = (Variables, status) => {
  const found = Variables.taskStatus.find(s => s.value === String(status));
  return found ? found.label : 'Not Set';
};

export default getTaskPriority;
