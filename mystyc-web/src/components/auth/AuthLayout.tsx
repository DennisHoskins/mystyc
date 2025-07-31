// import AuthTransition from "@/components/ui/transition/AuthTransition";
import AppLogo from '@/components/ui/AppLogo';

export default function AuthLayout({ children } : { children: React.ReactNode }) {
  return (
    <div className="w-full min-h-96">
      <AppLogo scale={1.2} className='mt-6' />
      {children}
    </div>      
  );
}