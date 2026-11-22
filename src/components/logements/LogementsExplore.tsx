import type { Listing } from "@/components/logements/ListingCard";
import ListingCard from "@/components/logements/ListingCard";
import { useLanguage } from "@/lib/language";
import { fetchListings } from "@/lib/listings";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
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
    title: "Explorer les logements",
    subtitle: "Trouvez votre prochain chez-vous à Montréal.",
    search: "Rechercher un quartier ou un logement...",
    allPrices: "Tous les prix",
    max800: "800 $ max",
    max1000: "1 000 $ max",
    neighborhood: "Quartier",
    allNeighborhoods: "Tous les quartiers",
    bedroomFilter: "Nombre de chambres",
    allBedrooms: "Toutes",
    results: "Logements disponibles",
    empty: "Aucun logement ne correspond à votre recherche.",
    demo: "Annonces de démonstration",
  },
  en: {
    title: "Explore apartments",
    subtitle: "Find your next home in Montreal.",
    search: "Search a neighborhood or apartment...",
    allPrices: "All prices",
    max800: "$800 max",
    max1000: "$1,000 max",
    neighborhood: "Neighborhood",
    allNeighborhoods: "All neighborhoods",
    bedroomFilter: "Number of bedrooms",
    allBedrooms: "All",
    results: "Available apartments",
    empty: "No apartments match your search.",
    demo: "Demo listings",
  },
};

export default function ExploreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language } = useLanguage();
  const t = translations[language];
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadListings() {
      try {
        const data = await fetchListings();

        if (active) {
          setListings(data);
        }
      } catch (err) {
        console.error("Failed to load listings:", err);

        if (active) {
          setError("Failed to load listings");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadListings();

    return () => {
      active = false;
    };
  }, []);
  const [search, setSearch] = useState("");
  const [maxRent, setMaxRent] = useState<number | null>(null);

  const [selectedNeighborhood, setSelectedNeighborhood] = useState<
    string | null
  >(null);

  const [minBedrooms, setMinBedrooms] = useState<number | null>(null);

  const filteredListings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return listings.filter((listing) => {
      const matchesSearch =
        listing.title.toLowerCase().includes(query) ||
        listing.neighborhood.toLowerCase().includes(query);

      const matchesRent = maxRent === null || listing.rent <= maxRent;

      const matchesNeighborhood =
        selectedNeighborhood === null ||
        listing.neighborhood === selectedNeighborhood;

      const matchesBedrooms =
        minBedrooms === null || listing.bedrooms >= minBedrooms;

      return (
        matchesSearch && matchesRent && matchesNeighborhood && matchesBedrooms
      );
    });
  }, [listings, search, maxRent, selectedNeighborhood, minBedrooms]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: 16,
          paddingBottom: insets.bottom + 110,
        },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.title}>{t.title}</Text>
        <Text style={styles.subtitle}>{t.subtitle}</Text>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={21} color={C.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder={t.search}
          placeholderTextColor={C.muted}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.filters}>
        {[
          { label: t.allPrices, value: null },
          { label: t.max800, value: 800 },
          { label: t.max1000, value: 1000 },
        ].map((filter) => {
          const selected = maxRent === filter.value;

          return (
            <Pressable
              key={filter.label}
              onPress={() => setMaxRent(filter.value)}
              style={[styles.filterButton, selected && styles.filterSelected]}
            >
              <Text
                style={[
                  styles.filterText,
                  selected && styles.filterTextSelected,
                ]}
              >
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.filterHeading}>{t.neighborhood}</Text>

      <View style={styles.filters}>
        {[
          { label: t.allNeighborhoods, value: null },
          ...Array.from(
            new Set(listings.map((listing) => listing.neighborhood)),
          ).map((neighborhood) => ({
            label: neighborhood,
            value: neighborhood,
          })),
        ].map((filter) => {
          const selected = selectedNeighborhood === filter.value;

          return (
            <Pressable
              key={filter.label}
              onPress={() => setSelectedNeighborhood(filter.value)}
              style={[styles.filterButton, selected && styles.filterSelected]}
            >
              <Text
                style={[
                  styles.filterText,
                  selected && styles.filterTextSelected,
                ]}
              >
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.filterHeading}>{t.bedroomFilter}</Text>

      <View style={styles.filters}>
        {[
          { label: t.allBedrooms, value: null },
          { label: "2+", value: 2 },
          { label: "3+", value: 3 },
          { label: "4+", value: 4 },
        ].map((filter) => {
          const selected = minBedrooms === filter.value;

          return (
            <Pressable
              key={filter.label}
              onPress={() => setMinBedrooms(filter.value)}
              style={[styles.filterButton, selected && styles.filterSelected]}
            >
              <Text
                style={[
                  styles.filterText,
                  selected && styles.filterTextSelected,
                ]}
              >
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t.results}</Text>
        <Text style={styles.count}>{filteredListings.length}</Text>
      </View>

      <Text style={styles.demoLabel}>{t.demo}</Text>

      {loading ? (
        <Text style={styles.empty}>
          {language === "fr"
            ? "Chargement des logements..."
            : "Loading apartments..."}
        </Text>
      ) : error ? (
        <Text style={styles.empty}>
          {language === "fr"
            ? "Impossible de charger les logements."
            : "Unable to load apartments."}
        </Text>
      ) : filteredListings.length === 0 ? (
        <Text style={styles.empty}>{t.empty}</Text>
      ) : (
        filteredListings.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            language={language}
            onPress={() =>
              router.push({
                pathname: "/listing/[id]",
                params: { id: listing.id },
              })
            }
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.bg,
  },
  content: {
    paddingHorizontal: 20,
    width: "100%",
    maxWidth: 780,
    alignSelf: "center",
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: C.dark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: C.muted,
    lineHeight: 21,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    paddingHorizontal: 15,
    height: 54,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    color: C.dark,
    fontSize: 14,
  },
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
    marginBottom: 28,
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
  },
  filterSelected: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: "600",
    color: C.dark,
  },
  filterTextSelected: {
    color: "#FFFFFF",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: C.dark,
  },
  count: {
    fontSize: 14,
    fontWeight: "700",
    color: C.primary,
  },
  demoLabel: {
    fontSize: 11,
    color: C.muted,
    marginBottom: 14,
  },
  empty: {
    textAlign: "center",
    color: C.muted,
    marginTop: 35,
    fontSize: 14,
  },
  filterHeading: {
    fontSize: 15,
    fontWeight: "700",
    color: C.dark,
    marginBottom: 10,
  },
});
