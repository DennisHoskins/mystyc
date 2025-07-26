import Card from "@/components/ui/Card";

export default function AuthLayout({ children } : { children: React.ReactNode }) {
  return (
    <>
      <div className="flex flex-1 flex-col items-center justify-center -mt-20 w-full">
        <Card className='w-full md:max-w-lg text-center space-y-6'>
          {children}
        </Card>
      </div>
    </>
  );
}
