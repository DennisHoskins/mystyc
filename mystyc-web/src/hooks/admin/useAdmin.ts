import { useAdminUsers } from './useAdminUsers';
import { useAdminDevices } from './useAdminDevices';
import { useAdminAuthEvents } from './useAdminAuthEvents';
import { useAdminContent } from './useAdminContent';

export function useAdmin() {
  const users = useAdminUsers();
  const devices = useAdminDevices();
  const auth = useAdminAuthEvents();
  const content = useAdminContent();

  return {
    admin: {
      users,
      devices,
      auth,
      content,
    }
  };
}