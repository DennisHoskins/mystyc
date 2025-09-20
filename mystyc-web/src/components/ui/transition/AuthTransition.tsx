"use client"

import BaseTransition, { transitionVariants } from "./BaseTransition";

export default function AuthTransition({ children }: { children: React.ReactNode }) {
  return (
    <BaseTransition
      variants={transitionVariants.fade}
      className="flex-1 flex flex-col w-full items-center justify-center"
      keyPrefix="auth"
      usePathnameKey={true}
      transitionConfig={{ duration: 1 }}
    >
      {children}
    </BaseTransition>
  );
}