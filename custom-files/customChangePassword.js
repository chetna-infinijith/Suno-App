import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as GlobalVariables from '../config/GlobalVariableContext';
import { useNavigation } from '@react-navigation/native';
import { logError } from '../index';
import { checkInternetAndProceed } from './InternetConnection';

const PASSWORD_REGEX =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
const DEBOUNCE_MS = 300;

const NAVIGATION_ROUTES = {
  STACK: 'AppSettingsScreen',
};

const PasswordInput = React.memo(
  React.forwardRef(
    (
      {
        label,
        value,
        placeholder,
        error,
        secure,
        onChangeText,
        onBlur,
        onToggleSecure,
        fieldKey,
        selection,
        onSelectionChange,
      },
      ref
    ) => {
      return (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{label}</Text>
          <View
            style={[
              styles.inputWrapper,
              error ? styles.inputError : value ? styles.inputSuccess : null,
            ]}
          >
            <Ionicons
              name="lock-closed"
              size={20}
              color="#666"
              style={styles.lockIcon}
            />
            <TextInput
              ref={ref}
              style={styles.input}
              value={value}
              placeholder={placeholder}
              placeholderTextColor="#999"
              secureTextEntry={secure}
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={t => onChangeText(fieldKey, t)}
              onBlur={() => onBlur(fieldKey)}
              selection={selection}
              onSelectionChange={e =>
                onSelectionChange(fieldKey, e.nativeEvent.selection)
              }
              importantForAutofill="no"
              keyboardType="default"
              returnKeyType="done"
              underlineColorAndroid="transparent"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => {
                onToggleSecure(fieldKey);
                setTimeout(() => {
                  if (ref && typeof ref !== 'function' && ref.current) {
                    ref.current.focus && ref.current.focus();
                  }
                }, 50);
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name={secure ? 'eye' : 'eye-off'}
                size={22}
                color="#666"
              />
            </TouchableOpacity>
          </View>
          {error && fieldKey !== 'currentPassword' ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}
        </View>
      );
    }
  )
);

export const ChangePasswordView = () => {
  const navigation = useNavigation();
  const globalValues = GlobalVariables.useValues();
  const setGlobalVariableValue = GlobalVariables.useSetValue();
  const { AUTH_HEADER, senderID } = globalValues;
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [secureState, setSecureState] = useState({
    currentPassword: true,
    newPassword: true,
    confirmPassword: true,
  });

  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    apiError: '',
  });

  const [loading, setLoading] = useState(false);
  const [checkingCurrent, setCheckingCurrent] = useState(false);

  const refs = {
    currentPassword: useRef(null),
    newPassword: useRef(null),
    confirmPassword: useRef(null),
  };

  // Keep selection to prevent caret jumping
  const [selection, setSelection] = useState({
    currentPassword: undefined,
    newPassword: undefined,
    confirmPassword: undefined,
  });

  // Debounce timer for newPassword validation
  const validationTimer = useRef(null);

  const validateNewPasswordSync = useCallback(pw => {
    if (!pw) return 'Password is required';
    if (!PASSWORD_REGEX.test(pw)) {
      return 'Password must be 8+ characters with a letter, a digit, and a special character from !@#$%^&*';
    }
    return '';
  }, []);

  const validateConfirmSync = useCallback(
    confirm => {
      if (!confirm) return 'Please confirm your password';
      if (confirm !== form.newPassword) return 'Passwords do not match';
      return '';
    },
    [form.newPassword]
  );

  const handleChange = useCallback(
    (field, value) => {
      setForm(p => ({ ...p, [field]: value }));
      setErrors(p => ({ ...p, apiError: '' }));

      if (field === 'newPassword') {
        if (validationTimer.current) clearTimeout(validationTimer.current);
        validationTimer.current = setTimeout(() => {
          const newErr = validateNewPasswordSync(value);
          setErrors(p => ({
            ...p,
            newPassword: newErr,
            confirmPassword:
              p.confirmPassword && value !== form.confirmPassword
                ? 'Passwords do not match'
                : p.confirmPassword,
          }));
        }, DEBOUNCE_MS);
      }

      if (field === 'confirmPassword') {
        const cErr = validateConfirmSync(value);
        setErrors(p => ({ ...p, confirmPassword: cErr }));
      }
    },
    [form.confirmPassword, validateConfirmSync, validateNewPasswordSync]
  );

  const handleSelectionChange = useCallback((field, sel) => {
    setSelection(s => ({ ...s, [field]: sel }));
  }, []);

  const toggleSecure = useCallback(field => {
    setSecureState(s => ({ ...s, [field]: !s[field] }));
  }, []);

  const isFormValid = useCallback(() => {
    return (
      form.currentPassword.length > 0 &&
      form.newPassword.length > 0 &&
      form.confirmPassword.length > 0 &&
      validateNewPasswordSync(form.newPassword) === '' &&
      validateConfirmSync(form.confirmPassword) === ''
    );
  }, [form, validateConfirmSync, validateNewPasswordSync]);

  const handleBlur = useCallback(
    field => {
      if (field === 'newPassword') {
        setErrors(p => ({
          ...p,
          newPassword: validateNewPasswordSync(form.newPassword),
        }));
      }
      if (field === 'confirmPassword') {
        setErrors(p => ({
          ...p,
          confirmPassword: validateConfirmSync(form.confirmPassword),
        }));
      }
    },
    [
      form.newPassword,
      form.confirmPassword,
      validateConfirmSync,
      validateNewPasswordSync,
    ]
  );

  const handleSubmit = useCallback(async () => {
    const newErr = validateNewPasswordSync(form.newPassword);
    const confErr = validateConfirmSync(form.confirmPassword);

    setErrors(p => ({ ...p, newPassword: newErr, confirmPassword: confErr }));

    if (!form.currentPassword) {
      Alert.alert('Error', 'Please enter your current password');
      return;
    }

    if (newErr || confErr) return;

    const isConnected = await checkInternetAndProceed();
        if (!isConnected) {
          return;
        }

    setLoading(true);
    try {
      const resp = await fetch(`${globalValues.API_BASE_URL}/auth/change-password/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: AUTH_HEADER,
        },
        body: JSON.stringify({
          current_password: form.currentPassword,
          password1: form.newPassword,
          password2: form.confirmPassword,
        }),
      });

      const data = await resp.json();

      if (resp.ok) {
        Alert.alert('Success', 'Password changed successfully!', [
          {
            text: 'OK',
            onPress: () => {
              setForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
              });
              setSecureState({
                currentPassword: true,
                newPassword: true,
                confirmPassword: true,
              });
              setErrors({ newPassword: '', confirmPassword: '' });
            },
          },
        ]);
        await getUserInfo();
        navigateToScreen(NAVIGATION_ROUTES.STACK);
        console.log('submit successful');
      } else {
        // handle server errors
        let msg = 'Something went wrong. Please try again.';

        if (data.non_field_errors && Array.isArray(data.non_field_errors)) {
          const errObj = data.non_field_errors[0];
          if (errObj?.message === 'Current password is incorrect') {
            msg = 'Current password is incorrect';
          } else if (typeof errObj === 'string') {
            msg = errObj;
          }
        } else if (data.detail) {
          msg = data.detail;
        }

        Alert.alert('Error', msg);
        console.log('error message', msg);
      }
    } catch (e) {
      Alert.alert('Network Error', 'Unable to connect. Please try again.');
      console.log('error submit', e);
    } finally {
      setLoading(false);
    }
  }, [form, validateConfirmSync, validateNewPasswordSync, navigateToScreen]);

  useEffect(() => {
    return () => {
      if (validationTimer.current) clearTimeout(validationTimer.current);
    };
  }, []);

  const navigateToScreen = useCallback(
    (routeName, options = {}) => {
      setLoading(false);
      navigation.navigate(routeName, {}, { pop: true, ...options });
    },
    [navigation]
  );

  const getUserInfo = useCallback(async () => {
    try {
      if (!AUTH_HEADER) {
        throw new Error('No authentication header available');
      }
      const response = await fetch(`${globalValues.API_BASE_URL}/auth/users/${senderID}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: AUTH_HEADER,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const userData = await response.json();
      await Promise.all([
        setGlobalVariableValue({ key: 'UserInfo', value: userData }),
        setGlobalVariableValue({ key: 'senderID', value: userData?.id }),
      ]);
    } catch (error) {
      logError('Error fetching user info:', error);
      logError("Error fetching user info:", error);

      navigateToScreen(NAVIGATION_ROUTES.STACK);
      throw error;
    }
  }, [setGlobalVariableValue, navigateToScreen]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.formContainer}>
        <PasswordInput
          ref={refs.currentPassword}
          label="Current Password"
          value={form.currentPassword}
          placeholder="Enter your current password"
          error={''}
          secure={secureState.currentPassword}
          onChangeText={handleChange}
          onBlur={handleBlur}
          onToggleSecure={toggleSecure}
          fieldKey="currentPassword"
          selection={selection.currentPassword}
          onSelectionChange={handleSelectionChange}
        />

        <PasswordInput
          ref={refs.newPassword}
          label="New Password"
          value={form.newPassword}
          placeholder="Enter new password"
          error={errors.newPassword}
          secure={secureState.newPassword}
          onChangeText={handleChange}
          onBlur={handleBlur}
          onToggleSecure={toggleSecure}
          fieldKey="newPassword"
          selection={selection.newPassword}
          onSelectionChange={handleSelectionChange}
        />

        <PasswordInput
          ref={refs.confirmPassword}
          label="Confirm Password"
          value={form.confirmPassword}
          placeholder="Confirm your new password"
          error={errors.confirmPassword}
          secure={secureState.confirmPassword}
          onChangeText={handleChange}
          onBlur={handleBlur}
          onToggleSecure={toggleSecure}
          fieldKey="confirmPassword"
          selection={selection.confirmPassword}
          onSelectionChange={handleSelectionChange}
        />

        <TouchableOpacity
          style={[
            styles.submitButton,
            (!isFormValid() || loading) && styles.submitButtonDisabled,
          ]}
          onPress={() => {
            Keyboard.dismiss();
            handleSubmit();
          }}
          disabled={!isFormValid() || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Change Password</Text>
          )}
        </TouchableOpacity>

        {/* <View style={styles.requirementsContainer}>
            <Text style={styles.requirementsTitle}>Password Requirements:</Text>
            <Text style={styles.requirement}>• Minimum 8 characters</Text>
            <Text style={styles.requirement}>• At least one letter</Text>
            <Text style={styles.requirement}>• At least one digit</Text>
            <Text style={styles.requirement}>• At least one special character (!@#$%^&*)</Text>
          </View> */}
      </View>
    </KeyboardAvoidingView>
  );
};
const styles = StyleSheet.create({
  container: { flex: 1, width: '100%' },
  // scrollContainer: { flexGrow: 1, paddingTop: 12 },
  formContainer: {
    borderRadius: 12,
    paddingHorizontal: 2,
    // backgroundColor: '#fff',
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.08,
    // elevation: 4,
  },
  inputContainer: { width: '100%', marginBottom: 18 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#fbfbfb',
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 18,
    fontSize: 16,
    color: '#222',
  },
  eyeIcon: { paddingHorizontal: 10, paddingVertical: 6 },
  lockIcon: { marginLeft: 12 },
  inputError: { borderColor: '#ff3b30' },
  inputSuccess: { borderColor: '#4cd964' },
  errorText: { color: '#ff3b30', fontSize: 13, marginTop: 6 },
  apiErrorContainer: {
    backgroundColor: '#ff3b30',
    padding: 10,
    borderRadius: 8,
    marginVertical: 8,
  },
  apiErrorText: { color: '#fff', textAlign: 'center' },
  submitButton: {
    backgroundColor: '#066858',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  submitButtonDisabled: { backgroundColor: '#a0a0a0' },
  requirementsContainer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  requirementsTitle: { fontSize: 15, fontWeight: '600', marginBottom: 6 },
  requirement: { fontSize: 13, color: '#666', marginBottom: 4 },
});

export default ChangePasswordView;
