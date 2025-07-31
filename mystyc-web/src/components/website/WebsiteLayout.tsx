'use client'

import { useUser } from "../ui/layout/context/AppContext"; 
import WebsiteHeader from "@/components/website/WebsiteHeader";
import ScrollWrapper from "@/components/ui/layout/scroll/ScrollWrapper";
import WebsiteFooter from "@/components/website/WebsiteFooter";
import WebsiteHome from "@/components/website/WebsiteHome";

export default function WebsiteLayout() {
  const user = useUser();

  return (
    <>
      <WebsiteHeader />
      {user == null &&
        <ScrollWrapper>
          <WebsiteHome />
          <WebsiteFooter />
        </ScrollWrapper>
      }
    </>
  );
}