
import AppTabs from '@/components/app-tabs';
import { LanguageProvider } from '@/lib/language';

export default function AppLayout() {
  return (
    <LanguageProvider>
      <AppTabs />
    </LanguageProvider>
  );
}
