"use client"

import BaseTransition from "./BaseTransition";

const crossfadeVariant = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { delay: 0.5 } },
  exit: { opacity: 0, y: -20 }
};

interface FormTransitionProps {
  children: React.ReactNode;
  stepKey: string | number;
}

export default function FormTransition({ children, stepKey }: FormTransitionProps) {
  return (
    <BaseTransition
      variants={crossfadeVariant}
      className="absolute inset-0"
      keyPrefix={`form-step-${stepKey}`}
      transitionConfig={{ duration: 0.5, ease: "easeInOut" }}
    >
      {children}
    </BaseTransition>
  );
}