// import { useEffect, useRef, useState } from 'react';
// import AudioRecord from 'react-native-audio-record';
// import { Buffer } from 'buffer';
// import * as GlobalVariables from '../config/GlobalVariableContext';
// import { Alert, Platform } from 'react-native';
// import { PermissionsAndroid } from 'react-native';
// import analytics from '@react-native-firebase/analytics';
// import { getSessionId } from '../global-functions/sessionManager';

// export default function useAmbientScribe(patientId, clinicId, selectedSOAPMain, selectedChartNoteMain) {
//     const wsRef = useRef(null);
//     const timerRef = useRef(null);
//     const [status, setStatus] = useState('idle');
//     const [transcript, setTranscript] = useState('');
//     const [seconds, setSeconds] = useState(0);
//     const [scribeId, setScribeId] = useState('idle');
//     const [amplitude, setAmplitude] = useState(0);
//     const [isConnecting, setIsConnecting] = useState(false);
//     const [isReconnecting, setIsReconnecting] = useState(false);

//     const Constants = GlobalVariables.useValues();

//     const requestMicPermission = async () => {
//         if (Platform.OS === 'android') {
//             const granted = await PermissionsAndroid.request(
//                 PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
//             );

//             return granted === PermissionsAndroid.RESULTS.GRANTED;
//         }
//         return true;
//     };
//     useEffect(() => {


//         // AudioRecord.init({
//         //     sampleRate: 16000,
//         //     channels: 1,
//         //     bitsPerSample: 16,
//         //     audioSource: 6,
//         // });

//         // return () => cleanup();

//         const setupAudio = async () => {
//             const hasPermission = await requestMicPermission();

//             if (!hasPermission) {
//                 Alert.alert("Microphone permission denied");
//                 return;
//             }

//             AudioRecord.init({
//                 sampleRate: 16000,
//                 channels: 1,
//                 bitsPerSample: 16,
//                 audioSource: 6,
//             });

//             // AudioRecord.on('data', handleAudioData);
//         };

//         setupAudio();

//         return () => cleanup();
//         // return () => {
//         //     AudioRecord.stop();
//         //     AudioRecord.removeAllListeners();
//         // };


//     }, []);

//     // ==========================
//     // CONNECT SOCKET
//     // ==========================
//     const connectSocket = () => {
//         setIsConnecting(true)
//         const ws = new WebSocket(
//             `${Constants.API_WSS_URL}/ambient-scribe/`
//         );

//         ws.onopen = () => {
//             // 1️⃣ Authenticate (JSON message, not header)
//             ws.send(
//                 JSON.stringify({
//                     type: 'authenticate',
//                     token: Constants.AUTH_HEADER,
//                 })
//             );
//         };

//         ws.onmessage = async (event) => {
//             try {
//                 const message = JSON.parse(event.data);


//                 // console.log("==== message : ", message)

//                 // 2️⃣ After authentication → start recording
//                 if (message.type === 'authenticated' && message.success) {

//                     ws.send(
//                         JSON.stringify({
//                             type: 'start_recording',
//                             //   scribe_id: scribeId,
//                             clinic_id: clinicId,
//                             patient_id: patientId,
//                             silence_detection_sec: 60,
//                             silence_grace_period_sec: 3,
//                             energy_margin_db: 6,
//                             aggressiveness: 2,
//                             noise_floor_percentile: 10,
//                             speech_ratio_threshold: 0.05

//                         })
//                     );
//                 }

//                 // 3️⃣ Recording started
//                 if (message.type === 'recording_started') {
//                     setScribeId(message.scribe_id)
//                     await analytics().logEvent('scribe_session_started', {
//                         // source: 'mobile',
//                         // platform : Platform.OS,
//                         patient_context: String(patientId),
//                         // clinicId : clinicId,
//                         scribeId: String(message.scribe_id),
//                         session_id: getSessionId()
//                     });

//                     setStatus('recording');
//                     startTimer();
//                     setIsConnecting(false)
//                 }

//                 // 4️⃣ Transcript snapshot
//                 if (message.type === 'resume_snapshot') {
//                     const newText =
//                         message?.chunks?.[0]?.channel?.alternatives?.[0]?.transcript;

//                     if (newText) {
//                         setTranscript(prev => prev + ' ' + newText);
//                     }
//                 }

//                 // If backend sends plain Results
//                 if (message.type === 'Results') {
//                     const newText =
//                         message?.channel?.alternatives?.[0]?.transcript;

