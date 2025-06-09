import { cookies } from 'next/headers';
import { App } from '@/interfaces/app.interface';

const APP_STATE_COOKIE_KEY = 'mystyc_app_state';

export async function getApp(): Promise<App | null> {
 try {
   const cookieStore = await cookies();
   const appCookie = cookieStore.get(APP_STATE_COOKIE_KEY);
   
   if (!appCookie?.value) {
     return null;
   }

   return JSON.parse(appCookie.value);
 } catch {
   return null;
 }
}

export async function setApp(app: App): Promise<void> {
 try {
   const cookieStore = await cookies();
   
   cookieStore.set(APP_STATE_COOKIE_KEY, JSON.stringify(app), {
     httpOnly: true,
     secure: process.env.NODE_ENV === 'production',
     sameSite: 'lax',
     path: '/'
   });
 } catch {
   // Silently fail if cookie setting is unavailable
 }
}

export async function clearApp(): Promise<void> {
 try {
   const cookieStore = await cookies();
   cookieStore.delete(APP_STATE_COOKIE_KEY);
 } catch {
   // Silently fail if cookie deletion is unavailable
 }
}