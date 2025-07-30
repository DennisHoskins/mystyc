import AuthTransition from "@/components/ui/transition/AuthTransition";

export default function Template({ children } : { children: React.ReactNode }) {
  return (
    <AuthTransition>
      {children}
    </AuthTransition>
  );
}