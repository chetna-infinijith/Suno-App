const setPatientApplyFilter = (
  Variables,
  setGlobalVariableValue,
  is_Active,
  tags,
  selectedClinic,
  selectedCommunication_method,
  selectedCrm_segment,
  selectedInsuranceTypes,
  selectedLast_outcome,
  selectedManageCarePlan,
  selectedPayment_source_type,
  selectedProvider,
  selectedReferenceSource,
  selectedSubReferenceSource,
  selectedWarranty
) => {
  // console.log("======= Varible:", Variables);
  const result_tags = tags.join(',');

  const applyData = {
    preferred_communication_method: selectedCommunication_method,
    preferred_provider: selectedProvider,
    insurer: selectedInsuranceTypes,
    assigned_tags: result_tags,
    preferred_clinic: selectedClinic,
    latest_referral_source: selectedReferenceSource,
    latest_sub_referral_source: selectedSubReferenceSource,
    crm_segment: selectedCrm_segment,
    payment_source_type: selectedPayment_source_type,
    managed_care_plan: selectedManageCarePlan,
    last_outcome: selectedLast_outcome,
    manufacturer_warranty_is_expiring_in_less_than_days: selectedWarranty,
    is_active_patient: is_Active,
  };

//   const applyData = {};

  
// const addIfValid = (key, value) => {
//   if (
//     value !== null &&
//     value !== undefined &&
//     value !== '' &&
//     !(key === 'manufacturer_warranty_is_expiring_in_less_than_days' && value === 60)
//   ) {
//     applyData[key] = value;
//   }
// };
  
//   addIfValid('preferred_communication_method', selectedCommunication_method);
//   addIfValid('preferred_provider', selectedProvider);
//   addIfValid('insurer', selectedInsuranceTypes);
  
//   if (result_tags?.length > 0) {
//     applyData.assigned_tags = result_tags;
//   }
  
//   addIfValid('preferred_clinic', selectedClinic);
//   addIfValid('latest_referral_source', selectedReferenceSource);
//   addIfValid('latest_sub_referral_source', selectedSubReferenceSource);
//   addIfValid('crm_segment', selectedCrm_segment);
//   addIfValid('payment_source_type', selectedPayment_source_type);
//   addIfValid('managed_care_plan', selectedManageCarePlan);
//   addIfValid('last_outcome', selectedLast_outcome);
//   addIfValid(
//     'manufacturer_warranty_is_expiring_in_less_than_days',
//     selectedWarranty
//   );
//   addIfValid('is_active_patient', is_Active);
  


  // setGlobalVariableValue({ key: 'is_active_patient', value: is_Active });
  // setGlobalVariableValue({ key: 'isApplyFilter', value: true });
  setGlobalVariableValue({ key: 'patientOffsetFilter', value: 0 });

  return applyData;
};

export default setPatientApplyFilter;
