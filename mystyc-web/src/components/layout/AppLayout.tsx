'use client';

import { ServerUser } from '@/server/getUser';

import { BusyProvider } from '@/components/context/BusyContext';
import { AppProvider } from '@/components/context/AppContext';

import Header from './header/Header';
import MainWrapper from '@/components/layout/MainWrapper';
import Footer from './footer/Footer';
import ServerLogoutPage from '../auth/ServerLogoutForm';

interface AppLayoutProps {
  children: React.ReactNode;
  user: ServerUser | null;
}

export default function AppLayout({ children, user }: AppLayoutProps) {
  return (
    <BusyProvider>
      <AppProvider user={user && user.user}>
        <Header user={user && user.user} />
        <MainWrapper>
          {(user && !user.user && user.authenticated) ? <ServerLogoutPage /> : children}
        </MainWrapper>              
        <Footer user={user && user.user} />
      </AppProvider>
    </BusyProvider>
  );
}
