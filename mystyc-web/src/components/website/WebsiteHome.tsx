'use client';

import Section from "@/components/ui/Section";
import Hero from "@/components/website/content/Hero";
import Features from "@/components/website/content/Features";
import WebsiteContent from "@/components/website/content/Content";

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