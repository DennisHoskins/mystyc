'use client'

import { useUser } from "../ui/context/AppContext"; 
import WebsiteFooter from "@/components/website/WebsiteFooter";
import WebsiteHome from "@/components/website/WebsiteHome";
import ParallaxContainer from "../ui/parallax/ParallaxContainer";

export default function WebsiteLayout() {
  const user = useUser();

  return (
    <>
      {user == null &&
        <ParallaxContainer className="-mt-[59px]">
          <WebsiteHome />
          <WebsiteFooter />
        </ParallaxContainer>
      }
    </>
  );
}