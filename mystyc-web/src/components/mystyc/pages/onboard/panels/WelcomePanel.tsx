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
      subtitle={
        <>
          Let&apos;s unlock what the stars say about you.
          <br />
          To begin, we need a few details so we can build your birth chart.
          <br />
          <br />
          It&apos;ll only take a minute...
        </>
      }
    >
      <Form onSubmit={handleSubmit}>
        <Button
          type="submit"
          autoFocus
          loadingContent="Working..."
          className="py-3 w-auto min-w-40 self-center flex items-center justify-center !rounded-full"
        >
          Get Started
          <ChevronRight className='h-4 w-4 ml-2 -mr-1' strokeWidth={3} />
        </Button>
      </Form>
    </FormLayout>
  );
}