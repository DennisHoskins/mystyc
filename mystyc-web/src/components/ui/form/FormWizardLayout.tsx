'use client'

import { AnimatePresence } from "framer-motion";

import FormTransition from "@/components/ui/transition/FormTransition";

interface WizardStep {
  component: React.ComponentType<any>;
  props?: any;
}

interface FormWizardLayoutProps {
  steps: WizardStep[];
  currentStep: number;
  className?: string;
}

export default function FormWizardLayout({ 
  steps, 
  currentStep, 
  className = "" 
}: FormWizardLayoutProps) {
  if (currentStep < 0 || currentStep >= steps.length) {
    return null;
  }

  const currentStepData = steps[currentStep];
  const CurrentComponent = currentStepData.component;

  return (
    <div className={`relative ${className}`}>
      <AnimatePresence mode="wait">
        <FormTransition stepKey={currentStep}>
          <CurrentComponent {...currentStepData.props} />
        </FormTransition>
      </AnimatePresence>
    </div>
  );
}