import * as momentTimezone from 'moment-timezone';

const formatTime = (date, zone) => {
  const options = { hour: 'numeric', minute: 'numeric', hour12: true };
  // return date.toLocaleTimeString([], options);
  if (!date) return null;
  // return moment(date).format('hh:mm A'); // e.g., 01:00 PM
  return momentTimezone.tz(date, zone).format('hh:mm A');
};

export default formatTime;
