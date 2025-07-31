'use client'

import { useUser } from "../ui/context/AppContext"; 
import ScrollWrapper from "@/components/ui/layout/scroll/ScrollWrapper";
import WebsiteFooter from "@/components/website/WebsiteFooter";
import WebsiteHome from "@/components/website/WebsiteHome";

export default function WebsiteLayout() {
  const user = useUser();

  return (
    <>
      {user == null &&
        <ScrollWrapper>
          <WebsiteHome />
          <WebsiteFooter />
        </ScrollWrapper>
      }
    </>
  );
}