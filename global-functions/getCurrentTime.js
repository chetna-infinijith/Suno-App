import * as CurrentTimeZone from '../CurrentTimeZone';

const getCurrentTime = timezone => {
  const now = new Date();

  const yesterday = new Date(now);
  yesterday.setUTCDate(now.getUTCDate() - 1); // move back 1 day in UTC
  yesterday.setUTCHours(18, 30, 0, 0); // fix to 18:30:00 UTC
  // console.log("====== Yeste : ", yesterday.toISOString())     // force 18:30:00 UTC
  return yesterday.toISOString();

  // CurrentTimeZone.getCurrentTimeInZone(timezone).then(datetime => {
  //   console.log("========= CurrentTimeZone timezone:", timezone, datetime);
  //   return datetime;

  // });
};

export default getCurrentTime;
