import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { API_BASE_URL, ServerRequestHandler } from '../ServerRequestHandler';

async function updateUserCache(user: any) {
  const cookieStore = await cookies();
  cookieStore.set('user_data', JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });
}

async function getCurrentUser(authToken: string | null) {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }

  const user = await response.json();
  await updateUserCache(user);
  return user;
}

async function updateUserProfile(authToken: string | null, dto: any) {
  const response = await fetch(`${API_BASE_URL}/users/update-profile`, {
    method: 'PATCH',
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

  const user = await response.json();
  await updateUserCache(user);
  return user;
}

async function logout(authToken: string | null, dto: any) {
  const response = await fetch(`${API_BASE_URL}/users/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify(dto)
  });

  // Clear cookies
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
  cookieStore.delete('user_data');

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }

  return {};
}

async function updateFcmToken(authToken: string | null, dto: any) {
  const response = await fetch(`${API_BASE_URL}/devices/notify-token`, {
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

  return {};
}

export async function GET(request: NextRequest) {
  return ServerRequestHandler.handle(request, {getCurrentUser});
}

export async function PATCH(request: NextRequest) {
  return ServerRequestHandler.handle(request, {updateUserProfile});
}

export async function POST(request: NextRequest) {
  return ServerRequestHandler.handle(request, {
    logout,
    updateFcmToken
  });
}