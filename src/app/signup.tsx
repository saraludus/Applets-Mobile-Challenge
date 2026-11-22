import { signUp } from '@/services/auth';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextInputInstance,
  View,
} from 'react-native';

const COLORS = {
  terracotta: '#B65C48',
  peach: '#F4C4B1',
  cream: '#FFF8F1',
  espresso: '#33221F',
  blush: '#E9B5A8',
  muted: 'rgba(51, 34, 31, 0.65)',
  placeholder: 'rgba(51, 34, 31, 0.4)',
};

type FocusedField = 'displayName' | 'email' | 'password' | 'confirmPassword' | null;

export default function SignupScreen() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<FocusedField>(null);
  const [showPassword, setShowPassword] = useState(false);

  const emailRef = useRef<TextInputInstance>(null);
  const passwordRef = useRef<TextInputInstance>(null);
  const confirmRef = useRef<TextInputInstance>(null);

  async function handleSignup() {
    if (!displayName.trim() || !email.trim() || !password) {
      Alert.alert('Informations manquantes', 'Veuillez remplir tous les champs.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Mot de passe incorrect', 'Les mots de passe ne correspondent pas.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Mot de passe faible', 'Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    try {
      setLoading(true);

      const data = await signUp(email.trim(), password, displayName.trim());

      if (data.session) {
        router.replace('/' as any);
      } else {
        Alert.alert(
          'Vérifiez votre e-mail',
          'Veuillez confirmer votre adresse e-mail avant de vous connecter.',
          [{ text: 'OK', onPress: () => router.replace('/login' as any) }]
        );
      }
    } catch (error: any) {
      console.log('SIGNUP ERROR:', error);
      console.log('ERROR MESSAGE:', error?.message);
      console.log('ERROR DETAILS:', error?.details);
      console.log('ERROR STATUS:', error?.status);

      Alert.alert('Inscription échouée', error?.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.root}>
      <View pointerEvents="none" style={styles.circleLarge} />
      <View pointerEvents="none" style={styles.circleSmall} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.door}>
              <View style={styles.doorKnob} />
            </View>
            <Text style={styles.brand}>Roommate App</Text>
            <Text style={styles.title}>Créer un compte</Text>
            <Text style={styles.subtitle}>Trouvez votre colocataire idéal.</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nom affiché</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focused === 'displayName' && styles.inputWrapperFocused,
                ]}
              >
                <TextInput
                  style={styles.input}
                  placeholder="Nom visible par les autres"
                  placeholderTextColor={COLORS.placeholder}
                  value={displayName}
                  onChangeText={setDisplayName}
                  autoComplete="name"
                  textContentType="name"
                  returnKeyType="next"
                  onFocus={() => setFocused('displayName')}
                  onBlur={() => setFocused(null)}
                  onSubmitEditing={() => emailRef.current?.focus()}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Adresse e-mail</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focused === 'email' && styles.inputWrapperFocused,
                ]}
              >
                <TextInput
                  ref={emailRef}
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={COLORS.placeholder}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  returnKeyType="next"
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  onSubmitEditing={() => passwordRef.current?.focus()}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Mot de passe</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focused === 'password' && styles.inputWrapperFocused,
                ]}
              >
                <TextInput
                  ref={passwordRef}
                  style={styles.input}
                  placeholder="Au moins 6 caractères"
                  placeholderTextColor={COLORS.placeholder}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="new-password"
                  textContentType="newPassword"
                  returnKeyType="next"
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  onSubmitEditing={() => confirmRef.current?.focus()}
                />
                <Pressable
                  onPress={() => setShowPassword((v) => !v)}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  <Text style={styles.toggle}>{showPassword ? 'Masquer' : 'Afficher'}</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Confirmer le mot de passe</Text>
              <View
                style={[
                  styles.inputWrapper,
                  focused === 'confirmPassword' && styles.inputWrapperFocused,
                ]}
              >
                <TextInput
                  ref={confirmRef}
                  style={styles.input}
                  placeholder="Saisissez à nouveau votre mot de passe"
                  placeholderTextColor={COLORS.placeholder}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="new-password"
                  textContentType="newPassword"
                  returnKeyType="done"
                  onFocus={() => setFocused('confirmPassword')}
                  onBlur={() => setFocused(null)}
                  onSubmitEditing={handleSignup}
                />
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
                loading && styles.buttonDisabled,
              ]}
              onPress={handleSignup}
              disabled={loading}
              accessibilityRole="button"
            >
              <Text style={styles.buttonText}>
                {loading ? 'Création du compte...' : 'S’inscrire'}
              </Text>
            </Pressable>
          </View>

          <Pressable
            onPress={() => router.replace('/login' as any)}
            style={styles.footer}
            accessibilityRole="link"
          >
            <Text style={styles.footerText}>
              Vous avez déjà un compte ? <Text style={styles.footerLink}>Se connecter</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.cream,
    overflow: 'hidden',
  },
  flex: {
    flex: 1,
  },
  circleLarge: {
    position: 'absolute',
    top: -90,
    right: -70,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: COLORS.peach,
  },
  circleSmall: {
    position: 'absolute',
    top: 120,
    left: -60,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.blush,
    opacity: 0.55,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 48,
    gap: 28,
  },
  header: {
    gap: 6,
  },
  door: {
    width: 64,
    height: 80,
    backgroundColor: COLORS.terracotta,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 12,
    marginBottom: 14,
  },
  doorKnob: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: COLORS.cream,
  },
  brand: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.terracotta,
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.espresso,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: COLORS.muted,
  },
  form: {
    gap: 16,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.espresso,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.blush,
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  inputWrapperFocused: {
    borderColor: COLORS.terracotta,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: COLORS.espresso,
  },
  toggle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.terracotta,
    paddingLeft: 12,
  },
  button: {
    backgroundColor: COLORS.terracotta,
    paddingVertical: 17,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonPressed: {
    opacity: 0.88,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.cream,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  footerText: {
    fontSize: 15,
    color: COLORS.muted,
  },
  footerLink: {
    color: COLORS.terracotta,
    fontWeight: '700',
  },
});
