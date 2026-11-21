
import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import LeaseAnalysisResults, {
    type LeaseIssue,
} from "../components/lease-analysis-results";

// Fictional data used only to test the interface.
const demoIssues: LeaseIssue[] = [
  {
    id: "1",
    title: "Dépôt de garantie",
    severity: "high",
    clause: "Le locataire doit verser un dépôt de garantie de 500 $.",
    explanation:
      "Au Québec, un propriétaire ne peut généralement pas exiger un dépôt de garantie. Cette clause pourrait être problématique.",
  },
  {
    id: "2",
    title: "Accès au logement",
    severity: "medium",
    clause:
      "Le propriétaire peut entrer dans le logement sans préavis.",
    explanation:
      "L'accès du propriétaire au logement est encadré par la loi. Cette clause devrait être vérifiée.",
  },
];

export default function LeaseAnalyzerScreen() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [showResults, setShowResults] = useState(false);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets.length > 0) {
        const file = result.assets[0];

        setFileName(file.name);
        setFileUri(file.uri);
        setMessage("");
        setShowResults(false);
      }
    } catch {
      setMessage("Erreur lors de la sélection du fichier.");
    }
  };

  const analyzeDocument = () => {
    if (!fileUri) {
      setMessage("Veuillez d'abord sélectionner un bail.");
      return;
    }

    // No real AI call yet.
    setMessage("");
    setShowResults(true);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>
        Analyse de bail 📄
      </Text>

      <Text style={styles.subtitle}>
        Téléversez votre contrat de location pour
        identifier les clauses potentiellement problématiques.
      </Text>

      <View style={styles.uploadCard}>
        <Text style={styles.icon}>📁</Text>

        <Text style={styles.uploadTitle}>
          Importer votre bail
        </Text>

        <Text style={styles.description}>
          Format accepté : PDF
        </Text>

        <Pressable
          style={styles.uploadButton}
          onPress={pickDocument}
        >
          <Text style={styles.uploadButtonText}>
            Choisir un fichier
          </Text>
        </Pressable>
      </View>

      {fileName && (
        <View style={styles.fileCard}>
          <Text style={styles.fileText}>
            ✅ Fichier sélectionné : {fileName}
          </Text>
        </View>
      )}

      <Pressable
        style={[
          styles.analyzeButton,
          !fileUri && styles.disabledButton,
        ]}
        onPress={analyzeDocument}
        disabled={!fileUri}
      >
        <Text style={styles.analyzeButtonText}>
          Afficher les résultats de démonstration
        </Text>
      </Pressable>

      {message !== "" && (
        <Text style={styles.message}>
          {message}
        </Text>
      )}

      {showResults && (
        <LeaseAnalysisResults
          issues={demoIssues}
          language="fr"
          isDemo
        />
      )}

      <Text style={styles.disclaimer}>
        Cette fonctionnalité est informative et ne
        remplace pas un avis juridique professionnel.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    padding: 20,
    paddingBottom: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1E293B",
    marginTop: 30,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    lineHeight: 24,
    marginBottom: 30,
  },
  uploadCard: {
    backgroundColor: "#FFFFFF",
    padding: 35,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
    alignItems: "center",
  },
  icon: {
    fontSize: 48,
    marginBottom: 15,
  },
  uploadTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 25,
    paddingVertical: 14,
    borderRadius: 10,
  },
  uploadButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  fileCard: {
    backgroundColor: "#DCFCE7",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  fileText: {
    color: "#166534",
    fontWeight: "500",
  },
  analyzeButton: {
    backgroundColor: "#1E293B",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 25,
  },
  disabledButton: {
    opacity: 0.5,
  },
  analyzeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  message: {
    fontSize: 15,
    color: "#2563EB",
    textAlign: "center",
    marginTop: 20,
  },
  disclaimer: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    marginTop: 25,
  },
});
