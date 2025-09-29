import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = `Privacy Policy | mystyc` + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import ParallaxContainer from "@/components/ui/parallax/ParallaxContainer";
import PrivacyPage from "@/components/website/privacy/PrivacyPage";

export default function Page() {
  return (
    <>
      <ParallaxContainer className='!fixed w-full h-full !overflow-hidden z-0'><></></ParallaxContainer>
      <PrivacyPage />
    </>
  );
}