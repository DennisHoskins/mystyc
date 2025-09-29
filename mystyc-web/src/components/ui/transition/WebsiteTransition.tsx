"use client"

import BaseTransition, { transitionVariants } from "./BaseTransition";

export default function WebsiteTransition({ children }: { children: React.ReactNode }) {
  return (
    <BaseTransition
      variants={transitionVariants.fade}
      className="flex-1 flex flex-col w-full"
      keyPrefix="web"
    >
      {children}
    </BaseTransition>
  );
}