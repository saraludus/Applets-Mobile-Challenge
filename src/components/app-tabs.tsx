
import { useLanguage } from '@/lib/language';
import { NativeTabs } from 'expo-router/native-tabs';

const colors = {
  background: '#FFFCF8',
  primary: '#B65C48',
  inactive: '#806B65',
  indicator: '#F4C4B1',
};

export default function AppTabs() {
  const { language } = useLanguage();
  const fr = language === 'fr';

  return (
    <NativeTabs
      backgroundColor={colors.background}
      tintColor={colors.primary}
      indicatorColor={colors.indicator}
      labelStyle={{
        default: { color: colors.inactive },
        selected: { color: colors.primary },
      }}
    >
      {/* HOME */}
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>
          {fr ? 'Accueil' : 'Home'}
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="house"
          md="home"
        />
      </NativeTabs.Trigger>

      {/* EXPLORE */}
      <NativeTabs.Trigger name="explore">
        <NativeTabs.Trigger.Label>
          {fr ? 'Explorer' : 'Explore'}
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="magnifyingglass"
          md="search"
        />
      </NativeTabs.Trigger>

      {/* BUDGET */}
      <NativeTabs.Trigger name="budget-calculator">
        <NativeTabs.Trigger.Label>
          Budget
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="dollarsign.circle"
          md="account_balance_wallet"
        />
      </NativeTabs.Trigger>

      {/* PROFILE */}
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>
          {fr ? 'Profil' : 'Profile'}
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="person.crop.circle"
          md="person"
        />
      </NativeTabs.Trigger>

            {/* MATCHING - AVAILABLE BUT NOT SHOWN IN BOTTOM NAV */}
      <NativeTabs.Trigger name="matching" hidden />

      {/* NOTIFICATIONS - AVAILABLE BUT NOT SHOWN IN BOTTOM NAV */}
      <NativeTabs.Trigger name="notifications" hidden />
    </NativeTabs>
  );
}
