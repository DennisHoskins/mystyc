export const storage = {
  session: {
    getItem: (key: string): string | null => {
      if (typeof window === 'undefined') return null;
      try {
        return sessionStorage.getItem(key);
      } catch {
        return null;
      }
    },
    
    setItem: (key: string, value: string | null): void => {
      if (typeof window === 'undefined') return;
      try {
        if (value === null) {
          sessionStorage.removeItem(key);
        } else {
          sessionStorage.setItem(key, value);
        }
      } catch {
        // Silently fail if storage is unavailable
      }
    },
    
    removeItem: (key: string): void => {
      if (typeof window === 'undefined') return;
      try {
        sessionStorage.removeItem(key);
      } catch {
        // Silently fail if storage is unavailable
      }
    }
  },

  local: {
    getItem: (key: string): string | null => {
      if (typeof window === 'undefined') return null;
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    
    setItem: (key: string, value: string | null): void => {
      if (typeof window === 'undefined') return;
      try {
        if (value === null) {
          localStorage.removeItem(key);
        } else {
          localStorage.setItem(key, value);
        }
      } catch {
        // Silently fail if storage is unavailable
      }
    },
    
    removeItem: (key: string): void => {
      if (typeof window === 'undefined') return;
      try {
        localStorage.removeItem(key);
      } catch {
        // Silently fail if storage is unavailable
      }
    }
  }
};