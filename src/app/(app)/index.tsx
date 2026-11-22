
import { useLanguage } from '@/lib/language';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const C = {
  bg: '#FFF8F1',
  primary: '#B65C48',
  dark: '#33221F',
  muted: '#806B65',
  card: '#FFFCF8',
  border: '#E9D5CC',
  soft: '#F8E9DF',
  white: '#FFFFFF',
};

const translations = {
  fr: {
    hello: 'Bonjour',
    tagline: 'Trouvez votre prochain chez-vous à Montréal.',
    question: 'Que recherchez-vous ?',
    roommates: 'Colocataires',
    roommatesDesc: 'Trouvez une personne compatible avec votre mode de vie.',
    apartments: 'Logements',
    apartmentsDesc: 'Découvrez des appartements à Montréal.',
    budget: 'Mon budget',
    budgetDesc: 'Estimez vos dépenses par personne.',
    city: 'Montréal, Québec',
    profile: 'Ouvrir mon profil',
  },
  en: {
    hello: 'Hello',
    tagline: 'Find your next home in Montreal.',
    question: 'What are you looking for?',
    roommates: 'Roommates',
    roommatesDesc: 'Find someone compatible with your lifestyle.',
    apartments: 'Apartments',
    apartmentsDesc: 'Discover apartments in Montreal.',
    budget: 'My budget',
    budgetDesc: 'Estimate your monthly cost per person.',
    city: 'Montreal, Quebec',
    profile: 'Open my profile',
  },
};

type FeatureProps = {
  icon: 'people-outline' | 'home-outline';
  title: string;
  description: string;
  onPress: () => void;
  width: '48%' | '100%';
  featured?: boolean;
};

function FeatureCard({
  icon,
  title,
  description,
  onPress,
  width,
  featured = false,
}: FeatureProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [
        styles.featureCard,
        { width },
        featured && styles.featuredCard,
        pressed && styles.pressed,
      ]}
    >
      <View
        style={[
          styles.featureIcon,
          featured && styles.featuredIcon,
        ]}
      >
        <Ionicons
          name={icon}
          size={24}
          color={featured ? C.white : C.primary}
        />
      </View>

      <View style={styles.featureText}>
        <Text
          style={[
            styles.featureTitle,
            featured && styles.featuredText,
          ]}
        >
          {title}
        </Text>

        <Text
          style={[
            styles.featureDescription,
            featured && styles.featuredDescription,
          ]}
        >
          {description}
        </Text>
      </View>

      <Ionicons
        name="arrow-forward"
        size={19}
        color={featured ? C.white : C.primary}
        style={styles.featureArrow}
      />
    </Pressable>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { language } = useLanguage();

  const t = translations[language];

  const [firstName, setFirstName] = useState('');

  const cardWidth: '48%' | '100%' =
    width >= 350 ? '48%' : '100%';

  useEffect(() => {
    let active = true;

    async function loadName() {
      const { data } = await supabase.auth.getUser();
      if (!active || !data.user) return;

      const user = data.user;
      const metadata = user.user_metadata || {};

      const rawName =
        metadata.first_name ||
        metadata.display_name ||
        metadata.full_name ||
        metadata.name ||
        user.email?.split('@')[0] ||
        '';

      if (typeof rawName === 'string') {
        const first = rawName.trim().split(/\s+/)[0];

        const formatted = first
          ? first.charAt(0).toUpperCase() + first.slice(1)
          : '';

        setFirstName(formatted);
      }
    }

    loadName();

    return () => {
      active = false;
    };
  }, []);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingTop: insets.top + 12,
          paddingBottom: 115,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>

        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.brand}>
            <View style={styles.logo}>
              <Ionicons
                name="home-outline"
                size={24}
                color={C.white}
              />
            </View>

            <View>
              <Text style={styles.brandTitle}>
                Notre Coloc
              </Text>
              <Text style={styles.location}>
                {t.city}
              </Text>
            </View>
          </View>

          <Pressable
            style={styles.profileButton}
            onPress={() => router.push('/profile')}
            accessibilityRole="button"
            accessibilityLabel={t.profile}
          >
            <Ionicons
              name="person-outline"
              size={22}
              color={C.primary}
            />
          </Pressable>
        </View>

        {/* GREETING */}
        <View style={styles.welcome}>
          <Text style={styles.greeting}>
            {t.hello}{firstName ? `, ${firstName}` : ''}
          </Text>

          <Text style={styles.tagline}>
            {t.tagline}
          </Text>
        </View>

        {/* MAIN ACTIONS */}
        <Text style={styles.sectionTitle}>
          {t.question}
        </Text>

        <View style={styles.grid}>
          <FeatureCard
            icon="people-outline"
            title={t.roommates}
            description={t.roommatesDesc}
            onPress={() => router.push('/explore?section=colocs')}
            width={cardWidth}
            featured
          />

          <FeatureCard
            icon="home-outline"
            title={t.apartments}
            description={t.apartmentsDesc}
            onPress={() => router.push('/explore?section=logements')}
            width={cardWidth}
          />
        </View>

        {/* BUDGET SHORTCUT */}
        <Pressable
          style={({ pressed }) => [
            styles.budgetCard,
            pressed && styles.pressed,
          ]}
          onPress={() => router.push('/budget-calculator')}
          accessibilityRole="button"
          accessibilityLabel={t.budget}
        >
          <View style={styles.budgetIcon}>
            <Ionicons
              name="wallet-outline"
              size={22}
              color={C.primary}
            />
          </View>

          <View style={styles.budgetText}>
            <Text style={styles.budgetTitle}>
              {t.budget}
            </Text>
            <Text style={styles.budgetDescription}>
              {t.budgetDesc}
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={22}
            color={C.primary}
          />
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scrollContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 780,
  },
  pressed: {
    opacity: 0.77,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 28,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    flexShrink: 1,
  },
  logo: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: C.dark,
  },
  location: {
    fontSize: 12,
    color: C.muted,
    marginTop: 3,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  welcome: {
    backgroundColor: C.soft,
    padding: 20,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: C.dark,
    marginBottom: 7,
  },
  tagline: {
    fontSize: 14,
    lineHeight: 21,
    color: C.muted,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: C.dark,
    marginBottom: 15,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 13,
  },

  featureCard: {
    minHeight: 192,
    borderRadius: 18,
    padding: 16,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
  },
  featuredCard: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  featureIcon: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: C.soft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  featuredIcon: {
    backgroundColor: '#FFFFFF25',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
    color: C.dark,
    marginBottom: 7,
  },
  featureDescription: {
    fontSize: 12,
    lineHeight: 17,
    color: C.muted,
  },
  featuredText: {
    color: C.white,
  },
  featuredDescription: {
    color: '#FFF0E8',
  },
  featureArrow: {
    alignSelf: 'flex-end',
    marginTop: 12,
  },

  budgetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    gap: 13,
    minHeight: 90,
  },
  budgetIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: C.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetText: {
    flex: 1,
  },
  budgetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: C.dark,
    marginBottom: 4,
  },
  budgetDescription: {
    fontSize: 12,
    lineHeight: 18,
    color: C.muted,
  },
});
