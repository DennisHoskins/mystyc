export default function WebsiteLayout({ children, modal }: { 
  children: React.ReactNode, 
  modal: React.ReactNode 
}) {
  return (
    <>
      {children}
      {modal}
    </>      
  );
}
