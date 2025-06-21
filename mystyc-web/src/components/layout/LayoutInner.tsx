'use client';

import { usePathname } from 'next/navigation';
import StateTransition from '@/components/transition/StateTransition';
import PageTransition from '@/components/transition/PageTransition';
import WebsiteHeader from './header/WebsiteHeader';
import AppHeader from './header/AppHeader';
import Main from '@/components/Main';
import WebsiteFooter from './footer/WebsiteFooter';
import AppFooter from './footer/AppFooter';

export default function LayoutInner({
  children,
  isWebsite,
}: {
  children: React.ReactNode;
  isWebsite: boolean;
}) {
  const pathname = usePathname();

  const Header = isWebsite ? WebsiteHeader : AppHeader;
  const Footer = isWebsite ? WebsiteFooter : AppFooter;

  return (
    <StateTransition isWebsite={isWebsite}>
      <Header />
      <PageTransition pathname={pathname}>
        <Main>{children}</Main>
      </PageTransition>
      <Footer />
    </StateTransition>
  );
}