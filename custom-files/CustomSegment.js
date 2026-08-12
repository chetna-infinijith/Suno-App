import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

const SEGMENTS = ['Assigned To Me', 'Created By Me', 'Completed'];

export const CustomSegment = ({ value, setValue, theme }) => (
  <View style={styles.container}>
    <View style={styles.segmentContainer}>
      {SEGMENTS.map((label, index) => {
        const isActive = value === index;
        return (
          <Pressable
            key={label}
            onPress={() => setValue(index)}
            style={[styles.segment, isActive && styles.activeSegment]}
          >
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              style={[styles.segmentText, isActive && styles.activeText]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#E8EFED',
    borderRadius: 12,
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 11,
    paddingHorizontal: 6,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeSegment: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentText: {
    color: '#6B7280',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  activeText: {
    color: '#066858',
    fontFamily: 'Inter_600SemiBold',
  },
});

export default CustomSegment;
