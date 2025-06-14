'use client';

import { useState, useEffect } from 'react';

import { useApp } from '@/components/context/AppContext';
import { User } from '@/interfaces/user.interface';
import FooterPublic from './FooterPublic';
import FooterUser from './FooterUser';

export default function Footer({ user }: { user: User | null }) {
 const { app } = useApp();
 const [isHydrated, setIsHydrated] = useState(false);
 
 useEffect(() => {
   setIsHydrated(true);
 }, []);
 
 const currentUser = isHydrated ? (app?.user || null) : user;
 
 return (
   <>
     {currentUser ? (
       <FooterUser />
     ) : (
       <FooterPublic />
     )}
   </>
 );
}