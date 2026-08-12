import React from 'react';
import {
  View,
  Text,
  Pressable,
  Platform,
  ActivityIndicator,
  Keyboard,
  SafeAreaView,
} from 'react-native';
import { RichText, Toolbar, useEditorBridge } from '@10play/tentap-editor';
import * as GlobalVariables from '../config/GlobalVariableContext';
import { logError } from '../index.js';
import showAlertUtil from '../utils/showAlert';

export const ScribeContextEditor = ({
  scribeId,
  initialContent = '',
  theme,
  onSaved,
}) => {
  const Constants = GlobalVariables.useValues();
  const [isSaving, setIsSaving] = React.useState(false);

  const editor = useEditorBridge({
    initialContent: initialContent || '',
    avoidIosKeyboard: true,
  });

  const lastSyncedContent = React.useRef(null);

  React.useEffect(() => {
    if (!editor || initialContent === undefined) {
      return;
    }
    if (lastSyncedContent.current === initialContent) {
      return;
    }
    editor.setContent(initialContent || '');
    lastSyncedContent.current = initialContent;
  }, [editor, initialContent]);

  const dismissKeyboard = () => {
    editor?.blur?.();
    editor?.blurEditor?.();
    Keyboard.dismiss();
  };

  const handleSave = async () => {
    if (!scribeId) {
      showAlertUtil({
        title: 'Save failed',
        message: 'Scribe ID is missing.',
        buttonText: 'OK',
      });
      return;
    }

    try {
      setIsSaving(true);
      dismissKeyboard();
      const html = await editor.getHTML();

      const response = await fetch(
        `${Constants.API_BASE_URL}/ai/ambient-scribes/${scribeId}/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: Constants.AUTH_HEADER,
          },
          body: JSON.stringify({ custom_context: html }),
        }
      );

      const result = await response.json().catch(() => ({}));

      if (response.ok) {
        showAlertUtil({
          title: 'Saved',
          message: 'Scribe context saved successfully.',
          buttonText: 'OK',
        });
        onSaved?.(html, result);
      } else {
        showAlertUtil({
          title: 'Save failed',
          message: result?.detail || 'Could not save scribe context.',
          buttonText: 'OK',
        });
      }
    } catch (err) {
      logError('Save scribe context error:', err);
      showAlertUtil({
        title: 'Save failed',
        message: 'Could not save scribe context. Please try again.',
        buttonText: 'OK',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const accentColor = theme?.colors?.branding?.secondary ?? '#054743';

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: '#F3F6F5' }}
      edges={['left', 'right', 'bottom']}
    >
      <View style={{ flex: 1 }}>
        <View
          style={{
            width: '100%',
            borderBottomWidth: 1,
            borderColor: '#E8EEEC',
            height: 50,
            backgroundColor: '#fff',
          }}
        >
          <Toolbar editor={editor} hidden={false} />
        </View>

        <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 12 }}>
          <View
            style={{
              flex: 1,
              backgroundColor: '#fff',
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#E8EEEC',
              padding: 12,
            }}
          >
            <RichText editor={editor} hideKeyboardAccessoryView={false} />
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            gap: 10,
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 12,
          }}
        >
          <Pressable
            onPress={handleSave}
            disabled={isSaving}
            style={{
              flex: 1,
              backgroundColor: accentColor,
              borderRadius: 10,
              paddingVertical: 12,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isSaving ? 0.7 : 1,
            }}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text
                style={{
                  color: '#fff',
                  fontSize: 16,
                  fontFamily: 'Inter_600SemiBold',
                }}
              >
                Save
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ScribeContextEditor;
