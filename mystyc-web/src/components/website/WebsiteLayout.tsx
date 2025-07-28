import Header from "../ui/layout/Header";
import WebsiteHeader from "./ui/WebsiteHeader";
import ScrollWrapper from "@/components/ui/layout/scroll/ScrollWrapper";
import PageTransition from '@/components/ui/layout/transition/PageTransition';
import Footer from "../ui/layout/Footer";

export default function WebsiteLayout({ children } : { children: React.ReactNode }) {
  return (
    <>
      <Header><WebsiteHeader /></Header>
      <ScrollWrapper>
        <PageTransition>
          {children}
          <Footer />
        </PageTransition>
      </ScrollWrapper>
    </>
  );
}