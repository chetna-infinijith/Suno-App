import React, { useEffect, useRef, useState } from 'react';
import { Platform, View, TouchableOpacity, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Icon } from '@draftbit/ui';
import WebmAudioPlayer from './WebmAudioPlayer';

const normalizePlaybackUri = uri => {
  if (!uri) return uri;
  if (uri.startsWith('file://')) return uri;
  if (uri.startsWith('/')) return `file://${uri}`;
  return uri;
};

const isLocalUri = uri =>
  uri?.startsWith('file://') || uri?.startsWith('/');

export const getFormatFromUri = (uri = '') => {
  const path = uri.split('?')[0];
  const match = path.match(/\.([a-zA-Z0-9]+)$/);
  return match?.[1]?.toLowerCase() ?? '';
};

function NativeAudioPlayer({ audioUri, fallbackUri, audioFormat, theme }) {
  const format =
    audioFormat || getFormatFromUri(audioUri || fallbackUri) || 'm4a';
  const isWebm = format === 'webm';
  const webmPlaybackUri = audioUri || fallbackUri;

  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [activeUri, setActiveUri] = useState(null);
  const [useWebmFallback, setUseWebmFallback] = useState(false);
  const [webmStreamUri, setWebmStreamUri] = useState(null);
  const soundRef = useRef(null);

  useEffect(() => {
    setUseWebmFallback(false);
    setWebmStreamUri(null);
    loadAudio();

    return () => {
      unloadSound();
    };
  }, [audioUri, fallbackUri, format]);

  const unloadSound = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.unloadAsync();
      } catch (_) {
        // ignore unload errors
      }
      soundRef.current = null;
      setSound(null);
    }
  };

  const verifyLocalFile = async uri => {
    if (!isLocalUri(uri)) return true;
    const normalized = normalizePlaybackUri(uri);
    const info = await FileSystem.getInfoAsync(normalized);
    return info.exists && (info.size ?? 0) > 1024;
  };

  const tryLoadSound = async uri => {
    let normalizedUri = normalizePlaybackUri(uri);
    if (Platform.OS === 'android' && normalizedUri?.startsWith('file://')) {
      normalizedUri = normalizedUri.startsWith('file:///')
        ? normalizedUri
        : normalizedUri.replace('file://', 'file:///');
    }
    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri: normalizedUri },
      { shouldPlay: false },
      null,
      false
    );
    return { newSound, normalizedUri };
  };

  const loadAudio = async () => {
    const candidates = [audioUri, fallbackUri].filter(Boolean);

    if (candidates.length === 0) {
      setIsLoading(false);
      setLoadError(null);
      setActiveUri(null);
      return;
    }

    setIsLoading(true);
    setLoadError(null);
    setPosition(0);
    setDuration(0);
    setIsPlaying(false);
    setActiveUri(null);

    await unloadSound();

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      });

      let lastError = null;

      for (const candidate of candidates) {
        try {
          if (isLocalUri(candidate)) {
            const isValid = await verifyLocalFile(candidate);
            if (!isValid) {
              lastError = new Error('Local audio file is missing or invalid');
              continue;
            }
          }

          const { newSound, normalizedUri } = await tryLoadSound(candidate);

          newSound.setOnPlaybackStatusUpdate(status => {
            if (status.isLoaded) {
              setPosition(status.positionMillis);
              setDuration(status.durationMillis || 0);
              setIsPlaying(status.isPlaying);
            }
          });

          soundRef.current = newSound;
          setSound(newSound);
          setActiveUri(normalizedUri);
          setLoadError(null);
          return;
        } catch (error) {
          lastError = error;
          console.log('AudioPlayer load attempt failed:', candidate, error);
        }
      }

      if (isWebm) {
        const streamUri =
          Platform.OS === 'android' &&
          isLocalUri(webmPlaybackUri) &&
          fallbackUri &&
          !isLocalUri(fallbackUri)
            ? fallbackUri
            : webmPlaybackUri;

        if (streamUri) {
          setUseWebmFallback(true);
          setWebmStreamUri(streamUri);
          setLoadError(null);
          return;
        }
      }

      setLoadError(
        lastError?.message || 'Unable to play this audio file.'
      );
    } catch (error) {
      console.log('AudioPlayer load error:', error);
      setLoadError(error?.message || 'Unable to play this audio file.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayPause = async () => {
    if (!sound) return;

    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  const handleSeek = async value => {
    if (sound) {
      await sound.setPositionAsync(value);
    }
  };

  const formatTime = millis => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const accentColor = theme?.colors?.branding?.secondary ?? '#066858';

  if (useWebmFallback && webmStreamUri) {
    return <WebmAudioPlayer audioUri={webmStreamUri} theme={theme} />;
  }

  if (isLoading) {
    return (
      <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#666' }}>
        Loading audio...
      </Text>
    );
  }

  if (loadError) {
    return (
      <View>
        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 13,
            color: '#b45309',
            marginBottom: 8,
          }}
        >
          Could not play audio. Try downloading again.
        </Text>
        <TouchableOpacity onPress={loadAudio}>
          <Text
            style={{
              fontFamily: 'Inter_500Medium',
              fontSize: 13,
              color: accentColor,
            }}
          >
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!activeUri || !sound) {
    return null;
  }

  return (
    <View style={{ paddingTop: 8 }}>
      {fallbackUri && activeUri === fallbackUri ? (
        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 12,
            color: '#666',
            marginBottom: 6,
          }}
        >
          {audioUri ? 'Streaming from server' : 'Playing from server'}
        </Text>
      ) : null}

      <TouchableOpacity
        onPress={togglePlayPause}
        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}
      >
        <Icon
          name={
            isPlaying
              ? 'MaterialCommunityIcons/pause-circle'
              : 'MaterialCommunityIcons/play-circle'
          }
          size={32}
          color={accentColor}
        />
        <Text
          style={{
            fontSize: 14,
            fontFamily: 'Inter_500Medium',
            color: accentColor,
            marginLeft: 8,
          }}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </Text>
      </TouchableOpacity>

      <Slider
        value={position}
        minimumValue={0}
        maximumValue={duration || 1}
        onSlidingComplete={handleSeek}
        minimumTrackTintColor={accentColor}
        thumbTintColor={accentColor}
      />

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12 }}>
          {formatTime(position)}
        </Text>
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12 }}>
          {formatTime(duration)}
        </Text>
      </View>
    </View>
  );
}

export default function AudioPlayer(props) {
  const format =
    props.audioFormat ||
    getFormatFromUri(props.audioUri || props.fallbackUri) ||
    'm4a';
  const playbackUri = props.audioUri || props.fallbackUri;

  if (format === 'webm' && Platform.OS === 'ios') {
    return <WebmAudioPlayer audioUri={playbackUri} theme={props.theme} />;
  }

  return <NativeAudioPlayer {...props} />;
}
