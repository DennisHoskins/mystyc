import HeaderUser from '@/components/layout/header/HeaderUser';
import FooterUser from '@/components/layout/footer/FooterUser';

export default function MystycLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HeaderUser />
        {children}
      <FooterUser />
    </>
  );
}
