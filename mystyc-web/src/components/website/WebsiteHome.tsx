import Hero from "@/components/website/content/Hero";
import Features from "@/components/website/content/Features";
import Summary from "./content/Summary";

export default function WebsiteHome() {
  return (
    <div className="p-8 md:p-4 lg:p-0">
      <Hero />
      <Features />
      <Summary />
    </div>
  );
}