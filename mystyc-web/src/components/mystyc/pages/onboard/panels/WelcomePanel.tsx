'use client'

import { ChevronRight } from 'lucide-react';

import { AppUser } from '@/interfaces/app/app-user.interface';
import FormLayout from '@/components/ui/form/FormLayout';
import Form from '@/components/ui/form/Form';
import Button from '@/components/ui/Button';

export default function WelcomePanel({ user } : { user: AppUser }) {
  if (!user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('wizard-next'));
  };

  return (
    <FormLayout 
      title="Welcome to Mystyc!"
      subtitle={
        <>
          Let’s unlock what the stars say about you.
          <br />
          We’ll ask for a few details to build your birth chart.
          <br />
          <br />
          It&apos;ll only take a minute...
        </>
      }
    >
      <Form onSubmit={handleSubmit}>
        <Button
          type="submit"
          loadingContent="Working..."
          className="mt-6 py-3 w-auto min-w-40 self-center flex items-center justify-center !rounded-full"
        >
          Get Started
          <ChevronRight className='h-4 w-4 ml-2 -mr-1 mt-[1.5px]' strokeWidth={3} />
        </Button>
      </Form>
    </FormLayout>
  );
}