"use client"

import BaseTransition, { transitionVariants } from "./BaseTransition";

export default function ModalTransition({ children, doTransition = true }: { children: React.ReactNode, doTransition: boolean }) {
  return (
    <BaseTransition
        variants={transitionVariants.fadeScale}
        className="absolute h-full w-full flex items-center justify-center pointer-events-none"
        keyPrefix="modal"
        doTransition={doTransition}
      >
        {children}
    </BaseTransition>
  );
}