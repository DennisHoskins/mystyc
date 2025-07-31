"use client"

import BaseTransition, { transitionVariants } from "./BaseTransition";

export default function AdminTransition({ children }: { children: React.ReactNode }) {
  return (
    <BaseTransition
      variants={transitionVariants.fade}
      className="flex-1 flex flex-col w-full min-h-0"
      keyPrefix="admin"
      usePathnameKey={true}
    >
      {children}
    </BaseTransition>
  );
}