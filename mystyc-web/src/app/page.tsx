import WebsiteHeader from "@/components/website/WebsiteHeader";
import ScrollWrapper from "@/components/ui/layout/scroll/ScrollWrapper";
import AppTransition from '@/components/ui/layout/transition/AppTransition';
import WebsiteFooter from "@/components/website/WebsiteFooter";
import WebsiteHome from "@/components/website/WebsiteHome";

export default function Page() {
  return (
    <>
      <WebsiteHeader />
      <div className="flex overflow-hidden">
        <ScrollWrapper>
          <AppTransition>
            <WebsiteHome />
            <WebsiteFooter />
          </AppTransition>
        </ScrollWrapper>
      </div>
    </>
  )
}