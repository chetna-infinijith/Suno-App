const dueAmount = (patient_responsibility_balance, available_credit) => {
  return Math.max(
    (patient_responsibility_balance || 0) - (available_credit || 0),
    0
  );
};

export default dueAmount;
