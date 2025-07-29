'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { AppUser } from '@/interfaces/app/app-user.interface';

import FormLayout from '@/components/ui/form/FormLayout';
import Form from '@/components/ui/form/Form';
import TextInput from '@/components/ui/form/TextInput';
import Button from '@/components/ui/Button';

export default function BirthPanel({ user } : { user: AppUser }) {
  const router = useRouter();
  // const [isWorking, setWorking] = useState(false);
  // const [error, setError] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [timeOfBirth, setTimeOfBirth] = useState("");

  if (!user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/account");
  };

  return (
    // <FormLayout subtitle="Tell me when you were born. Be as accurate as possible" error={error}>
    <FormLayout subtitle="Tell me when you were born. Be as accurate as possible" error={null}>
      <Form onSubmit={handleSubmit}>
        <TextInput
          id="dateOfBirth"
          name="dateOfBirth"
          type="text"
          label='Date of Birth'
          autoComplete="Date of Birth"
          placeholder="Enter the day you were born"
          value={dateOfBirth}
          onChange={e => setDateOfBirth(e.target.value)}
          // required
        />
        <TextInput
          id="timeOfBirth"
          name="timeOfBirth"
          type="text"
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
          className="w-full mt-6"
        >
          OK
        </Button>
      </Form>
    </FormLayout>
  );
}