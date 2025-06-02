'use client';

import { useAuth } from '@/components/context/AuthContext';
import FooterPublic from './FooterPublic';
import FooterUser from './FooterUser';

export default function Footer() {
  const { user } = useAuth();
  return user ? <FooterUser /> : <FooterPublic />;
}
