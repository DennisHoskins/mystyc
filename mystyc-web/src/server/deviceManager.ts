import { cookies } from 'next/headers';

const DEVICE_ID_COOKIE_KEY = 'mystyc_device_id';

export async function getDeviceId(): Promise<string> {
 try {
   const cookieStore = await cookies();
   const deviceCookie = cookieStore.get(DEVICE_ID_COOKIE_KEY);
   
   if (deviceCookie?.value) {
     return deviceCookie.value;
   }

   // Generate new device ID if none exists
   const newDeviceId = crypto.randomUUID();
   await setDeviceId(newDeviceId);
   return newDeviceId;
 } catch {
   // Fallback if everything fails
   return crypto.randomUUID();
 }
}

export async function setDeviceId(deviceId: string): Promise<void> {
 try {
   const cookieStore = await cookies();
   
   cookieStore.set(DEVICE_ID_COOKIE_KEY, deviceId, {
     httpOnly: true,
     secure: process.env.NODE_ENV === 'production',
     sameSite: 'lax',
     path: '/'
   });
 } catch {
   // Silently fail if cookie setting is unavailable
 }
}

export async function clearDeviceId(): Promise<void> {
 try {
   const cookieStore = await cookies();
   cookieStore.delete(DEVICE_ID_COOKIE_KEY);
 } catch {
   // Silently fail if cookie deletion is unavailable
 }
}