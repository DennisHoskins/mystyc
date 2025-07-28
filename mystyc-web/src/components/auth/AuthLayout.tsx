'use client'

import Card from "@/components/ui/Card";

export default function AuthLayout({ children } : { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center -mt-20 w-full p-4">
      <Card className='w-full max-w-lg text-center space-y-6 m-4'>
        {children}
      </Card>
    </div>
  );
}
