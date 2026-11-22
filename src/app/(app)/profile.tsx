
import { useLanguage } from '@/lib/language';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { language, setLanguage } = useLanguage();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState('');

  const fr = language === 'fr';

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      if (!mounted || !data.user) return;

      const user = data.user;
      const metadata = user.user_metadata || {};

      setName(
        metadata.full_name ||
          metadata.first_name ||
          metadata.name ||
          user.email?.split('@')[0] ||
          ''
      );
      setEmail(user.email || '');
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  async function logout() {
    setLoggingOut(true);
    setError('');

    const { error: logoutError } =
      await supabase.auth.signOut();

    if (logoutError) {
      setError(logoutError.message);
      setLoggingOut(false);
    }
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{
        paddingTop: insets.top + 20,
        paddingHorizontal: 20,
        paddingBottom: 100,
      }}
    >
      <Text style={styles.heading}>
        {fr ? 'Mon profil' : 'My profile'}
      </Text>

      <View style={styles.account}>
        <View style={styles.avatar}>
          <Ionicons
            name="person-outline"
            size={28}
            color="#B65C48"
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.name}>
            {name || (fr ? 'Mon compte' : 'My account')}
          </Text>
          <Text style={styles.email}>{email}</Text>
        </View>
      </View>

      <Text style={styles.section}>
        {fr ? 'Langue' : 'Language'}
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>
          {fr ? "Langue de l'application" : 'App language'}
        </Text>

        <View style={styles.languageRow}>
          <Pressable
            onPress={() => setLanguage('fr')}
            style={[
              styles.languageButton,
              fr && styles.selected,
            ]}
          >
            <Text
              style={[
                styles.languageText,
                fr && styles.selectedText,
              ]}
            >
              Français
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setLanguage('en')}
            style={[
              styles.languageButton,
              !fr && styles.selected,
            ]}
          >
            <Text
              style={[
                styles.languageText,
                !fr && styles.selectedText,
              ]}
            >
              English
            </Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.section}>
        {fr ? 'Compte' : 'Account'}
      </Text>

      <Pressable
        onPress={logout}
        disabled={loggingOut}
        style={styles.logout}
      >
        {loggingOut ? (
          <ActivityIndicator color="#B65C48" />
        ) : (
          <>
            <Ionicons
              name="log-out-outline"
              size={21}
              color="#B65C48"
            />
            <Text style={styles.logoutText}>
              {fr ? 'Se déconnecter' : 'Log out'}
            </Text>
          </>
        )}
      </Pressable>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFF8F1',
  },
  heading: {
    fontSize: 29,
    fontWeight: '800',
    color: '#33221F',
    marginBottom: 25,
  },
  account: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    marginBottom: 28,
    backgroundColor: '#FFFCF8',
    borderColor: '#E9D5CC',
    borderWidth: 1,
    borderRadius: 18,
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: '#F8E9DF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    color: '#33221F',
    fontSize: 18,
    fontWeight: '800',
  },
  email: {
    color: '#806B65',
    fontSize: 12,
    marginTop: 5,
  },
  section: {
    fontSize: 19,
    fontWeight: '800',
    color: '#33221F',
    marginBottom: 13,
  },
  card: {
    padding: 18,
    borderRadius: 17,
    backgroundColor: '#FFFCF8',
    borderWidth: 1,
    borderColor: '#E9D5CC',
    marginBottom: 29,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#33221F',
    marginBottom: 15,
  },
  languageRow: {
    flexDirection: 'row',
    backgroundColor: '#F3E6DE',
    borderRadius: 12,
    padding: 4,
  },
  languageButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 9,
  },
  selected: {
    backgroundColor: '#FFFFFF',
  },
  languageText: {
    color: '#806B65',
    fontWeight: '600',
  },
  selectedText: {
    color: '#B65C48',
    fontWeight: '800',
  },
  logout: {
    backgroundColor: '#FFFCF8',
    borderColor: '#E9D5CC',
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  logoutText: {
    color: '#B65C48',
    fontSize: 15,
    fontWeight: '800',
  },
  error: {
    color: '#B91C1C',
    marginTop: 12,
  },
});
