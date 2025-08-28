"use client"

import BaseTransition, { transitionVariants } from "./BaseTransition";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <BaseTransition
      variants={transitionVariants.fadeSlide}
      className="flex-1 flex flex-col w-full"
      keyPrefix="mystyc"
    >
      {children}
    </BaseTransition>
  );
}