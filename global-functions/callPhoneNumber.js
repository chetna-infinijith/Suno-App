import * as PhoneUtils from '../PhoneUtils';

const callPhoneNumber = async phoneNumber => {
  await PhoneUtils.makePhoneCall(phoneNumber);
};

export default callPhoneNumber;
