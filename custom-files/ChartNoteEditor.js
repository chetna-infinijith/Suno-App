import React, { useRef, useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Button,
  Alert,
  Text,
  Pressable,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Linking,
  Animated,
  Easing,
  Vibration,
  PermissionsAndroid, Keyboard
} from 'react-native';
import * as GlobalVariables from '../config/GlobalVariableContext';
import { useNavigation } from '@react-navigation/native';
import * as SunoApi from '../apis/SunoApi.js';
import { RichText, Toolbar, useEditorBridge } from '@10play/tentap-editor';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Ionicons } from '@expo/vector-icons';
import Voice from '@react-native-voice/voice';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import SpeechWebView from "./SpeechWebView";
import hasTextInHTML from '../global-functions/hasTextInHTML';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { logError } from '../index.js';

export const ChartNoteEditor = ({ patientData, chartNoteData }) => {
  const sunoUpdateNoteStatusPATCH = SunoApi.useUpdateNoteStatusPATCH();
// console.log("=== chartNoteData ", chartNoteData)
  const Constants = GlobalVariables.useValues();
  const { clinic_pk_id, senderID, MessageId, AUTH_HEADER } = Constants;
  const navigation = useNavigation();
  const [recognizing, setRecognizing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [chartNoteID, setChartNoteID] = useState(chartNoteData && Object.keys(chartNoteData).length === 0 ? 0 : chartNoteData?.id );
  const [chartNoteStatus, setChartNoteStatus] = useState(chartNoteData && Object.keys(chartNoteData).length === 0 ? false : true );
  const [isEditorEmpty, setIsEditorEmpty] = useState(true);

  const [reloadChart, setReloadChart] = React.useState(0);
  const [hasPermission, setHasPermission] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [messageText, setMessageText] = useState('');
  const [hasProcessedResult, setHasProcessedResult] = useState(false);
  const [partialText, setPartialText] = useState('');
  const speechRef = useRef(null);
  // console.log("=== chartNoteData : ",chartNoteData)
  const recordingTimerRef = useRef(null);
  const voiceStartedRef = useRef(false);
  const audioLevelsRef = useRef(
    Array(15)
      .fill(0)
      .map(() => Math.random() * 20 + 10)
  );
  const startTimeRef = useRef(null);
  const lastDisplayedTimeRef = useRef(0);
  const lastRecognizedRef = useRef('');
  const speechTextSnapshot = useRef('');

  useEffect(() => {
    const trackEvent = async () => {
      await logEvent('patient_chart_opened', {
        // chart_load_time_ms: textInputValue || '',
        // has_recent_appt: json?.results?.length ?? 0,
      });
    };
  
    trackEvent();
  }, []);

  useEffect(() => {
  
    const requestPermissions = async () => {
      const { granted } =
        await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      setHasPermission(granted);
    };

    requestPermissions();
  }, []);

  useSpeechRecognitionEvent('start', () => setRecognizing(true));
  useSpeechRecognitionEvent('end', () => setRecognizing(false));
  useSpeechRecognitionEvent('result', async event => {
    const text = event.results[0]?.transcript || '';

    // Get the newly added words only
    const newText = text.startsWith(lastTranscript)
      ? text.slice(lastTranscript.length).trim()
      : text;

    // console.log("==== newText : ", newText)
    if (!newText) return;
    // console.log("==== newText ====: ", newText)

    setLastTranscript(text); // update last transcript
    setTranscript(text);

    if (editor) {
      const currentText = await editor.getHTML(); // get current editor content
      // editor.setContent(currentText + (currentText ? ' ' : '') + newText); // append on same line
      // editor.setContent(currentText + ' ' + newText);

      // Match the last block (paragraph/div) and append newText inside it
      const newHTML = currentText.replace(/(<\/(p|div)>)\s*$/, '') + ' ' + newText + '</p>';

      editor.setContent(newHTML);

    }
  });
  useSpeechRecognitionEvent('error', event => {
    console.log('error code:', event.error, 'error message:', event.message);
  });

  const handleStart = async () => {
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!result.granted) {
      console.warn('Permissions not granted', result);
      return;
    }
    // Start speech recognition
    ExpoSpeechRecognitionModule.start({
      lang: 'en-US',
      interimResults: true,
      continuous: false,
      androidRecognitionServicePackage: "com.google.android.tts",

    });
  };


  useEffect(() => {
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechVolumeChanged = onSpeechVolumeChanged;

    Voice.onSpeechPartialResults = onSpeechPartialResults;

    return () => {
      Voice.destroy().then(
        () => Voice.removeAllListeners && Voice.removeAllListeners()
      );
      stopAllTimers();
    };
  }, []);

  const onSpeechPartialResults = async e => {
    if (Platform.OS === 'ios') {
      return;
    }
    // if (e.value && e.value.length > 0) {
    //   // setPartialResults(e.value[0]);     
    // }
    try {
      const newChunk = (e.value?.[0] || "").trim();
      // console.log("==== newChunk : ",newChunk)
      const oldChunk = prevSpeechChunk.current || "";

      const diff = getNewWords(oldChunk, newChunk).trim();


      // get only the delta compared to last chunk
      // let i = 0;
      // const max = Math.min(oldChunk.length, newChunk.length);
      // while (i < max && oldChunk[i] === newChunk[i]) i++;
      // const diff = newChunk.slice(i).trim();

      // update chunk store for next tick
      prevSpeechChunk.current = newChunk;

      if (!diff) {
        // nothing new — bail out
        return;
      }

      // accumulate cleaned speech
      speechFinal.current = (speechFinal.current ? speechFinal.current + " " : "") + diff;

      // Try to insert at cursor using editor commands
      if (!editor) {
        console.warn("Editor instance not available. Using fallback.");
        return;
      }

      // Prefer insertText for plain words (preserves marks & cursor)
      // Use try/catch: insertText can throw if selection invalid
      try {
        await safeAppendToEnd(editor, diff);
      } catch (insertErr) {
        console.warn("insertText/insertContent failed, falling back:", insertErr);
        // If selection lost or insert failed, append to end
        // await safeAppendToEnd(editor, diff);
      }
    } catch (err) {
      logError("onSpeechResults error:", err);
      logError("onSpeechResults error:", err);
    }
  };

  const onSpeechVolumeChanged = e => {
    if (e.value) {
      const volume = Math.min(e.value / 5, 1);
      updateWaveform(volume);
    }
  };

  const updateWaveform = volume => {
    const newLevels = audioLevelsRef.current.map((level, index) => {
      const baseLevel = 10 + Math.sin(Date.now() / 200 + index) * 5;
      return baseLevel + volume * 40;
    });
    audioLevelsRef.current = newLevels;
  };
  const typedHTML = useRef("");
  const prevSpeechChunk = useRef("");
  const speechFinal = useRef("");

  const onEditorUpdate = ({ editor }) => {
    // store typed HTML separately so speech doesn't overwrite typed content
    typedHTML.current = editor.getHTML();
  };


  const onSpeechStart = e => {
    prevSpeechChunk.current = "";
    setRecognizing(true);
    voiceStartedRef.current = true;
    // setRecordingTime(0);
    startAnimations();

    startTimeRef.current = Date.now();
    lastDisplayedTimeRef.current = 0;
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    recordingTimerRef.current = setInterval(() => {
      const elapsedSeconds = Math.floor(
        (Date.now() - startTimeRef.current) / 1000
      );
      if (elapsedSeconds !== lastDisplayedTimeRef.current) {
        setRecordingTime(elapsedSeconds);
        lastDisplayedTimeRef.current = elapsedSeconds;
      }
    }, 1000);
  };

  const onSpeechEnd = async (e) => {
    console.log('Speech ended');
    if (Platform.OS === 'ios') {
      prevSpeechChunk.current = "";
    }


    if (Platform.OS === 'android') {
      handleStopRecording()
      // try {
      //   await Voice.stop(); // ensure previous session closed
      // } catch {}

      // setTimeout(async () => {
      //   try {
      //     await Voice.start('en-US');
      //     // await Voice.start('en-US', {
      //     //   EXTRA_PARTIAL_RESULTS: true,
      //     //   EXTRA_MAX_SPEECH_INPUT_LENGTH_MILLIS: 3600000 // 1 hour
      //     // });

      //   } catch (e) {
      //     console.log("voice restart error", e);
      //   }
      // }, 20);
    }

    // setIsProcessing(true);
  };

  const prevWords = useRef([]); // store previous recognized words


  // const onSpeechResults = async (e) => {
  //   const text = e.value?.[0]?.trim() || '';
  //   const words = text.split(/\s+/);
  //   const oldWords = prevWords.current;

  //   // ✅ Find only new words that were not previously added
  //   let diffIndex = 0;
  //   while (
  //     diffIndex < oldWords.length &&
  //     diffIndex < words.length &&
  //     oldWords[diffIndex] === words[diffIndex]
  //   ) {
  //     diffIndex++;
  //   }

  //   const newWords = words.slice(diffIndex);
  //   prevWords.current = words;

  //   if (newWords.length > 0 && editor) {
  //     const newPart = newWords.join(' ');
  //     const currentHTML = await editor.getHTML();
  //     const cleaned = currentHTML.replace(/\s*<\/p>\s*$/, '');
  //     const updatedHTML = `${cleaned} ${newPart}</p>`;
  //     editor.setContent(updatedHTML);
  //     console.log('==== newHTML :', updatedHTML);
  //   }
  // };

  const escapeHtml = (str = "") =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  // Fallback: safe append to end of document
  const safeAppendToEnd = async (editor, plainText) => {
    try {
      const current = await editor.getHTML();
      const cleaned = current.replace(/\s*<\/p>\s*$/, "");
      const appended = `${cleaned} ${escapeHtml(plainText)}</p>`;
      editor.setContent(appended);
      // console.log("FALLBACK appended to end:", plainText);
    } catch (err) {
      logError("safeAppendToEnd error:", err);
      logError("safeAppendToEnd error:", err);

    }
  };
  const getNewWords = (prev, curr) => {
    if (!prev) return curr;

    const prevArr = prev.split(/\s+/);
    const currArr = curr.split(/\s+/);

    if (currArr.length <= prevArr.length) return "";

    // return only the words that are newly added
    return currArr.slice(prevArr.length).join(" ");
  };
  // Main speech handler — robust insertion
  const onSpeechResults = async (e) => {
    if (Platform.OS == 'ios') {
      try {
        const newChunk = (e.value?.[0] || "").trim();
        // console.log("==== newChunk : ",newChunk)
        const oldChunk = prevSpeechChunk.current || "";

        const diff = getNewWords(oldChunk, newChunk).trim();


        // get only the delta compared to last chunk
        // let i = 0;
        // const max = Math.min(oldChunk.length, newChunk.length);
        // while (i < max && oldChunk[i] === newChunk[i]) i++;
        // const diff = newChunk.slice(i).trim();

        // update chunk store for next tick
        prevSpeechChunk.current = newChunk;

        if (!diff) {
          // nothing new — bail out
          return;
        }

        // accumulate cleaned speech
        speechFinal.current = (speechFinal.current ? speechFinal.current + " " : "") + diff;

        // Try to insert at cursor using editor commands
        if (!editor) {
          console.warn("Editor instance not available. Using fallback.");
          return;
        }

        // Prefer insertText for plain words (preserves marks & cursor)
        // Use try/catch: insertText can throw if selection invalid
        try {
          await safeAppendToEnd(editor, diff);
        } catch (insertErr) {
          console.warn("insertText/insertContent failed, falling back:", insertErr);
          // If selection lost or insert failed, append to end
          // await safeAppendToEnd(editor, diff);
        }
      } catch (err) {
        logError("onSpeechResults error:", err);
        logError("onSpeechResults error:", err);
      }
    }
  };


  const prevSpeechText = useRef("");

  // const onSpeechResults = async (e) => {
  //   const newChunk = (e.value?.[0] || "").trim();
  //   const oldChunk = prevSpeechChunk.current;

  //   // Compute difference (longest common prefix)
  //   let i = 0;
  //   while (
  //     i < oldChunk.length &&
  //     i < newChunk.length &&
  //     oldChunk[i] === newChunk[i]
  //   ) {
  //     i++;
  //   }

  //   // Only NEW part from speech engine
  //   const diff = newChunk.slice(i).trim();

  //   prevSpeechChunk.current = newChunk;

  //   if (!diff) return;

  //   // Add diff into final speech buffer
  //   speechFinal.current += " " + diff;

  //   // Merge UI: typed + speech
  //   const mergedHTML =
  //     `${typedHTML.current.replace(/\s*<\/p>\s*$/, "")} ${speechFinal.current.trim()}</p>`;

  //   editor.setContent(mergedHTML);
  // };




  const editor = useEditorBridge({
    // autofocus: true,
    // avoidIosKeyboard: true,
    initialContent: chartNoteData && Object.keys(chartNoteData).length === 0 ? '' : chartNoteData?.text,
    onReady: () => {
      console.log('Editor is ready');
    },
    onUpdate: ({ editor }) => {
      console.log("Editor updated:", editor.getText());
    },
  });


  const onSpeechError = e => {
    setHasProcessedResult(false);
    const silentErrors = ['7', '6', '5', '1', '0'];
    if (!silentErrors.includes(e.error?.code?.toString())) {
      if (e.error?.message && !e.error.message.includes('RecognitionService')) {
        // Alert.alert('Speech Error', 'Please try speaking again');
      }
    }
    handleStopRecording();
  };

  

  const requestSpeechPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'This app needs microphone access for voice messages',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    if (Platform.OS === 'ios') {
      const result = await check(PERMISSIONS.IOS.MICROPHONE);

      if (result === RESULTS.GRANTED) return true;

      const requestResult = await request(PERMISSIONS.IOS.MICROPHONE);
      return requestResult === RESULTS.GRANTED;
    return true
    }

    return true;
  };
  const startVoiceRecording = async () => {
    try {
      prevWords.current = []; // reset
      Keyboard.dismiss();
     
      const hasPermission = await requestSpeechPermission();
      console.log("======hasPermission : ", hasPermission)
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'This feature needs Microphone permission to work properly. Please enable it from app settings.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Open Settings',
              onPress: () => {
                Linking.openSettings().catch(() => {
                  Alert.alert(
                    'Error',
                    'Unable to open settings. Please open them manually.'
                  );
                });
              },
            },
          ],
          { cancelable: false }
        );
        return;
      }
    
      if (recognizing) return;
      speechTextSnapshot.current = messageText.trim();
      await Voice.destroy(); // clear old sessions
      Voice.removeAllListeners();
      setRecognizing(true);
      setIsProcessing(false);
      setHasProcessedResult(false);
      voiceStartedRef.current = false;

      // await Voice.destroy();

      if (Platform.OS === 'ios') {
        await Voice.start('en-US', {
          EXTRA_PARTIAL_RESULTS: true,
          EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS: 3000,
          EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS: 3000,
        });
      } else {
        // await Voice.start('en-US',{
        //   EXTRA_PARTIAL_RESULTS: true,
        // });
        Voice.start('en-US', {
          EXTRA_PARTIAL_RESULTS: true,
          EXTRA_MAX_SPEECH_INPUT_LENGTH_MILLIS: 3600000 // 1 hour
        });
      }

      Vibration.vibrate(50);
    } catch (error) {
      console.log('Error starting voice recording:', error);
      setRecognizing(false);
    }
  };

  const handleStopRecording = async () => {
    try {
      if (voiceStartedRef.current) {
        await Voice.stop();
      } else {
        await Voice.stop();
      }
    } catch (error) {
      console.log('Error stopping recording:', error);
    } finally {


      cleanupRecording();
    }
  };

  const handleCloseVoiceUI = async () => {
    try {
      if (voiceStartedRef.current) {
        await Voice.cancel();
      } else {
        await Voice.cancel();
      }
    } catch (error) {
      console.log('Error canceling recording:', error);
    } finally {
      cleanupRecording();
      // setRecognizedText('');
    }
  };

  const cleanupRecording = async () => {
    try {
      setRecordingTime(0)
      setIsProcessing(false);
      voiceStartedRef.current = false;
      await Voice.destroy();
      Voice.removeAllListeners();
      setRecognizing(false);
      stopAllTimers();
      stopAnimations();
      Vibration.vibrate(50);
      lastRecognizedRef.current = '';
      speechTextSnapshot.current = '';
    } catch (error) {
      console.log("=== Error : ", error)
    }
  };

  const handleGetContent = async () => {
    if (!editor) return;

    const text = await editor.getText();
    const html = await editor.getHTML();
    const json = await editor.getJSON();

    // console.log('Plain text:', text);
    // console.log('HTML:', html);
    // console.log('JSON:', json);

    try {
      // const staff_id = Constants.UserInfo?.id;
      if (chartNoteData && Object.keys(chartNoteData).length === 0) {


        const param = {
          text: html,
          icd10_codes: [],
          patient: patientData.patientID,
          type: patientData.type,
          clinic: patientData.clinic ?? clinic_pk_id,
        };
        console.log('param:', param, patientData);

        const response = await fetch(`${Constants.API_BASE_URL}/chart-notes/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: Constants.AUTH_HEADER,
          },
          body: JSON.stringify(param),
        });

        // const response = await res.json();
        // console.log(
        //   '======= Json :',
        //   //   `${Constants.API_BASE_URL}/events-optimized/?status=1,2,4,5,99&from_date=${fromDate}&to_date=${toDate}&query={*}&staff_member=${staff_id}&type=A,S`,
        //   response
        // );
        const result = await response.json();
        // console.log("=== res :", result)

        if (response.ok) {
          Alert.alert('Success', 'Notes added successfully.', [
            {
              text: 'Ok',
              onPress: () => {
                // navigation.goBack();
                setChartNoteID(result?.id);
              },
            },
          ]);
        } else {
          Alert.alert('Failed to add notes', JSON.stringify(result));
        }
      } else {
        // console.log('param:', chartNoteData?.icd10_codes?.map(item => item.id) ?? []);

        const param = {
          text: html,
          icd10_codes: chartNoteData?.icd10_codes?.map(item => item.id) ?? [],
        };

        const response = await fetch(`${Constants.API_BASE_URL}/chart-notes/${chartNoteData?.id}/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: Constants.AUTH_HEADER,
          },
          body: JSON.stringify(param),
        });

        // const response = await res.json();
        // console.log(
        //   '======= Json :',
        //   //   `${Constants.API_BASE_URL}/events-optimized/?status=1,2,4,5,99&from_date=${fromDate}&to_date=${toDate}&query={*}&staff_member=${staff_id}&type=A,S`,
        //   response
        // );
        const result = await response.json();

        if (response.ok) {
          Alert.alert('Success', 'Notes updated successfully.', [
            {
              text: 'Ok',
              onPress: () => {
                // navigation.goBack();
              },
            },
          ]);
        } else {
          Alert.alert('Failed to add notes', JSON.stringify(result));
        }
      }
    } catch (err) {
      console.log('======= err :', err);
    } finally {
      setLoading(false);
    }
  };
  const formatTimeChat = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  const startAnimations = () => {
    Keyboard.dismiss();
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    Animated.spring(slideAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopAnimations = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    pulseAnim.stopAnimation();
  };

  const stopAllTimers = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    startTimeRef.current = null;
    lastDisplayedTimeRef.current = 0;
  };


  // Render modern voice UI
  const renderVoiceUI = () => (
    <Animated.View
      style={[
        {
          position: 'absolute',
          bottom: 70,
          left: 20,
          right: 20,
          zIndex: 1000,
        },
        {
          transform: [
            { scale: scaleAnim },
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
          opacity: scaleAnim,
        },
      ]}
    >
      <View style={{

        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
      }}>
        <View style={{
          alignItems: 'center',
          marginBottom: 12,
        }}>
          <Text style={{
            fontSize: 20,
            fontWeight: '700',
            color: '#333',
            marginBottom: 4,
          }}>
            {isProcessing ? 'Processing...' : 'Speak Now'}
          </Text>
          <Text style={{
            fontSize: 14,
            color: '#666',
            textAlign: 'center',
          }}>
            {isProcessing ? 'Converting to text...' : "We're listening"}
          </Text>
        </View>

        <View style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'center',
          height: 60,
          marginVertical: 10,
          paddingHorizontal: 10,
        }}>
          {audioLevelsRef.current.map((level, index) => (
            <Animated.View
              key={index}
              style={[
                {
                  width: 3,
                  marginHorizontal: 2,
                  borderRadius: 2,
                  minHeight: 10,
                },
                {
                  height: level,
                  backgroundColor: isProcessing
                    ? '#999'
                    : level > 40
                      ? '#FF6B6B'
                      : '#4ECDC4',
                  transform: [
                    {
                      scaleY: pulseAnim.interpolate({
                        inputRange: [1, 1.1],
                        outputRange: [1, level > 40 ? 1.2 : 1.1],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>

        <View style={{
          alignItems: 'center',
          marginTop: 10,
        }}>
          <Animated.View style={[{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: '#FF6B6B',
            marginBottom: 8,
          }, { opacity: pulseAnim }]}>
            <View style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: '#FF6B6B',
            }} />
          </Animated.View>
          <Text style={{
            fontSize: 24,
            fontWeight: '700',
            color: '#333',
          }}>{formatTimeChat(recordingTime)}</Text>
        </View>
      </View>
    </Animated.View>
  );
  const appendToEditor = (text) => {
    if (!editor) return;
    editor.setContent(text + " ");
  };

  React.useEffect(() => {

    const interval = setInterval(async () => {
      if (editor?.getHTML) {
        const html = await editor.getHTML();
        const blank =
          !html ||
          html.trim() === "" ||
          html === "<p></p>" ||
          html === "<p><br></p>";
  
        setIsEditorEmpty(blank);
      }
    }, 400);
  
    return () => clearInterval(interval);
  }, [editor]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Editor content */}
      <View
        style={{
          width: '100%',
          borderTopWidth: 1,
          borderColor: '#ccc',
          height: 50,
        }}
      >
        <Toolbar editor={editor} hidden={false} />
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 125 : 110}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'space-between',
          }}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ flex: 1, margin: 20 }}>
            <RichText editor={editor} hideKeyboardAccessoryView={true} />
          </View>
          {/* <SpeechWebView
        ref={speechRef}
        onResult={(txt) => appendToEditor(txt)}
      /> */}

          {/* Always visible toolbar, regardless of keyboard */}
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1, paddingHorizontal: 20, flexDirection: 'row' }}>
              <Pressable
                onPress={() => {
                  handleGetContent();
                }}
                style={{
                  backgroundColor: '#054743', // theme background
                  borderRadius: 8,
                  paddingVertical: 10,
                  // paddingHorizontal: 16,
                  alignItems: 'center', // center text
                  justifyContent: 'center',
                  flex: 1, marginRight: 5
                }}
              >
                <Text
                  style={{
                    color: 'white', // or theme.colors.surface
                    fontSize: 16,
                    fontWeight: '600',
                  }}
                >
                  {chartNoteData && Object.keys(chartNoteData).length === 0 ?
                    'Save Note'
                    :
                    'Update Note'}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  Alert.alert(
                    'Confirmation',
                    'Are you sure you want to mark this chart note as completed?',
                    [
                      {
                        text: 'Cancel',
                        style: 'cancel',
                        onPress: () => {
                          // handle cancel action
                          console.log('User cancelled');
                        },
                      },
                      {
                        text: 'Yes',
                        onPress: async () => {
                          let error = null;
                          try {
                            const html = await editor.getHTML();

                            const chartData = (
                              await sunoUpdateNoteStatusPATCH.mutateAsync(
                                {
                                  id: chartNoteID,
                                  note: html,
                                }
                              )
                            )?.json;

                            setReloadChart(reloadChart + 1);
                            Alert.alert(
                              '',
                              'This chart note has been marked as completed successfully.'
                            );

                          } catch (err) {
                            logError(err);
                            logError("Error on Chart note completed:", err);

                            error = err.message ?? err;
                          }

                        },
                      },
                    ],
                    { cancelable: true }
                  );
                }}
                style={{
                  backgroundColor: chartNoteID <= 0 ||
                  isEditorEmpty? 'rgba(0, 0, 0, 0.36)'  : '#054743' , // theme background
                  borderRadius: 8,
                  paddingVertical: 10,
                  // paddingHorizontal: 16,
                  alignItems: 'center', // center text
                  justifyContent: 'center',
                  flex: 1,
                  marginLeft: 5
                }}
                
                disabled={chartNoteID <= 0 || isEditorEmpty}
              >
                <Text
                  style={{
                    color: 'white', // or theme.colors.surface
                    fontSize: 16,
                    fontWeight: '600',
                  }}
                >
                  {"Complete Note"}
                </Text>
              </Pressable>
            </View>

            <View style={{ alignItems: 'center' }}>
              {!recognizing ? (
                // <Button title="Start" onPress={handleStart} />
                // <TouchableOpacity
                //   style={{
                //     width: 44,
                //     height: 44,
                //     borderRadius: 22,
                //     // backgroundColor: '#fff',
                //     justifyContent: 'center',
                //     alignItems: 'center',
                //     marginRight: 20,
                //   }}
                //   onPress={() => handleStart()}
                // >
                //    <Feather name="mic" size={30} color="#054743" />
                //    </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 24,
                    backgroundColor: '#E3F2FD',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 20,
                  }}
                  onPress={() => {
                    editor?.blur?.();          // for RichEditor or Quill editor
                    editor?.blurEditor?.()
                    Keyboard.dismiss();
                    if (Platform.OS == 'ios') {
                      startVoiceRecording()
                    } else {
                      // handleStart()
                      startVoiceRecording()
                      // speechRef.current.start()
                    }

                    // handleStart()
                  }
                  }
                >
                  <Ionicons name="mic-outline" size={24} color="#066858" />
                </TouchableOpacity>


              ) : (
                // <TouchableOpacity
                //   style={{
                //     width: 44,
                //     height: 44,
                //     borderRadius: 24,
                //     backgroundColor: '#054743',
                //     justifyContent: 'center',
                //     alignItems: 'center',
                //     marginRight: 20,
                //   }}
                //   onPress={() => ExpoSpeechRecognitionModule.stop()}
                // >
                //   <Feather name="mic" size={30} color="#fff" />
                // </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: '#FFE5E5',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 1,
                    marginRight: 20,
                    borderColor: '#FFCDD2',
                  }}
                  onPress={() => {
                    if (Platform.OS == 'ios') {
                      handleCloseVoiceUI()
                    } else {
                      // ExpoSpeechRecognitionModule.stop()
                      // speechRef.current.stop()
                      handleCloseVoiceUI()
                    }
                  }
                  }
                >
                  <Ionicons name="close" size={24} color="#FF3B30" />
                </TouchableOpacity>

              )}
            </View>
          </View>
        </ScrollView>

        {recognizing && renderVoiceUI()}

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
};
