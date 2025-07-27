'use client'

import Header from "../ui/layout/Header";
import WebsiteHeader from "./ui/WebsiteHeader";
import ScrollWrapper from "@/components/ui/layout/scroll/ScrollWrapper";
import Footer from "../ui/layout/Footer";

export default function WebsiteLayout({ children } : { children: React.ReactNode }) {
  return (
    <>
      <Header><WebsiteHeader /></Header>
      <ScrollWrapper>
        {children}
        <Footer />
      </ScrollWrapper>
    </>
  );
}