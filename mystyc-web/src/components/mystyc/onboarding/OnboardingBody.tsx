'use client';

import React from 'react';
import OnboardingHeader from './OnboardingHeader';

type OnboardingBodyProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export default function OnboardingBody({ title, subtitle, children }: OnboardingBodyProps) {
  return (
    <div className="space-y-6">
      <OnboardingHeader title={title} subtitle={subtitle} />
      {children}
    </div>
  );
}
