const filterDocumentFlashListData = (Variables, docType) => {
  const data = [
    {
      bg: '#fef3c7',
      id: 2527,
      date: '04/02/2023 ',
      name: 'Audiogram Results',
      color: '#dc2626',
      assign: 'Dr. Wilson',
      prority: 'Medium',
      note: 'Get updated list of medications',
      size: '1.2 MB',
      docType: 1,
      imagepath: '',
      downloadtype: 1,
    },
    {
      bg: '#fef3c7',
      id: 25278,
      date: '04/20/2023 ',
      name: 'Insurance Card (Front)',
      color: '#2563eb',
      assign: 'Reception',
      prority: 'Medium',
      note: 'Get updated list of medications',
      size: '1.8 MB',
      docType: 2,
      imagepath: '',
      downloadtype: 2,
    },
    {
      bg: '#fef3c7',
      id: 2529,
      date: '04/02/2023 ',
      name: 'Insurance Card (Back)',
      color: '#2563eb',
      assign: 'Reception',
      prority: 'Medium',
      note: 'Get updated list of medications',
      size: '1.5 MB',
      docType: 2,
      imagepath: '',
      downloadtype: 2,
    },
    {
      bg: '#fef3c7',
      id: 2524,
      date: '08/02/2023 ',
      name: 'HIPAA Consent Form',
      color: '#dc2626',
      assign: 'Reception',
      prority: 'Medium',
      note: 'Get updated list of medications',
      size: '0.5 MB',
      docType: 3,
      imagepath: '',
      downloadtype: 1,
    },
    {
      bg: '#fef3c7',
      id: 2523,
      date: '08/12/2023 ',
      name: 'Hearing Aid Recommendation Report',
      color: '#dc2626',
      assign: 'Dr. Wilson',
      prority: 'Medium',
      note: 'Get updated list of medications',
      size: '2.2 MB',
      docType: 4,
      imagepath: '',
      downloadtype: 1,
    },
  ];

  if (!data || !Array.isArray(data)) {
    return [];
  }
  if (docType == 0) {
    return data;
  }
  return data.filter(item => {
    return item['docType'] === docType;
  });
};

export default filterDocumentFlashListData;
