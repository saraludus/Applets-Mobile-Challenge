import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type Listing = {
  id: string;
  title: string;
  neighborhood: string;
  rent: number;
  bedrooms: number;
  imageUrl: string;
  isDemo: boolean;
};

type ListingCardProps = {
  listing: Listing;
  language: "fr" | "en";
  onPress?: () => void;
};

const C = {
  primary: "#B65C48",
  dark: "#33221F",
  muted: "#806B65",
  card: "#FFFCF8",
  border: "#E9D5CC",
  soft: "#F8E9DF",
};

export default function ListingCard({
  listing,
  language,
  onPress,
}: ListingCardProps) {
  const fr = language === "fr";

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : undefined}
      style={({ pressed }) => [
        styles.card,
        pressed && onPress && styles.pressed,
      ]}
    >
      <Image
        source={{ uri: listing.imageUrl }}
        style={styles.image}
        contentFit="cover"
        transition={200}
      />

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2}>
            {listing.title}
          </Text>

          <View style={styles.priceContainer}>
            <Text style={styles.rent}>
              {listing.rent.toLocaleString("fr-CA")} $
            </Text>
            <Text style={styles.month}>{fr ? "/mois" : "/month"}</Text>
          </View>
        </View>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={15} color={C.muted} />
          <Text style={styles.location}>{listing.neighborhood}, Montréal</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.bedroomsRow}>
            <Ionicons name="bed-outline" size={17} color={C.muted} />
            <Text style={styles.bedrooms}>
              {listing.bedrooms} {fr ? "chambres" : "bedrooms"}
            </Text>
          </View>

          {listing.isDemo && (
            <View style={styles.demoBadge}>
              <Text style={styles.demoText}>{fr ? "Démo" : "Demo"}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 16,
  },
  pressed: {
    opacity: 0.85,
  },
  image: {
    width: "100%",
    height: 190,
    backgroundColor: C.soft,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: C.dark,
    flex: 1,
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  rent: {
    fontSize: 19,
    fontWeight: "800",
    color: C.primary,
  },
  month: {
    fontSize: 12,
    color: C.muted,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  location: {
    fontSize: 13,
    color: C.muted,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bedroomsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  bedrooms: {
    fontSize: 13,
    color: C.muted,
  },
  demoBadge: {
    backgroundColor: C.soft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  demoText: {
    fontSize: 11,
    fontWeight: "700",
    color: C.primary,
  },
});
