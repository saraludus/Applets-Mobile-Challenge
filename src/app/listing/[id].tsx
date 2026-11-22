import type { Listing } from "@/components/logements/ListingCard";
import { useLanguage } from "@/lib/language";
import { fetchListingById } from "@/lib/listings";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const C = {
  bg: "#FFF8F1",
  primary: "#B65C48",
  dark: "#33221F",
  muted: "#806B65",
  card: "#FFFCF8",
  border: "#E9D5CC",
};

const translations = {
  fr: {
    back: "Retour",
    month: "/mois",
    bedrooms: "chambres",
    about: "À propos de ce logement",
    description: "Découvrez ce logement situé à Montréal.",
    demo: "Annonce de démonstration",
    notFound: "Logement introuvable.",
    loading: "Chargement du logement...",
    error: "Impossible de charger ce logement.",
  },
  en: {
    back: "Back",
    month: "/month",
    bedrooms: "bedrooms",
    about: "About this apartment",
    description: "Discover this apartment located in Montreal.",
    demo: "Demo listing",
    notFound: "Apartment not found.",
    loading: "Loading apartment...",
    error: "Unable to load this apartment.",
  },
};

export default function ListingDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language } = useLanguage();
  const t = translations[language];

  const { id } = useLocalSearchParams<{ id: string }>();

  const [result, setResult] = useState<{
    id: string;
    listing: Listing | null;
    error: boolean;
  } | null>(null);

  const loading = !!id && result?.id !== id;
  const error = result?.id === id && result.error;
  const listing = result?.id === id ? result.listing : null;

  useEffect(() => {
    if (!id) return;

    let active = true;

    async function loadListing() {
      try {
        const data = await fetchListingById(id);

        if (active) {
          setResult({
            id,
            listing: data,
            error: false,
          });
        }
      } catch (err) {
        console.error("Failed to load apartment:", err);

        if (active) {
          setResult({
            id,
            listing: null,
            error: true,
          });
        }
      }
    }

    loadListing();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading || error) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={styles.title}>{loading ? t.loading : t.error}</Text>

        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>{t.back}</Text>
        </Pressable>
      </View>
    );
  }

  if (!listing) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={styles.title}>{t.notFound}</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>{t.back}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 40,
        },
      ]}
    >
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={20} color={C.primary} />
        <Text style={styles.backText}>{t.back}</Text>
      </Pressable>

      <Image
        source={{ uri: listing.imageUrl }}
        style={styles.image}
        contentFit="cover"
      />

      <View style={styles.details}>
        <Text style={styles.title}>{listing.title}</Text>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={18} color={C.muted} />
          <Text style={styles.location}>{listing.neighborhood}, Montréal</Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.price}>
            {listing.rent.toLocaleString("fr-CA")} $
          </Text>
          <Text style={styles.month}>{t.month}</Text>
        </View>

        <View style={styles.bedroomsRow}>
          <Ionicons name="bed-outline" size={20} color={C.primary} />
          <Text style={styles.bedrooms}>
            {listing.bedrooms} {t.bedrooms}
          </Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>{t.about}</Text>
        <Text style={styles.description}>{t.description}</Text>

        {listing.isDemo && <Text style={styles.demo}>{t.demo}</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.bg,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    paddingHorizontal: 20,
    maxWidth: 780,
    width: "100%",
    alignSelf: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  backText: {
    fontSize: 15,
    fontWeight: "700",
    color: C.primary,
  },
  image: {
    width: "100%",
    height: 240,
    borderRadius: 18,
    backgroundColor: C.border,
  },
  details: {
    marginTop: 24,
    gap: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: C.dark,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  location: {
    fontSize: 15,
    color: C.muted,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  price: {
    fontSize: 27,
    fontWeight: "800",
    color: C.primary,
  },
  month: {
    fontSize: 14,
    color: C.muted,
  },
  bedroomsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bedrooms: {
    fontSize: 15,
    color: C.dark,
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: C.dark,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: C.muted,
  },
  demo: {
    fontSize: 12,
    color: C.muted,
    marginTop: 12,
  },
});
