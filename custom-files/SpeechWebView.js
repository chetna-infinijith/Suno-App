import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { WebView } from "react-native-webview";

const SpeechWebView = forwardRef(({ onResult }, ref) => {
  const webviewRef = useRef(null);

  const html = `
  <html>
  <body>
  <script>
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recog = new SpeechRecognition();

    recog.continuous = true;
    recog.interimResults = true;
    recog.lang = "en-US";

    recog.onresult = (event) => {
      let text = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        text += event.results[i][0].transcript + " ";
      }
      window.ReactNativeWebView.postMessage(text);
    };

    // 🟦 Auto restart after Android stops (2–3 sec)
    recog.onend = () => {
      if (window.keepListening) {
        setTimeout(() => recog.start(), 0);
      }
    };

    function startRec() {
      window.keepListening = true;
      recog.start();
    }

    function stopRec() {
      window.keepListening = false;
      recog.stop();
    }

    window.startRec = startRec;
    window.stopRec = stopRec;
  </script>
  </body>
  </html>
  `;

  useImperativeHandle(ref, () => ({
    start: () => webviewRef.current.injectJavaScript("startRec();"),
    stop: () => webviewRef.current.injectJavaScript("stopRec();"),
  }));

  return (
    <WebView
      ref={webviewRef}
      originWhitelist={["*"]}
      javaScriptEnabled
      source={{ html }}
      onMessage={(e) => onResult(e.nativeEvent.data)}
    />
  );
});

export default SpeechWebView;
