import { useApp } from '@/components/context/AppContext';
import FooterPublic from './FooterPublic';
import FooterUser from './FooterUser';

export default function Footer() {
  const { app } = useApp();

  return (
    <>
      {app && app.user ? (
        <FooterUser />
      ) : (
        <FooterPublic />
      )}
    </>
  );
}