import { useAdminUsers } from './useAdminUsers';

export function useAdmin() {
  const users = useAdminUsers();

  return {
    admin: {
      users,
    }
  };
}