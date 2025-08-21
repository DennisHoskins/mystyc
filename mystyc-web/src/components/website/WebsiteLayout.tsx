'use client'

import { useEffect } from "react";

import { useUser, useBusy } from "../ui/context/AppContext"; 
import ScrollWrapper from "@/components/ui/layout/scroll/ScrollWrapper";
import WebsiteFooter from "@/components/website/WebsiteFooter";
import WebsiteHome from "@/components/website/WebsiteHome";
import ParallaxContainer from "../ui/parallax/ParallaxContainer";

export default function WebsiteLayout() {
  const { setBusy } = useBusy();
  const user = useUser();

  useEffect(() => {
    setBusy(false);
  }, [setBusy])

  return (
    <>
      {user == null &&
        <ScrollWrapper className="-mt-[59px] !h-full">
          <ParallaxContainer>
            <WebsiteHome />
            <WebsiteFooter />
          </ParallaxContainer>
        </ScrollWrapper>
      }
    </>
  );
}