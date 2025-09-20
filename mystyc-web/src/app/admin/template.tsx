import AdminTransition from "@/components/ui/transition/AdminTransition";

export default function Template({ children } : { children: React.ReactNode }) {
  return (
    <AdminTransition>
      {children}
    </AdminTransition>          
  );
}