import { use } from 'react';
import AuthenticationPage from '@/components/admin/pages/authentications/authentication/AuthenticationPage';

interface AuthenticationPageProps {
  params: Promise<{
    authId: string;
  }>;
}

export default function Page({ params }: AuthenticationPageProps) {
  const { authId } = use(params);

  return <AuthenticationPage authId={authId} />
}