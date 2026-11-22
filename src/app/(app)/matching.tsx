import { rankCandidates, type Profile, type Ranked } from '@/lib/matching';
import { supabase } from '@/lib/supabase';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function scoreColor(score: number, dealbreaker: boolean) {
  if (dealbreaker) return '#d9534f';
  if (score >= 75) return '#2e9e5b';
  if (score >= 50) return '#e0a100';
  return '#d9534f';
}

export default function MatchingScreen() {
  const dark = useColorScheme() === 'dark';
  const text = dark ? '#fff' : '#111';
  const sub = dark ? '#aaa' : '#666';
  const border = dark ? '#333' : '#ddd';

  const [ranked, setRanked] = useState<Ranked[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) {
      setError(userErr?.message ?? 'Not signed in');
      return;
    }

    const { data, error: profErr } = await supabase.from('profiles').select('*');
    if (profErr) {
      setError(profErr.message);
      return;
    }

    const profiles = (data ?? []) as Profile[];
    const me = profiles.find((p) => p.id === userData.user.id);
    if (!me) {
      setError('You have no profile yet. Create one so we can match you.');
      return;
    }

    setRanked(rankCandidates(me, profiles));
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={[styles.title, { color: text }]}>Your matches</Text>
      {error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={ranked}
        keyExtractor={(r) => r.profile.id}
        refreshing={refreshing}
        onRefresh={onRefresh}
       ListEmptyComponent={
  <Text style={{ color: sub }}>
    {error ? '' : 'No other profiles yet.'}
  </Text>
}
        renderItem={({ item }) => (
          <View style={[styles.card, { borderColor: border }]}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: text }]}>
                  {item.profile.name}
                  {item.profile.age ? `, ${item.profile.age}` : ''}
                </Text>
                {item.completeness < 0.6 && (
                  <Text style={{ color: sub, fontSize: 12 }}>Incomplete profile</Text>
                )}
              </View>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: scoreColor(item.score, item.dealbreaker) },
                ]}
              >
                <Text style={styles.badgeText}>{item.score}%</Text>
              </View>
            </View>

            {item.dealbreaker && (
              <Text style={styles.warn}>⚠ Dealbreaker found</Text>
            )}
            {item.reasons.map((r, i) => (
              <Text key={i} style={{ color: sub, marginTop: 2 }}>
                • {r}
              </Text>
            ))}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  card: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  name: { fontSize: 18, fontWeight: '600' },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  badgeText: { color: '#fff', fontWeight: '700' },
  warn: { color: '#d9534f', fontWeight: '600', marginBottom: 4 },
  error: { color: '#d9534f', marginBottom: 10 },
});