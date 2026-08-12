import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  ActivityIndicator,
  Alert,
  Keyboard,
  FlatList,
  PermissionsAndroid,
  Animated,
  Easing,
  Vibration,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as GlobalVariables from '../config/GlobalVariableContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Voice from '@react-native-voice/voice';
import { IconButton } from '@draftbit/ui';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { logError } from '../index';
import { checkInternetAndProceed } from './InternetConnection';
import { B } from '@expo/html-elements';

const { width, height } = Dimensions.get('window');

let globalPatientId = null;
const MAX_RECORDING_TIME = 120;

export const MessageThreadsView = () => {
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // const scrollViewRef = useRef();
  const flatListRef = useRef();
  const textInputRef = useRef(null);
  const templateSearchInputRef = useRef(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const messageDetail = route.params?.MessageDetail;
  const messageId = route.params?.messageId;
  const onThreadClose = route.params?.onThreadClose;
  const initialUnreadCount = route.params?.unreadCount || 0;

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recognizedText, setRecognizedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showVoiceUI, setShowVoiceUI] = useState(false);
  const [isSpeechActive, setIsSpeechActive] = useState(false);

  const [hasProcessedResult, setHasProcessedResult] = useState(false);
  const [partialResults, setPartialResults] = useState('');

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const globalValues = GlobalVariables.useValues();
  const { clinic_pk_id, senderID, MessageId, AUTH_HEADER } = globalValues;
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageIdParam, setMessageIdParam] = useState(MessageId);
  const [clinic_pk, setClinicPk] = useState(clinic_pk_id);
  const [sendAssignId, setsendAssignId] = useState(senderID);
  const [refreshKey, setRefreshKey] = useState(0);
  const [limitValue, setLimit] = useState(30);
  const [offsetKey, setoffsetKey] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  // const initialMessageSnapshotRef = useRef('');
  const [draftKey, setDraftKey] = useState(null);

  const messageTemplates = [
    {
      category: 'Appointment Reminders',
      templates: [
        'This is a reminder that you have an appointment scheduled for tomorrow at 10:00 AM. Please arrive 10 minutes early to complete any paperwork.',
        'Votre rendez-vous a été confirmé pour le vendredi 15 octobre à 14h30 avec le Dr Smith. Veuillez nous faire savoir si vous avez besoin de recalendrier.',
      ],
    },
    {
      category: 'Follow-up Instructions',
      templates: [
        'Remember to wear your hearing aids for at least 8 hours per day during the adaptation period. This will help you adjust to the new sounds.',
        'Please clean your hearing aids daily using the tools provided. If you have any questions about maintenance, do not hesitate to contact us.',
      ],
    },
    {
      category: 'Hearing Aid Care',
      templates: [
        'To extend battery life, open the battery door when your hearing aids are not in use. Store them in a cool, dry place.',
        'Keep your hearing aids away from heat and moisture. Remove them before showering, swimming, or using a hair dryer.',
      ],
    },
    {
      category: 'Payment Reminders',
      templates: [
        'This is a friendly reminder that your account has a balance of $X. Please call our office to make a payment arrangement.',
      ],
    },
    {
      category: 'General Information',
      templates: [
        'Our office will be closed on Monday, July fourth, in observance of Independence Day. We will resume normal hours on Tuesday, July fifth.',
      ],
    },
  ];

  ///////////////////////////////////////////////////
  // Refs for timers
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
  const hasMarkedAsReadRef = useRef(false);
  const shouldRefreshListRef = useRef(false);
  const processingTimeoutRef = useRef(null);
  const stopTimeoutRef = useRef(null);

  useEffect(() => {
    if (messageId && messageDetail) {
      setMessageIdParam(messageId);
    }
  }, [route.params, messageId, messageDetail]);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, event => {
      const height = event?.endCoordinates?.height ?? 0;
      setKeyboardHeight(height + (insets?.bottom ?? 0));
      requestAnimationFrame(() => {
        flatListRef.current?.scrollToOffset?.({ offset: 0, animated: true });
      });
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

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

  const onSpeechPartialResults = e => {
    try {
      if (e.value && e.value.length > 0) {
        const partialText = e.value[0];
        setPartialResults(partialText);

        const capitalizedPartial = autoCapitalizeFirstWord(partialText);

        setMessageText(prev => {
          const baseText = speechTextSnapshot.current;
          if (baseText) {
            return `${baseText} ${capitalizedPartial}`.trim();
          }
          return capitalizedPartial;
        });
      }
    } catch (error) {
      // console.log('Error in onSpeechPartialResults:', error);
    }
    // if (e.value && e.value.length > 0) {
    //   const partialText = e.value[0];
    //   setPartialResults(partialText);

    //   // setMessageText(prev => {
    //   //   const base = speechTextSnapshot.current || '';
    //   //   return base ? `${base} ${partialText}`.trim() : partialText;
    //   // });

    //   requestAnimationFrame(() => {
    //     setTimeout(() => {
    //       textInputRef.current?.scrollToEnd?.({ animated: true });
    //     }, 100);
    //   });
    // }
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

  const onSpeechStart = e => {
    voiceStartedRef.current = true;
    setIsRecording(true);
    setRecordingTime(0);
    setHasProcessedResult(false);
    setRecognizedText('');
    setPartialResults('');
    startAnimations();
    startRecordingTimer();

    startTimeRef.current = Date.now();
    lastDisplayedTimeRef.current = 0;
  };

  const onSpeechEnd = e => {
    if (!isRecording) return;
    
    setIsProcessing(true);
    
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
    }
    
    // Auto-restart for continuous listening
    processingTimeoutRef.current = setTimeout(() => {
      if (isRecording) {
        try {
          Voice.start('en-US', {
            EXTRA_LANGUAGE_MODEL: 'free_form',
            EXTRA_PARTIAL_RESULTS: true,
            EXTRA_MAX_RESULTS: 1,
          });
        } catch (error) {
          console.log('Restart error:', error);
        }
      }
    }, 500);
    // processingTimeoutRef.current = setTimeout(() => {
    //   if (isRecording && !hasProcessedResult) {
    //     Voice.stop().then(() => {
    //       Voice.start('en-US', {
    //         EXTRA_LANGUAGE_MODEL: 'free_form',
    //         EXTRA_PARTIAL_RESULTS: true,
    //         EXTRA_MAX_RESULTS: 5,
    //         EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS: 120000,
    //         EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS: 120000,
    //         EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS: 120000,
    //       });
    //     });
    //   }
    // }, 1500);
    // if (!hasProcessedResult) {
    //   processingTimeoutRef.current = setTimeout(() => {
    //     if (isRecording && !hasProcessedResult) {
    //       handleStopRecording();
    //     }
    //   }, 3000);
    // } else {
    //   processingTimeoutRef.current = setTimeout(() => {
    //     setIsProcessing(false);
    //   }, 1000);
    // }
  };

  const onSpeechResults = e => {
    try {
      if (e.value && e.value.length > 0) {
        const rawText = e.value[0].trim();
        
        if (!rawText) return;
        const capitalizedText = autoCapitalizeFirstWord(rawText);

        setRecognizedText(capitalizedText);
        setHasProcessedResult(true);
        
        setMessageText(prev => {
          const baseText = speechTextSnapshot.current;
          if (baseText) {
            return `${baseText} ${rawText}`.trim();
          }
          return capitalizedText;
        });
        
        setIsProcessing(false);
      }
    } catch (error) {
      setIsProcessing(false);
    }
  };

  const autoCapitalizeFirstWord = (text) => {
    if (!text || text.length === 0) return text;
    const trimmedText = text.trim();
    
    if (trimmedText.length > 0) {
      return trimmedText.charAt(0).toUpperCase() + trimmedText.slice(1);
    }
    return trimmedText;
  };

  // const enhancedIOSFilter = (newText, existingText = '') => {
  //   if (!newText) return newText;

  //   let cleaned = newText.replace(/\s+/g, ' ').trim();

  //   const words = cleaned.split(' ');
  //   const uniqueWords = [];
  //   let lastWord = '';

  //   for (let i = 0; i < words.length; i++) {
  //     const currentWord = words[i].toLowerCase().replace(/[^\w]+$/g, '');
  //     if (currentWord !== lastWord) {
  //       uniqueWords.push(words[i]);
  //       lastWord = currentWord;
  //     }
  //   }
  //   cleaned = uniqueWords.join(' ');

  //   if (
  //     existingText &&
  //     cleaned.toLowerCase().includes(existingText.toLowerCase())
  //   ) {
  //     const existingLower = existingText.toLowerCase();
  //     const cleanedLower = cleaned.toLowerCase();
  //     const existingIndex = cleanedLower.indexOf(existingLower);

  //     if (existingIndex !== -1) {
  //       const newPart = cleaned
  //         .slice(existingIndex + existingText.length)
  //         .trim();
  //       return newPart ? `${existingText} ${newPart}` : existingText;
  //     }
  //   }

  //   return cleaned;
  // };

  // const filterDuplicateWords = text => {
  //   if (!text) return text;
  //   const cleaned = text.replace(/\s+/g, ' ').trim();
  //   const words = cleaned.split(' ');
  //   const uniqueWords = [];
  //   let lastWord = '';
  //   for (let i = 0; i < words.length; i++) {
  //     const currentWord = words[i].toLowerCase();
  //     const cmp = currentWord.replace(/[^\w]+$/g, '');
  //     if (cmp !== lastWord) {
  //       uniqueWords.push(words[i]);
  //       lastWord = cmp;
  //     }
  //   }
  //   return uniqueWords.join(' ');
  // };

  const onSpeechError = e => {
    if (e.error?.code === '7' || e.error?.message?.includes('No speech input')) {
      if (isRecording) {
        setTimeout(() => {
          try {
            Voice.start('en-US', {
              EXTRA_LANGUAGE_MODEL: 'free_form',
              EXTRA_PARTIAL_RESULTS: true,
              EXTRA_MAX_RESULTS: 1,
            });
          } catch (error) {
            setIsRecording(false);
            setIsProcessing(false);
          }
        }, 1000);
      }
      return;
    }
    
    // For other errors, stop recording
    setIsRecording(false);
    setIsProcessing(false);
  };

  const startAnimations = () => {
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
    setRecordingTime(0);
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
    }
    
    return true;
  };

  const startVoiceRecording = async () => {
    try {
      try {
        await Voice.destroy();
      } catch (e) {
      }
      
      const hasPermission = await requestSpeechPermission();
      if (!hasPermission) {
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
      
      // Reset all states
      speechTextSnapshot.current = messageText.trim();
      setShowVoiceUI(true);
      setIsRecording(false);
      setRecognizedText('');
      setIsProcessing(false);
      setHasProcessedResult(false);
      voiceStartedRef.current = false;
      setPartialResults('');

      // Clear any existing timeouts
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
        processingTimeoutRef.current = null;
      }
      if (stopTimeoutRef.current) {
        clearTimeout(stopTimeoutRef.current);
        stopTimeoutRef.current = null;
      }

      // Start voice recognition with simple options
      await Voice.start('en-US', {
        EXTRA_LANGUAGE_MODEL: 'free_form',
        EXTRA_PARTIAL_RESULTS: true,
        EXTRA_MAX_RESULTS: 1,
      });

      Vibration.vibrate(50);
    } catch (error) {
      setShowVoiceUI(false);
      setIsRecording(false);
      setIsProcessing(false);
    }
  };

  const startRecordingTimer = () => {
    startTimeRef.current = Date.now();
    lastDisplayedTimeRef.current = 0;
    setRecordingTime(0);

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }

    recordingTimerRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const elapsedSeconds = Math.floor(
          (Date.now() - startTimeRef.current) / 1000
        );
        if (elapsedSeconds !== lastDisplayedTimeRef.current) {
          setRecordingTime(elapsedSeconds);
          lastDisplayedTimeRef.current = elapsedSeconds;
        }

        if (elapsedSeconds >= MAX_RECORDING_TIME) {
          handleStopRecording();
        }
      }
    }, 1000);
  };

  const handleStopRecording = async () => {
    try {
      stopAllTimers();
      
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
        processingTimeoutRef.current = null;
      }
      if (stopTimeoutRef.current) {
        clearTimeout(stopTimeoutRef.current);
        stopTimeoutRef.current = null;
      }
      
      if (voiceStartedRef.current) {
        await Voice.stop();
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    } catch (error) {
      // console.log('Error stopping recording:', error);
    } finally {
      setTimeout(() => {
        cleanupRecording();
      }, 300);
    }
  };

  const handleCloseVoiceUI = async () => {
    try {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
        processingTimeoutRef.current = null;
      }
      if (stopTimeoutRef.current) {
        clearTimeout(stopTimeoutRef.current);
        stopTimeoutRef.current = null;
      }
      
      stopAllTimers();
      
      if (voiceStartedRef.current) {
        await Voice.cancel();
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    } catch (error) {
      // console.log('Error canceling recording:', error);
    } finally {
      cleanupRecording();
      setRecognizedText('');
    }
  };

  const cleanupRecording = () => {
    
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }
    if (stopTimeoutRef.current) {
      clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }

    stopAllTimers();
    
    setIsRecording(false);
    setIsProcessing(false);
    setIsSpeechActive(false);
    voiceStartedRef.current = false;
    setShowVoiceUI(false);
    stopAllTimers();
    stopAnimations();
    
    // Reset vibration
    Vibration.cancel();
    Vibration.vibrate(50);

    lastRecognizedRef.current = '';
    speechTextSnapshot.current = '';
    setPartialResults('');
    setHasProcessedResult(false);
    setRecognizedText('');
  };

  const formatTimeChat = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Render modern voice UI
  const renderVoiceUI = () => (
    <Animated.View
      style={[
        styles.voiceOverlay,
        {
          bottom: 140,
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
      <View style={styles.voiceContainer}>
        <View style={styles.voiceHeader}>
          <Text style={styles.voiceTitle}>
            {isProcessing ? 'Processing...' : 'Speak Now'}
          </Text>
          <Text style={styles.voiceSubtitle}>
            {isProcessing ? 'Converting to text...' : "We're listening"}
          </Text>
        </View>

        <View style={styles.waveformContainer}>
          {audioLevelsRef.current.map((level, index) => (
            <Animated.View
              key={index}
              style={[
                styles.waveformBar,
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

        <View style={styles.timerContainer}>
          <Animated.View style={[styles.recordingDot, { opacity: pulseAnim }]}>
            <View style={styles.recordingPulse} />
          </Animated.View>
          <Text style={styles.timerText}>{formatTimeChat(recordingTime)}</Text>
        </View>
      </View>
    </Animated.View>
  );

  //////////////////////////////////////
  // const handleInputContentSizeChange = (event) => {
  //   if (textInputRef.current) {
  //     setTimeout(() => {
  //       textInputRef.current?.scrollToEnd({ animated: true });
  //     }, 100);
  //   }
  // };

  // useEffect(() => {
  //   if (messageText && textInputRef.current) {
  //     setTimeout(() => {
  //       textInputRef.current?.scrollToEnd({ animated: true });
  //     }, 50);
  //   }
  // }, [messageText]);

  useEffect(() => {
    if (messageIdParam) {
      const key = `draft_${messageIdParam}`;
      setDraftKey(key);
      loadDraftMessage(key);
    }
  }, [messageIdParam]);

  const loadDraftMessage = async (key) => {
    try {
      const draft = await AsyncStorage.getItem(key);
      if (draft) {
        setMessageText(draft);
      }
    } catch (error) {
      logError('Error loading draft:', error);
      logError('Failed to load draft message :', error);

    }
  };

  const saveDraftMessage = async (text) => {
    if (!draftKey) return;
    
    try {
      if (text.trim()) {
        await AsyncStorage.setItem(draftKey, text);
      } else {
        await AsyncStorage.removeItem(draftKey);
      }
    } catch (error) {
      logError('Error saving draft:', error);
      logError('Failed to saving draft message :', error);

    }
  };

  const handleMessageTextChange = (text) => {
    setMessageText(text);
    saveDraftMessage(text);
  };

  ///////////////////////////////////////////////

  const calculateUnreadMessages = messages => {
    return messages.filter(
      msg => msg.direction === 2 && !msg.is_read && msg.status === 101
    ).length;
  };

  const markMessagesAsRead = async () => {
    if (!messageIdParam || !AUTH_HEADER || hasMarkedAsReadRef.current) return;

    try {
      const url = `${globalValues.API_BASE_URL}/patients/${messageIdParam}/messages/read/`;
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: AUTH_HEADER,
        },
      });
      if (response.ok) {
        hasMarkedAsReadRef.current = true;
        setMessages(prev => prev.map(msg => ({ ...msg, is_read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      logError('Error marking messages as read:', error);
      logError('Error marking messages as read :', error);

    }
  };

  const shouldShowUnreadDivider = async (messages, threadId) => {
    try {
      const lastSeenKey = `last_seen_${threadId}`;
      const lastSeen = await AsyncStorage.getItem(lastSeenKey);
      if (!lastSeen) return false;

      const lastSeenDate = new Date(lastSeen);
      const unreadMessages = messages.filter(
        m =>
          new Date(m.created_at) > lastSeenDate &&
          m.direction === 2 &&
          !m.is_read
      );

      return unreadMessages.length > 0;
    } catch (err) {
      logError('shouldShowUnreadDivider error:', err);
      logError('Error shouldShowUnreadDivider:', err);

      return false;
    }
  };

  const insertNewMessageDivider = async (msgs, threadIdParam) => {
    const threadId = threadIdParam || messageIdParam;
    if (!threadId) return msgs;
    const shouldShow = await shouldShowUnreadDivider(msgs, threadId);
    if (!shouldShow) return msgs;

    const lastSeenKey = `last_seen_${threadId}`;
    const lastSeen = await AsyncStorage.getItem(lastSeenKey);
    const lastSeenDate = new Date(lastSeen);

    const firstUnreadIndex = msgs.findIndex(
      m =>
        new Date(m.created_at) > lastSeenDate && m.direction === 2 && !m.is_read
    );

    if (firstUnreadIndex === -1) return msgs;

    const unreadMessages = msgs.filter(
      m =>
        new Date(m.created_at) > lastSeenDate && m.direction === 2 && !m.is_read
    );

    const dividerItem = {
      id: `divider-${threadId}-${Date.now()}`,
      type: 'divider',
      count: unreadMessages.length,
    };
    const updated = [...msgs];
    updated.splice(firstUnreadIndex, 0, dividerItem);

    return updated;
  };

  const UnreadDivider = ({ count }) => (
    <View style={styles.unreadDivider}>
      <View style={styles.unreadLine} />
      <View style={styles.unreadBadge}>
        <Text style={styles.unreadDividerText}>
          {count} new message{count > 1 ? 's' : ''}
        </Text>
      </View>
      <View style={styles.unreadLine} />
    </View>
  );

  const insertDateSeparators = msgs => {
    const result = [];
    let lastDateGroup = null;
    const sortedMessages = [...msgs].sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );

    const dateGroups = [];
    let currentGroup = [];

    sortedMessages.forEach((msg, index) => {
      if (msg.type === 'divider') {
        if (currentGroup.length > 0) {
          dateGroups.push(currentGroup);
          currentGroup = [];
        }
        dateGroups.push([msg]);
        return;
      }

      const msgDate = new Date(msg.created_at);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let displayDate = '';

      if (msgDate.toDateString() === today.toDateString()) {
        displayDate = 'Today';
      } else if (msgDate.toDateString() === yesterday.toDateString()) {
        displayDate = 'Yesterday';
      } else {
        displayDate = msgDate.toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      }

      if (
        currentGroup.length === 0 ||
        (currentGroup[0].dateGroup && currentGroup[0].dateGroup !== displayDate)
      ) {
        if (currentGroup.length > 0) {
          dateGroups.push(currentGroup);
        }
        currentGroup = [{ ...msg, dateGroup: displayDate }];
      } else {
        currentGroup.push({ ...msg, dateGroup: displayDate });
      }
    });

    if (currentGroup.length > 0) {
      dateGroups.push(currentGroup);
    }
    dateGroups.forEach(group => {
      if (group[0].type === 'divider') {
        // Add divider as is
        result.push(group[0]);
      } else {
        const displayDate = group[0].dateGroup;
        result.push({
          id: `date-${group[0].id}-${displayDate}`,
          type: 'date',
          date: displayDate,
        });

        group.forEach(msg => {
          const { dateGroup, ...cleanMsg } = msg;
          result.push(cleanMsg);
        });
      }
    });
    return result.reverse();
  };

  // const fetchUnreadMessagesCount = async () => {
  //   try {
  //     const response = await fetch(
  //       `https://prod.suno.tech/api/messages/unread-messages-count/?clinics=${clinic_pk}`,
  //       {
  //         headers: {
  //           'Content-Type': 'application/json',
  //           Authorization: AUTH_HEADER,
  //         },
  //       }
  //     );

  //     if (response.ok) {
  //       const data = await response.json();
  //       setUnreadCount(data.count || 0);
  //     }
  //   } catch (error) {
  //     logError('Error fetching unread count:', error);
  //   }
  // };

  const filteredTemplates =
    searchQuery.trim() === ''
      ? messageTemplates
      : messageTemplates
          .map(category => ({
            ...category,
            templates: category.templates.filter(
              template =>
                template.toLowerCase().includes(searchQuery.toLowerCase()) ||
                category.category
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase())
            ),
          }))
          .filter(category => category.templates.length > 0);

  const fetchMessageDetail = async (loadMore = false) => {
    try {
      const isConnected = await checkInternetAndProceed();
        if (!isConnected) {
          return;
        }
      setLoading(true);
      setIsInitialLoad(true);
      const url = `${globalValues.API_BASE_URL}/messages/?patient=${messageIdParam}&limit=${limitValue}&offset=${offsetKey}&refreshKey=${refreshKey}&ordering=-created_at,-id&query={id,type,created_at,media,direction,status,is_read,sender,patient{id,photo,first_name,last_name,middle_name,preferred_name,title},text,assignee{id,first_name,last_name,suffix,title,photo}}`;

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: AUTH_HEADER,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        const transformedMessages = data.map(message => ({
          id: message.id,
          text: message.text || '',
          time: message.created_at
            ? formatTime(message.created_at)
            : new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
          isOutgoing: message.direction === 1,
          isRead: message.is_read,
          sender: message.isOutgoing
            ? ''
            : message.patient?.first_name + ' ' + message.patient?.last_name ||
              'Patient',
          created_at: message.created_at,
          senderInfo: message.sender,
          patientInfo: message.patient,
          direction: message.direction,
          status: message.status,
        }));

        // Calculate unread count from API data
        const currentUnreadCount = calculateUnreadMessages(data);
        setUnreadCount(currentUnreadCount);

        let merged;
        if (loadMore) {
          const existing = messages.filter(
            m => m.type !== 'divider' && m.type !== 'date'
          );
          merged = [...transformedMessages, ...existing];
          const seen = new Set();
          merged = merged.filter(m => {
            if (!m.id) return true;
            if (seen.has(m.id)) return false;
            seen.add(m.id);
            return true;
          });
        } else {
          merged = transformedMessages;
        }

        const withDates = insertDateSeparators(merged);
        const withDivider = await insertNewMessageDivider(
          withDates,
          messageIdParam
        );
        setMessages(withDivider);

        if (data.length > 0 && data[0].patient) {
          globalPatientId = data[0].patient.id;
        }

        // Mark messages as read after loading
        if (currentUnreadCount > 0 && !hasMarkedAsReadRef.current) {
          setTimeout(() => {
            markMessagesAsRead();
          }, 1000);
        }
      }
    } catch (err) {
      logError('Error fetching messages:', err);
      logError('Error fetching messages:', err);

    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  };

  const loadOlderMessages = async () => {
    const prevHeight = contentHeight;
    setoffsetKey(prev => prev + limitValue);
    await fetchMessageDetail(true);
    setTimeout(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({
          offset: contentHeight - prevHeight,
          animated: false,
        });
      }
    }, 100);
  };

  // unbound count message read steps.
  // const markMessagesAsRead = async (patientId) => {
  //   setMessages(prev =>
  //     prev.filter(item => item.type !== 'divider').map(msg => ({ ...msg, isRead: true }))
  //   );
  //   setUnreadCount(0);
  //   await fetchUnreadMessagesCount();
  // };

  const markThreadAsSeen = async (threadId, lastSeenDate) => {
    try {
      const lastSeenKey = `last_seen_${threadId}`;
      await AsyncStorage.setItem(lastSeenKey, lastSeenDate);
      // console.log(`Marked thread ${threadId} as seen at: ${lastSeenDate}`);
    } catch (err) {
      logError('markThreadAsSeen error:', err);
      logError('markThreadAsSeen error:', err);

    }
  };

  // useEffect(() => {
  //   fetchUnreadMessagesCount();
  // }, []);

  useEffect(() => {
    const initializeThread = async () => {
      await fetchMessageDetail(false);

      if (messages.length > 0) {
        let latestMessageDate = null;
        for (let i = messages.length - 1; i >= 0; i--) {
          const it = messages[i];
          if (!it.type && it.created_at) {
            latestMessageDate = it.created_at;
            break;
          }
        }

        if (!latestMessageDate) {
          latestMessageDate = new Date().toISOString();
        }

        if (messageIdParam) {
          await markThreadAsSeen(messageIdParam, latestMessageDate);
        }
      }
    };

    initializeThread();

    return () => {
      if (onThreadClose && messageIdParam) {
        try {
          const actualReadCount = initialUnreadCount - unreadCount;
          onThreadClose(messageIdParam, Math.max(0, actualReadCount));
        } catch (err) {
          console.warn('Cleanup error:', err);
        }
      }
    };
  }, [messageIdParam]);

  useEffect(() => {
    const unsubscribeBeforeRemove = navigation.addListener(
      'beforeRemove',
      () => {
        if (onThreadClose && messageIdParam) {
          const actualReadCount = unreadCount;
          onThreadClose(
            messageIdParam,
            Math.max(0, actualReadCount),
            shouldRefreshListRef.current
          );
        }
      }
    );

    return unsubscribeBeforeRemove;
  }, [navigation, onThreadClose, messageIdParam, unreadCount]);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    const unreadMessagesVisible = viewableItems.some(
      v => v.item?.direction === 2 && !v.item?.is_read && v.item?.status === 101
    );

    if (unreadMessagesVisible && !hasMarkedAsReadRef.current) {
      markMessagesAsRead();
    }
  }).current;

  const formatTime = timestamp => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch (error) {
      return new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    }
  };

  const formatDate = timestamp => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString();
    } catch (error) {
      return new Date().toLocaleDateString();
    }
  };

  useEffect(() => {
    if (!flatListRef.current || !messages || messages.length === 0) return;

    const dividerIndex = messages.findIndex(
      m => m && typeof m.id === 'string' && m.id.startsWith('divider-')
    );
    if (dividerIndex === -1) return;

    try {
      flatListRef.current.scrollToIndex({
        index: dividerIndex,
        animated: true,
        viewPosition: 0.5,
      });
    } catch (err) {
      setTimeout(() => {
        try {
          flatListRef.current.scrollToIndex({
            index: dividerIndex,
            animated: true,
            viewPosition: 0.5,
          });
        } catch (err2) {
          // ignore silently
        }
      }, 150);
    }
  }, [messages]);

  const sendNewMessage = async messageText => {
    const isConnected = await checkInternetAndProceed();
        if (!isConnected) {
          return;
        }
    if (isSending) return; // 🚫 Prevent multiple clicks

    if (!messageText.trim()) return;
    setSending(true);
    setIsSending(true);

    try {
      const patientIdParam = globalPatientId || '';
      const senderId = sendAssignId;
      // console.log('Using sender ID from UserInfo:', senderId);

      const messageData = {
        text: messageText.trim(),
        clinic: parseInt(clinic_pk),
        patient: patientIdParam,
        sender: senderId,
      };

      const response = await fetch(`${globalValues.API_BASE_URL}/messages/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: AUTH_HEADER,
        },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        let errorMessage = `Failed to send message: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage += ` - ${JSON.stringify(errorData)}`;
        } catch (parseError) {
          errorMessage += ` - Could not parse error response`;
        }
        throw new Error(errorMessage);
      }

      let responseData;
      try {
        responseData = await response.json();
      } catch (parseError) {
        responseData = { id: Date.now() };
      }

      const newMessage = {
        id: responseData.id || Date.now(),
        text: messageText.trim(),
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        isOutgoing: true,
        isRead: false,
        created_at: new Date().toISOString(),
        direction: 1,
        status : responseData.status
      };

      const cleaned = messages.filter(
        i => i.type !== 'divider' && i.type !== 'date'
      );
      const withNew = [newMessage, ...cleaned];
      const withDates = insertDateSeparators(withNew);
      setMessages(withDates);
      setMessageText('');

      shouldRefreshListRef.current = true;

      if (draftKey) {
        await AsyncStorage.removeItem(draftKey);
      }

      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
    } catch (error) {
      logError('Error sending message:', error);
      logError('Error sending message:', error);

    } finally {
      setSending(false);
      setTimeout(() => {
        setIsSending(false);
      }, 1000);
    }
  };

  const handleTemplateSelect = async template => {
    await sendNewMessage(template);
    setShowTemplates(false);
    setSearchQuery('');
  };

  const handleSendMessage = async () => {
    if (messageText.trim()) {
      await sendNewMessage(messageText);
    }
  };

  const handleAttachmentSelect = type => {
    setShowAttachments(false);
  };

  useEffect(() => {
    if (showTemplates) {
      textInputRef.current?.blur();
      const focusTimer = setTimeout(() => {
        templateSearchInputRef.current?.focus();
      }, 150);
      return () => clearTimeout(focusTimer);
    }

    setSearchQuery('');
  }, [showTemplates]);

  if (loading && isInitialLoad) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#066858" />
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    );
  }

  const footerBottomInset =
    keyboardHeight > 0
      ? Platform.OS === 'android'
        ? keyboardHeight
        : 0
      : insets.bottom;

  return (
    <View
      style={{
        flex: 1,
        paddingBottom: Platform.OS === 'ios' ? keyboardHeight : 0,
      }}
    >
      <View style={{ flex: 1 }}>
        {/* Chat Messages */}
        {!loading && messages.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="chatbubbles-outline" size={80} color="#B0BEC5" />
            <Text style={styles.emptyStateTitle}>No messages yet</Text>
            <Text style={styles.emptyStateSubtitle}>
              Start the conversation by sending your first message.
            </Text>
          </View>
        ) : (
          <FlatList
            style={styles.messagesContainer}
            ref={flatListRef}
            data={messages}
            keyExtractor={(item, index) =>
              item.id?.toString() || index.toString()
            }
            renderItem={({ item }) => {
              if (item.type === 'divider') {
                return <UnreadDivider count={item.count} />;
              }
              if (item.type === 'date') {
                return (
                  <View style={styles.dateBadge}>
                    <Text style={styles.dateBadgeText}>{item.date}</Text>
                  </View>
                );
              }

              // const isUnread = item.direction === 2 && !item.is_read;

              return (
                <View style={styles.messageWrapper}>
                  <View
                    style={[
                      styles.messageBubble,
                      item.isOutgoing
                        ? styles.outgoingMessage
                        : styles.incomingMessage,
                    ]}
                  >
                    {!item.isOutgoing && item.sender && (
                      <Text style={styles.senderName}>{item.sender}</Text>
                    )}
                    <Text
                      style={[
                        styles.messageText,
                        item.isOutgoing
                          ? styles.outgoingText
                          : styles.incomingText,
                      ]}
                    >
                      {item.text}
                    </Text>
                    <View style={styles.messageFooter}>
                      <Text
                        style={[
                          styles.messageTime,
                          item.isOutgoing
                            ? styles.outgoingTime
                            : styles.incomingTime,
                        ]}
                      >
                        {item.time}
                      </Text>
                      {item.isOutgoing && (
                         <IconButton
                         onPress={() => {
                           
                         }}
                        //  color={item.status == 5 ? 'red'  : item.status == 3 ? 'red' : '#E0E0FF'}
                        color={'#E0E0FF'}
                         icon={ item.status == 5 ? 'Ionicons/close-circle'  : item.status == 3 ? 'MaterialIcons/error-outline' :  'Feather/check' }
                         size={18}
                         style={{paddingLeft : 8}}
                       />
                        // <Text style={styles.readStatus}>
                          // {item.status == 5 ?  : item.isRead ? '✓✓' : '✓'}
                        // </Text>
                      )}
                       {!item.isOutgoing && (
                         <IconButton
                         onPress={() => {
                           
                         }}
                        //  color={item.status == 5 ? 'red'  : item.status == 3 ? 'red' : '#E0E0FF'}
                        color={item.isRead ? '#087069'  :'#E0E0FF'}
                         icon={item.isRead ? 'Ionicons/checkmark-done' : item.status == 5 ? 'Ionicons/close-circle'  : item.status == 3 ? 'MaterialIcons/error-outline' :  'Feather/check' }
                         size={18}
                         style={{paddingLeft : 8}}
                       />
                        // <Text style={styles.readStatus}>
                          // {item.status == 5 ?  : item.isRead ? '✓✓' : '✓'}
                        // </Text>
                      )}
                    </View>
                  </View>
                </View>
              );
            }}
            inverted
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            onScroll={({ nativeEvent }) => {
              if (nativeEvent.contentOffset.y >= contentHeight - 20) {
                loadOlderMessages();
              }
            }}
            onContentSizeChange={(w, h) => setContentHeight(h)}
            scrollEventThrottle={18}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
            contentContainerStyle={{ paddingBottom: 32 }}
          />
        )}

        {/* Modern Voice UI Overlay */}
        {showVoiceUI && renderVoiceUI()}

        {/* Fixed Footer Section */}
        <View
          style={[
            styles.footerSection,
            { paddingBottom: footerBottomInset },
          ]}
        >
          {/* Message Templates Panel */}
          {showTemplates && (
            <View
              style={[
                styles.templatesPanel,
                {
                  height: Math.min(
                    height * 0.5,
                    messageTemplates.length * 80 + 100
                  ),
                },
              ]}
            >
              <View style={styles.templatesHeader}>
                <View style={styles.searchContainer}>
                  <Ionicons name="search" size={24} color="#555" />
                  <TextInput
                    ref={templateSearchInputRef}
                    style={styles.searchInput}
                    placeholder="Search templates..."
                    placeholderTextColor="#999"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onFocus={() => textInputRef.current?.blur()}
                    autoCorrect={false}
                    autoCapitalize="none"
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setSearchQuery('')}
                      style={styles.clearSearchButton}
                    >
                      <Ionicons name="close-circle" size={20} color="#999" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              <ScrollView
                style={styles.templatesContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {filteredTemplates.length === 0 ? (
                  <View style={styles.noResultsContainer}>
                    <Ionicons name="search-outline" size={40} color="#CCC" />
                    <Text style={styles.noResultsText}>
                      No templates found for "{searchQuery}"
                    </Text>
                  </View>
                ) : (
                  filteredTemplates.map((category, index) => (
                    <View key={index} style={styles.templateCategory}>
                      <Text style={styles.categoryTitle}>
                        {category.category}
                      </Text>
                      {category.templates.map((template, templateIndex) => (
                        <TouchableOpacity
                          key={templateIndex}
                          style={styles.templateItem}
                          onPress={() => handleTemplateSelect(template)}
                        >
                          <Text style={styles.templateText}>{template}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ))
                )}
              </ScrollView>
            </View>
          )}

          {/* Attachment Options */}
          {showAttachments && (
            <View style={styles.attachmentOptions}>
              <TouchableOpacity
                style={styles.attachmentOption}
                onPress={() => handleAttachmentSelect('image')}
              >
                <View
                  style={[
                    styles.attachmentIcon,
                    { backgroundColor: '#E3F2FD' },
                  ]}
                >
                  <Ionicons name="image" size={24} color="#066858" />
                </View>
                <Text style={styles.attachmentLabel}>Image</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.attachmentOption}
                onPress={() => handleAttachmentSelect('document')}
              >
                <View
                  style={[
                    styles.attachmentIcon,
                    { backgroundColor: '#E3F2FD' },
                  ]}
                >
                  <Ionicons name="document-text" size={24} color="#066858" />
                </View>
                <Text style={styles.attachmentLabel}>Document</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Input Area */}
          <View style={styles.inputContainer}>
            {/* <TouchableOpacity
              style={styles.attachButton}
              onPress={() => {
                setShowAttachments(!showAttachments);
                setShowTemplates(false);
              }}
            >
              <Ionicons name="attach" size={28} color="#066858" />
            </TouchableOpacity> */}

            <TouchableOpacity
              style={styles.templateButton}
              onPress={() => {
                const nextShowTemplates = !showTemplates;
                setShowTemplates(nextShowTemplates);
                setShowAttachments(false);
                if (nextShowTemplates) {
                  textInputRef.current?.blur();
                  Keyboard.dismiss();
                  setTimeout(() => {
                    templateSearchInputRef.current?.focus();
                  }, 150);
                }
              }}
            >
              <Ionicons
                name="document-text-outline"
                size={24}
                color="#066858"
              />
            </TouchableOpacity>

            <TextInput
              ref={textInputRef}
              style={[styles.messageInput, { maxHeight: 120 }]}
              placeholder="Type a message..."
              placeholderTextColor="#999"
              value={messageText}
              onChangeText={handleMessageTextChange}
              editable={!showTemplates && !sending}
              multiline={true}
              scrollEnabled={true}
              showsVerticalScrollIndicator={true}
              onContentSizeChange={() => {
                requestAnimationFrame(() => {
                  textInputRef.current?.scrollToEnd?.({ animated: true });
                });
              }}
            />
            {showVoiceUI ? (
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCloseVoiceUI}
                
              >
                <Ionicons name="close" size={24} color="#FF3B30" />
              </TouchableOpacity>
            ) : messageText.trim() ? (
              <TouchableOpacity
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  backgroundColor: isSending ? 'rgba(6, 104, 88, 0.5)' : '#066858',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={handleSendMessage}
                disabled={isSending}
              >
                <Ionicons
                  style={styles.sendIcon}
                  name="send"
                  size={20}
                  color="#fff"
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.micButton}
                onPress={startVoiceRecording}
              >
                <Ionicons name="mic-outline" size={24} color="#066858" />
              </TouchableOpacity>
            )}
            {/* {sending ? (
              <View style={styles.sendButton}>
                <ActivityIndicator size="small" color="#fff" />
              </View>
            ) : messageText.trim() ? (
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSendMessage}
                disabled={sending}
              >
                <Ionicons
                  style={styles.sendIcon}
                  name="send"
                  size={20}
                  color="#fff"
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={[styles.micButton, isRecording && styles.micButtonActive]}
                onPress={handleMicPress}
                onLongPress={handleMicLongPress}
                delayLongPress={300}
              >
                <Ionicons 
                  name={isRecording ? "mic" : "mic-outline"} 
                  size={24} 
                  color={isRecording ? "#FFF" : "#066858"} 
                />
              </TouchableOpacity>
            )} */}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    // marginTop: 16
  },
  bottomSpacer: {
    height: 20,
  },
  footerSection: {
    backgroundColor: '#FFF',
    zIndex: 1000,
    minHeight: 80,
    borderTopWidth: 1,
    borderColor: '#E0E0E0',
  },
  messageWrapper: {
    marginBottom: 16,
    // marginTop: 16
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    // borderRadius: 14,
  },
  senderName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  outgoingSender: {
    color: '#E0E0FF',
  },
  incomingSender: {
    color: '#066858',
    fontSize: 13,
    paddingVertical: 2,
  },
  outgoingMessage: {
    backgroundColor: '#066858',
    alignSelf: 'flex-end',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  incomingMessage: {
    backgroundColor: '#FFF',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  outgoingText: {
    color: '#FFF',
  },
  incomingText: {
    color: '#333',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 12,
  },
  outgoingTime: {
    color: '#E0E0FF',
  },
  incomingTime: {
    color: '#999',
  },
  readStatus: {
    color: '#E0E0FF',
    marginLeft: 4,
    fontSize: 12,
  },
  templatesPanel: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: '#E0E0E0',
    maxHeight: height * 0.5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  templatesHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  templatesTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#066858',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  clearSearchButton: {
    padding: 4,
    marginLeft: 8,
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    marginTop: 12,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  templatesContent: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  templateCategory: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#066858',
    marginBottom: 12,
  },
  templateItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  templateText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  attachmentOptions: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    justifyContent: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  attachmentOption: {
    alignItems: 'center',
    marginRight: 32,
  },
  attachmentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  attachmentLabel: {
    fontSize: 14,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  // messageInput: {
  //   flex: 1,
  //   borderWidth: 1,
  //   borderColor: '#E0E0E0',
  //   borderRadius: 10,
  //   paddingHorizontal: 12,
  //   paddingVertical: 12,
  //   fontSize: 16,
  //   maxHeight: 50,
  //   marginRight: 8,
  // },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 120,
    marginRight: 8,
  },
  attachButton: {
    padding: 5,
    marginRight: 4,
  },
  templateButton: {
    padding: 5,
    marginRight: 8,
  },
  micButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#066858',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  sendIcon: {
    transform: [{ rotate: '-40deg' }],
    marginLeft: 4,
    marginBottom: 2,
  },
  divider: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    marginVertical: 8,
  },
  dividerText: {
    fontSize: 13,
    color: '#066858',
    fontWeight: '600',
  },
  dateBadge: {
    alignSelf: 'center',
    backgroundColor: '#E0F2F1',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 16,
    marginTop: 8,
  },
  dateBadgeText: {
    fontSize: 13,
    color: '#066858',
    fontWeight: '600',
  },
  unreadDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  unreadLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#066858',
    opacity: 0.3,
  },
  unreadDividerText: {
    marginHorizontal: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#066858',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },

  ////////////////////
  voiceOverlay: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  voiceContainer: {
    backgroundColor: '#FFF',
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
  },
  voiceHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  voiceTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  voiceSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 60,
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  waveformBar: {
    width: 3,
    marginHorizontal: 2,
    borderRadius: 2,
    minHeight: 10,
  },
  timerContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF6B6B',
    marginBottom: 8,
  },
  recordingPulse: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF6B6B',
  },
  timerText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  /////////
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#F9FAFB',
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#37474F',
    marginTop: 16,
  },
  emptyStateSubtitle: {
    fontSize: 15,
    color: '#78909C',
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default MessageThreadsView;
