import { useAdminUsers } from './useAdminUsers';
import { useAdminDevices } from './useAdminDevices';
import { useAdminAuthEvents } from './useAdminAuthEvents';

export function useAdmin() {
  const users = useAdminUsers();
  const devices = useAdminDevices();
  const auth = useAdminAuthEvents();

  return {
    admin: {
      users,
      devices,
      auth,
    }
  };
}