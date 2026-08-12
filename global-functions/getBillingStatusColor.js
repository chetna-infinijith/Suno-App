const getBillingStatusColor = (Variables, status, type) => {
  const found = Variables.billingStatus.find(
    s => s.value === String(status)
  );
  if (type == 1) {
    return found ? found.bgColor : '#465c841a';
  } else {
    return found ? found.color : '#505f7a';
  }
};

export default getBillingStatusColor;
