'use client'

import { useUser } from '@/components/ui/layout/context/AppContext';
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
        className="ml-1 underline hover:text-gray-700"
      >
        home
      </a>
    </Footer>
  );
}
