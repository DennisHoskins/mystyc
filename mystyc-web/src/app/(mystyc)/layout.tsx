import MystycLayout from "@/components/mystyc/MystycLayout";

export default function Layout({ children}: { children: React.ReactNode }) {
  return (
    <MystycLayout>
      {children}
    </MystycLayout>
  );
}