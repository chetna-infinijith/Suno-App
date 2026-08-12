import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    ActivityIndicator,
    Modal,
    Pressable,
    Platform
} from 'react-native';
// import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import { Button } from '@draftbit/ui';


const ScribeControlBar = ({
    scribes_enabled,
    status,
    amplitude,
    isConnecting,
    isPostponing,
    onStart,
    onPause,
    onResume,
    onStop,
    onPostpone,
    onSaveSettings,
    showSilenceModal,
    countdown,
    onSilencePause,
    onSilenceContinue,
}) => {
    const isRecording = status === 'recording';
    const isPaused = status === 'paused' || status === 'pause';
    // console.log("=== showSilenceModal : ",showSilenceModal)
    const [showSettingModal, setShowSettingModal] = useState(false);
    const [selectedPreviewMain, setSelectedPreviewMain] = useState(true);
    const [selectedSOAPMain, setSelectedSOAPMain] = useState(true);
    const [selectedChartNoteMain, setSelectedChartNoteMain] = useState(true);

    const CheckBoxItem = ({ label, value, selected, onPress }) => {
        // const isChecked = selectedValues.includes(value);

        return (
            <Pressable style={styles.optionRow} onPress={onPress}>
                {selected ?
                    <Icon name="checkbox-marked" size={25} color="#000" />
                    : <Icon name="checkbox-blank-outline" size={25} color="#000" />
                }
                <Text style={styles.optionText}>{label}</Text>
            </Pressable>
        );
    };

    const DeleteAppointmentModal = ({ visible, onClose, onDelete }) => {
        const [selectedPreview, setSelectedPreview] = useState(selectedPreviewMain);
        const [selectedSOAP, setSelectedSOAP] = useState(selectedSOAPMain);
        const [selectedChartNote, setSelectedChartNote] = useState(selectedChartNoteMain);
        return (
            <Modal
                transparent
                visible={visible}
                animationType="fade"
                onRequestClose={onClose}
            >
                <View style={styles.overlay}>
                    <View style={styles.containerModal}>
                        <Text style={styles.title}>
                            {'Ambient Scribe Settings'}
                        </Text>

                        <Pressable style={styles.optionRow} onPress={() => { setSelectedPreview(!selectedPreview) }}>
                            {selectedPreview ?
                                <Icon name="checkbox-marked" size={25} color="#000" />
                                : <Icon name="checkbox-blank-outline" size={25} color="#000" />
                            }
                            <Text style={styles.optionText}>{'Show transcription preview'}</Text>
                        </Pressable>

                        <Pressable style={styles.optionRow} onPress={() => { setSelectedSOAP(!selectedSOAP) }}>
                            {selectedSOAP ?
                                <Icon name="checkbox-marked" size={25} color="#000" />
                                : <Icon name="checkbox-blank-outline" size={25} color="#000" />
                            }
                            <Text style={styles.optionText}>{'Auto generate SOAP Notes'}</Text>
                        </Pressable>

                        <Pressable style={styles.optionRow} onPress={() => { setSelectedChartNote(!selectedChartNote) }}>
                            {selectedChartNote ?
                                <Icon name="checkbox-marked" size={25} color="#000" />
                                : <Icon name="checkbox-blank-outline" size={25} color="#000" />
                            }
                            <Text style={styles.optionText}>{'Auto find related Chart Note'}</Text>
                        </Pressable>


                        <View style={styles.actions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.deleteBtn}
                                onPress={() => onDelete({
                                    preview: selectedPreview,
                                    soap: selectedSOAP,
                                    chartNote: selectedChartNote,
                                })
                                }
                            >
                                <Text style={styles.deleteText}>Save Changes</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    };

    return (
        <View style={styles.wrapper}>
            <DeleteAppointmentModal
                visible={showSettingModal}
                onClose={() => setShowSettingModal(false)}
                onDelete={(data) => {
                    // console.log("Saved Settings:", data);
                    setSelectedChartNoteMain(data.chartNote)
                    setSelectedPreviewMain(data.preview)
                    setSelectedSOAPMain(data.soap)
                    onSaveSettings && onSaveSettings(data);
                    setShowSettingModal(false);
                }}
            />

            <Modal
                transparent
                visible={showSilenceModal}
                animationType="fade"
                onRequestClose={onSilenceContinue}
            >
                <View style={styles.overlay}>
                    <View style={styles.containerModal}>

                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            marginBottom: 10,
                        }}>
                            <Text style={styles.title}>Silence detected</Text>

                            <TouchableOpacity onPress={onSilenceContinue}>
                                <Text style={{ fontSize: 18 }}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={{
                            fontSize: 16,
                            marginVertical: 10,
                        }}>Pause recording?</Text>

                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'flex-end',
                            marginTop: 10,
                        }}>
                            <TouchableOpacity style={{
                                borderWidth: 1,
                                borderColor: '#0f5132',
                                paddingVertical: 8,
                                paddingHorizontal: 14,
                                borderRadius: 8,
                                marginRight: 10,
                            }} onPress={onSilencePause}>
                                <Text style={{
                                    color: '#0f5132',
                                }}>Yes ({countdown})</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={{
                                backgroundColor: '#0f5132',
                                paddingVertical: 8,
                                paddingHorizontal: 18,
                                borderRadius: 8,
                            }} onPress={onSilenceContinue}>
                                <Text style={{
                                    color: '#fff',
                                }}>No</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </View>
            </Modal>

            <LinearGradient
                colors={['#7B6D8D', '#C8B9A6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                    styles.container,
                    (isRecording || isPaused) && styles.activeBorder,
                ]}

            >
                {/* Settings Icon */}
                {/* <TouchableOpacity disabled={status === 'idle' ? false : true} onPress={() => { setShowSettingModal(true) }}>
                    <MaterialIcon name="settings" size={25} color= {status === 'idle' ? "#fff" : "rgba(255, 255, 255, 0.5)" }/>
                </TouchableOpacity> */}

                <View pointerEvents={scribes_enabled ? 'auto' : 'none'}
                    style={[styles.container, !scribes_enabled && { opacity: 0.5 }]}>
                    {/* Center Section */}
                    {(status === 'idle' || isConnecting) && (
                        <TouchableOpacity
                            style={[
                                styles.captureBtn,
                                isConnecting && styles.captureBtnDisabled,
                            ]}
                            onPress={onStart}
                            disabled={isConnecting}
                            activeOpacity={isConnecting ? 1 : 0.7}
                        >
                            {isConnecting ? <ActivityIndicator color={'#fff'} />
                                :

                                <Icon name="microphone" size={22} color="#fff" />}
                            <Text style={styles.captureText}>{isConnecting ? 'Please wait' : 'Capture Visit'}</Text>
                            {/* <Text style={styles.captureText}>Capture Visit</Text> */}

                        </TouchableOpacity>
                    )}

                    {isRecording && !isConnecting && (
                        <>
                            {/* {Platform.OS === 'ios' ? 
                        <Waveform amplitude={amplitude} />
                        : */}
                            <WaveformAndroid />

                            {/* } */}
                            <CircleButton icon="pause" onPress={onPause} size={22} />
                            <CircleButton icon="square" onPress={onStop} size={18} />
                        </>
                    )}

                    {isPaused && !isConnecting && (
                        <>
                            <View style={styles.wavePlaceholder} />
                            <CircleButton icon="microphone" onPress={onResume} size={24} disabled={isPostponing} />
                            <Button
                                title={isPostponing ? 'Please wait…' : 'Postpone'}
                                onPress={onPostpone}
                                variant="outline"
                                disabled={isPostponing}
                                loading={isPostponing}
                                style={{ marginRight: 10 }}
                            />
                            <CircleButton icon="square" onPress={onStop} size={18} disabled={isPostponing} />
                        </>
                    )}
                </View>
                {/* Right Icons */}
                {/* <View style={styles.rightIcons}>
                    <MaterialIcon name="audio-file" size={20} color="#fff" />
                    <Feather name="chevron-down" size={18} color="#fff" />
                </View> */}
            </LinearGradient>
        </View>
    );
};

