import { storage } from '@/util/storage';

let cachedUid: string | null = null;
let cachedDeviceId: string | null = null;

export const authCache = {
  getAuthData() {
    return {
      firebaseUid: cachedUid || storage.local.getItem('firebaseUid'),
      deviceId: cachedDeviceId || this.getDeviceFingerprint()
    };
  },

  getFirebaseUid(): string | null {
    return cachedUid || null;
  },

  setFirebaseUid(uid: string) {
    storage.local.setItem('firebaseUid', uid);
    cachedUid = uid;
  },

  clearFirebaseUid() {
    storage.local.removeItem('firebaseUid');
    cachedUid = null;
  },

  clearCache(): void {
    storage.local.removeItem('firebaseUid');
    cachedUid = null;
  },

  getDeviceFingerprint(): string {
    if (cachedDeviceId) return cachedDeviceId;
    
    const existing = storage.local.getItem('deviceFingerprint');
    if (existing) {
      cachedDeviceId = existing;
      return existing;
    }

    const newFingerprint = crypto.randomUUID();
    storage.local.setItem('deviceFingerprint', newFingerprint);
    cachedDeviceId = newFingerprint;
    return newFingerprint;
  }
};