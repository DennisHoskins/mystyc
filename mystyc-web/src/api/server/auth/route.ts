import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { API_BASE_URL, ServerRequestHandler } from '../ServerRequestHandler';

async function registerSession(authToken: string | null, dto: any) {
 const response = await fetch(`${API_BASE_URL}/users/me`, {
   method: 'POST',
   headers: {
     'Content-Type': 'application/json',
     'Authorization': `Bearer ${authToken}`
   },
   body: JSON.stringify(dto)
 });

 if (!response.ok) {
   const errorText = await response.text();
   throw new Error(errorText);
 }

 if (!authToken) {
   const errorText = 'Unauthorized Exception';
   throw new Error(errorText);
 }

 const user = await response.json();

 // Store auth token and user in cookies
 const cookieStore = await cookies();
 cookieStore.set('auth_token', authToken, {
   httpOnly: true,
   secure: process.env.NODE_ENV === 'production',
   sameSite: 'lax',
   path: '/'
 });

 cookieStore.set('user_data', JSON.stringify(user), {
   httpOnly: true,
   secure: process.env.NODE_ENV === 'production',
   sameSite: 'lax',
   path: '/'
 });

 return user;
}

async function refreshToken(authToken: string | null, dto: any) {
 const { firebaseToken } = dto;
 
 const cookieStore = await cookies();
 cookieStore.set('auth_token', firebaseToken, {
   httpOnly: true,
   secure: process.env.NODE_ENV === 'production',
   sameSite: 'lax',
   path: '/'
 });
 
 return { success: true };
}

export async function POST(request: NextRequest) {
 return ServerRequestHandler.handle(request, {
   registerSession,
   refreshToken
 }, false);
}