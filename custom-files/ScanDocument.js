import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import {
  // Button,
  Pressable,
  Text,
  View,
  FlatList,
  Alert,
  ActivityIndicator,
  Modal,
  Dimensions,
  Button,
  StyleSheet,
} from 'react-native';
import { Image } from 'expo-image';
import { Icon } from '@draftbit/ui';
import * as GlobalVariables from '../config/GlobalVariableContext';

export const ScanDocument = ({ patientData }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const ref = useRef(null);
  const [mode, setMode] = useState('picture');
  const [facing, setFacing] = useState('back');
  const [recording, setRecording] = useState(false);
  const [capturedImages, setCapturedImages] = useState([]);
  const [showCamera, setShowCamera] = useState(true);
  const [loading, setLoading] = useState(false);
  const screenWidth = Dimensions.get('window').width - 30;
  const numColumns = 3;
  const spacing = 10; // margin between items
  const imageSize = (screenWidth - spacing * (numColumns + 1)) / numColumns;

  const Constants = GlobalVariables.useValues();
  console.log('patientID : ', patientData);

  if (!permission) return null;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>
          We need your permission to use the camera
        </Text>
        <Pressable
          onPress={requestPermission}
          style={{
            backgroundColor: '#054743', // theme background
            paddingVertical: 10,
            paddingHorizontal: 16,
            alignItems: 'center', // center text
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              color: 'white', // or theme.colors.surface
              fontSize: 16,
              fontWeight: '600',
            }}
          >
            Grant permission
          </Text>
        </Pressable>
      </View>
    );
  }

  const takePicture = async () => {
    try {
      const photo = await ref.current?.takePictureAsync();
      if (photo?.uri) {
        setCapturedImages(prev => [...prev, photo.uri]);
        setShowCamera(false);
      }
    } catch (error) {
      console.log('===== Error :', error);
    }
  };

  const uploadImages = async () => {
    if (capturedImages.length === 0) {
      Alert.alert(
        'No Images',
        'Please capture at least one image before upload.'
      );
      return;
    }

    try {
      setLoading(true);
      let hadFailure = false;
      for (let i = 0; i < capturedImages.length; i++) {
        const uri = capturedImages[i];
        const filename = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename ?? '');
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        const formData = new FormData();
        formData.append('document', {
          uri,
          name: filename || `photo_${i}.jpg`,
          type,
        });

        console.log(
          `Uploading file ${i + 1}/${capturedImages.length} → ${filename}`
        );

        const response = await fetch(
          `${Constants.API_BASE_URL}/patients/${patientData.patientID}/e-documents/upload/`,
          {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              Authorization: Constants.AUTH_HEADER,
            },
            body: formData,
          }
        );

        const result = await response.json();
        console.log(`Result for ${filename}:`, result);

        if (!response.ok) {
          hadFailure = true;
          Alert.alert(
            'Upload Failed',
            `File ${filename} failed: ${JSON.stringify(result)}`
          );
          break; // stop if one fails
        }
      }
      setLoading(false);
      if (!hadFailure) {
        Alert.alert('Success', 'Documents uploaded successfully.');
        setCapturedImages([]);
      }
    } catch (error) {
      console.log('Upload failed:', error);
      Alert.alert('Upload Failed', error.message);
      setLoading(false);
    }
  };

  const renderCamera = () => (
    <CameraView
      style={styles.camera}
      ref={ref}
      mode={mode}
      facing={facing}
      mute={false}
      responsiveOrientationWhenOrientationLocked
    >
      <View style={styles.shutterContainer}>
        <Pressable onPress={takePicture}>
          {({ pressed }) => (
            <View
              style={[
                styles.shutterBtn,
                {
                  opacity: pressed ? 0.5 : 1,
                },
              ]}
            >
              <View
                style={[styles.shutterBtnInner, { backgroundColor: 'white' }]}
              />
            </View>
          )}
        </Pressable>
        {/* <Pressable onPress={() => setFacing((prev) => (prev === "back" ? "front" : "back"))}>
          <FontAwesome6 name="rotate-left" size={32} color="white" />
        </Pressable> */}
      </View>
    </CameraView>
  );

  const deleteImage = index => {
    console.log('===== Delete :', index);
    Alert.alert('Delete Image', 'Are you sure you want to delete this image?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setCapturedImages(prev => prev.filter((_, i) => i !== index));
        },
      },
    ]);
  };

  const renderPictures = () => (
    <View style={{ flex: 1, padding: 10 }}>
      <Modal transparent visible={loading} animationType="fade">
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.4)',
          }}
        >
          <ActivityIndicator size="large" color="#066858" />
        </View>
      </Modal>
      <View style={{ flex: 1, padding: 10 }}>
        <Text style={{ margin: 10, fontSize: 16, fontWeight: 'bold' }}>
          Captured Images ({capturedImages.length})
        </Text>
        <FlatList
          data={capturedImages}
          numColumns={numColumns}
          columnWrapperStyle={{ justifyContent: 'flex-start' }}
          keyExtractor={(item, idx) => idx.toString()}
          renderItem={({ item, index }) => (
            <View style={{ margin: spacing / 2 }}>
              <Image
                source={{ uri: item }}
                style={{
                  width: imageSize,
                  height: imageSize,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#ccc',
                }}
              />
              <Pressable
                onPress={() => deleteImage(index)}
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  backgroundColor: 'red',
                  borderRadius: 12,
                  padding: 4,
                }}
              >
                <Icon name="MaterialIcons/delete" size={16} color="white" />
              </Pressable>
            </View>
          )}
        />
        <View style={{ marginVertical: 20 }}>
          <Pressable
            onPress={() => setShowCamera(true)}
            style={{
              backgroundColor: '#054743', // theme background
              borderRadius: 8,
              paddingVertical: 10,
              paddingHorizontal: 16,
              alignItems: 'center', // center text
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                color: 'white', // or theme.colors.surface
                fontSize: 16,
                fontWeight: '600',
              }}
            >
              Capture More
            </Text>
          </Pressable>
        </View>

        <Pressable
          onPress={uploadImages}
          style={{
            backgroundColor: '#054743', // theme background
            borderRadius: 8,
            paddingVertical: 10,
            paddingHorizontal: 16,
            alignItems: 'center', // center text
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              color: 'white', // or theme.colors.surface
              fontSize: 16,
              fontWeight: '600',
            }}
          >
            Upload Documents
          </Text>
        </Pressable>
      </View>
    </View>
  );
  return (
    <View style={styles.container}>
      {showCamera ? renderCamera() : renderPictures()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  shutterContainer: {
    position: 'absolute',
    bottom: 44,
    left: 0,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  shutterBtn: {
    backgroundColor: 'transparent',
    borderWidth: 5,
    borderColor: 'white',
    width: 85,
    height: 85,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterBtnInner: {
    width: 70,
    height: 70,
    borderRadius: 50,
  },
});
