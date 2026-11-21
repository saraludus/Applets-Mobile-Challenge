
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Roomie 🌿</Text>
      <Text style={styles.subtitle}>Find your perfect roommate.</Text>

      <Pressable
        style={styles.button}
        onPress={() => router.push('/explore' as any)}
      >
        <Text style={styles.buttonText}>Explore roommates</Text>
      </Pressable>

      <Text style={styles.note}>Your home screen is working!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBEDB8',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#455230',
  },
  subtitle: {
    fontSize: 17,
    color: '#637545',
    marginTop: 10,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#637545',
    paddingVertical: 15,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  note: {
    marginTop: 25,
    color: '#455230',
  },
});