// const Waveform = ({ amplitude }) => {
//     const bars = useRef(
//         Array.from({ length: 20 }, () => new Animated.Value(2))
//     ).current;

//     useEffect(() => {
//         bars.forEach((bar, index) => {
//             Animated.timing(bar, {
//                 toValue: 5 + amplitude * 40 * Math.random(),
//                 duration: 80,
//                 useNativeDriver: false,
//             }).start();
//         });
//     }, [amplitude]);

//     return (
//         <View style={styles.containerWave}>
//             {bars.map((bar, index) => (
//                 <Animated.View
//                     key={index}
//                     style={[
//                         styles.bar,
//                         { height: bar }
//                     ]}
//                 />
//             ))}
//         </View>

//     );
// };

const BAR_COUNT = 30;

const WaveformAndroid = () => {
    const bars = useRef(
        Array.from({ length: BAR_COUNT }, () => new Animated.Value(10))
    ).current;

    useEffect(() => {
        const interval = setInterval(() => {
            for (let i = 0; i < BAR_COUNT - 1; i++) {
                bars[i].setValue(bars[i + 1]._value);
            }

            const randomHeight = Math.random() * 20 + 10;

            Animated.timing(bars[BAR_COUNT - 1], {
                toValue: randomHeight,
                duration: 80,
                useNativeDriver: false,
            }).start();
        }, 100);

        return () => clearInterval(interval);
    }, []);

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 20 }}>
            {bars.map((bar, index) => (
                <Animated.View
                    key={index}
                    style={{
                        width: 1,
                        marginHorizontal: 1,
                        height: bar,
                        backgroundColor: '#fff',
                        borderRadius: 2,
                    }}
                />
            ))}
        </View>
    );
};
const Waveform = ({ amplitude }) => {
    const bars = useRef(
        Array.from({ length: BAR_COUNT }, () => new Animated.Value(4))
    ).current;

    useEffect(() => {
        // shift bars left
        for (let i = 0; i < BAR_COUNT - 1; i++) {
            bars[i].setValue(bars[i + 1]._value);
        }

        // add new amplitude to end
        const newHeight = 10 + amplitude * 420;

        Animated.timing(bars[BAR_COUNT - 1], {
            toValue: newHeight,
            duration: 80,
            useNativeDriver: false,
        }).start();

    }, [amplitude]);

    return (
        <View style={styles.waveContainer}>
            {bars.map((bar, index) => (
                <Animated.View
                    key={index}
                    style={[
                        styles.bar,
                        { height: bar }
                    ]}
                />
            ))}
        </View>
    );
};


