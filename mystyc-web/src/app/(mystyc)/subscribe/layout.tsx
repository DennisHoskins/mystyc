
import Card from "@/components/ui/Card";

export default function SubscribeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className='w-full md:max-w-lg text-center p-4'>
        <Card>
          {children}
        </Card>
      </div>
    </div>
  );
}
