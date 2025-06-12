import { useApp } from '@/components/context/AppContext';
import HeaderPublic from './HeaderPublic';
import HeaderUser from './HeaderUser';

export default function Header() {
  const { app } = useApp();

  return (
    <>
      {app && app.user ? (
        <HeaderUser />
      ) : (
        <HeaderPublic />
      )}
    </>
  );
}