//                     if (newText) {
//                         setTranscript(prev => prev + ' ' + newText);
//                     }
//                 }

//             } catch (e) {
//                 // Ignore binary frames
//             }
//         };

//         ws.onerror = async (e) => {
//             console.log('WebSocket error', e.message);
//             await analytics().logEvent('scribe_error', {
//                 error_type: String(e?.message || 'unknown').substring(0, 100),
//                 error_code: String(e?.code || 'no_code'),
//             });
//         };

//         wsRef.current = ws;
//     };

//     // ==========================
//     // START RECORDING
//     // ==========================
//     const startRecording = async () => {
//         setTranscript('');
//         setSeconds(0);
//         connectSocket();



//         AudioRecord.on('data', (data) => {
//             const buffer = Buffer.from(data, 'base64');

//             if (Platform.OS == 'ios') {

//                 // // Convert PCM to Int16 array
//                 const int16 = new Int16Array(
//                     buffer.buffer,
//                     buffer.byteOffset,
//                     buffer.length / 2
//                 );

//                 // Calculate RMS (Root Mean Square)
//                 let sum = 0;
//                 for (let i = 0; i < int16.length; i++) {
//                     sum += int16[i] * int16[i];
//                 }

//                 const rms = Math.sqrt(sum / int16.length);
//                 const normalized = Math.min(rms / 32768, 1);

//                 setAmplitude(normalized);
//             } else {
//                 // const normalized = Math.min(buffer.length / 4000, 1);
//                 // setAmplitude(normalized);
//                 setAmplitude(0.00001);

//                 // setAmplitude(Math.random() * 0.8);

//             }
//             // setAmplitude(0.00001);


//             // Send audio to server
//             if (wsRef.current?.readyState === WebSocket.OPEN) {
//                 wsRef.current.send(buffer);
//             }
//         });

//         AudioRecord.start();
//     };

//     // ==========================
//     // PAUSE
//     // ==========================
//     const pauseRecording = () => {
//         setStatus('paused');
//         stopTimer();
//         AudioRecord.stop();

//     };

//     // ==========================
//     // RESUME
//     // ==========================
//     const resumeRecording = () => {
//         setStatus('recording');
//         startTimer();
//         AudioRecord.stop();

//     };

//     // ==========================
//     // STOP
//     // ==========================
//     const stopRecording = () => {
//         setIsConnecting(true)
//         // setStatus('stop');

//         Alert.alert(
//             '', `Are you sure you want to stop audio recording?`,
//             [
//                 {
//                     text: 'Cancel',
//                     onPress: async () => {
//                         setStatus('recording');
//         startTimer();
//                         await analytics().logEvent('scribe_session_cancelled', {
//                             duration_sec: formatDuration(seconds),
//                             cancel_reason: 'cancel'
//                         });
//                     },
//                     style: 'cancel', // iOS bolds "Cancel"
//                 },
//                 {
//                     text: 'Yes',
//                     onPress: async () => {
//                         setIsConnecting(true)
//                         AudioRecord.stop();
//                         stopTimer();
//                         // console.log("==== wsRef :", formatDuration(seconds),)
//                         await analytics().logEvent('scribe_session_completed', {
//                             duration_sec: formatDuration(seconds),
//                             session_id: getSessionId()
//                         });
//                         if (wsRef.current) {
//                             // console.log("==== recording end :", formatDuration(seconds),selectedChartNoteMain)

//                             wsRef.current.send(
//                                 JSON.stringify({
//                                     type: 'end_recording',
//                                     duration: formatDuration(seconds),
//                                     find_related_chart_note: selectedChartNoteMain,
//                                     transform: selectedSOAPMain ? 'soap' : '',
//                                 })
//                             );

//                             wsRef.current.close();

//                             setIsConnecting(false)
//                             setTranscript('');


//                         }

//                         setStatus('idle');
//                     },
//                 },
//             ],
//             { cancelable: true } // ✅ Android back button closes alert
//         );


//     };

//     // ==========================
//     // TIMER
//     // ==========================
//     const startTimer = () => {
//         timerRef.current = setInterval(() => {
//             setSeconds(prev => prev + 1);
//         }, 1000);
//     };

//     const stopTimer = () => {
//         clearInterval(timerRef.current);
//     };

//     const formatDuration = (totalSeconds) => {
//         const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
//         const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
//         const secs = String(totalSeconds % 60).padStart(2, '0');
//         return `${hrs}:${mins}:${secs}`;
//     };

