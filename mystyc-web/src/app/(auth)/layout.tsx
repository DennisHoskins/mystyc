import WebsiteLayout from "@/components/website/WebsiteLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <WebsiteLayout>
      <div className="flex flex-1 flex-col items-center justify-center -mt-20 w-full">
        {children}
      </div>
    </WebsiteLayout>
  );
}
