'use client';

import ScrollWrapper from "@/components/ui/layout/scroll/ScrollWrapper";
import Section from "@/components/ui/Section";
import Hero from "@/components/website/pages/Hero";
import Features from "@/components/website/pages/Features";
import WebsiteContent from "@/components/website/pages/Content";
import Footer from "../ui/layout/Footer";

export default function WebsiteHome() {
  return (
    <>
      <ScrollWrapper>
        <Section background="blue">
          <Hero />
        </Section>
        <Section background="white">
          <Features />
        </Section>
        <Section background="gray">
          <WebsiteContent />
        </Section>
        <Footer />
      </ScrollWrapper>
    </>
  );
}