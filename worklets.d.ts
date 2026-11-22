declare module 'react-native-worklets' {
  export function scheduleOnRN<Args extends unknown[], Return>(
    fn: (...args: Args) => Return,
    ...args: Args
  ): void;
}