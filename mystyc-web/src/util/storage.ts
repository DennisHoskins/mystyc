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
  },

  cookie: {
    getItem: (key: string): string | null => {
      if (typeof window === 'undefined') return null;
      try {
        const name = key + "=";
        const decodedCookie = decodeURIComponent(document.cookie);
        const cookieArray = decodedCookie.split(';');
        
        for (let i = 0; i < cookieArray.length; i++) {
          let cookie = cookieArray[i];
          while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1);
          }
          if (cookie.indexOf(name) === 0) {
            return cookie.substring(name.length, cookie.length);
          }
        }
        return null;
      } catch {
        return null;
      }
    },

    setItem: (key: string, value: string | null): void => {
      if (typeof window === 'undefined') return;
      try {
        if (value === null) {
          // Delete the cookie by setting it to expire in the past
          document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
        } else {
          // Set cookie with path=/ to make it accessible across the entire site
          document.cookie = `${key}=${encodeURIComponent(value)}; path=/`;
        }
      } catch {
        // Silently fail if cookie setting is unavailable
      }
    },

    removeItem: (key: string): void => {
      if (typeof window === 'undefined') return;
      try {
        // Delete the cookie by setting it to expire in the past
        document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
      } catch {
        // Silently fail if cookie deletion is unavailable
      }
    }
  }
};