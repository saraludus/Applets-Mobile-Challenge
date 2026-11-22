
import { useLanguage } from '@/lib/language';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';

type Roommate = {
  user_id: string;
  first_name: string;
  age: number | null;
  bio: string | null;
  max_budget: number | null;
  sleep_schedule: string | null;
  cleanliness: string | null;
  social_lifestyle: string | null;
};

type FilterKey =
  | 'budget'
  | 'sleep'
  | 'cleanliness'
  | 'social';

type Filters = Record<FilterKey, string>;

const EMPTY_FILTERS: Filters = {
  budget: 'all',
  sleep: 'all',
  cleanliness: 'all',
  social: 'all',
};

type Option = {
  label: string;
  value: string;
};

function FilterDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const selected =
    options.find((option) => option.value === value);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      <Pressable
        onPress={() => setOpen(!open)}
        style={styles.dropdown}
        accessibilityRole="button"
      >
        <Text style={styles.dropdownText}>
          {selected?.label}
        </Text>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={18}
          color="#B65C48"
        />
      </Pressable>

      {open && (
        <View style={styles.options}>
          {options.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => {
                onChange(option.value);
                setOpen(false);
              }}
              style={[
                styles.option,
                value === option.value &&
                  styles.selectedOption,
              ]}
            >
              <Text style={styles.optionText}>
                {option.label}
              </Text>

              {value === option.value && (
                <Ionicons
                  name="checkmark"
                  size={18}
                  color="#B65C48"
                />
              )}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

export default function ColocsExplore() {
  const { language } = useLanguage();
  const fr = language === 'fr';

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draft, setDraft] = useState<Filters>({
    ...EMPTY_FILTERS,
  });
  const [applied, setApplied] = useState<Filters>({
    ...EMPTY_FILTERS,
  });


  // Roommate profiles retrieved from Supabase
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [loadingRoommates, setLoadingRoommates] = useState(true);
  const [roommatesError, setRoommatesError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadRoommates() {
      try {
        const { data: authData, error: authError } =
          await supabase.auth.getUser();

        if (authError || !authData.user) {
          throw authError || new Error('Not signed in');
        }

        const { data, error } = await supabase
          .from('roommate_profiles')
          .select(
            'user_id, first_name, age, bio, max_budget, sleep_schedule, cleanliness, social_lifestyle'
          )
          .eq('discoverable', true)
          .neq('user_id', authData.user.id);

        if (error) throw error;

        if (active) {
          setRoommates((data || []) as Roommate[]);
        }
      } catch (error) {
        if (active) {
          setRoommatesError(
            error instanceof Error
              ? error.message
              : 'Unable to load roommates'
          );
        }
      } finally {
        if (active) {
          setLoadingRoommates(false);
        }
      }
    }

    loadRoommates();

    return () => {
      active = false;
    };
  }, []);


  // Filter real roommate profiles using the selected preferences.
  const filteredRoommates = roommates.filter((person) => {
    const matchesBudget =
      applied.budget === 'all' ||
      (person.max_budget !== null &&
        person.max_budget <= Number(applied.budget));

    const matchesSleep =
      applied.sleep === 'all' ||
      person.sleep_schedule === applied.sleep;

    const matchesCleanliness =
      applied.cleanliness === 'all' ||
      person.cleanliness === applied.cleanliness;

    const matchesSocial =
      applied.social === 'all' ||
      person.social_lifestyle === applied.social;

    return (
      matchesBudget &&
      matchesSleep &&
      matchesCleanliness &&
      matchesSocial
    );
  });


  const [sendingTo, setSendingTo] = useState<string | null>(null);
  const [sentRequests, setSentRequests] = useState<string[]>([]);


  useEffect(() => {
    let active = true;

    async function loadSentRequests() {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) return;

      const { data, error } = await supabase
        .from('roommate_connections')
        .select('receiver_id')
        .eq('sender_id', authData.user.id);

      if (error) {
        console.error('Error loading connection requests:', error.message);
        return;
      }

      if (active) {
        setSentRequests(
          (data ?? []).map((request) => request.receiver_id)
        );
      }
    }

    loadSentRequests();

    return () => {
      active = false;
    };
  }, []);

  async function sendConnectionRequest(receiverId: string) {
    if (sendingTo !== null || sentRequests.includes(receiverId)) {
      return;
    }

    setSendingTo(receiverId);

    try {
      const { data, error: authError } =
        await supabase.auth.getUser();

      if (authError || !data.user) {
        throw new Error('You must be signed in.');
      }

      const { error } = await supabase
        .from('roommate_connections')
        .insert({
          sender_id: data.user.id,
          receiver_id: receiverId,
          status: 'pending',
        });

      if (error) throw error;

      setSentRequests((previous) => [...previous, receiverId]);

      Alert.alert(
        fr ? 'Demande envoyée !' : 'Request sent!',
        fr
          ? 'Votre demande de connexion a été envoyée.'
          : 'Your connection request has been sent.'
      );
    } catch (error) {
      Alert.alert(
        fr ? 'Erreur' : 'Error',
        error instanceof Error
          ? error.message
          : 'Unable to send request.'
      );
    } finally {
      setSendingTo(null);
    }
  }


  const activeCount = Object.values(applied).filter(
    (value) => value !== 'all'
  ).length;

  function updateFilter(
    key: FilterKey,
    value: string
  ) {
    setDraft((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  function resetFilters() {
    setDraft({ ...EMPTY_FILTERS });
    setApplied({ ...EMPTY_FILTERS });
    setFiltersOpen(false);
  }

  function applyFilters() {
    setApplied({ ...draft });
    setFiltersOpen(false);
  }

  const allPreferences = fr
    ? 'Toutes les préférences'
    : 'All preferences';

  const budgetOptions = [
    {
      value: 'all',
      label: fr ? 'Tous les budgets' : 'All budgets',
    },
    { value: '800', label: '800 $ max' },
    { value: '1000', label: '1 000 $ max' },
    { value: '1200', label: '1 200 $ max' },
    { value: '1500', label: '1 500 $ max' },
  ];

  const sleepOptions = [
    { value: 'all', label: allPreferences },
    {
      value: 'morning',
      label: fr ? 'Lève-tôt' : 'Early bird',
    },
    {
      value: 'night',
      label: fr ? 'Oiseau de nuit' : 'Night owl',
    },
  ];

  const cleanlinessOptions = [
    { value: 'all', label: allPreferences },
    {
      value: 'relaxed',
      label: fr ? 'Décontracté·e' : 'Relaxed',
    },
    {
      value: 'tidy',
      label: fr ? 'Bien rangé·e' : 'Tidy',
    },
    {
      value: 'verytidy',
      label: fr ? 'Très organisé·e' : 'Very organized',
    },
  ];

  const socialOptions = [
    { value: 'all', label: allPreferences },
    {
      value: 'quiet',
      label: fr ? 'Plutôt tranquille' : 'Mostly quiet',
    },
    {
      value: 'balanced',
      label: fr ? 'Un peu des deux' : 'A bit of both',
    },
    {
      value: 'social',
      label: fr ? 'Très sociable' : 'Very social',
    },
  ];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heading}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>
            {fr ? 'Trouver une coloc' : 'Find a roommate'}
          </Text>
          <Text style={styles.subtitle}>
            {fr
              ? 'Découvrez des personnes qui partagent votre mode de vie.'
              : 'Discover people who share your lifestyle.'}
          </Text>
        </View>

        <Pressable
          style={styles.filterButton}
          onPress={() => {
            if (!filtersOpen) {
              setDraft({ ...applied });
            }
            setFiltersOpen(!filtersOpen);
          }}
        >
          <Ionicons
            name="options-outline"
            size={19}
            color="#B65C48"
          />

          <Text style={styles.filterButtonText}>
            {fr ? 'Filtrer' : 'Filter'}
            {activeCount > 0 ? ` (${activeCount})` : ''}
          </Text>
        </Pressable>
      </View>

      {filtersOpen && (
        <View style={styles.filterCard}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>
              {fr
                ? 'Filtres de colocataires'
                : 'Roommate filters'}
            </Text>

            <Pressable
              onPress={() => setFiltersOpen(false)}
            >
              <Ionicons
                name="close"
                size={21}
                color="#806B65"
              />
            </Pressable>
          </View>

          <FilterDropdown
            label={
              fr
                ? 'Budget mensuel maximum'
                : 'Maximum monthly budget'
            }
            value={draft.budget}
            options={budgetOptions}
            onChange={(value) =>
              updateFilter('budget', value)
            }
          />

          <FilterDropdown
            label={
              fr ? 'Rythme de sommeil' : 'Sleep schedule'
            }
            value={draft.sleep}
            options={sleepOptions}
            onChange={(value) =>
              updateFilter('sleep', value)
            }
          />

          <FilterDropdown
            label={fr ? 'Propreté' : 'Cleanliness'}
            value={draft.cleanliness}
            options={cleanlinessOptions}
            onChange={(value) =>
              updateFilter('cleanliness', value)
            }
          />

          <FilterDropdown
            label={fr ? 'Vie sociale' : 'Social lifestyle'}
            value={draft.social}
            options={socialOptions}
            onChange={(value) =>
              updateFilter('social', value)
            }
          />

          <View style={styles.actions}>
            <Pressable
              onPress={resetFilters}
              style={styles.resetButton}
            >
              <Text style={styles.resetText}>
                {fr ? 'Réinitialiser' : 'Reset'}
              </Text>
            </Pressable>

            <Pressable
              onPress={applyFilters}
              style={styles.applyButton}
            >
              <Text style={styles.applyText}>
                {fr ? 'Appliquer' : 'Apply'}
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      <Text style={styles.resultsTitle}>
        {fr
          ? 'Colocataires disponibles'
          : 'Available roommates'}
      </Text>

      
      {loadingRoommates ? (
        <ActivityIndicator
          size="large"
          color="#B65C48"
          style={{ marginTop: 30 }}
        />
      ) : roommatesError ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>
            {fr
              ? 'Impossible de charger les colocataires'
              : 'Unable to load roommates'}
          </Text>

          <Text style={styles.emptyText}>
            {roommatesError}
          </Text>
        </View>
      ) : filteredRoommates.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons
            name="people-outline"
            size={37}
            color="#B65C48"
          />

          <Text style={styles.emptyTitle}>
            {fr
              ? 'Aucun colocataire trouvé'
              : 'No roommates found'}
          </Text>

          <Text style={styles.emptyText}>
            {fr
              ? 'Aucun profil partagé ne correspond à vos filtres pour le moment.'
              : 'No shared profiles match your filters right now.'}
          </Text>

          <Pressable onPress={resetFilters}>
            <Text
              style={{
                color: '#B65C48',
                fontWeight: '700',
                marginTop: 8,
              }}
            >
              {fr ? 'Réinitialiser les filtres' : 'Reset filters'}
            </Text>
          </Pressable>
        </View>
      ) : (
        filteredRoommates.map((person) => (
          <View
            key={person.user_id}
            style={{
              backgroundColor: '#FFFCF8',
              borderWidth: 1,
              borderColor: '#E9D5CC',
              borderRadius: 17,
              padding: 18,
              marginBottom: 15,
            }}
          >
            {/* ROOMMATE NAME */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 13,
                marginBottom: 14,
              }}
            >
              <View
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 29,
                  backgroundColor: '#F8E9DF',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons
                  name="person-outline"
                  size={29}
                  color="#B65C48"
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 19,
                    fontWeight: '800',
                    color: '#33221F',
                  }}
                >
                  {person.first_name}
                  {person.age !== null
                    ? `, ${person.age}`
                    : ''}
                </Text>

                <Text
                  style={{
                    fontSize: 12,
                    color: '#806B65',
                    marginTop: 5,
                  }}
                >
                  {fr ? 'Colocataire' : 'Roommate'}
                </Text>
              </View>
            </View>

            {/* ABOUT */}
            {!!person.bio && (
              <Text
                style={{
                  color: '#806B65',
                  fontSize: 13,
                  lineHeight: 20,
                  marginBottom: 15,
                }}
              >
                {person.bio}
              </Text>
            )}

            <View
              style={{
                height: 1,
                backgroundColor: '#E9D5CC',
                marginBottom: 15,
              }}
            />

            {/* BUDGET */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
              <Ionicons
                name="wallet-outline"
                size={19}
                color="#B65C48"
              />
              <Text style={{ color: '#33221F', flex: 1 }}>
                {fr ? 'Budget maximum' : 'Maximum budget'} :{' '}
                {person.max_budget !== null
                  ? `${person.max_budget} $`
                  : '—'}
              </Text>
            </View>

            {/* SLEEP */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
              <Ionicons
                name="moon-outline"
                size={19}
                color="#B65C48"
              />
              <Text style={{ color: '#33221F', flex: 1 }}>
                {fr ? 'Sommeil' : 'Sleep'} :{' '}
                {person.sleep_schedule === 'morning'
                  ? fr ? 'Lève-tôt' : 'Early bird'
                  : person.sleep_schedule === 'night'
                    ? fr ? 'Oiseau de nuit' : 'Night owl'
                    : '—'}
              </Text>
            </View>

            {/* CLEANLINESS */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
              <Ionicons
                name="sparkles-outline"
                size={19}
                color="#B65C48"
              />
              <Text style={{ color: '#33221F', flex: 1 }}>
                {fr ? 'Propreté' : 'Cleanliness'} :{' '}
                {person.cleanliness === 'relaxed'
                  ? fr ? 'Décontracté·e' : 'Relaxed'
                  : person.cleanliness === 'tidy'
                    ? fr ? 'Bien rangé·e' : 'Tidy'
                    : person.cleanliness === 'verytidy'
                      ? fr ? 'Très organisé·e' : 'Very organized'
                      : '—'}
              </Text>
            </View>

            {/* SOCIAL LIFESTYLE */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Ionicons
                name="people-outline"
                size={19}
                color="#B65C48"
              />
              <Text style={{ color: '#33221F', flex: 1 }}>
                {fr ? 'Vie sociale' : 'Social lifestyle'} :{' '}
                {person.social_lifestyle === 'quiet'
                  ? fr ? 'Plutôt tranquille' : 'Mostly quiet'
                  : person.social_lifestyle === 'balanced'
                    ? fr ? 'Un peu des deux' : 'A bit of both'
                    : person.social_lifestyle === 'social'
                      ? fr ? 'Très sociable' : 'Very social'
                      : '—'}
              </Text>
            </View>
                        {/* CONNECT BUTTON */}
            <Pressable
             onPress={() => sendConnectionRequest(person.user_id)}
disabled={
  sendingTo !== null ||
  sentRequests.includes(person.user_id)
}
              style={{
                backgroundColor: '#B65C48',
                borderRadius: 12,
                paddingVertical: 14,
                marginTop: 20,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 8,
                opacity: sendingTo !== null ? 0.6 : 1,
              }}
            >
              <Ionicons
                name="person-add-outline"
                size={19}
                color="#FFFFFF"
              />
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontWeight: '800',
                }}
              >
               {sentRequests.includes(person.user_id)
  ? fr
    ? 'Demande envoyée ✓'
    : 'Request sent ✓'
  : sendingTo === person.user_id
    ? fr
      ? 'Envoi en cours...'
      : 'Sending...'
    : fr
      ? 'Se connecter'
      : 'Connect'}
              </Text>
            </Pressable>
          </View>
        ))
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFF8F1',
  },
  content: {
    padding: 20,
    paddingBottom: 110,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 24,
  },
  title: {
    fontSize: 25,
    fontWeight: '800',
    color: '#33221F',
    marginBottom: 7,
  },
  subtitle: {
    fontSize: 13,
    color: '#806B65',
    lineHeight: 20,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9D5CC',
    backgroundColor: '#FFFCF8',
    padding: 11,
  },
  filterButtonText: {
    color: '#B65C48',
    fontWeight: '700',
    fontSize: 13,
  },
  filterCard: {
    backgroundColor: '#FFFCF8',
    borderWidth: 1,
    borderColor: '#E9D5CC',
    borderRadius: 17,
    padding: 16,
    marginBottom: 25,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 17,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#33221F',
  },
  field: {
    marginBottom: 16,
  },
  label: {
    color: '#33221F',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 9,
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9D5CC',
    borderRadius: 11,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    gap: 10,
  },
  dropdownText: {
    flex: 1,
    color: '#33221F',
    fontSize: 13,
  },
  options: {
    borderWidth: 1,
    borderColor: '#E9D5CC',
    backgroundColor: '#FFFFFF',
    borderRadius: 11,
    marginTop: 5,
    overflow: 'hidden',
  },
  option: {
    minHeight: 43,
    paddingHorizontal: 12,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedOption: {
    backgroundColor: '#F8E9DF',
  },
  optionText: {
    color: '#33221F',
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  resetButton: {
    flex: 1,
    minHeight: 47,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#E9D5CC',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetText: {
    color: '#B65C48',
    fontWeight: '700',
  },
  applyButton: {
    flex: 1,
    minHeight: 47,
    borderRadius: 11,
    backgroundColor: '#B65C48',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#33221F',
    marginBottom: 15,
  },
  emptyCard: {
    backgroundColor: '#FFFCF8',
    borderWidth: 1,
    borderColor: '#E9D5CC',
    borderRadius: 17,
    padding: 25,
    alignItems: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#33221F',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#806B65',
    textAlign: 'center',
    lineHeight: 20,
  },
});