//     // ==========================
//     // CLEANUP
//     // ==========================
//     const cleanup = () => {
//         stopTimer();
//         AudioRecord.stop();
//         if (wsRef.current) {
//             wsRef.current.close();
//         }
//     };

//     return {
//         status,
//         transcript,
//         seconds,
//         amplitude,
//         isConnecting,
//         startRecording,
//         pauseRecording,
//         resumeRecording,
//         stopRecording,
//     };
// }

import { useCallback, useEffect, useRef, useState } from 'react';
import AudioRecord from 'react-native-audio-record';
import { Buffer } from 'buffer';
import * as GlobalVariables from '../config/GlobalVariableContext';
import { Alert, Platform, PermissionsAndroid, Linking } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import analytics from '@react-native-firebase/analytics';
import { getSessionId } from '../global-functions/sessionManager';
import { Vibration } from 'react-native';

export default function useAmbientScribe(
  patientId,
  clinicId,
  selectedSOAPMain,
  selectedChartNoteMain
) {
  const wsRef = useRef(null);
  const timerRef = useRef(null);
  const isRecordingRef = useRef(false);
  const isStartingRef = useRef(false);

  const [status, setStatus] = useState('idle');
  const [transcript, setTranscript] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [amplitude, setAmplitude] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isPostponing, setIsPostponing] = useState(false);
  const [micStatus, setMicStatus] = useState('idle');
  const [scribeId, setScribeId] = useState('');
  const scribeIdRef = useRef('');
  const statusRef = useRef('idle');

  const [showSilenceModal, setShowSilenceModal] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const countdownRef = useRef(null);
  const silenceIgnoreUntilRef = useRef(0);

  const lastAudioTimeRef = useRef(Date.now());
  const lastTranscriptTimeRef = useRef(Date.now());
  const noInputTimerRef = useRef(null);
  const silenceAlertShownRef = useRef(false);
  const silenceTimerRef = useRef(null);
  const endRecordingCallbackRef = useRef(null);

  const amplitudeHistoryRef = useRef([]);
  const noiseSamplesRef = useRef([]);
  const speechFramesRef = useRef(0);
  const totalFramesRef = useRef(0);
  const lastProcessTimeRef = useRef(0);

  const HISTORY_SIZE = 10;
  const NOISE_WINDOW = 50;
  const NOISE_PERCENTILE = 0.15;
  const ENERGY_MARGIN = 0.02;

  const NO_INPUT_TIMEOUT = 30000;
  const SPEECH_RATIO_THRESHOLD = 0.1;

  const Constants = GlobalVariables.useValues();

  const updateScribeId = nextScribeId => {
    const value = nextScribeId ? String(nextScribeId) : '';
    scribeIdRef.current = value;
    setScribeId(value);
  };

  const resetStartState = () => {
    isStartingRef.current = false;
    setIsConnecting(false);
  };

  const resetScribeSessionState = () => {
    isStartingRef.current = false;
    isRecordingRef.current = false;
    endRecordingCallbackRef.current = null;

    clearInterval(noInputTimerRef.current);
    clearInterval(countdownRef.current);
    setShowSilenceModal(false);
    silenceAlertShownRef.current = false;
    setIsConnecting(false);

    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (_error) {}
      wsRef.current = null;
    }

    updateScribeId('');
  };

  const prepareForNewRecording = useCallback(() => {
    const currentStatus = statusRef.current;
    if (currentStatus !== 'idle' && currentStatus !== 'ending') {
      return;
    }

    resetScribeSessionState();

    if (currentStatus === 'ending') {
      setStatus('idle');
    }
  }, []);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const initAudioRecord = () => {
    AudioRecord.init({
      sampleRate: 16000,
      channels: 1,
      bitsPerSample: 16,
      audioSource: 6,
    });
  };

  const appendTranscriptText = text => {
    const trimmed = String(text || '').trim();
    if (!trimmed) return;

    lastTranscriptTimeRef.current = Date.now();
    setTranscript(prev => {
      if (!prev) return trimmed;
      if (prev.endsWith(trimmed)) return prev;
      return `${prev} ${trimmed}`;
    });
  };

  const extractSnapshotText = message => {
    if (!message) return '';

    if (Array.isArray(message.chunks)) {
      return message.chunks
        .map(chunk => {
          if (typeof chunk === 'string') return chunk;
          return (
            chunk?.channel?.alternatives?.[0]?.transcript ||
            chunk?.text ||
            chunk?.transcript ||
            ''
          );
        })
        .filter(Boolean)
        .join(' ');
    }

    return (
      message?.channel?.alternatives?.[0]?.transcript ||
      message?.text ||
      message?.transcript ||
      ''
    );
  };

  const startAudioCapture = async () => {
    try {
      AudioRecord.stop();
    } catch (_error) {}

    initAudioRecord();
    attachAudioDataListener();
    await AudioRecord.start();
    isRecordingRef.current = true;
    lastAudioTimeRef.current = Date.now();
    lastTranscriptTimeRef.current = Date.now();
  };

  const restartMicAfterPause = async () => {
    try {
      await AudioRecord.start();
    } catch (_startError) {
      await startAudioCapture();
    }

    isRecordingRef.current = true;
    lastAudioTimeRef.current = Date.now();
    lastTranscriptTimeRef.current = Date.now();
  };

  const getActiveScribeId = () => scribeIdRef.current || scribeId;

  const sendSocketAuthAction = ws => {
    const activeScribeId = getActiveScribeId();

    if (activeScribeId) {
      ws.send(
        JSON.stringify({
          type: 'start_recording',
          scribe_id: activeScribeId,
          patient_id: patientId,
        })
      );
      return;
    }

    ws.send(
      JSON.stringify({
        type: 'start_recording',
        clinic_id: clinicId,
        patient_id: patientId,
      })
    );
  };

  // ==========================
  // PERMISSION (ANDROID + IOS)
  // ==========================
  const requestMicPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }

    if (Platform.OS === 'ios') {
      const result = await check(PERMISSIONS.IOS.MICROPHONE);

      if (result === RESULTS.GRANTED) return true;

      const requestResult = await request(PERMISSIONS.IOS.MICROPHONE);
      return requestResult === RESULTS.GRANTED;
    }

    return false;
  };

  // ==========================
  // INIT AUDIO
  // ==========================
  // ==========================
  // INIT AUDIO
  // ==========================
  useEffect(() => {
    const initAudio = async () => {
      const hasPermission = await requestMicPermission();
      if (!hasPermission) return;

      AudioRecord.init({
        sampleRate: 16000,
        channels: 1,
        bitsPerSample: 16,
        audioSource: 6,
      });
    };

    initAudio();
    return () => cleanup();
  }, []);

  // ==========================
  // HELPER
  // ==========================
  const percentile = (arr, p) => {
    if (!arr.length) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const idx = Math.floor(p * (sorted.length - 1));
    return sorted[idx];
  };

  useEffect(() => {
    if (showSilenceModal) {
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);

            // ✅ auto pause directly from hook
            pauseRecording();

            silenceAlertShownRef.current = false;
            setShowSilenceModal(false);

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(countdownRef.current);
  }, [showSilenceModal]);

  // ==========================
  // SINGLE AUDIO LISTENER
  // ==========================
  const handleAudioData = data => {
    if (!isRecordingRef.current) return;

    try {
      const buffer = Buffer.from(data, 'base64');

      // -------- Send Audio --------
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(buffer);
      }

      if (Platform.OS === 'ios') {
        let sum = 0;
        for (let i = 0; i < buffer.length; i += 2) {
          const int16 = buffer.readInt16LE(i);
          sum += Math.abs(int16);
        }

        const avg = sum / (buffer.length / 2);
        const normalized = Math.min(avg / 32768, 1);

        setAmplitude(normalized);

        // -------- Noise Sampling --------
        noiseSamplesRef.current.push(normalized);
        if (noiseSamplesRef.current.length > NOISE_WINDOW) {
          noiseSamplesRef.current.shift();
        }

        const noiseFloor = percentile(noiseSamplesRef.current, NOISE_PERCENTILE);
        const dynamicThreshold = Math.min(noiseFloor + ENERGY_MARGIN, 0.2);

        // -------- Smoothing --------
        amplitudeHistoryRef.current.push(normalized);
        if (amplitudeHistoryRef.current.length > HISTORY_SIZE) {
          amplitudeHistoryRef.current.shift();
        }

        const avgAmplitude =
          amplitudeHistoryRef.current.reduce((a, b) => a + b, 0) /
          amplitudeHistoryRef.current.length;

        // -------- Speech Detection --------
        totalFramesRef.current += 1;

        if (avgAmplitude > dynamicThreshold) {
          speechFramesRef.current += 1;
          lastAudioTimeRef.current = Date.now();
          setMicStatus('speaking');
        } else {
          if (Date.now() - lastAudioTimeRef.current > 3000) {
            setMicStatus('no_audio');
          } else {
            setMicStatus('listening');
          }
        }
      } else {
        if (Platform.OS === 'android') {
          const now = Date.now();

          if (now - lastProcessTimeRef.current < 100) return; // throttle

          lastProcessTimeRef.current = now;

          // lightweight amplitude (sample only small part)
          let sum = 0;
          const SAMPLE_SIZE = 200;

          for (let i = 0; i < Math.min(buffer.length, SAMPLE_SIZE); i += 2) {
            if (i + 1 >= buffer.length) break;

            const int16 =
              buffer[i] | (buffer[i + 1] << 8);

            const signed =
              int16 > 0x7fff ? int16 - 0x10000 : int16;

            sum += Math.abs(signed);
          }

          const avg = sum / (SAMPLE_SIZE / 2);
          const normalized = Math.min(avg / 32768, 1);

          if (Math.abs(normalized - amplitude) > 0.02) {
            setAmplitude(normalized);
          }

          return; // ⛔ skip heavy logic
        }
      }

    } catch (error) { }
  };

  const attachAudioDataListener = () => {
    try {
      AudioRecord.removeAllListeners?.('data');
    } catch (_error) {}
    AudioRecord.on('data', handleAudioData);
  };

  useEffect(() => {
    attachAudioDataListener();
  }, []);
  // ==========================
  // SOCKET
  // ==========================
  const connectSocket = () => {
    const existing = wsRef.current;

    if (
      existing &&
      (existing.readyState === WebSocket.CONNECTING ||
        existing.readyState === WebSocket.OPEN)
    ) {
      return;
    }

    if (existing) {
      try {
        existing.close();
      } catch (_error) {}
      wsRef.current = null;
    }

    setIsConnecting(true);

    const ws = new WebSocket(`${Constants.API_WSS_URL}/ambient-scribe/`);

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: 'authenticate',
          token: Constants.AUTH_HEADER,
        })
      );
    };

    ws.onmessage = async (event) => {
      let message;
      try {
        message = JSON.parse(event.data);
      } catch (_parseError) {
        return;
      }

      try {
        if (message.type === 'authenticated') {
          sendSocketAuthAction(ws);
        }

        if (message.type === 'recording_started') {
          updateScribeId(message.scribe_id);
          setStatus('recording');
          startTimer();
          isRecordingRef.current = true;
          isStartingRef.current = false;
          setIsConnecting(false);

          lastAudioTimeRef.current = Date.now();
          lastTranscriptTimeRef.current = Date.now();

          startNoInputWatcher();

          await analytics().logEvent('scribe_session_started', {
            patient_context: String(patientId),
            session_id: getSessionId(),
          });
        }

        if (
          message.type === 'Results' ||
          message.type === 'result' ||
          message.type === 'transcription' ||
          message.type === 'transcription_chunk'
        ) {
          const newText =
            message?.channel?.alternatives?.[0]?.transcript ||
            message?.text ||
            message?.transcript;
          appendTranscriptText(newText);
        }

        if (message.type === 'resume_snapshot') {
          appendTranscriptText(extractSnapshotText(message));
        }

        if (message.type === 'recording_ended') {
          console.log("Recording ended:", message);

          isRecordingRef.current = false;
          clearInterval(noInputTimerRef.current);
          stopTimer();

          const onEnded = endRecordingCallbackRef.current;
          endRecordingCallbackRef.current = null;

          resetScribeSessionState();
          setStatus('idle');
          resetStartState();
          setTranscript('');

          onEnded?.();

          if (!onEnded) {
            Alert.alert(
              "Recording Uploaded",
              "The scribe recording has been uploaded. You will receive a notification once it is processed."
            );
          }
        }
      } catch (error) {
        console.log('Scribe message handler error:', error);
      }
    };

    const handleStartFailure = () => {
      if (!isStartingRef.current) {
        return;
      }
      resetStartState();
      try {
        AudioRecord.stop();
      } catch (_error) {}
    };

    ws.onerror = handleStartFailure;

    ws.onclose = () => {
      if (isStartingRef.current && !isRecordingRef.current) {
        handleStartFailure();
      }
    };

    wsRef.current = ws;
  };

  // ==========================
  // SILENCE WATCHER
  // ==========================
  const startNoInputWatcher = () => {
    clearInterval(noInputTimerRef.current);
    let silenceTimer;

    noInputTimerRef.current = setInterval(() => {
      const now = Date.now();

      const noAudio = now - lastAudioTimeRef.current > NO_INPUT_TIMEOUT;
      const noTranscript =
        now - lastTranscriptTimeRef.current > NO_INPUT_TIMEOUT;

      const speechRatio =
        speechFramesRef.current / (totalFramesRef.current || 1);


      // if (
      //   noAudio &&
      //   noTranscript &&
      //   speechRatio < SPEECH_RATIO_THRESHOLD &&
      //   isRecordingRef.current &&
      //   !silenceAlertShownRef.current
      // ) {

      if (
        now > silenceIgnoreUntilRef.current && // ✅ NEW
        noAudio &&
        noTranscript &&
        speechRatio < SPEECH_RATIO_THRESHOLD &&
        isRecordingRef.current &&
        !silenceAlertShownRef.current
      ) {

        silenceAlertShownRef.current = true;

        Vibration.vibrate([0, 500, 200, 500]);

        // console.log("===== setShowSilenceModal")
        setCountdown(30);
        setShowSilenceModal(true);


        // let seconds = 30;

        // // ✅ auto pause timer
        // silenceTimerRef.current = setTimeout(() => {
        //   pauseRecording();
        //   silenceAlertShownRef.current = false;
        // }, 30000);

        // Alert.alert(
        //   "Silence Detected",
        //   `Pause recording?\n\nRecording will pause automatically in ${seconds} seconds.`,
        //   [
        //     {
        //       text: "No",
        //       style: "cancel",
        //       onPress: () => {
        //         clearTimeout(silenceTimerRef.current);
        //         silenceAlertShownRef.current = false; // allow future alerts
        //         silenceIgnoreUntilRef.current = Date.now() + 30000;

        //       },
        //     },
        //     {
        //       text: "Yes",
        //       onPress: () => {
        //         clearTimeout(silenceTimerRef.current);
        //         pauseRecording();
        //         silenceAlertShownRef.current = false;
        //       },
        //     },
        //   ],
        //   { cancelable: false }
        // );
      }
    }, 1000);
  };

  // ==========================
  // START
  // ==========================
  const startRecording = async () => {
    if (
      statusRef.current === 'recording' ||
      statusRef.current === 'paused' ||
      statusRef.current === 'pause'
    ) {
      return;
    }

    resetScribeSessionState();

    isStartingRef.current = true;
    setIsConnecting(true);

    try {
      const hasPermission = await requestMicPermission();
      if (!hasPermission) {
        resetStartState();
        Alert.alert(
          "Permission Required",
          "Please enable microphone access in Settings.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() }
          ]
        );
        return;
      }
      setStatus('idle');
      setTranscript('');
      setSeconds(0);
      setMicStatus('listening');

      speechFramesRef.current = 0;
      totalFramesRef.current = 0;
      noiseSamplesRef.current = [];
      amplitudeHistoryRef.current = [];

      connectSocket();
      await startAudioCapture();
    } catch (error) {
      resetScribeSessionState();
      resetStartState();
      setStatus('idle');
      console.log('Start recording error:', error);
    }
  };

  // ==========================
  // PAUSE
  // ==========================
  const pauseRecording = () => {
    if (statusRef.current !== 'recording') {
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'pause' }));
    }

    setStatus('paused');
    stopTimer();
    isRecordingRef.current = false;

    try {
      AudioRecord.stop();
    } catch (_error) {}

    clearInterval(noInputTimerRef.current);
    setShowSilenceModal(false);
    silenceAlertShownRef.current = false;
    clearInterval(countdownRef.current);
    setMicStatus('listening');
  };

  const postponeRecording = async (scribeIdOverride) => {
    // scribeIdOverride may be a press event when wired directly to onPress,
    // so only accept a string/number id.
    const overrideId =
      typeof scribeIdOverride === 'string' ||
      typeof scribeIdOverride === 'number'
        ? scribeIdOverride
        : undefined;
    const activeScribeId = overrideId || scribeIdRef.current || scribeId;

    if (!activeScribeId) {
      console.log('Postpone recording: missing scribe ID');
      return false;
    }

    if (isPostponing) {
      return false;
    }

    try {
      setIsPostponing(true);
      console.log('Postpone recording:', activeScribeId);
      stopTimer();
      isRecordingRef.current = false;
      AudioRecord.stop();
      clearInterval(noInputTimerRef.current);
      setShowSilenceModal(false);
      silenceAlertShownRef.current = false;
      clearInterval(countdownRef.current);
      const response = await fetch(
        `${Constants.API_BASE_URL}/ai/ambient-scribes/${activeScribeId}/pause/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: Constants.AUTH_HEADER,
          },
        }
      );
      if (response.ok) {
        isRecordingRef.current = false;
        clearInterval(noInputTimerRef.current);
        stopTimer();

        if (wsRef.current) {
          wsRef.current.close();
        }

        setStatus('idle');
        setIsConnecting(false);
        setTranscript('');
        updateScribeId('');

        await analytics().logEvent('scribe_session_postponed', {
          duration_sec: formatDuration(seconds),
          session_id: getSessionId(),
        });

        Alert.alert(
          '',
          'Recording saved for later — open the scribe list to resume or complete.'
        );
        return true;
      }

      throw new Error('Failed to postpone recording');
    } catch (error) {
      console.log('Postpone error:', error);
      return false;
    } finally {
      setIsPostponing(false);
    }
  };
  const reconnectRecordingSocket = () => {
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (_error) {}
      wsRef.current = null;
    }

    isStartingRef.current = true;
    connectSocket();
  };

  const resumeRecording = async () => {
    if (statusRef.current !== 'paused' && statusRef.current !== 'pause') {
      return;
    }

    const activeScribeId = getActiveScribeId();
    if (!activeScribeId) {
      Alert.alert('Resume failed', 'Recording session is no longer active.');
      return;
    }

    try {
      silenceIgnoreUntilRef.current = 0;
      setShowSilenceModal(false);
      silenceAlertShownRef.current = false;
      clearInterval(countdownRef.current);

      // Same reconnect flow as resumeScribeSession (ScribeHistoryScreen)
      reconnectRecordingSocket();
      await restartMicAfterPause();
      setStatus('recording');
      startTimer();
      startNoInputWatcher();
      setMicStatus('listening');
      setIsConnecting(false);
    } catch (error) {
      console.log('Resume recording error:', error);
      setStatus('paused');
      isRecordingRef.current = false;
      isStartingRef.current = false;
      setIsConnecting(false);
      Alert.alert('Resume failed', 'Could not resume recording. Please try again.');
    }
  };

  const resumeScribeSession = async existingScribeId => {
    if (isStartingRef.current || isRecordingRef.current) {
      return false;
    }

    isStartingRef.current = true;
    setIsConnecting(true);

    try {
      const hasPermission = await requestMicPermission();
      if (!hasPermission) {
        resetStartState();
        Alert.alert(
          'Permission Required',
          'Please enable microphone access in Settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
        return false;
      }

      if (!existingScribeId) {
        resetStartState();
        Alert.alert('Resume failed', 'Scribe ID is required to resume recording.');
        return false;
      }

      if (!patientId) {
        resetStartState();
        Alert.alert('Resume failed', 'Patient information is missing for this scribe.');
        return false;
      }

      updateScribeId(existingScribeId);
      setMicStatus('listening');

      speechFramesRef.current = 0;
      totalFramesRef.current = 0;
      noiseSamplesRef.current = [];
      amplitudeHistoryRef.current = [];

      silenceIgnoreUntilRef.current = 0;
      setShowSilenceModal(false);
      silenceAlertShownRef.current = false;
      clearInterval(countdownRef.current);

      reconnectRecordingSocket();
      await restartMicAfterPause();
      isRecordingRef.current = true;
      lastAudioTimeRef.current = Date.now();
      lastTranscriptTimeRef.current = Date.now();
      return true;
    } catch (error) {
      resetStartState();
      console.log('Resume scribe session error:', error);
      return false;
    }
  };
  const onSilenceContinue = () => {
    setShowSilenceModal(false);

    silenceAlertShownRef.current = false;

    // ⏱ ignore for 30 sec
    silenceIgnoreUntilRef.current = Date.now() + 30000;
  }

  // ==========================
  // STOP
  // ==========================
  // const stopRecording = () => {
  //   pauseRecording(); // pause first
  //   clearInterval(noInputTimerRef.current);
  //   Alert.alert(
  //     '',
  //     'Are you sure you want to stop audio recording?',
  //     [
  //       {
  //         text: 'Cancel',
  //         style: 'cancel',
  //         onPress: () => {
  //           // 🔥 Resume recording again
  //           resumeRecording();
  //         },
  //       },
  //       {
  //         text: 'Yes',
  //         onPress: async () => {
  //           try {


  //             isRecordingRef.current = false;

  //             await analytics().logEvent('scribe_session_completed', {
  //               duration_sec: formatDuration(seconds),
  //               session_id: getSessionId(),
  //             });

  //             if (wsRef.current) {
  //               wsRef.current.send(
  //                 JSON.stringify({
  //                   type: 'end_recording',
  //                   duration: formatDuration(seconds),
  //                   find_related_chart_note: selectedChartNoteMain,
  //                   transform: selectedSOAPMain ? 'soap' : '',
  //                 })
  //               );
  //               // setScribeId('')
  //               // wsRef.current.close();
  //               // setIsConnecting(false)
  //               // setTranscript('');
  //               // Alert.alert('', "The scribe record is uploaded. You receive notification when it will be processed.");
  //             }

  //             setStatus('idle');
  //           } catch (error) {

  //           }
  //         },

  //       },

  //     ],
  //     { cancelable: true }
  //   );
  // };

  const formatDuration = (totalSeconds) => {
    const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const secs = String(totalSeconds % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const sendEndRecording = async () => {
    isRecordingRef.current = false;
    AudioRecord.stop();
    stopTimer();
    clearInterval(noInputTimerRef.current);
    clearInterval(countdownRef.current);
    setShowSilenceModal(false);
    silenceAlertShownRef.current = false;

    await analytics().logEvent('scribe_session_completed', {
      duration_sec: formatDuration(seconds),
      session_id: getSessionId(),
    });

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'end_recording',
          duration: formatDuration(seconds),
          find_related_chart_note: selectedChartNoteMain,
          transform: selectedSOAPMain ? 'soap' : '',
        })
      );
      setStatus('ending');
      return;
    }

    const onEnded = endRecordingCallbackRef.current;
    endRecordingCallbackRef.current = null;
    resetScribeSessionState();
    setStatus('idle');
    onEnded?.();
  };

  const stopRecording = () => {
    try {
      setStatus('paused');
      setIsConnecting(true);
      stopTimer();
      isRecordingRef.current = false;
      AudioRecord.stop();
      clearInterval(noInputTimerRef.current);
      Alert.alert(
        '',
        'Are you sure you want to stop audio recording?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: async () => {
              setIsConnecting(false);
              resumeRecording();
            },
          },
          {
            text: 'Yes',
            onPress: async () => {
              try {
                await sendEndRecording();
              } catch (error) {
                console.log('Stop error:', error);
                setIsConnecting(false);
              }
            },
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.log('====== : error :', error);
    }
  };

  const completeRecording = ({ onEnded } = {}) => {
    console.log("====== completeRecording :", onEnded);
    const wsOpen = wsRef.current?.readyState === WebSocket.OPEN;
    const isActive =
      wsOpen &&
      (status === 'recording' || status === 'paused' || status === 'pause');

    if (!isActive) {
      return false;
    }

    if (onEnded) {
      endRecordingCallbackRef.current = onEnded;
    }

    Alert.alert(
      'Complete Scribe',
      'This will finalize your scribe and process all recordings. Continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            endRecordingCallbackRef.current = null;
          },
        },
        {
          text: 'Complete',
          onPress: async () => {
            try {
              setIsConnecting(true);
              await sendEndRecording();
            } catch (error) {
              console.log('Complete recording error:', error);
              endRecordingCallbackRef.current = null;
              setIsConnecting(false);
            }
          },
        },
      ],
      {
        cancelable: true,
        onDismiss: () => {
          endRecordingCallbackRef.current = null;
        },
      }
    );

    return true;
  };

  // ==========================
  // TIMER
  // ==========================
  const startTimer = () => {
    stopTimer();
    timerRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(timerRef.current);
  };

  // ==========================
  // CLEANUP
  // ==========================
  const cleanup = () => {
    try {
      stopTimer();
      AudioRecord.stop();
      resetScribeSessionState();
      setStatus('idle');
    } catch (error) {

    }

  };

  return {
    status,
    transcript,
    seconds,
    amplitude,
    isConnecting,
    isPostponing,
    startRecording,
    prepareForNewRecording,
    postponeRecording,
    pauseRecording,
    resumeRecording,
    resumeScribeSession,
    stopRecording,
    completeRecording,
    showSilenceModal,
    countdown,
    onSilenceContinue
  };
}
