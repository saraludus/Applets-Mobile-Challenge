
import { NativeTabs } from 'expo-router/native-tabs';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{
        selected: { color: colors.text },
      }}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>
          Accueil
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="explore">
        <NativeTabs.Trigger.Label>
          Explorer
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

     
      <NativeTabs.Trigger name="budget-calculator">
        <NativeTabs.Trigger.Label>
          Budget
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="dollarsign.circle"
          md="account_balance_wallet"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="matching">
        <NativeTabs.Trigger.Label>
          Matching
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
