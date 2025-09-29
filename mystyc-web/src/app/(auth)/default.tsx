import WebsiteHeader from "@/components/website/WebsiteHeader";
import WebsiteHome from "@/components/website/WebsiteHome";
import WebsiteLayout from "@/components/website/WebsiteLayout";

export default function Default() {
  return (
    <>
      <WebsiteHeader />
      <WebsiteLayout><WebsiteHome /></WebsiteLayout>
    </>
  );
}