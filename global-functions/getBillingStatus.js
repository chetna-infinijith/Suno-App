const getBillingStatus = (Variables, status) => {
  const found = Variables.billingStatus.find(
    s => s.value === String(status)
  );
  return found ? found.label : 'Draft';
};

export default getBillingStatus;
