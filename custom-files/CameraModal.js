import React, { useState, useRef } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Camera, CameraType, CameraView } from "expo-camera";
import { Icon } from "@draftbit/ui";

export default function CameraModal({ visible, onClose, onCapture }) {
    const cameraRef = useRef(null);
    const [preview, setPreview] = useState(null);
    const [flash, setFlash] = useState("off"); // off | on | auto
    const toggleFlash = () => {
        setFlash((prev) =>
            prev === "off" ? "on" : prev === "on" ? "auto" : "off"
        );
    };
    const takePhoto = async () => {
        const result = await cameraRef.current.takePictureAsync();
        setPreview(result); // show preview image

        // onCapture(result);
        // onClose();
    };
    const savePhoto = () => {
        onCapture(preview);
        setPreview(null);
        onClose();
    };

    const retakePhoto = () => {
        setPreview(null);
    };
    return (
        <Modal visible={visible} animationType="slide">
            <View style={{ flex: 1 }}>
                {preview ? (
                    <View style={{ flex: 1 }}>
                        <Image
                            source={{ uri: preview.uri }}
                            style={{ flex: 1 }}
                            resizeMode="cover"
                        />

                        <View style={styles.modalBottom}>
                            <TouchableOpacity style={styles.btn} onPress={retakePhoto}>
                                <Text style={styles.btnText}>Retake</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.btnPrimary} onPress={savePhoto}>
                                <Text style={styles.btnTextPrimary}>Save</Text>
                            </TouchableOpacity>
                        </View>

                        {/* <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelTxt}>Cancel</Text>
            </TouchableOpacity> */}
                    </View>
                ) : (
                    <>
                        {/* ----- CAMERA MODE ----- */}
                        <CameraView
                            ref={cameraRef}
                            facing="back"
                            flash={flash}
                            style={{ flex: 1 }}
                        />
                        {/* <View style={styles.focusBox} /> */}

                        <View style={styles.modalBottom}>

                            <TouchableOpacity onPress={onClose}>
                                <Text style={styles.cancelTxt}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.captureBtn} onPress={takePhoto} />
                            {/* <Text style={{width : 70}}>{' '}</Text> */}
                            <TouchableOpacity style={{


                            }} onPress={toggleFlash}>
                                <Icon
                                    size={35}
                                    name={flash == 'off' ? 'MaterialIcons/flash-off' : flash == 'on' ? 'Entypo/flash' : 'MaterialCommunityIcons/flash-auto'}
                                    color={'#ffffff'}
                                />

                                {/* <Text style={{
                                    color: "#fff",
                                    fontSize: 16,
                                }}>Flash: {flash}</Text> */}
                            </TouchableOpacity>
                        </View>

                    </>
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalBottom: {
        position: "absolute",
        bottom: 0,
        width: "100%",
        alignItems: "center",
        flexDirection: 'row',
        justifyContent: 'space-between',
        // marginHorizontal : 20,
        backgroundColor: 'black',
        height: 150,
        flex: 1,
        alignContent: 'center',
        paddingHorizontal: 20
    },
    focusBox: {
        position: "absolute",
        top: "30%",
        left: "18%",
        width: "64%",
        height: "30%",
        borderWidth: 1,
        borderColor: "#00E676",
        borderRadius: 12,
        backgroundColor: "transparent",
        // bottom : 150
    },
    flashBtn: {
        position: "absolute",
        top: "35%",
        left: "18%",
        width: "64%",
        height: "30%",
        borderWidth: 3,
        borderColor: "#00E676",
        borderRadius: 12,
        backgroundColor: "transparent",
    },
    captureBtn: {
        width: 70,
        height: 70,
        backgroundColor: "#fff",
        borderRadius: 70,
        borderWidth: 4,
        borderColor: "#ddd",
        marginBottom: 20,
    },
    cancelTxt: {
        color: "#fff",
        fontSize: 18,
    },

    btn: {
        paddingVertical: 12,
        // paddingHorizontal: 20,
        borderRadius: 12,
        // backgroundColor: "#444",
    },
    btnPrimary: {
        paddingVertical: 12,
        // paddingHorizontal: 20,
        borderRadius: 12,
        // backgroundColor: "#00C853",
    },
    btnText: {
        color: "#fff",
        fontSize: 16,
    },
    btnTextPrimary: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
});
