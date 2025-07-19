'use client';

import Section from "@/components/ui/Section";
import Hero from "@/components/website/pages/Hero";
import Features from "@/components/website/pages/Features";
import WebsiteContent from "@/components/website/pages/Content";

export default function WebsiteHome() {
  return (
    <>
      <Section background="blue">
        <Hero />
      </Section>
      <Section background="white">
        <Features />
      </Section>
      <Section background="gray">
        <WebsiteContent />
      </Section>
    </>
  );
}