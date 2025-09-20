'use client'

import { useUser } from "../ui/context/AppContext"; 
import WebsiteFooter from "@/components/website/WebsiteFooter";
import ParallaxContainer from "../ui/parallax/ParallaxContainer";

export default function WebsiteLayout({ children } : { children: React.ReactNode }) {
  const user = useUser();

  return (
    <>
      {user == null &&
        <ParallaxContainer className="-mt-[59px]">
          {children}
          <WebsiteFooter />
        </ParallaxContainer>
      }
    </>
  );
}