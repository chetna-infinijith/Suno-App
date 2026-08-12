const fetchProviders = providerData => {
  const providers =
    providerData.length > 0
      ? [
          ...providerData.map(item => ({
            label: item.full_name,
            value: item.id.toString(),
          })),
        ]
      : [];
  //{ label: "All Provider", value: "All Provider" }
  // console.log('=====providers : ',providerData);

  return providers;
};

export default fetchProviders;
