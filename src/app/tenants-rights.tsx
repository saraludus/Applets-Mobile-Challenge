import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const rights = [
  {
    title: 'Dépôt de garantie',
    description:
      'Au Québec, un propriétaire ne peut généralement pas exiger un dépôt de garantie en plus du premier mois de loyer.',
  },
  {
    title: 'Augmentation de loyer',
    description:
      'Le propriétaire doit respecter les règles et délais prévus pour modifier le loyer. Le locataire dispose de recours.',
  },
  {
    title: 'Réparations et entretien',
    description:
      'Le propriétaire doit maintenir le logement en bon état et effectuer les réparations qui lui incombent.',
  },
  {
    title: 'Respect de la vie privée',
    description:
      "Le propriétaire doit respecter les règles applicables avant d'entrer dans votre logement.",
  },
];

export default function TenantRightsScreen() {
  const openTAL = () => {
    Linking.openURL('https://www.tal.gouv.qc.ca/');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Droits des locataires 🏠</Text>

      <Text style={styles.subtitle}>Comprenez vos droits en tant que locataire au Québec.</Text>

      {rights.map((right) => (
        <View key={right.title} style={styles.card}>
          <Text style={styles.cardTitle}>{right.title}</Text>

          <Text style={styles.description}>{right.description}</Text>
        </View>
      ))}

      <Pressable style={styles.button} onPress={openTAL}>
        <Text style={styles.buttonText}>Consulter le TAL</Text>
      </Pressable>

      <Text style={styles.disclaimer}>
        Ces informations sont générales et ne remplacent pas un avis juridique.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 30,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 25,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#2563EB',
    padding: 17,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disclaimer: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 40,
  },
});
