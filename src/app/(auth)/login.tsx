import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useSignIn, useSignUp } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const { signIn, errors: _signInErrors, fetchStatus: signInFetchStatus } = useSignIn();
  const { signUp, errors: _signUpErrors, fetchStatus: signUpFetchStatus } = useSignUp();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUpMode] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');

  const navigateAfterAuth = useCallback(async ({ session, decorateUrl }: { session: any; decorateUrl: (url: string) => string }) => {
    if (session?.currentTask) {
      // Handle session tasks (MFA enrollment, org selection, etc.) - redirect to login
      const destination = decorateUrl('/(auth)/login');
      if (destination.startsWith('https')) {
        window.location.href = destination;
      } else {
        router.replace('/(auth)/login');
      }
      return;
    }
    const destination = decorateUrl('/(tabs)');
    if (destination.startsWith('https')) {
      window.location.href = destination;
    } else {
      router.replace('/(tabs)');
    }
  }, [router]);

  const getErrorMessage = (error: { longMessage?: string; message: string; code: string } | null) => {
    if (!error) return 'Unknown error';
    return error.longMessage || error.message;
  };

  async function onSignInPress() {
    if (!signIn || signInFetchStatus === 'fetching') return;
    setLoading(true);
    try {
      const { error } = await signIn.password({ emailAddress: email, password });
      if (error) {
        Alert.alert('Sign In Failed', getErrorMessage(error));
        return;
      }
      if (signIn.status === 'complete') {
        await signIn.finalize({ navigate: navigateAfterAuth });
      } else if (signIn.status === 'needs_second_factor') {
        Alert.alert('2FA Required', 'Please complete two-factor authentication');
      }
    } catch (err: any) {
      Alert.alert('Sign In Failed', err.message);
    } finally {
      setLoading(false);
    }
  }

  async function onSignUpPress() {
    if (!signUp || signUpFetchStatus === 'fetching') return;
    setLoading(true);
    try {
      const { error } = await signUp.password({ emailAddress: email, password });
      if (error) {
        if (error.code === 'form_identifier_not_found') {
          const { error: signUpError } = await signUp.password({ emailAddress: email, password });
          if (signUpError) {
            Alert.alert('Sign Up Failed', getErrorMessage(signUpError));
            return;
          }
        } else {
          Alert.alert('Sign Up Failed', getErrorMessage(error));
          return;
        }
      }
      
      if (signUp.status === 'complete') {
        await signUp.finalize({ navigate: navigateAfterAuth });
      } else if (signUp.unverifiedFields?.includes('email_address')) {
        await signUp.verifications.sendEmailCode();
        setPendingVerification(true);
      }
    } catch (err: any) {
      Alert.alert('Sign Up Failed', err.message);
    } finally {
      setLoading(false);
    }
  }

  async function onPressVerify() {
    if (!signUp || signUpFetchStatus === 'fetching') return;
    setLoading(true);
    try {
      const { error } = await signUp.verifications.verifyEmailCode({ code });
      if (error) {
        Alert.alert('Verification Failed', getErrorMessage(error));
        return;
      }
      if (signUp.status === 'complete') {
        await signUp.finalize({ navigate: navigateAfterAuth });
      }
    } catch (err: any) {
      Alert.alert('Verification Failed', err.message);
    } finally {
      setLoading(false);
    }
  }

  if (pendingVerification) {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons name="mail-unread-outline" size={48} color="#007AFF" />
          </View>
          <Text style={styles.title}>Verify Email</Text>
          <Text style={styles.subtitle}>Enter the code we just sent to your email</Text>
          
          <View style={styles.inputContainer}>
            <Ionicons name="key-outline" size={20} color="#8E8E93" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={code}
              placeholder="Verification Code"
              onChangeText={setCode}
              keyboardType="number-pad"
            />
          </View>
          <TouchableOpacity style={styles.button} onPress={onPressVerify} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Verify</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Ionicons name="wallet" size={40} color="#FFF" />
        </View>
        <Text style={styles.headerTitle}>Expense Tracker</Text>
        <Text style={styles.headerSubtitle}>Manage your finances easily</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{isSignUp ? 'Create Account' : 'Welcome Back'}</Text>
        
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#8E8E93" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            onChangeText={setEmail}
            value={email}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#8E8E93" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            onChangeText={setPassword}
            value={password}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity
          style={styles.button}
          disabled={loading || signInFetchStatus === 'fetching' || signUpFetchStatus === 'fetching'}
          onPress={() => isSignUp ? onSignUpPress() : onSignInPress()}
        >
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => setIsSignUpMode(!isSignUp)}
        >
          <Text style={styles.switchText}>
            {isSignUp ? 'Already have an account? ' : 'Need an account? '}
            <Text style={styles.switchTextBold}>{isSignUp ? 'Sign In' : 'Sign Up'}</Text>
          </Text>
        </TouchableOpacity>
        {isSignUp && <View nativeID="clerk-captcha" />}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1C1C1E',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 24,
    textAlign: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 14,
    height: 56,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#1C1C1E',
  },
  button: {
    height: 56,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  switchButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  switchText: {
    fontSize: 15,
    color: '#8E8E93',
  },
  switchTextBold: {
    color: '#007AFF',
    fontWeight: '600',
  },
});