import React from 'react';
import WelcomeHeader from './WelcomeHeader';

type WelcomeBodyProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export default function WelcomeBody({ title, subtitle, children }: WelcomeBodyProps) {
  return (
    <div className="space-y-6">
      <WelcomeHeader title={title} subtitle={subtitle} />
      {children}
    </div>
  );
}
