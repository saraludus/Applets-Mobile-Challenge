
import ColocsExplore from '@/components/colocs/ColocsExplore';
import LogementsExplore from '@/components/logements/LogementsExplore';
import { useLanguage } from '@/lib/language';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ExploreMode = 'logements' | 'colocs';

export default function ExploreScreen() {
  const { language } = useLanguage();
  const insets = useSafeAreaInsets();

  const router = useRouter();
  const { section } = useLocalSearchParams<{ section?: string }>();

  const [selectedMode, setSelectedMode] =
    useState<ExploreMode>('logements');

  const mode: ExploreMode =
    section === 'colocs' || section === 'logements'
      ? section
      : selectedMode;

  function setMode(nextMode: ExploreMode) {
    setSelectedMode(nextMode);
    router.setParams({ section: nextMode });
  }

  return (
    <View style={styles.screen}>
      {/* LOGEMENTS / COLOCS SWITCH */}
      <View
        style={[
          styles.switchArea,
          { paddingTop: insets.top + 8 },
        ]}
      >
        <View style={styles.switchContainer}>
          <Pressable
            onPress={() => setMode('logements')}
            style={[
              styles.switchButton,
              mode === 'logements' && styles.activeButton,
            ]}
          >
            <Ionicons
              name="home-outline"
              size={19}
              color={
                mode === 'logements'
                  ? '#FFFFFF'
                  : '#806B65'
              }
            />

            <Text
              style={[
                styles.switchText,
                mode === 'logements' && styles.activeText,
              ]}
            >
              {language === 'fr'
                ? 'Logements'
                : 'Apartments'}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setMode('colocs')}
            style={[
              styles.switchButton,
              mode === 'colocs' && styles.activeButton,
            ]}
          >
            <Ionicons
              name="people-outline"
              size={19}
              color={
                mode === 'colocs'
                  ? '#FFFFFF'
                  : '#806B65'
              }
            />

            <Text
              style={[
                styles.switchText,
                mode === 'colocs' && styles.activeText,
              ]}
            >
              {language === 'fr'
                ? 'Colocs'
                : 'Roommates'}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* CONTENT */}
      <View style={styles.content}>
        {mode === 'logements' ? (
          <LogementsExplore />
        ) : (
          <ColocsExplore />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFF8F1',
  },
  switchArea: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#FFF8F1',
  },
  switchContainer: {
    flexDirection: 'row',
    backgroundColor: '#F4E5DA',
    padding: 5,
    borderRadius: 16,
    gap: 5,
  },
  switchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
    borderRadius: 12,
  },
  activeButton: {
    backgroundColor: '#B65C48',
  },
  switchText: {
    color: '#806B65',
    fontSize: 14,
    fontWeight: '700',
  },
  activeText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
});
