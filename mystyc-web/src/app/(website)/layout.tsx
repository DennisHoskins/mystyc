import HeaderPublic from '@/components/layout/header/HeaderPublic';
import FooterPublic from '@/components/layout/footer/FooterPublic';

interface WebsiteLayoutProps {
  children: React.ReactNode;
}

export default function WebsiteLayout({ children }: WebsiteLayoutProps) {
  return (
    <>
      <HeaderPublic />
        {children}
      <FooterPublic />
    </>
  );
}