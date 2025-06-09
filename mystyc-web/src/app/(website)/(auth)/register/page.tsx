import { getDeviceId } from '@/server/deviceManager';
import RegisterForm from '@/components/auth/RegisterForm';

export default async function RegisterPage() {
  const deviceId = await getDeviceId();
  
  return <RegisterForm deviceId={deviceId} />
}

