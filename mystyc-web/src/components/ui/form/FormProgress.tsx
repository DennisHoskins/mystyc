'use client'

import { motion, AnimatePresence } from 'framer-motion';
import { User, Calendar, Building } from 'lucide-react';
import { ComponentType } from 'react';

import NamePanel from '@/components/mystyc/pages/onboard/panels/NamePanel';
import BirthPanel from '@/components/mystyc/pages/onboard/panels/BirthPanel';
import CityPanel from '@/components/mystyc/pages/onboard/panels/CityPanel';

interface FormProgressProps {
  currentStep: number;
  steps: { component: ComponentType<any> }[];
}

const stepMap = new Map<ComponentType<any>, number>([
  [NamePanel, 0],
  [BirthPanel, 1],
  [CityPanel, 2],
]);

const icons = [User, Calendar, Building];

export default function FormProgress({ currentStep, steps }: FormProgressProps) {
  const StepComponent = steps[currentStep]?.component;
  const isVisible = stepMap.has(StepComponent);
  const activeIndex = stepMap.get(StepComponent);

  return (
    <div className="h-24 flex items-center justify-center">
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            key="form-progress"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.75 }}
            className="flex items-center"
          >
            {icons.map((Icon, index) => {
              const isActive = index === activeIndex;
              const isComplete = typeof activeIndex === 'number' && index < activeIndex;

              return (
                <div key={index} className="flex items-center">
                  <div className={`
                    flex items-center justify-center 
                    w-8 h-8 rounded-full border-2
                    ${isActive ? 'bg-gray-500 text-white scale-115 shadow-[0_0_0_1px_white,0_0_0_3px_gray]' : 'scale-95'}
                    ${isComplete ? 'bg-gray-500 text-white' : ''}
                    ${!isActive && !isComplete ? 'bg-white text-gray-400 border-gray-300' : ''}
                    transition-transform
                  `}>
                    <Icon className="w-3 h-3" strokeWidth={2.5} />
                  </div>

                  {index < icons.length - 1 && (
                    <div className="w-8 h-0.5 bg-gray-300 mx-2" />
                  )}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
