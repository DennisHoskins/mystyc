'use client';

import { useAuth } from '@/components/context/AuthContext';
import HeaderPublic from './HeaderPublic';
import HeaderUser from './HeaderUser';

export default function Header() {
  const { user } = useAuth();
  return user ? <HeaderUser /> : <HeaderPublic />;
}