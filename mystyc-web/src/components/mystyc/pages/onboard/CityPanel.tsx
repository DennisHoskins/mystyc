'use client'

import { useState } from 'react';

import { AppUser } from '@/interfaces/app/app-user.interface';

import FormLayout from '@/components/ui/form/FormLayout';
import Form from '@/components/ui/form/Form';
import TextInput from '@/components/ui/form/TextInput';
import Button from '@/components/ui/Button';

export default function CityPanel({ user } : { user: AppUser }) {
  // const [isWorking, setWorking] = useState(false);
  // const [error, setError] = useState('');
  const [city, setCity] = useState("");

  if (!user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    // <FormLayout subtitle="Tell me the city you were born in" error={error}>
    <FormLayout subtitle="Tell me the city you were born in" error={null}>
      <Form onSubmit={handleSubmit}>
        <TextInput
          id="city"
          name="city"
          type="text"
          label='Enter the city you were born in'
          autoComplete="City Name"
          placeholder="City Name"
          value={city}
          onChange={e => setCity(e.target.value)}
          required
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