'use client'

import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';

import { AppUser } from '@/interfaces/app/app-user.interface';
import FormLayout from '@/components/ui/form/FormLayout';
import Form from '@/components/ui/form/Form';
import DateInput from '@/components/ui/form/DateInput';
import TimeInput from '@/components/ui/form/TimeInput';
import Button from '@/components/ui/Button';

export default function BirthPanel({ user, setIsWorking } : { user: AppUser, setIsWorking: (working: boolean) => void }) {
  // const [isWorking, setWorking] = useState(false);
  // const [error, setError] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [timeOfBirth, setTimeOfBirth] = useState("");

  useEffect(() => {
    setIsWorking(false);
  }, [setIsWorking])

  if (!user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next = async () => {
      setIsWorking(true);
      await new Promise(resolve => setTimeout(resolve, 2500));
      window.dispatchEvent(new CustomEvent('wizard-next'));
    }
    next();
  };

  return (
    <FormLayout 
      title="When were you born?"
      subtitle={
        <>
          The date <i>and</i> time shape your astrological profile.
          <br />
          If you’re not sure of the time, take your best guess.
        </>
      } 
      error={null}
    >
      <Form onSubmit={handleSubmit}>
        <DateInput
          id="dateOfBirth"
          name="dateOfBirth"
          label='Date of Birth'
          autoComplete="Date of Birth"
          placeholder="Enter the day you were born"
          value={dateOfBirth}
          onChange={e => setDateOfBirth(e.target.value)}
          // required
        />
        <TimeInput
          id="timeOfBirth"
          name="timeOfBirth"
          label='Time of Birth'
          autoComplete="Time of Birth"
          placeholder="Enter the time you were born"
          value={timeOfBirth}
          onChange={e => setTimeOfBirth(e.target.value)}
          // required
        />
        <Button
          type="submit"
          // loading={isWorking}
          loadingContent="Working..."
          className="py-3 w-auto min-w-28 self-end flex items-center justify-center"
        >
          Next
          <ChevronRight className='h-4 w-4 ml-2 -mr-1 mt-[1.5px]' strokeWidth={3} />
        </Button>
      </Form>
    </FormLayout>
  );
}