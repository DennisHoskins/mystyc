import { getDeviceId } from '@/server/deviceManager';
import LoginForm from '@/components/auth/LoginForm';

const deviceId = await getDeviceId();

export default async function LoginPage() {
  return <LoginForm deviceId={deviceId} />
}