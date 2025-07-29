'use client';

import { AppUser } from '@/interfaces/app/app-user.interface';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';
import Footer from "../ui/layout/Footer";

export default function MystycFooter({ user } : { user: AppUser }) {
  const router = useTransitionRouter();

  const handleAdminClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/admin')    
  }

  return (
    <Footer>
      {user.isAdmin && (
        <>
          {' · '}
          <a            
            href="/admin"
            onClick={handleAdminClick}
            className="ml-1 underline hover:text-gray-700"
          >
            Admin
          </a>
        </>
      )}
    </Footer>
  );
}
