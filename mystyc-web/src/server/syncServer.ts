import { cookies } from 'next/headers';
import { App } from '@/interfaces/app.interface';

const COOKIE_NAME = 'mystyc_app_state';

export async function syncApp(app: Partial<App> | null) {
  const cookieStore = await cookies();

  if (!app) {
    cookieStore.delete(COOKIE_NAME);
    return;
  }

  const existingRaw = cookieStore.get(COOKIE_NAME)?.value ?? '{}';

  let existing: Partial<App>;
  try {
    existing = JSON.parse(existingRaw);
  } catch {
    existing = {};
  }

  const updated: Partial<App> = {
    authToken: app.authToken ?? existing.authToken,
    user: app.user ?? existing.user,
    fcmToken: app.fcmToken ?? existing.fcmToken,
    deviceId: existing.deviceId ?? '', // preserve if already set
  };

  cookieStore.set(COOKIE_NAME, JSON.stringify(updated), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
  });
}

export async function clearApp() {
  syncApp(null);
}
