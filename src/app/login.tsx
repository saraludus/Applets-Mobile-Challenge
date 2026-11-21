
import { signIn } from '@/services/auth';
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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    try {
      setLoading(true);
      await signIn(email.trim(), password);
      router.replace('/' as any);
    } catch (error) {
      Alert.alert(
        'Login failed',
        error instanceof Error ? error.message : 'Something went wrong.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Roommate App</Text>
      <Text style={styles.subtitle}>Welcome back!</Text>

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

      <Pressable
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Logging in...' : 'Log in'}
        </Text>
      </Pressable>

      {/* <Pressable onPress={() => router.push('/signup')}> */}
      <Pressable onPress={() => router.push('/signup' as any)}>
        <Text style={styles.link}>Don&apos;t have an account? Sign up</Text>
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
