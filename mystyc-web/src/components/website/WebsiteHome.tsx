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
      <Section>
        <Features />
      </Section>
      <Section className="pt-12">
        <WebsiteContent />
      </Section>
    </>
  );
}