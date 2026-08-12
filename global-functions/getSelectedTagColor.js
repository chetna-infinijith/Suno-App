const getSelectedTagColor = (tagData, item) => {
  return tagData?.some(tag => tag === item.id) ? '#ccfbf1' : '#E5E7EB';
};

export default getSelectedTagColor;
