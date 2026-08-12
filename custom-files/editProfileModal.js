import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as GlobalVariables from '../config/GlobalVariableContext';
import { logError } from '../index';
import { checkInternetAndProceed } from './InternetConnection';


export const EditProfileDetails = ({ onProfileUpdate }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    title: '',
    suffix: '',
    role: '',
    npi: '',
    license_number: '',
    photo: '',
  });

  const [loading, setLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(false);
  const [showTitleDropdown, setShowTitleDropdown] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  const navigation = useNavigation();
  const globalValues = GlobalVariables.useValues();
  const setGlobalVariableValue = GlobalVariables.useSetValue();
  const { senderID, AUTH_HEADER } = globalValues;
  const USER_ID = senderID;

  // Fetch user data when modal opens
  useEffect(() => {
    if (USER_ID) {
      fetchUserData();
    }
  }, [USER_ID]);

  const fetchUserData = async () => {
    const isConnected = await checkInternetAndProceed();
        if (!isConnected) {
          return;
        }

    setUserLoading(true);
    try {
      const response = await fetch(`${globalValues.API_BASE_URL}/auth/users/${USER_ID}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: AUTH_HEADER,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        const userTitle = userData.title ? userData.title.toString() : '';

        setFormData({
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          title: userTitle,
          suffix: userData.suffix || '',
          role: userData.role || '',
          npi: userData.npi || '',
          license_number: userData.license_number || '',
          photo:
            userData.photo ||
            'https://master-app.suno.tech/assets/user-CXthF0zB.png',
        });
      } else {
        throw new Error('Failed to fetch user data');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load user data');
      logError('Fetch error:', error);
      logError('Failed to load user data :', error);

    } finally {
      setUserLoading(false);
    }
  };

  // Request camera and gallery permissions
  const requestPermissions = async () => {
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert(
        'Permission required',
        'Sorry, we need camera and gallery permissions to change your profile photo.'
      );
      return false;
    }
    return true;
  };

  // Handle image picker
  const handleImagePicker = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    Alert.alert('Select Photo', 'Choose an option', [
      {
        text: 'Take Photo',
        onPress: () => takePhoto(),
      },
      {
        text: 'Choose from Gallery',
        onPress: () => pickImageFromGallery(),
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  };

  // Take photo with camera
  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        await uploadImage(asset);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
      logError('Camera error:', error);
      logError('Failed to take photo :', error);

    }
  };

  // Pick image from gallery
  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        await uploadImage(asset);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image from gallery');
      logError('Gallery error:', error);
      logError('Failed to pick image from gallery :', error);

    }
  };

  // Upload image to server
  const uploadImage = async imageAsset => {
    setImageUploading(true);
    try {
      const formDataToSend = new FormData();
      // const fileExtension = imageAsset.uri.split('.').pop();

      formDataToSend.append('photo', {
        uri: imageAsset.uri,
        type: imageAsset.mimeType || 'image/jpeg',
        name: `profile_${USER_ID}_${Date.now()}.jpg`,
      });

      const response = await fetch(`${globalValues.API_BASE_URL}/auth/users/${USER_ID}/`, {
        method: 'PATCH',
        headers: {
          // 'Content-Type': 'multipart/form-data',
          Accept: 'application/json',
          Authorization: AUTH_HEADER,
        },
        body: formDataToSend,
      });

      console.log('Upload response status:', response.status);

      if (response.ok) {
        const updatedUser = await response.json();
        setFormData(prev => ({
          ...prev,
          photo:
            updatedUser.photo ||
            'https://master-app.suno.tech/assets/user-CXthF0zB.png',
        }));
        setGlobalVariableValue({
          key: 'UserInfo',
          value: updatedUser,
        });
        Alert.alert('Success', 'Profile photo updated successfully');
        onProfileUpdate?.();
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload profile photo');
      logError('Upload error:', error);
      logError('Failed to upload profile photo  :', error);

    } finally {
      setImageUploading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Save profile changes
  const handleSave = async () => {
    if (!formData.first_name || !formData.last_name) {
      Alert.alert('Error', 'First Name and Last Name are required');
      return;
    }

    const isConnected = await checkInternetAndProceed();
        if (!isConnected) {
          return;
        }

    setLoading(true);
    try {
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        title: formData.title,
        suffix: formData.suffix,
        role: formData.role,
        npi: formData.npi,
        license_number: formData.license_number,
        color: null,
        scheduler_select_all_staff: false,
        scheduler_persist_per_clinic: false,
        touchpoint_notifications_enabled: true,
        user_reminder_notifications_enabled: true,
        payment_request_notifications_enabled: true,
        task_is_assigned_notifications_enabled: true,
        onboarding_form_notifications_enabled: true,
        patient_arrived_sound_enabled: true,
        chat_sound_notification: true,
        summary_paragraph_font_size: 16,
        auto_generate_summary: true,
        auto_generate_diagnosis: true,
        task_updates_notification: true,
        task_comments_notification: true,
        include_comment_text: false,
        noah_auto_sync: true,
        pure_tone_audiogram_report_selected: true,
        speech_audiometry_word_recognition_report_selected: true,
        tympanometry_report_selected: true,
        acoustic_reflex_decay_report_selected: true,
        speech_in_noise_report_selected: true,
        otoacoustic_emissions_report_selected: true,
        switch_audiogram_orientation: false,
        email_signature: '',
        sync_with_google_calendar: false,
        native_pdf_tables_enabled: false,
        user_preferences: {
          staff_tasks: {
            task_updates_notification: true,
            task_comments_notification: true,
            include_comment_text: false,
          },
          reporting: {
            pure_tone_audiogram_report_selected: true,
            speech_audiometry_word_recognition_report_selected: true,
            tympanometry_report_selected: true,
            acoustic_reflex_decay_report_selected: true,
            speech_in_noise_report_selected: true,
            otoacoustic_emissions_report_selected: true,
            switch_audiogram_orientation: false,
            auto_generate_summary: true,
            auto_generate_diagnosis: true,
            noah_auto_sync: true,
            speech_audiometry: { presentation: null },
            word_recognition: { presentation: null },
            speech_in_noise: {
              method: null,
              quick_sin_default_configuration: null,
            },
            summary: { paragraph_font_size: 16 },
          },
          email_signature: '',
        },
      };

      const response = await fetch(`${globalValues.API_BASE_URL}/auth/users/${USER_ID}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: AUTH_HEADER,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        console.log('result update', updatedUser);
        setGlobalVariableValue({ key: 'UserInfo', value: updatedUser });

        Alert.alert('Success', 'Profile updated successfully');
        onProfileUpdate?.();
        handleSuccessAndClose();
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
      logError('Update error:', error);
      logError('Failed to update profile :', error);

    } finally {
      setLoading(false);
    }
  };

  const handleSuccessAndClose = async () => {
    setGlobalVariableValue({ key: 'EditProfile', value: false });
    // navigation.goBack();
  };

  // Title dropdown options
  const titleOptions = [
    { label: 'None', value: '' },
    { label: 'DR', value: '1' },
    { label: 'MR', value: '2' },
    { label: 'MS', value: '4' },
    { label: 'MRS', value: '3' },
  ];

  const getSelectedTitleLabel = () => {
    return (
      titleOptions.find(opt => opt.value === formData.title)?.label || 'None'
    );
  };

  const onClose = () => {
    // navigation.goBack();
    setGlobalVariableValue({ key: 'EditProfile', value: false });
  };

  const renderTitleDropdown = () => {
    if (!showTitleDropdown) return null;

    return (
      <View style={styles.dropdownContainer}>
        <ScrollView
          style={styles.dropdownScroll}
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="handled"
        >
          {titleOptions.map(option => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.dropdownOption,
                formData.title === option.value &&
                  styles.dropdownOptionSelected,
              ]}
              onPress={() => {
                handleInputChange('title', option.value);
                setShowTitleDropdown(false);
              }}
            >
              <Text
                style={[
                  styles.dropdownOptionText,
                  formData.title === option.value &&
                    styles.dropdownOptionTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  if (userLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.loadingContainer}>
            <Text>Loading...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Profile Picture Section */}
          <View style={styles.photoSection}>
            <TouchableOpacity
              style={styles.photoContainer}
              onPress={handleImagePicker}
              disabled={imageUploading}
            >
              <View style={styles.photoPlaceholder}>
                {formData.photo ? (
                  <Image
                    source={{ uri: formData.photo }}
                    style={styles.profileImage}
                    resizeMode="cover"
                    onLoadStart={() => setImageLoading(true)}
                    onLoadEnd={() => setImageLoading(false)}
                    onError={() => {
                      setImageLoading(false);
                      setFormData(prev => ({
                        ...prev,
                        photo:
                          'https://master-app.suno.tech/assets/user-CXthF0zB.png',
                      }));
                    }}
                  />
                ) : (
                  <Icon name="person" size={48} color="#bbb" />
                )}
                {imageLoading && !imageUploading && (
                  <View style={styles.uploadingOverlay}>
                    <ActivityIndicator size="small" color="#fff" />
                  </View>
                )}
                {imageUploading && (
                  <View style={styles.uploadingOverlay}>
                    <Text style={styles.uploadingText}>Uploading...</Text>
                  </View>
                )}
                <View style={styles.cameraIcon}>
                  <Icon name="camera-alt" size={20} color="#fff" />
                </View>
              </View>
              <Text style={styles.changePhotoText}>
                {imageUploading ? 'Uploading...' : 'Change Photo'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            {/* First Name */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                FIRST NAME <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                value={formData.first_name}
                onChangeText={value => handleInputChange('first_name', value)}
                placeholder="Enter first name"
                placeholderTextColor="#999"
              />
            </View>

            {/* Last Name */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                LAST NAME <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                value={formData.last_name}
                onChangeText={value => handleInputChange('last_name', value)}
                placeholder="Enter last name"
                placeholderTextColor="#999"
              />
            </View>

            {/* Title Dropdown */}
            <View
              style={[styles.fieldContainer, styles.dropdownFieldContainer]}
            >
              <Text style={styles.label}>TITLE</Text>
              <TouchableOpacity
                style={styles.dropdownField}
                onPress={() => {
                  setShowTitleDropdown(!showTitleDropdown);
                }}
              >
                <Text
                  style={[
                    styles.dropdownDisplay,
                    !formData.title && styles.placeholderText,
                  ]}
                >
                  {getSelectedTitleLabel()}
                </Text>
                <Icon
                  name={showTitleDropdown ? 'arrow-drop-up' : 'arrow-drop-down'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
              {renderTitleDropdown()}
            </View>

            {/* Suffix - TextInput */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>SUFFIX</Text>
              <TextInput
                style={styles.textInput}
                value={formData.suffix}
                onChangeText={value => handleInputChange('suffix', value)}
                placeholder="Enter suffix"
                placeholderTextColor="#999"
              />
            </View>

            {/* Role - TextInput */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>ROLE</Text>
              <TextInput
                style={styles.textInput}
                value={formData.role}
                onChangeText={value => handleInputChange('role', value)}
                placeholder="Enter your role"
                placeholderTextColor="#999"
              />
            </View>

            {/* NPI - TextInput */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>NPI</Text>
              <TextInput
                style={styles.textInput}
                value={formData.npi}
                onChangeText={value => handleInputChange('npi', value)}
                placeholder="Enter NPI"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            {/* License Number - TextInput */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>LICENSE NUMBER</Text>
              <TextInput
                style={styles.textInput}
                value={formData.license_number}
                onChangeText={value =>
                  handleInputChange('license_number', value)
                }
                placeholder="Enter license number"
                placeholderTextColor="#999"
              />
            </View>

            {/* Signature Section 
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Signature</Text>
            <View style={styles.signatureContainer}>
              <Text style={styles.signatureText}>Empty Signature</Text>
            </View>
          </View> */}
          </View>

          {/* Spacer for bottom save button */}
          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Fixed Save Button at Bottom */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    height: 60,
  },
  closeButton: {
    padding: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoSection: {
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  photoContainer: {
    alignItems: 'center',
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 60,
  },
  uploadingText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#066858',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoText: {
    color: '#066858',
    fontSize: 16,
    fontWeight: '600',
  },
  formSection: {
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 24,
    zIndex: 1,
  },
  dropdownFieldContainer: {
    zIndex: 1000, // Higher z-index for dropdown container
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  required: {
    color: 'red',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  dropdownField: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownDisplay: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginTop: 4,
    backgroundColor: '#fff',
    maxHeight: 200,
    zIndex: 2000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownOptionSelected: {
    backgroundColor: '#066858',
  },
  dropdownOptionText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownOptionTextSelected: {
    color: '#fff',
  },
  signatureContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  signatureText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  bottomSpacer: {
    height: 80,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  saveButton: {
    backgroundColor: '#066858',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditProfileDetails;
