import PageTransition from "@/components/ui/transition/PageTransition";

export default function Template({ children } : { children: React.ReactNode }) {
  return (
    <PageTransition>
      {children}
    </PageTransition>          
  );
}