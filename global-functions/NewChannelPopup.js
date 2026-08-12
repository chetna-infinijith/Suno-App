import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Icon } from '@draftbit/ui';

const NewChannelPopup = ({ visible, onClose, onSelectGroup }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={styles.backdrop}>
        <View style={styles.modalBox}>
          
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.title}>New channel</Text>
            
            <TouchableOpacity onPress={onClose}>
              <Icon name={'AntDesign/close'} size={22} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Option */}
          <TouchableOpacity style={styles.optionBox} onPress={() => onSelectGroup('group')}>

            <Icon name={'Ionicons/chatbubble-outline'} size={30} color="#8b3dff" />
            <Text style={styles.optionText}>Group</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
};

export default NewChannelPopup;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  modalBox: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },

  optionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
  },

  optionText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#000',
  },
});
