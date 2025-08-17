import Section from "@/components/ui/Section";
import Hero from "@/components/website/content/Hero";
import Features from "@/components/website/content/Features";
import WebsiteContent from "@/components/website/content/Content";

export default function WebsiteHome() {
  return (
    <>
      <Section>
        <Hero />
      </Section>
      <Section background="purple">
        <Features />
      </Section>
      <Section className="mt-12">
        <WebsiteContent />
      </Section>
    </>
  );
}