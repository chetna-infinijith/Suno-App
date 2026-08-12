const formatPhoneNumber = phoneNumber => {
  // console.log("=======formatPhoneNumber : ", phoneNumber)
  if (!phoneNumber) {
    return ''; // or return null if you prefer
  }

  if (phoneNumber.length === 10) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(
      3,
      6
    )}-${phoneNumber.slice(6)}`;
  }

  return phoneNumber;
};

export default formatPhoneNumber;
