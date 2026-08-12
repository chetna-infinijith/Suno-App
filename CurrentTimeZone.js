import { format } from 'date-fns-tz';

// export const getCurrentTimeInZone = async (timezone = 'us/eastern') => {
//   const now = new Date();
//   // Format to ISO string with timezone offset
//   console.log(
//     '======== date : ', timezone,
//     format(now, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone: timezone })
//   );
//   // return '2025-08-21T18:30:00.000Z';
//   return format(now, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone: timezone });
// };

export const getCurrentTimeInZone = async (timezone = 'us/eastern') => {
  const now = new Date();
  return format(now, "yyyy-MM-dd'T'HH:mm:ss", { timeZone: timezone });
  // const zonedDate = utcToZonedTime(now, timezone);
  // console.log('==== zonedDate : ', zonedDate);
  // return formatISO(zonedDate, { representation: 'complete' });
};
