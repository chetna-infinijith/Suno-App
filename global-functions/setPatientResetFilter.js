const setPatientResetFilter = (Variables, setGlobalVariableValue) => {
  // console.log("======= Varible:", Variables);
  const resetData = {
    preferred_communication_method: '',
    preferred_provider: '',
    insurer: '',
    assigned_tags: '',
    preferred_clinic: '',
    latest_referral_source: '',
    latest_sub_referral_source: '',
    crm_segment: '',
    payment_source_type: '',
    managed_care_plan: '',
    last_outcome: '',
    manufacturer_warranty_is_expiring_in_less_than_days: '',
    is_active_patient: true,
  };

  // setGlobalVariableValue({ key: 'patientFilterData', value: resetData });
  // setGlobalVariableValue({ key: 'is_active_patient', value: true });
  // setGlobalVariableValue({ key: 'selectedProvider', value: "" });
  // setGlobalVariableValue({ key: 'selectedAppointments', value: "" });
  // setGlobalVariableValue({ key: 'selectedInsurance', value: "" });
  // setGlobalVariableValue({ key: 'assigned_tags', value: "" });
  // setGlobalVariableValue({ key: 'isApplyFilter', value: false });
  setGlobalVariableValue({ key: 'patientOffsetFilter', value: 0 });

  return resetData;
};

export default setPatientResetFilter;
