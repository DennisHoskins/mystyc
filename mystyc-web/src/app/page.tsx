import RootPage from '@/components/layout/RootPage';

import { getCurrentUser } from '@/server/getCurrentUser';

export default async function Page() {
  const user = await getCurrentUser();

  return <RootPage user={user} />
}