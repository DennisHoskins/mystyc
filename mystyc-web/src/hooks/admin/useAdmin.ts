import { useAdminUsers } from './useAdminUsers';
import { useAdminDevices } from './useAdminDevices';

export function useAdmin() {
  const users = useAdminUsers();
  const devices = useAdminDevices();

  return {
    admin: {
      users,
      devices,
    }
  };
}