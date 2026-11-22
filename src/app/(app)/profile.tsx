
import { useLanguage } from '@/lib/language';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const C = {
  bg: '#FFF8F1',
  card: '#FFFCF8',
  primary: '#B65C48',
  dark: '#33221F',
  muted: '#806B65',
  border: '#E9D5CC',
  soft: '#F8E9DF',
  white: '#FFFFFF',
  success: '#47744F',
};

type Sleep = 'morning' | 'night' | null;
type Clean = 'relaxed' | 'tidy' | 'verytidy' | null;
type Social = 'quiet' | 'balanced' | 'social' | null;

type Profile = {
  firstName: string;
  age: string;
  bio: string;
  budget: string;
  sleep: Sleep;
  cleanliness: Clean;
  social: Social;
};

type Option = {
  label: string;
  value: string;
};

const EMPTY: Profile = {
  firstName: '',
  age: '',
  bio: '',
  budget: '',
  sleep: null,
  cleanliness: null,
  social: null,
};

const translations = {
  fr: {
    title: 'Mon profil',
    subtitle: 'Mes informations et préférences',
    completeTitle: 'Compléter mon profil',
    completeSubtitle:
      'Renseignez vos informations pour trouver une colocation compatible.',
    personal: 'Informations personnelles',
    firstName: 'Prénom',
    firstNamePlaceholder: 'Votre prénom',
    age: 'Âge',
    agePlaceholder: 'Votre âge',
    bio: 'À propos de moi',
    bioPlaceholder: 'Présentez-vous en quelques phrases...',
    budget: 'Mon budget',
    budgetLabel: 'Loyer mensuel maximum',
    budgetPlaceholder: 'Montant en $',
    month: '/ mois',
    lifestyle: 'Mon mode de vie',
    sleep: 'Rythme de sommeil',
    cleanliness: 'Propreté',
    social: 'Vie sociale',
    select: 'Sélectionnez une option',
    morning: 'Lève-tôt',
    night: 'Oiseau de nuit',
    relaxed: 'Décontracté·e',
    tidy: 'Bien rangé·e',
    verytidy: 'Très organisé·e',
    quiet: 'Plutôt tranquille',
    balanced: 'Un peu des deux',
    outgoing: 'Très sociable',
    edit: 'Modifier',
    cancel: 'Annuler',
    save: 'Enregistrer mon profil',
    saving: 'Enregistrement...',
    saved: 'Profil enregistré avec succès !',
    required: 'Veuillez remplir tous les champs obligatoires.',
    invalidAge: 'Veuillez entrer un âge entre 18 et 100 ans.',
    invalidBudget: 'Veuillez entrer un budget valide supérieur à 0.',
    settings: 'Paramètres',
    language: "Langue de l'application",
    logout: 'Se déconnecter',
    loading: 'Chargement du profil...',
    loadError: 'Impossible de charger votre profil.',
    saveError: "Impossible d'enregistrer votre profil.",
    logoutError: 'Impossible de vous déconnecter.',
    close: 'Fermer',
    account: 'Compte',
    noBio: 'Aucune présentation pour le moment.',
    unset: 'Non renseigné',
    requiredLabel: 'Champs obligatoires',
  },
  en: {
    title: 'My profile',
    subtitle: 'My information and preferences',
    completeTitle: 'Complete my profile',
    completeSubtitle:
      'Enter your information to find compatible roommates.',
    personal: 'Personal information',
    firstName: 'First name',
    firstNamePlaceholder: 'Your first name',
    age: 'Age',
    agePlaceholder: 'Your age',
    bio: 'About me',
    bioPlaceholder: 'Introduce yourself in a few sentences...',
    budget: 'My budget',
    budgetLabel: 'Maximum monthly rent',
    budgetPlaceholder: 'Amount in $',
    month: '/ month',
    lifestyle: 'My lifestyle',
    sleep: 'Sleep schedule',
    cleanliness: 'Cleanliness',
    social: 'Social lifestyle',
    select: 'Select an option',
    morning: 'Early bird',
    night: 'Night owl',
    relaxed: 'Relaxed',
    tidy: 'Tidy',
    verytidy: 'Very organized',
    quiet: 'Mostly quiet',
    balanced: 'A bit of both',
    outgoing: 'Very social',
    edit: 'Edit',
    cancel: 'Cancel',
    save: 'Save my profile',
    saving: 'Saving...',
    saved: 'Profile saved successfully!',
    required: 'Please complete all required fields.',
    invalidAge: 'Please enter an age between 18 and 100.',
    invalidBudget: 'Please enter a valid budget greater than 0.',
    settings: 'Settings',
    language: 'App language',
    logout: 'Log out',
    loading: 'Loading profile...',
    loadError: 'Unable to load your profile.',
    saveError: 'Unable to save your profile.',
    logoutError: 'Unable to log out.',
    close: 'Close',
    account: 'Account',
    noBio: 'No introduction yet.',
    unset: 'Not provided',
    requiredLabel: 'Required fields',
  },
};

