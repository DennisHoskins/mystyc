import PageTransition from '@/components/ui/layout/transition/PageTransition';
import AccountPage from '@/components/mystyc/pages/account/AccountPage';

export default function Page() {
  return (
    <PageTransition>
      <AccountPage />
    </PageTransition>
  );
}

