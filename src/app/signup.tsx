
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
    subtitle: 'Créez votre compte',
    name: 'Nom complet',
    email: 'Adresse courriel',
    password: 'Mot de passe',
    confirm: 'Confirmer le mot de passe',
    signup: 'Créer mon compte',
    loading: 'Création du compte...',
    haveAccount: 'Vous avez déjà un compte ?',
    login: 'Se connecter',
    missing: 'Information manquante',
    fill: 'Veuillez remplir tous les champs.',
    mismatch: 'Les mots de passe ne correspondent pas.',
    weak: 'Le mot de passe doit contenir au moins 6 caractères.',
    checkEmail: 'Vérifiez votre courriel',
    confirmEmail: 'Veuillez confirmer votre adresse courriel avant de vous connecter.',
    error: "Échec de l'inscription",
    generic: 'Une erreur est survenue.',
  },
  en: {
    title: 'CoHabitat',
    subtitle: 'Create your account',
    name: 'Full name',
    email: 'Email address',
    password: 'Password',
    confirm: 'Confirm password',
    signup: 'Create my account',
    loading: 'Creating account...',
    haveAccount: 'Already have an account?',
    login: 'Log in',
    missing: 'Missing information',
    fill: 'Please fill in all fields.',
    mismatch: 'Your passwords do not match.',
    weak: 'Password must contain at least 6 characters.',
    checkEmail: 'Check your email',
    confirmEmail: 'Please confirm your email before logging in.',
    error: 'Signup failed',
    generic: 'Something went wrong.',
  },
};

export default function SignupScreen() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<Language>('fr');

  const t = translations[language];

  async function handleSignup() {
    if (!displayName.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert(t.missing, t.fill);
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        language === 'fr' ? 'Erreur' : 'Error',
        t.mismatch
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        language === 'fr' ? 'Mot de passe invalide' : 'Weak password',
        t.weak
      );
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
          t.checkEmail,
          t.confirmEmail,
          [
            {
              text: 'OK',
              onPress: () => router.replace('/login' as any),
            },
          ]
        );
      }
    } catch (error: any) {
      console.log('SIGNUP ERROR:', error);

      Alert.alert(
        t.error,
        error?.message || t.generic
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
          <Text style={styles.label}>{t.name}</Text>
          <TextInput
            style={styles.input}
            placeholder={t.name}
            placeholderTextColor={C.muted}
            value={displayName}
            onChangeText={setDisplayName}
          />

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

          <Text style={styles.label}>{t.confirm}</Text>
          <TextInput
            style={styles.input}
            placeholder={t.confirm}
            placeholderTextColor={C.muted}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.pressed,
              loading && styles.disabled,
            ]}
            onPress={handleSignup}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? t.loading : t.signup}
            </Text>
          </Pressable>
        </View>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>{t.haveAccount} </Text>
          <Pressable onPress={() => router.replace('/login' as any)}>
            <Text style={styles.link}>{t.login}</Text>
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
    marginBottom: 22,
  },
  form: {
    gap: 9,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: C.dark,
    marginTop: 3,
  },
  input: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 13,
    padding: 14,
    fontSize: 15,
    color: C.dark,
  },
  button: {
    backgroundColor: C.primary,
    padding: 17,
    borderRadius: 13,
    alignItems: 'center',
    marginTop: 12,
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
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 20,
  },
  loginText: {
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