function isSleep(value: unknown): value is Exclude<Sleep, null> {
  return value === 'morning' || value === 'night';
}

function isClean(value: unknown): value is Exclude<Clean, null> {
  return (
    value === 'relaxed' ||
    value === 'tidy' ||
    value === 'verytidy'
  );
}

function isSocial(value: unknown): value is Exclude<Social, null> {
  return (
    value === 'quiet' ||
    value === 'balanced' ||
    value === 'social'
  );
}

function isComplete(profile: Profile) {
  const age = Number(profile.age);
  const budget = Number(profile.budget);

  return (
    profile.firstName.trim().length > 0 &&
    profile.bio.trim().length > 0 &&
    profile.age.trim().length > 0 &&
    Number.isInteger(age) &&
    age >= 18 &&
    age <= 100 &&
    profile.budget.trim().length > 0 &&
    Number.isFinite(budget) &&
    budget > 0 &&
    profile.sleep !== null &&
    profile.cleanliness !== null &&
    profile.social !== null
  );
}

function Dropdown({
  label,
  placeholder,
  value,
  options,
  onChange,
  closeLabel,
}: {
  label: string;
  placeholder: string;
  value: string | null;
  options: Option[];
  onChange: (value: string) => void;
  closeLabel: string;
}) {
  const [open, setOpen] = useState(false);

  const selected = options.find(
    (option) => option.value === value
  );

  return (
    <View style={styles.dropdownSection}>
      <Text style={styles.label}>
        {label} <Text style={styles.required}>*</Text>
      </Text>

      <Pressable
        onPress={() => {
          Keyboard.dismiss();
          setOpen(true);
        }}
        style={styles.dropdownButton}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Text
          style={[
            styles.dropdownText,
            !selected && styles.placeholder,
          ]}
        >
          {selected?.label || placeholder}
        </Text>

        <Ionicons
          name="chevron-down"
          size={20}
          color={C.primary}
        />
      </Pressable>

      <Modal
        transparent
        visible={open}
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setOpen(false)}
          />

          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {label}
              </Text>

              <Pressable
                onPress={() => setOpen(false)}
                accessibilityLabel={closeLabel}
              >
                <Ionicons
                  name="close"
                  size={23}
                  color={C.dark}
                />
              </Pressable>
            </View>

            {options.map((option) => {
              const active = option.value === value;

              return (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  style={[
                    styles.modalOption,
                    active && styles.modalOptionActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      active && styles.modalTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>

                  {active && (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color={C.primary}
                    />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Ionicons
        name={icon}
        size={21}
        color={C.primary}
      />

      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>
          {label}
        </Text>
        <Text style={styles.infoValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const { language, setLanguage } = useLanguage();
  const t = translations[language];
  const insets = useSafeAreaInsets();

  const [profile, setProfile] = useState<Profile>({
    ...EMPTY,
  });

  const [original, setOriginal] = useState<Profile>({
    ...EMPTY,
  });

  const [email, setEmail] = useState('');
  const [completed, setCompleted] = useState(false);
  const [editing, setEditing] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [success, setSuccess] = useState(false);

  // LOAD PROFILE FROM SUPABASE DATABASE
  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const { data: authData, error: authError } =
          await supabase.auth.getUser();

        if (authError || !authData.user) {
          throw authError || new Error('Not signed in');
        }

        const user = authData.user;
        const metadata = user.user_metadata || {};

        const { data: row, error: profileError } =
          await supabase
            .from('roommate_profiles')
            .select(
              'first_name, age, bio, max_budget, sleep_schedule, cleanliness, social_lifestyle'
            )
            .eq('user_id', user.id)
            .maybeSingle();

        if (profileError) {
          throw profileError;
        }

        // The database is the primary source of truth.
        // For older accounts without a database row,
        // restore previously saved Auth metadata answers.
        const old = metadata.roommate_profile || {};

        const loaded: Profile = row
          ? {
              firstName: row.first_name || '',
              age:
                row.age == null
                  ? ''
                  : String(row.age),
              bio: row.bio || '',
              budget:
                row.max_budget == null
                  ? ''
                  : String(row.max_budget),
              sleep: isSleep(row.sleep_schedule)
                ? row.sleep_schedule
                : null,
              cleanliness: isClean(row.cleanliness)
                ? row.cleanliness
                : null,
              social: isSocial(row.social_lifestyle)
                ? row.social_lifestyle
                : null,
            }
          : {
              firstName:
                typeof metadata.first_name === 'string'
                  ? metadata.first_name
                  : typeof metadata.full_name === 'string'
                    ? metadata.full_name.split(' ')[0]
                    : '',
              age:
                old.age == null
                  ? ''
                  : String(old.age),
              bio:
                typeof old.bio === 'string'
                  ? old.bio
                  : '',
              budget:
                old.max_budget == null
                  ? ''
                  : String(old.max_budget),
              sleep: isSleep(old.sleep_schedule)
                ? old.sleep_schedule
                : null,
              cleanliness: isClean(old.cleanliness)
                ? old.cleanliness
                : null,
              social: isSocial(old.social_lifestyle)
                ? old.social_lifestyle
                : null,
            };

        if (!active) return;

        setEmail(user.email || '');
        setProfile(loaded);
        setOriginal(loaded);

        // A first-time user starts in edit mode.
        // Existing completed profiles start in view mode.
        const complete = isComplete(loaded);
        setCompleted(complete);
        setEditing(!complete);
      } catch (error) {
        if (active) {
          Alert.alert(
            t.loadError,
            error instanceof Error
              ? error.message
              : t.loadError
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
    // Do not reload the form when language changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update<K extends keyof Profile>(
    key: K,
    value: Profile[K]
  ) {
    setProfile((previous) => ({
      ...previous,
      [key]: value,
    }));

    setSuccess(false);
  }

  function cancelEdit() {
    setProfile({ ...original });
    setEditing(false);
    setSuccess(false);
  }

  // SAVE PROFILE INTO roommate_profiles
  async function saveProfile() {
    const name = profile.firstName.trim();
    const ageText = profile.age.trim();
    const bio = profile.bio.trim();
    const budgetText = profile.budget.trim();

    if (
      !name ||
      !ageText ||
      !bio ||
      !budgetText ||
      !profile.sleep ||
      !profile.cleanliness ||
      !profile.social
    ) {
      Alert.alert(t.required);
      return;
    }

    const age = Number(ageText);
    const budget = Number(budgetText);

    if (
      !Number.isInteger(age) ||
      age < 18 ||
      age > 100
    ) {
      Alert.alert(t.invalidAge);
      return;
    }

    if (
      !Number.isInteger(budget) ||
      budget <= 0 ||
      budget > 2147483647
    ) {
      Alert.alert(t.invalidBudget);
      return;
    }

    setSaving(true);
    setSuccess(false);

    try {
      const { data, error: authError } =
        await supabase.auth.getUser();

      if (authError || !data.user) {
        throw authError || new Error(t.saveError);
      }

      // user_id MUST match the signed-in account.
      // Upsert inserts the first time and updates later.
      const { error: saveError } = await supabase
        .from('roommate_profiles')
        .upsert(
          {
            user_id: data.user.id,
            first_name: name,
            age,
            bio,
            max_budget: budget,
            sleep_schedule: profile.sleep,
            cleanliness: profile.cleanliness,
            social_lifestyle: profile.social,
          },
          { onConflict: 'user_id' }
        );

      if (saveError) {
        throw saveError;
      }

      const saved: Profile = {
        firstName: name,
        age: String(age),
        bio,
        budget: String(budget),
        sleep: profile.sleep,
        cleanliness: profile.cleanliness,
        social: profile.social,
      };

      setProfile(saved);
      setOriginal(saved);
      setCompleted(true);
      setEditing(false);
      setSuccess(true);
    } catch (error) {
      Alert.alert(
        t.saveError,
        error instanceof Error
          ? error.message
          : t.saveError
      );
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    if (loggingOut) return;

    setLoggingOut(true);

    const { error } =
      await supabase.auth.signOut();

    if (error) {
      Alert.alert(t.logoutError, error.message);
      setLoggingOut(false);
    }
  }

  const sleepOptions: Option[] = [
    { label: t.morning, value: 'morning' },
    { label: t.night, value: 'night' },
  ];

  const cleanOptions: Option[] = [
    { label: t.relaxed, value: 'relaxed' },
    { label: t.tidy, value: 'tidy' },
    { label: t.verytidy, value: 'verytidy' },
  ];

  const socialOptions: Option[] = [
    { label: t.quiet, value: 'quiet' },
    { label: t.balanced, value: 'balanced' },
    { label: t.outgoing, value: 'social' },
  ];

  function choiceLabel(
    value: string | null,
    options: Option[]
  ) {
    return (
      options.find((option) => option.value === value)
        ?.label || t.unset
    );
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator
          size="large"
          color={C.primary}
        />
        <Text style={styles.muted}>
          {t.loading}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + 14,
          paddingBottom: 115,
        },
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>
            {completed ? t.title : t.completeTitle}
          </Text>

          <Text style={styles.subtitle}>
            {completed
              ? t.subtitle
              : t.completeSubtitle}
          </Text>
        </View>

        {completed && (
          <Pressable
            onPress={() => {
              if (editing) {
                cancelEdit();
              } else {
                setEditing(true);
                setSuccess(false);
              }
            }}
            disabled={saving}
            style={styles.editButton}
          >
            <Ionicons
              name={
                editing
                  ? 'close-outline'
                  : 'pencil-outline'
              }
              size={17}
              color={C.primary}
            />

            <Text style={styles.editText}>
              {editing ? t.cancel : t.edit}
            </Text>
          </Pressable>
        )}
      </View>

      {/* PROFILE HEADER */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons
            name="person-outline"
            size={31}
            color={C.primary}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>
            {profile.firstName ||
              t.firstNamePlaceholder}
          </Text>
          <Text style={styles.userEmail}>
            {email}
          </Text>
        </View>
      </View>

      {/* PERSONAL INFORMATION */}
      <Text style={styles.sectionTitle}>
        {t.personal}
      </Text>

      <View style={styles.card}>
        {editing ? (
          <>
            <View style={styles.inputRow}>
              <View style={styles.half}>
                <Text style={styles.label}>
                  {t.firstName}
                  <Text style={styles.required}> *</Text>
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder={t.firstNamePlaceholder}
                  placeholderTextColor={C.muted}
                  value={profile.firstName}
                  onChangeText={(v) =>
                    update('firstName', v)
                  }
                  autoCapitalize="words"
                  maxLength={50}
                />
              </View>

              <View style={styles.half}>
                <Text style={styles.label}>
                  {t.age}
                  <Text style={styles.required}> *</Text>
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder={t.agePlaceholder}
                  placeholderTextColor={C.muted}
                  value={profile.age}
                  onChangeText={(v) => update('age', v)}
                  keyboardType="number-pad"
                  maxLength={3}
                />
              </View>
            </View>

            <Text style={styles.label}>
              {t.bio}
              <Text style={styles.required}> *</Text>
            </Text>

            <TextInput
              style={[styles.input, styles.bioInput]}
              placeholder={t.bioPlaceholder}
              placeholderTextColor={C.muted}
              value={profile.bio}
              onChangeText={(v) => update('bio', v)}
              multiline
              textAlignVertical="top"
              maxLength={400}
            />
          </>
        ) : (
          <>
            <InfoRow
              icon="person-outline"
              label={t.firstName}
              value={profile.firstName}
            />

            <View style={styles.divider} />

            <InfoRow
              icon="calendar-outline"
              label={t.age}
              value={profile.age}
            />

            <View style={styles.divider} />

            <Text style={styles.label}>
              {t.bio}
            </Text>

            <Text style={styles.bioText}>
              {profile.bio || t.noBio}
            </Text>
          </>
        )}
      </View>

      {/* BUDGET */}
      <Text style={styles.sectionTitle}>
        {t.budget}
      </Text>

      <View style={styles.card}>
        <View style={styles.iconRow}>
          <Ionicons
            name="wallet-outline"
            size={21}
            color={C.primary}
          />
          <Text style={styles.label}>
            {t.budgetLabel}
            {editing && (
              <Text style={styles.required}> *</Text>
            )}
          </Text>
        </View>

        {editing ? (
          <View style={styles.budgetRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder={t.budgetPlaceholder}
              placeholderTextColor={C.muted}
              value={profile.budget}
              onChangeText={(v) =>
                update('budget', v)
              }
              keyboardType="number-pad"
              maxLength={8}
            />

            <Text style={styles.muted}>
              $ CAD
            </Text>
          </View>
        ) : (
          <View style={styles.budgetRow}>
            <Text style={styles.budgetAmount}>
              {profile.budget} $
            </Text>
            <Text style={styles.muted}>
              {t.month}
            </Text>
          </View>
        )}
      </View>

      {/* LIFESTYLE */}
      <Text style={styles.sectionTitle}>
        {t.lifestyle}
      </Text>

      <View style={styles.card}>
        {editing ? (
          <>
            <Dropdown
              label={t.sleep}
              placeholder={t.select}
              value={profile.sleep}
              options={sleepOptions}
              closeLabel={t.close}
              onChange={(v) => {
                if (isSleep(v)) update('sleep', v);
              }}
            />

            <View style={styles.divider} />

            <Dropdown
              label={t.cleanliness}
              placeholder={t.select}
              value={profile.cleanliness}
              options={cleanOptions}
              closeLabel={t.close}
              onChange={(v) => {
                if (isClean(v)) {
                  update('cleanliness', v);
                }
              }}
            />

            <View style={styles.divider} />

            <Dropdown
              label={t.social}
              placeholder={t.select}
              value={profile.social}
              options={socialOptions}
              closeLabel={t.close}
              onChange={(v) => {
                if (isSocial(v)) update('social', v);
              }}
            />
          </>
        ) : (
          <>
            <InfoRow
              icon="moon-outline"
              label={t.sleep}
              value={choiceLabel(
                profile.sleep,
                sleepOptions
              )}
            />

            <View style={styles.divider} />

            <InfoRow
              icon="sparkles-outline"
              label={t.cleanliness}
              value={choiceLabel(
                profile.cleanliness,
                cleanOptions
              )}
            />

            <View style={styles.divider} />

            <InfoRow
              icon="people-outline"
              label={t.social}
              value={choiceLabel(
                profile.social,
                socialOptions
              )}
            />
          </>
        )}
      </View>

      {/* SAVE BUTTON */}
      {editing && (
        <>
          <Text style={styles.requiredNote}>
            * {t.requiredLabel}
          </Text>

          <Pressable
            onPress={saveProfile}
            disabled={saving}
            style={[
              styles.saveButton,
              saving && { opacity: 0.6 },
            ]}
          >
            {saving ? (
              <ActivityIndicator color={C.white} />
            ) : (
              <Ionicons
                name="checkmark-outline"
                size={22}
                color={C.white}
              />
            )}

            <Text style={styles.saveText}>
              {saving ? t.saving : t.save}
            </Text>
          </Pressable>
        </>
      )}

      {success && (
        <View style={styles.successRow}>
          <Ionicons
            name="checkmark-circle-outline"
            size={20}
            color={C.success}
          />

          <Text style={styles.successText}>
            {t.saved}
          </Text>
        </View>
      )}

      {/* SETTINGS */}
      <Text style={styles.sectionTitle}>
        {t.settings}
      </Text>

      <View style={styles.card}>
        <View style={styles.iconRow}>
          <Ionicons
            name="language-outline"
            size={21}
            color={C.primary}
          />
          <Text style={styles.label}>
            {t.language}
          </Text>
        </View>

        <View style={styles.languageRow}>
          <Pressable
            onPress={() => setLanguage('fr')}
            style={[
              styles.languageButton,
              language === 'fr' &&
                styles.activeLanguage,
            ]}
          >
            <Text
              style={[
                styles.languageText,
                language === 'fr' &&
                  styles.activeLanguageText,
              ]}
            >
              Français
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setLanguage('en')}
            style={[
              styles.languageButton,
              language === 'en' &&
                styles.activeLanguage,
            ]}
          >
            <Text
              style={[
                styles.languageText,
                language === 'en' &&
                  styles.activeLanguageText,
              ]}
            >
              English
            </Text>
          </Pressable>
        </View>
      </View>

      {/* LOGOUT */}
      <Text style={styles.sectionTitle}>
        {t.account}
      </Text>

      <Pressable
        onPress={logout}
        disabled={loggingOut}
        style={styles.logoutButton}
      >
        {loggingOut ? (
          <ActivityIndicator color={C.primary} />
        ) : (
          <>
            <Ionicons
              name="log-out-outline"
              size={21}
              color={C.primary}
            />
            <Text style={styles.logoutText}>
              {t.logout}
            </Text>
          </>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.bg,
  },
  loading: {
    flex: 1,
    backgroundColor: C.bg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  content: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 22,
  },
  title: {
    fontSize: 27,
    fontWeight: '800',
    color: C.dark,
    marginBottom: 7,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: C.muted,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 11,
    paddingVertical: 10,
    borderRadius: 11,
  },
  editText: {
    fontSize: 12,
    fontWeight: '700',
    color: C.primary,
  },
  profileCard: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 18,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    marginBottom: 26,
  },
  avatar: {
    width: 59,
    height: 59,
    borderRadius: 30,
    backgroundColor: C.soft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: C.dark,
  },
  userEmail: {
    fontSize: 12,
    color: C.muted,
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: C.dark,
    marginBottom: 12,
  },
  card: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 17,
    padding: 17,
    marginBottom: 25,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  half: {
    flex: 1,
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: C.dark,
    marginBottom: 10,
  },
  required: {
    color: C.primary,
  },
  input: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 11,
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    color: C.dark,
  },
  bioInput: {
    minHeight: 108,
    textAlignVertical: 'top',
  },
  bioText: {
    fontSize: 14,
    lineHeight: 21,
    color: C.muted,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 3,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
  },
  budgetAmount: {
    fontSize: 29,
    fontWeight: '800',
    color: C.primary,
  },
  muted: {
    fontSize: 13,
    color: C.muted,
  },
  dropdownSection: {
    marginBottom: 2,
  },
  dropdownButton: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 11,
    minHeight: 51,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  dropdownText: {
    color: C.dark,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  placeholder: {
    color: C.muted,
    fontWeight: '400',
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 19,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: C.dark,
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 14,
    color: C.muted,
  },
  requiredNote: {
    fontSize: 12,
    color: C.muted,
    marginBottom: 11,
  },
  saveButton: {
    backgroundColor: C.primary,
    borderRadius: 13,
    minHeight: 53,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginBottom: 24,
  },
  saveText: {
    color: C.white,
    fontSize: 14,
    fontWeight: '800',
  },
  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 22,
  },
  successText: {
    color: C.success,
    fontWeight: '700',
    fontSize: 13,
  },
  languageRow: {
    flexDirection: 'row',
    padding: 4,
    backgroundColor: C.soft,
    borderRadius: 12,
    gap: 4,
    marginTop: 16,
  },
  languageButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 9,
  },
  activeLanguage: {
    backgroundColor: C.white,
  },
  languageText: {
    color: C.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  activeLanguageText: {
    color: C.primary,
    fontWeight: '800',
  },
  logoutButton: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    paddingVertical: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 15,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '800',
    color: C.primary,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 25,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(35, 22, 20, 0.46)',
  },
  modalCard: {
    backgroundColor: C.card,
    borderRadius: 18,
    padding: 17,
    borderWidth: 1,
    borderColor: C.border,
    maxWidth: 450,
    width: '100%',
    alignSelf: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 11,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: C.dark,
    flex: 1,
  },
  modalOption: {
    paddingHorizontal: 14,
    paddingVertical: 16,
    minHeight: 51,
    borderRadius: 11,
    marginTop: 6,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalOptionActive: {
    backgroundColor: C.soft,
    borderColor: C.primary,
  },
  modalOptionText: {
    fontSize: 14,
    color: C.dark,
    fontWeight: '500',
  },
  modalTextActive: {
    color: C.primary,
    fontWeight: '800',
  },
});
