
import { signUp } from '@/services/auth';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

export default function SignupScreen() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!displayName.trim() || !email.trim() || !password) {
      Alert.alert('Missing information', 'Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password mismatch', 'Your passwords do not match.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must contain at least 6 characters.');
      return;
    }

    try {
      setLoading(true);

      const data = await signUp(
        email.trim(),
        password,
        displayName.trim()
      );

      if (data.session) {
        router.replace('/' as any);
      } else {
        Alert.alert(
          'Check your email',
          'Please confirm your email before logging in.',
          [{ text: 'OK', onPress: () => router.replace('/login' as any) }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Signup failed',
        error instanceof Error ? error.message : 'Something went wrong.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Find your perfect roommate!</Text>

      <TextInput
        style={styles.input}
        placeholder="Display name"
        value={displayName}
        onChangeText={setDisplayName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <Pressable
        style={styles.button}
        onPress={handleSignup}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Creating account...' : 'Sign up'}
        </Text>
      </Pressable>

      <Pressable onPress={() => router.replace('/login' as any)}>
        <Text style={styles.link}>Already have an account? Log in</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 16,
    backgroundColor: '#EBEDB8',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#455230',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 10,
  },
  button: {
    backgroundColor: '#637545',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  link: {
    textAlign: 'center',
    color: '#455230',
    marginTop: 10,
  },
});
