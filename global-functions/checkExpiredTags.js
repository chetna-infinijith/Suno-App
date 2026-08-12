const checkExpiredTags = expires_at => {
  const isValid = expires_at === null || new Date(expires_at) >= new Date();
  // console.log("====== isvalid : ",  expires_at )
  return !isValid;
};

export default checkExpiredTags;
