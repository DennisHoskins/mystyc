'use client';

import { useTransitionRouter } from '@/hooks/useTransitionRouter';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';

export default function Hero() {
 const router = useTransitionRouter();

 return (
   <div className="text-center">
     <Heading level={1} className="mb-6 text-4xl md:text-6xl">
       Welcome to mystyc
     </Heading>
     <Text className="text-gray-600 mb-8 text-lg md:text-xl max-w-2xl mx-auto">
       Discover insights about yourself, connect with your journey, and grow with our personalized tools.
     </Text>
     <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
       <Button variant="primary" onClick={() => router.push('/register')} className="text-lg px-8 py-3">
         Get Started Free
       </Button>
       <Button variant="secondary" onClick={() => router.push('/login')} className="text-lg px-8 py-3">
         Sign In
       </Button>
     </div>
     <div className="max-w-4xl mx-auto">
       <Heading level={2} className="mb-6">
         Why mystyc?
       </Heading>
       <ul className="text-left list-disc list-inside space-y-3 text-gray-700 text-lg">
         <li>Personalized self-discovery tools</li>
         <li>Data-driven insights and analytics</li>
         <li>Community-driven support and sharing</li>
         <li>Secure and private platform</li>
       </ul>
     </div>
   </div>
 );
}