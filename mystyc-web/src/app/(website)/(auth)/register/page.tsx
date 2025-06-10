import { getDeviceId } from '@/server/deviceManager';
import RegisterForm from '@/components/auth/RegisterForm';

const deviceId = await getDeviceId();

export default async function RegisterPage() {
  return <RegisterForm deviceId={deviceId} />
}

