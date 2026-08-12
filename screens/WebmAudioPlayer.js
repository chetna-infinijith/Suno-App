import React, { useMemo } from 'react';
import { Platform, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

const escapeHtmlAttr = value =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');

const isLocalUri = uri =>
  uri?.startsWith('file://') || uri?.startsWith('/');

export default function WebmAudioPlayer({ audioUri, theme }) {
  const accentColor = theme?.colors?.branding?.secondary ?? '#066858';

  // Android WebView cannot read app-private file:// paths in HTML audio tags
  if (Platform.OS === 'android' && isLocalUri(audioUri)) {
    return null;
  }

  const webViewSource = useMemo(() => {
    if (!audioUri) return null;

    const safeUri = escapeHtmlAttr(audioUri);
    const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 4px 0;
        background: transparent;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      }
      audio {
        width: 100%;
        min-height: 44px;
      }
    </style>
  </head>
  <body>
    <audio controls playsinline webkit-playsinline preload="metadata" src="${safeUri}">
      Your browser does not support WebM audio playback.
    </audio>
  </body>
</html>`;

    return {
      html,
      baseUrl: audioUri.startsWith('file://') ? audioUri : undefined,
    };
  }, [audioUri]);

  if (!audioUri || !webViewSource) {
    return null;
  }

  return (
    <View style={{ paddingTop: 4 }}>
      <Text
        style={{
          fontFamily: 'Inter_400Regular',
          fontSize: 12,
          color: '#666',
          marginBottom: 8,
        }}
      >
        WebM playback{Platform.OS === 'ios' ? ' (Safari engine)' : ''}
      </Text>
      <WebView
        source={webViewSource}
        style={{
          height: 56,
          backgroundColor: 'transparent',
        }}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled={false}
        originWhitelist={['*']}
        allowsFullscreenVideo={false}
        {...(Platform.OS === 'ios' && audioUri.startsWith('file://')
          ? { allowingReadAccessToURL: audioUri }
          : {})}
      />
      <Text
        style={{
          fontFamily: 'Inter_400Regular',
          fontSize: 11,
          color: accentColor,
          marginTop: 6,
        }}
        numberOfLines={1}
      >
        {audioUri.includes('amazonaws.com') ? 'Streaming from S3' : 'Local WebM file'}
      </Text>
    </View>
  );
}
