import Section from "@/components/ui/Section";
import Hero from "@/components/website/content/Hero";
import Features from "@/components/website/content/Features";

export default function WebsiteHome() {
  return (
    <>
      <Section>
        <Hero />
      </Section>
      <Section>
        <Features />
      </Section>
    </>
  );
}