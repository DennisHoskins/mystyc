import Footer from "@/components/ui/layout/Footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex flex-1 flex-col items-center justify-center -mt-20 w-full">
        {children}
      </div>
      <Footer />
    </>
  );
}
