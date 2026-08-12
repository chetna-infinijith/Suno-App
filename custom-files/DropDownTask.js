import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

const { width } = Dimensions.get('window');

export const DropDownTask = ({
  dropdownData = [],
  value,
  setValue,
  placeholderText = 'Select',
  zIndex = 5000,
}) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(dropdownData);

  // Update items when dropdownData changes
  useEffect(() => {
    setItems(dropdownData);
  }, [dropdownData]);

  return (
    <View style={styles.container}>
      <DropDownPicker
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={setValue}
        setItems={setItems}
        placeholder={placeholderText}
        zIndex={zIndex} // Important for Android stacking
        zIndexInverse={6000} // Needed if multiple dropdowns
        dropDownContainerStyle={styles.dropDownContainer}
        style={styles.dropdown}
        listMode="SCROLLVIEW" // Use scrollable list to avoid VirtualizedList warning
        dropDownDirection="BOTTOM"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 8,
    // zIndex: 5000, // Ensure dropdown stacks above other components
  },
  dropdown: {
    backgroundColor: 'white',
    borderColor: '#D1D5DB',
    borderRadius: 8,
    width: 200,
    height: 30,
  },
  dropDownContainer: {
    backgroundColor: 'white',
    borderColor: '#D1D5DB',
    borderRadius: 8,
    width: 200,

    // maxHeight: 225, // scrollable dropdown
  },
});
