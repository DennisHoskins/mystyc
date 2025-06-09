import { App } from '@/interfaces/app.interface';

import HeaderPublic from '@/components/layout/header/HeaderPublic';
import FooterPublic from '@/components/layout/footer/FooterPublic';

export default function WebsitecLayout({ app, children }: { app : App | null, children: React.ReactNode }) {
  if (app) {
    return null;
  }

  return (
    <>
      <HeaderPublic />
        {children}
      <FooterPublic />
    </>
  );
}