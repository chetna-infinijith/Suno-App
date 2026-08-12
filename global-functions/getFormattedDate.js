const getFormattedDate = dateString => {
  // const date = new Date();
  //   const options = {
  //     weekday: 'long',
  //     month: 'short',
  //     day: 'numeric'
  //   };
  //   return date.toLocaleDateString('en-US', options);

  if (!dateString) return '';

  const date = new Date(dateString);

  return date.toLocaleDateString('en-US', {
    weekday: 'short', // Sun, Mon, Tue, ...
    month: 'short', // Jan, Feb, Mar, ...
    day: '2-digit', // 01, 02, 03, ...
    year: 'numeric', // 2025
    timeZone: 'UTC', // Ensures consistent output
  });
};

export default getFormattedDate;
