import { App } from '@/interfaces/app.interface';

import HeaderUser from '@/components/layout/header/HeaderUser';
import FooterUser from '@/components/layout/footer/FooterUser';

export default function MystycLayout({ app, children }: { app : App | null, children: React.ReactNode }) {
  if (!app) {
    return null;
  }

  return (
    <>
      <HeaderUser />
        {children}
      <FooterUser />
    </>
  );
}
