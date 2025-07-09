'use client';

export default function AuthLayout({ children } : { children: React.ReactNode }) {

  return(
    <div className="flex flex-1 items-center justify-center -mt-20">
      <div className="w-full max-w-md text-center mx-4 px-6 border rounded-md p-6 shadow-sm bg-white">
        {children}
      </div>
    </div>
  );

}
