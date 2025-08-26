'use client'

import { AppUser } from '@/interfaces/app/app-user.interface';
import OnboardPage from './pages/onboard/OnboardPage';
import HomePage from './pages/home/HomePage';

export default function Mystyc({ user } : { user: AppUser }) {

console.log(user);

  return (
    <>
      {user.isOnboard ? <HomePage user={user} /> : <OnboardPage user={user} />}
    </>
  );
}
