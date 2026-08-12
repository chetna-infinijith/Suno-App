import { format } from 'date-fns-tz';

export default function getCurrentTimeInZone(timezone = 'us/eastern') {
  const now = new Date();
  // Format to ISO string with timezone offset
  return format(now, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone: timezone });
}
