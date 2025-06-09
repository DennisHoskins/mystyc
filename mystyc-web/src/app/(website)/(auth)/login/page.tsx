import { getDeviceId } from '@/server/deviceManager';
import LoginForm from '@/components/auth/LoginForm';

export default async function LoginPage() {
  const deviceId = await getDeviceId();
  
  return <LoginForm deviceId={deviceId} />
}