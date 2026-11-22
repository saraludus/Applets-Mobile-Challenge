
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

type Language = 'fr' | 'en';

const C = {
  bg: '#FFF8F1',
  primary: '#B65C48',
  peach: '#F4C4B1',
  rose: '#E9B5A8',
  dark: '#33221F',
  white: '#FFFFFF',
  muted: '#806B65',
  border: '#E9D5CC',
};

const translations = {
  fr: {
    title: 'CoHabitat',
    subtitle: 'Heureux de vous retrouver !',
    email: 'Adresse courriel',
    password: 'Mot de passe',
    login: 'Se connecter',
    loading: 'Connexion...',
    noAccount: "Vous n'avez pas de compte ?",
    signup: "S'inscrire",
    error: 'Échec de connexion',
    generic: 'Une erreur est survenue.',
  },
  en: {
    title: 'CoHabitat',
    subtitle: 'Welcome back!',
    email: 'Email address',
    password: 'Password',
    login: 'Log in',
    loading: 'Logging in...',
    noAccount: "Don't have an account?",
    signup: 'Sign up',
    error: 'Login failed',
    generic: 'Something went wrong.',
  },
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<Language>('fr');

  const t = translations[language];

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert(
        language === 'fr' ? 'Information manquante' : 'Missing information',
        language === 'fr'
          ? 'Veuillez remplir tous les champs.'
          : 'Please fill in all fields.'
      );
      return;
    }

    try {
      setLoading(true);
      await signIn(email.trim(), password);
      router.replace('/' as any);
    } catch (error) {
      Alert.alert(
        t.error,
        error instanceof Error ? error.message : t.generic
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>C</Text>
        </View>

        <Text style={styles.title}>{t.title}</Text>
        <Text style={styles.subtitle}>{t.subtitle}</Text>

        <View style={styles.form}>
          <Text style={styles.label}>{t.email}</Text>
          <TextInput
            style={styles.input}
            placeholder={t.email}
            placeholderTextColor={C.muted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>{t.password}</Text>
          <TextInput
            style={styles.input}
            placeholder={t.password}
            placeholderTextColor={C.muted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.pressed,
              loading && styles.disabled,
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? t.loading : t.login}
            </Text>
          </Pressable>
        </View>

        <View style={styles.signupRow}>
          <Text style={styles.signupText}>{t.noAccount} </Text>
          <Pressable onPress={() => router.push('/signup' as any)}>
            <Text style={styles.link}>{t.signup}</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.languageContainer}>
        <Text style={styles.languageLabel}>
          {language === 'fr' ? 'Langue' : 'Language'}
        </Text>

        <View style={styles.languageSwitch}>
          <Pressable
            onPress={() => setLanguage('fr')}
            style={[
              styles.languageOption,
              language === 'fr' && styles.selectedLanguage,
            ]}
          >
            <Text
              style={[
                styles.languageText,
                language === 'fr' && styles.selectedLanguageText,
              ]}
            >
              Français
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setLanguage('en')}
            style={[
              styles.languageOption,
              language === 'en' && styles.selectedLanguage,
            ]}
          >
            <Text
              style={[
                styles.languageText,
                language === 'en' && styles.selectedLanguageText,
              ]}
            >
              English
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
    padding: 24,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  logo: {
    width: 65,
    height: 65,
    borderRadius: 21,
    backgroundColor: C.primary,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '800',
    color: C.white,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: C.dark,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: C.muted,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 35,
  },
  form: {
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: C.dark,
    marginTop: 5,
  },
  input: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 13,
    padding: 16,
    fontSize: 15,
    color: C.dark,
  },
  button: {
    backgroundColor: C.primary,
    padding: 17,
    borderRadius: 13,
    alignItems: 'center',
    marginTop: 15,
  },
  buttonText: {
    color: C.white,
    fontSize: 16,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.6,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 25,
  },
  signupText: {
    color: C.muted,
    fontSize: 14,
  },
  link: {
    color: C.primary,
    fontWeight: '800',
    fontSize: 14,
  },
  languageContainer: {
    alignItems: 'center',
    paddingBottom: 12,
  },
  languageLabel: {
    color: C.muted,
    fontSize: 12,
    marginBottom: 10,
  },
  languageSwitch: {
    flexDirection: 'row',
    backgroundColor: C.peach,
    borderRadius: 25,
    padding: 4,
  },
  languageOption: {
    paddingVertical: 9,
    paddingHorizontal: 20,
    borderRadius: 22,
  },
  selectedLanguage: {
    backgroundColor: C.primary,
  },
  languageText: {
    color: C.dark,
    fontSize: 13,
    fontWeight: '600',
  },
  selectedLanguageText: {
    color: C.white,
  },
});
