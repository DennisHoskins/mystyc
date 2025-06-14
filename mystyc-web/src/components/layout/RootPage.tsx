'use client'

import { User } from '@/interfaces/user.interface';

import Mystyc from '@/app/(mystyc)/mystyc';
import Home from '@/app/(website)/home';

export default function Root({user}: { user: User | null }) {
  return (
    <>
      {user ? (
        <Mystyc />
      ) : (
        <Home />
      )}
    </>
  );
}