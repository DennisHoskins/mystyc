import WebsiteTransition from "@/components/ui/transition/WebsiteTransition";
import WebsiteHeader from "@/components/website/WebsiteHeader";
import ScrollWrapper from "@/components/ui/layout/scroll/ScrollWrapper";
import WebsiteFooter from "@/components/website/WebsiteFooter";
import WebsiteHome from "@/components/website/WebsiteHome";

export default function Page() {
  return (
    <>
      <WebsiteHeader />
      <WebsiteTransition>
        <ScrollWrapper>
          <WebsiteHome />
          <WebsiteFooter />
        </ScrollWrapper>
      </WebsiteTransition>        
    </>
  )
}