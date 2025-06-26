'use client';

import Section from "@/components/ui/Section";
import WebsiteHero from "@/components/app/website/content/hero";
import WebsiteFeatures from "@/components/app/website/content/features";
import WebsitePricing from "@/components/app/website/content/pricing";

export default function Home() {
  return (
    <>
      <Section background="blue">
        <WebsiteHero />
      </Section>
      <Section background="white">
        <WebsiteFeatures />
      </Section>
      <Section background="gray">
        <WebsitePricing />
      </Section>
    </>
  );
}