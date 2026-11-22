
import { useLanguage } from '@/lib/language';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Connection = {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  response_seen_at: string | null;
};

type RoommateName = {
  user_id: string;
  first_name: string;
};

const C = {
  background: '#FFF8F1',
  card: '#FFFCF8',
  primary: '#B65C48',
  dark: '#33221F',
  muted: '#806B65',
  border: '#E9D5CC',
  soft: '#F8E9DF',
  green: '#4F8A65',
};

export default function NotificationsScreen() {
  const { language } = useLanguage();
  const fr = language === 'fr';
  const insets = useSafeAreaInsets();

  const [userId, setUserId] = useState('');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [respondingTo, setRespondingTo] = useState<string | null>(null);

  const loadConnections = useCallback(async (isActive: () => boolean) => {
    try {
      if (isActive()) {
        setLoading(true);
        setErrorMessage('');
      }

      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) {
        throw new Error('You must be signed in.');
      }

      const currentUserId = authData.user.id;

      const { data, error } = await supabase
        .from('roommate_connections')
        .select(
          'id, sender_id, receiver_id, status, created_at, response_seen_at'
        )
        .or(
          `sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`
        )
        .order('created_at', { ascending: false });

      if (error) throw error;

      const requests = (data ?? []) as Connection[];

      if (!isActive()) return;

      setUserId(currentUserId);
      setConnections(requests);

      // Find the names of the other users.
      const otherUserIds = [
        ...new Set(
          requests.map((request) =>
            request.sender_id === currentUserId
              ? request.receiver_id
              : request.sender_id
          )
        ),
      ];

      if (otherUserIds.length === 0) {
        setNames({});
      } else {
        const { data: profiles, error: profileError } =
          await supabase
            .from('roommate_profiles')
            .select('user_id, first_name')
            .in('user_id', otherUserIds);

        if (profileError) {
          console.warn('Unable to load names:', profileError.message);
        }

        const nameMap: Record<string, string> = {};

        ((profiles ?? []) as RoommateName[]).forEach((profile) => {
          nameMap[profile.user_id] = profile.first_name;
        });

        if (isActive()) {
          setNames(nameMap);
        }
      }

      // Once the sender opens this screen, mark responses as seen.
      const unseenIds = requests
        .filter(
          (request) =>
            request.sender_id === currentUserId &&
            (request.status === 'accepted' ||
              request.status === 'declined') &&
            request.response_seen_at === null
        )
        .map((request) => request.id);

      if (unseenIds.length > 0 && isActive()) {
        const seenAt = new Date().toISOString();

        const { data: markedRequests, error: seenError } =
          await supabase
            .from('roommate_connections')
            .update({ response_seen_at: seenAt })
            .eq('sender_id', currentUserId)
            .in('id', unseenIds)
            .is('response_seen_at', null)
            .select('id');

        if (seenError) {
          console.warn(
            'Unable to mark responses as seen:',
            seenError.message
          );
        } else if (isActive()) {
          const markedIds = new Set(
            (markedRequests ?? []).map((request) => request.id)
          );

          setConnections((previous) =>
            previous.map((request) =>
              markedIds.has(request.id)
                ? { ...request, response_seen_at: seenAt }
                : request
            )
          );
        }
      }
    } catch (error) {
      if (isActive()) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Unable to load notifications.'
        );
      }
    } finally {
      if (isActive()) {
        setLoading(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      loadConnections(() => active);

      return () => {
        active = false;
      };
    }, [loadConnections])
  );

  async function respondToRequest(
    connectionId: string,
    nextStatus: 'accepted' | 'declined'
  ) {
    if (respondingTo !== null) return;

    setRespondingTo(connectionId);

    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) {
        throw new Error('You must be signed in.');
      }

      const { data, error } = await supabase
        .from('roommate_connections')
        .update({ status: nextStatus })
        .eq('id', connectionId)
        .eq('receiver_id', authData.user.id)
        .eq('status', 'pending')
        .select('id')
        .single();

      if (error) throw error;
      if (!data) throw new Error('Request could not be updated.');

      setConnections((previous) =>
        previous.map((request) =>
          request.id === connectionId
            ? { ...request, status: nextStatus }
            : request
        )
      );

      Alert.alert(
        nextStatus === 'accepted'
          ? fr ? 'Demande acceptée !' : 'Request accepted!'
          : fr ? 'Demande refusée' : 'Request declined',
        nextStatus === 'accepted'
          ? fr
            ? 'Vous êtes maintenant connectés.'
            : 'You are now connected.'
          : fr
            ? 'La demande a été refusée.'
            : 'The request was declined.'
      );
    } catch (error) {
      Alert.alert(
        fr ? 'Erreur' : 'Error',
        error instanceof Error
          ? error.message
          : 'Unable to update request.'
      );
    } finally {
      setRespondingTo(null);
    }
  }

  const incoming = connections.filter(
    (request) =>
      request.receiver_id === userId &&
      request.status === 'pending'
  );

  const outgoing = connections.filter(
    (request) => request.sender_id === userId
  );

  const accepted = connections.filter(
    (request) => request.status === 'accepted'
  );

  function otherPersonName(request: Connection) {
    const otherId =
      request.sender_id === userId
        ? request.receiver_id
        : request.sender_id;

    return names[otherId] || (fr ? 'Un colocataire' : 'A roommate');
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel={fr ? 'Retour' : 'Back'}
        >
          <Ionicons name="arrow-back" size={23} color={C.primary} />
        </Pressable>

        <Text style={styles.title}>Notifications</Text>

        <Pressable
          onPress={() => loadConnections(() => true)}
          style={styles.iconButton}
          disabled={loading || respondingTo !== null}
          accessibilityRole="button"
          accessibilityLabel={fr ? 'Actualiser' : 'Refresh'}
        >
          <Ionicons name="refresh-outline" size={22} color={C.primary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator
            color={C.primary}
            size="large"
            style={{ marginTop: 30 }}
          />
        ) : errorMessage ? (
          <View style={styles.card}>
            <Text style={styles.name}>
              {fr ? 'Erreur de chargement' : 'Loading error'}
            </Text>
            <Text style={styles.description}>{errorMessage}</Text>
          </View>
        ) : (
          <>
            {/* RECEIVED REQUESTS */}
            <Text style={styles.sectionTitle}>
              {fr ? 'Demandes reçues' : 'Received requests'}
              {' '}({incoming.length})
            </Text>

            {incoming.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons
                  name="notifications-outline"
                  size={34}
                  color={C.primary}
                />
                <Text style={styles.description}>
                  {fr
                    ? 'Aucune nouvelle demande.'
                    : 'No new requests.'}
                </Text>
              </View>
            ) : (
              incoming.map((request) => (
                <View key={request.id} style={styles.card}>
                  <View style={styles.personRow}>
                    <View style={styles.avatar}>
                      <Ionicons
                        name="person-outline"
                        size={24}
                        color={C.primary}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.name}>
                        {otherPersonName(request)}
                      </Text>
                      <Text style={styles.description}>
                        {fr
                          ? 'Souhaite se connecter avec vous'
                          : 'Wants to connect with you'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.actions}>
                    <Pressable
                      style={[
                        styles.acceptButton,
                        respondingTo !== null && styles.disabled,
                      ]}
                      disabled={respondingTo !== null}
                      onPress={() =>
                        respondToRequest(request.id, 'accepted')
                      }
                    >
                      <Text style={styles.acceptText}>
                        {respondingTo === request.id
                          ? '...'
                          : fr ? 'Accepter' : 'Accept'}
                      </Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.declineButton,
                        respondingTo !== null && styles.disabled,
                      ]}
                      disabled={respondingTo !== null}
                      onPress={() =>
                        respondToRequest(request.id, 'declined')
                      }
                    >
                      <Text style={styles.declineText}>
                        {fr ? 'Refuser' : 'Decline'}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ))
            )}

            {/* RESPONSES TO SENT REQUESTS */}
            <Text style={[styles.sectionTitle, styles.extraSpace]}>
              {fr ? 'Mes demandes envoyées' : 'My sent requests'}
              {' '}({outgoing.length})
            </Text>

            {outgoing.length === 0 ? (
              <Text style={styles.emptyText}>
                {fr
                  ? "Vous n'avez envoyé aucune demande."
                  : "You haven't sent any requests."}
              </Text>
            ) : (
              outgoing.map((request) => {
                const isAccepted = request.status === 'accepted';
                const isDeclined = request.status === 'declined';

                return (
                  <View key={request.id} style={styles.card}>
                    <View style={styles.personRow}>
                      <View style={styles.avatar}>
                        <Ionicons
                          name={
                            isAccepted
                              ? 'checkmark-circle-outline'
                              : isDeclined
                                ? 'close-circle-outline'
                                : 'time-outline'
                          }
                          size={25}
                          color={isAccepted ? C.green : C.primary}
                        />
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text style={styles.name}>
                          {otherPersonName(request)}
                        </Text>
                        <Text
                          style={[
                            styles.description,
                            isAccepted && { color: C.green },
                          ]}
                        >
                          {isAccepted
                            ? fr
                              ? 'A accepté votre demande !'
                              : 'Accepted your request!'
                            : isDeclined
                              ? fr
                                ? 'A refusé votre demande.'
                                : 'Declined your request.'
                              : fr
                                ? 'Demande en attente'
                                : 'Request pending'}
                        </Text>
                      </View>

                      <Ionicons
                        name={
                          isAccepted
                            ? 'checkmark-circle'
                            : isDeclined
                              ? 'close-circle'
                              : 'time'
                        }
                        size={22}
                        color={isAccepted ? C.green : C.muted}
                      />
                    </View>
                  </View>
                );
              })
            )}

            {/* ACCEPTED CONNECTIONS */}
            <Text style={[styles.sectionTitle, styles.extraSpace]}>
              {fr ? 'Mes connexions' : 'My connections'}
              {' '}({accepted.length})
            </Text>

            {accepted.length === 0 ? (
              <Text style={styles.emptyText}>
                {fr
                  ? 'Vos connexions acceptées apparaîtront ici.'
                  : 'Your accepted connections will appear here.'}
              </Text>
            ) : (
              accepted.map((request) => (
                <View key={request.id} style={styles.connectedCard}>
                  <View style={styles.avatar}>
                    <Ionicons
                      name="person-outline"
                      size={23}
                      color={C.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>
                      {otherPersonName(request)}
                    </Text>
                    <Text style={[styles.description, { color: C.green }]}>
                      {fr ? 'Connexion acceptée' : 'Connected'}
                    </Text>
                  </View>
                  <Ionicons
                    name="checkmark-circle"
                    size={23}
                    color={C.green}
                  />
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.background,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  iconButton: {
    height: 44,
    width: 44,
    borderRadius: 22,
    backgroundColor: C.card,
    borderColor: C.border,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 23,
    fontWeight: '800',
    color: C.dark,
  },
  content: {
    paddingBottom: 70,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: C.dark,
    marginBottom: 14,
  },
  extraSpace: {
    marginTop: 26,
  },
  card: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: C.dark,
  },
  description: {
    fontSize: 12,
    lineHeight: 18,
    color: C.muted,
    marginTop: 5,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 17,
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 13,
    alignItems: 'center',
    borderRadius: 11,
    backgroundColor: C.primary,
  },
  acceptText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  declineButton: {
    flex: 1,
    paddingVertical: 13,
    alignItems: 'center',
    borderRadius: 11,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: '#FFFFFF',
  },
  declineText: {
    color: C.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  disabled: {
    opacity: 0.5,
  },
  connectedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 15,
    marginBottom: 10,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 24,
    gap: 10,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
    borderRadius: 16,
  },
  emptyText: {
    color: C.muted,
    fontSize: 13,
    lineHeight: 20,
    marginVertical: 8,
  },
});
