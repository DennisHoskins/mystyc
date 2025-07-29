import PageTransition from '@/components/ui/layout/transition/PageTransition';
import Heading from '@/components/ui/Heading';

export default function SettingsPage() {
  return (
    <PageTransition>
      <Heading level={2} className="mt-8 text-center">Settings</Heading>
    </PageTransition>
  );
}

