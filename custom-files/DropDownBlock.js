import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

const { width } = Dimensions.get('window');

export const DropDownBlock = forwardRef(({
  dropdownData = [],
  value,
  setValue,
  placeholderText = 'Select',
  zIndex = 5000,
  listMode = 'SCROLLVIEW',
  modalTitle,
  onOpen,
}, ref) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(dropdownData);

  useImperativeHandle(ref, () => ({
    close: () => setOpen(false),
  }));

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
        zIndex={zIndex}
        zIndexInverse={6000}
        dropDownContainerStyle={styles.dropDownContainer}
        style={styles.dropdown}
        listMode={listMode}
        modalTitle={modalTitle}
        onOpen={onOpen}
        dropDownDirection="BOTTOM"
        ListEmptyComponent={() => (
          <View style={{ padding: 15, alignItems: 'center' }}>
            <Text style={{ color: '#6B7280' }}>No options</Text>
          </View>
        )}
      />
    </View>
  );
});

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
    width: width - 40,
  },
  dropDownContainer: {
    backgroundColor: 'white',
    borderColor: '#D1D5DB',
    borderRadius: 8,
    width: width - 40,
    // maxHeight: 225, // scrollable dropdown
  },
});
