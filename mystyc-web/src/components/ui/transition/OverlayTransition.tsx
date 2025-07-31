"use client"

import BaseTransition, { transitionVariants } from "./BaseTransition";

export default function OverlayTransition({ children }: { children: React.ReactNode }) {
  return (
    <BaseTransition
      variants={transitionVariants.fadeBlur}
      transitionConfig={{ duration: 0.5, ease: "easeInOut" }}
      className="absolute h-full w-full flex items-center justify-center z-[80]"
      keyPrefix="modal"
      usePathnameKey={true}
    >
      {children}
    </BaseTransition>
  );
}
