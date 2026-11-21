import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Keeps the initial server-rendered theme consistent
 * while allowing the browser to use the actual device theme.
 */
export function useColorScheme() {
  const hasHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    return colorScheme;
  }

  return 'light';
}
