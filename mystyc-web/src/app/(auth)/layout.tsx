
import Card from "@/components/ui/Card";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center -mt-20">
      <Card className='w-full md:max-w-lg text-center p-4 m-4'>
        {children}
      </Card>
    </div>
  );
}
