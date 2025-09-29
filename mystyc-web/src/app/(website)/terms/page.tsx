import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = `Terms of Use | mystyc` + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return { title };
}

import ParallaxContainer from "@/components/ui/parallax/ParallaxContainer";
import TermsPage from "@/components/website/terms/TermsPage";

export default function Page() {
  return (
    <>
      <ParallaxContainer className='!fixed w-full h-full !overflow-hidden'><></></ParallaxContainer>
      <TermsPage />
    </>
  );
}