import type { ReactNode } from "react";

export default function AuthLayout({ 
  children, 
  modals 
}: { 
  children: ReactNode, 
  modals: ReactNode}
) {
  return (
    <>
      {children}
      {modals}
    </>
  );
}
