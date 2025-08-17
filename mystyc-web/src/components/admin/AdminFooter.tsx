'use client'

import { useUser } from '@/components/ui/context/AppContext';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';
import Footer from "../ui/layout/Footer";

export default function AdminFooter() {
  const router = useTransitionRouter();
  const user = useUser();
  if (!user) {
    return;
  }

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/home')    
  }

  return (
    <Footer>
      {' · '}
      <a            
        href="/home"
        onClick={handleHomeClick}
        className="hover:text-gray-600"
      >
        home
      </a>
    </Footer>
  );
}
