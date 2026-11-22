import { createListing } from "@/lib/listings";
import { useLanguage } from "@/lib/language";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const C = {
  bg: "#FFF8F1",
  primary: "#B65C48",
  dark: "#33221F",
  muted: "#806B65",
  border: "#E9D5CC",
  white: "#FFFFFF",
};

const fallbackImage =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900";

const translations = {
  fr: {
    heading: "Ajouter un logement",
    title: "Titre de l'annonce",
    titlePlaceholder: "Ex. Chambre lumineuse à louer",
    neighborhood: "Quartier",
    neighborhoodPlaceholder: "Ex. Rosemont",
    rent: "Loyer mensuel ($)",
    bedrooms: "Nombre de chambres",
    image: "URL de l'image (facultatif)",
    publish: "Publier mon logement",
    publishing: "Publication...",
    required: "Veuillez remplir tous les champs obligatoires.",
    invalid: "Veuillez entrer un loyer et un nombre de chambres valides.",
    success: "Votre logement a été publié !",
    error: "Impossible de publier le logement.",
    back: "Retour",
  },
  en: {
    heading: "Add an apartment",
    title: "Listing title",
    titlePlaceholder: "E.g. Bright room for rent",
    neighborhood: "Neighborhood",
    neighborhoodPlaceholder: "E.g. Rosemont",
    rent: "Monthly rent ($)",
    bedrooms: "Number of bedrooms",
    image: "Image URL (optional)",
    publish: "Publish listing",
    publishing: "Publishing...",
    required: "Please fill in all required fields.",
    invalid: "Please enter a valid rent and bedroom count.",
    success: "Your apartment has been published!",
    error: "Unable to publish the apartment.",
    back: "Back",
  },
};

export default function AddListingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language } = useLanguage();
  const t = translations[language];

  const [title, setTitle] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [rent, setRent] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit() {
    if (submitting) return;

    if (!title.trim() || !neighborhood.trim() || !rent || !bedrooms) {
      setMessage(t.required);
      return;
    }

    const rentNumber = Number(rent);
    const bedroomsNumber = Number(bedrooms);

    if (
      !Number.isInteger(rentNumber) ||
      rentNumber <= 0 ||
      !Number.isInteger(bedroomsNumber) ||
      bedroomsNumber <= 0
    ) {
      setMessage(t.invalid);
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      await createListing({
        title,
        neighborhood,
        rent: rentNumber,
        bedrooms: bedroomsNumber,
        imageUrl: imageUrl.trim() || fallbackImage,
      });

      if (Platform.OS !== "web") {
        Alert.alert(t.success);
      }

      router.replace("/(app)/explore?section=logements" as any);
    } catch (error) {
      console.error("Failed to publish listing:", error);
      setMessage(t.error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Ionicons name="arrow-back" size={20} color={C.primary} />
          <Text style={styles.backText}>{t.back}</Text>
        </Pressable>

        <Text style={styles.heading}>{t.heading}</Text>

        <Text style={styles.label}>{t.title}</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder={t.titlePlaceholder}
          placeholderTextColor={C.muted}
          maxLength={100}
        />

        <Text style={styles.label}>{t.neighborhood}</Text>
        <TextInput
          style={styles.input}
          value={neighborhood}
          onChangeText={setNeighborhood}
          placeholder={t.neighborhoodPlaceholder}
          placeholderTextColor={C.muted}
          maxLength={80}
        />

        <Text style={styles.label}>{t.rent}</Text>
        <TextInput
          style={styles.input}
          value={rent}
          onChangeText={setRent}
          keyboardType="number-pad"
          placeholder="850"
          placeholderTextColor={C.muted}
        />

        <Text style={styles.label}>{t.bedrooms}</Text>
        <TextInput
          style={styles.input}
          value={bedrooms}
          onChangeText={setBedrooms}
          keyboardType="number-pad"
          placeholder="2"
          placeholderTextColor={C.muted}
        />

        <Text style={styles.label}>{t.image}</Text>
        <TextInput
          style={styles.input}
          value={imageUrl}
          onChangeText={setImageUrl}
          placeholder="https://..."
          placeholderTextColor={C.muted}
          autoCapitalize="none"
          keyboardType="url"
        />

        {!!message && <Text style={styles.message}>{message}</Text>}

        <Pressable
          style={[styles.button, submitting && styles.disabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={C.white} />
          ) : (
            <Text style={styles.buttonText}>{t.publish}</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  content: { paddingHorizontal: 22, gap: 12 },
  back: { flexDirection: "row", alignItems: "center", gap: 8 },
  backText: { color: C.primary, fontWeight: "600" },
  heading: {
    fontSize: 27,
    fontWeight: "800",
    color: C.dark,
    marginVertical: 16,
  },
  label: { fontSize: 14, fontWeight: "600", color: C.dark },
  input: {
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.white,
    borderRadius: 12,
    padding: 14,
    color: C.dark,
    fontSize: 16,
  },
  message: { color: C.primary, marginTop: 8 },
  button: {
    backgroundColor: C.primary,
    padding: 17,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 14,
  },
  buttonText: { color: C.white, fontWeight: "700", fontSize: 16 },
  disabled: { opacity: 0.6 },
});
