
import {
    Linking,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

export type LeaseIssue = {
  id: string;
  title: string;
  severity: "high" | "medium" | "low";
  clause: string;
  explanation: string;
  sourceUrl?: string;
};

type Props = {
  issues: LeaseIssue[];
  language?: "fr" | "en";
  isDemo?: boolean;
};

export default function LeaseAnalysisResults({
  issues,
  language = "fr",
  isDemo = false,
}: Props) {
  const fr = language === "fr";

  const labels = {
    title: fr
      ? "Résultats de l'analyse"
      : "Analysis Results",

    demo: fr
      ? "Démonstration : résultats fictifs, aucune analyse IA effectuée."
      : "Demo: fictional results, no AI analysis performed.",

    noIssues: fr
      ? "Aucun problème signalé dans les résultats fournis. Cela ne garantit pas que le bail est conforme."
      : "No issues were reported in the supplied results. This does not guarantee the lease complies with the law.",

    high: fr ? "Risque élevé" : "High risk",
    medium: fr ? "À vérifier" : "Needs review",
    low: fr ? "Information" : "Information",

    clause: fr ? "Clause du bail" : "Lease clause",

    source: fr
      ? "Consulter la source"
      : "View legal source",

    disclaimer: fr
      ? "Ces informations sont fournies à titre indicatif et ne remplacent pas un avis juridique."
      : "This information is for informational purposes and does not replace legal advice.",
  };

  const severityColor = {
    high: "#DC2626",
    medium: "#D97706",
    low: "#2563EB",
  };

  const severityLabel = {
    high: labels.high,
    medium: labels.medium,
    low: labels.low,
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {labels.title}
      </Text>

      {isDemo && (
        <View style={styles.demoBox}>
          <Text style={styles.demo}>
            {labels.demo}
          </Text>
        </View>
      )}

      {issues.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.description}>
            {labels.noIssues}
          </Text>
        </View>
      ) : (
        issues.map((issue) => (
          <View key={issue.id} style={styles.card}>
            <Text style={styles.cardTitle}>
              {issue.title}
            </Text>

            <Text
              style={[
                styles.severity,
                {
                  color:
                    severityColor[issue.severity],
                },
              ]}
            >
              {severityLabel[issue.severity]}
            </Text>

            <Text style={styles.label}>
              {labels.clause}
            </Text>

            <Text style={styles.quote}>
              {issue.clause}
            </Text>

            <Text style={styles.description}>
              {issue.explanation}
            </Text>

            {issue.sourceUrl && (
              <Pressable
                accessibilityRole="link"
                onPress={() => {
                  if (issue.sourceUrl) {
                    Linking.openURL(issue.sourceUrl);
                  }
                }}
              >
                <Text style={styles.link}>
                  {labels.source} ↗
                </Text>
              </Pressable>
            )}
          </View>
        ))
      )}

      <Text style={styles.disclaimer}>
        {labels.disclaimer}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    gap: 14,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
  },

  demoBox: {
    backgroundColor: "#EFF6FF",
    padding: 12,
    borderRadius: 8,
  },

  demo: {
    fontSize: 14,
    color: "#1D4ED8",
    lineHeight: 21,
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 10,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
  },

  severity: {
    fontSize: 14,
    fontWeight: "bold",
  },

  label: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#475569",
  },

  quote: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#475569",
    backgroundColor: "#F1F5F9",
    padding: 12,
    borderRadius: 8,
    lineHeight: 21,
  },

  description: {
    fontSize: 15,
    lineHeight: 23,
    color: "#475569",
  },

  link: {
    color: "#2563EB",
    fontWeight: "bold",
    marginTop: 5,
  },

  disclaimer: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 19,
    marginBottom: 25,
  },
});