const CircleButton = ({ icon, onPress, size, disabled }) => (
    <TouchableOpacity
        style={[styles.circleBtn, disabled && { opacity: 0.5 }]}
        onPress={onPress}
        disabled={disabled}
    >
        <Icon name={icon} size={size} color="#fff" />
    </TouchableOpacity>
);
const styles = StyleSheet.create({
    wrapper: {
        padding: 16,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 18,
    },
    activeBorder: {
        borderWidth: 2,
        borderColor: '#F4A43A',
    },
    captureBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#6F5C78',
        paddingHorizontal: 30,
        paddingVertical: 10,
        borderRadius: 25,
    },
    captureBtnDisabled: {
        opacity: 0.7,
    },
    captureText: {
        color: '#fff',
        fontWeight: '600',
        paddingLeft: 20
    },
    circleBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#6F5C78',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 16,
    },
    rightIcons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    waveContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: 50,
        // marginHorizontal: 10,
        overflow: 'hidden',
        // backgroundColor : 'red'

    },
    waveBar: {
        width: 3,
        height: Math.random() * 25 + 5,
        backgroundColor: '#fff',
        marginHorizontal: 2,
        borderRadius: 2,
    },
    wavePlaceholder: {
        width: 100,
    },
    containerWave: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: 50,
    },
    bar: {
        width: 1,
        backgroundColor: 'white',
        marginHorizontal: 1,
        borderRadius: 2,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 25,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 6,
    },

    optionText: {
        fontSize: 15,
        color: '#333',
        paddingLeft: 8
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 25,
    },
    cancelBtn: {
        marginRight: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    cancelText: {
        color: '#00695c',
        fontWeight: '600',
    },
    deleteBtn: {
        backgroundColor: '#00695c',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 4,
    },
    deleteText: {
        color: '#fff',
        fontWeight: '600',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    containerModal: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 20,
        elevation: 5,
    },
    checkboxOuter: {
        width: 22,
        height: 22,
        borderWidth: 2,
        borderColor: '#6F5C78',
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },

    checkboxInner: {
        width: 12,
        height: 12,
        backgroundColor: '#6F5C78',
        borderRadius: 2,
    },
});


export default ScribeControlBar;

