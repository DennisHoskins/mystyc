import { App } from '@/interfaces/app.interface';

export function useServerSync() {
  const syncToServer = async (newApp: App) => {
    try {
      await fetch('/api/app-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newApp)
      });
    } catch (error) {
      // Handle sync failure
      throw error;
    }
  };
  
  return { syncToServer };
}