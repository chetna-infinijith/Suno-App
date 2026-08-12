const TagSelection = itemName => {
  const currentList = [
    'Hearing Aid User',
    'New Patient',
    'Tinnitus',
    'Balance Issues',
    'Follow-up Needed',
  ];

  const exists = currentList?.includes(itemName);
  if (exists) {
    // Remove item
    const updated = currentList.filter(i => i !== itemName);
    return updated;
  } else {
    // Add item
    const updated = [...(currentList || []), itemName];
    return updated;
  }
};

export default TagSelection;
