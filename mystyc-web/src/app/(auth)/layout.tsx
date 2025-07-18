
import Card from "@/components/ui/Card";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center -mt-20">
      <div className='w-full max-w-lg text-center p-4'>
        <Card>
          {children}
        </Card>
      </div>
    </div>
  );
}
