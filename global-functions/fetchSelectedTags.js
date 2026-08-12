const fetchSelectedTags = (tagData, item) => {
  const exists = tagData.find(tag => tag === item.id);
  if (exists) {
    // remove
    return tagData.filter(tag => tag !== item.id);
  } else {
    // add
    return [...tagData, item.id];
  }
};

export default fetchSelectedTags;
