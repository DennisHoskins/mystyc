'use client';

import Section from "@/components/ui/Section";
import Hero from "@/components/app/website/content/Hero";
import Features from "@/components/app/website/content/Features";
import WebsiteContent from "@/components/app/website/content/Content";

export default function Home() {
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