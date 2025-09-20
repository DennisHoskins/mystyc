'use client'

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronRight } from 'lucide-react';

import { UserProfileInputSchema } from 'mystyc-common/schemas/user-profile.schema';
import { AppUser } from '@/interfaces/app/app-user.interface';
import { DeviceInfo } from '@/interfaces/';
import { updateUserProfile } from '@/server/actions/userProfile';
import { useUserStore } from '@/store/userStore';

import FormLayout from '@/components/ui/form/FormLayout';
import Form from '@/components/ui/form/Form';
import TextInput from '@/components/ui/form/TextInput';
import Button from '@/components/ui/Button';

interface NamePanelProps {
  user: AppUser;
  deviceInfo: DeviceInfo;
  setIsWorking: (working: boolean) => void;
}

type NameFormData = {
  firstName?: string;
  lastName?: string;
};

export default function NamePanel({ user, deviceInfo, setIsWorking }: NamePanelProps) {
  const { setUser } = useUserStore();
  const [serverError, setServerError] = useState<string | null>(null);

  const { 
    register, 
    handleSubmit, 
    watch,
    formState: { errors, isValid }
  } = useForm<NameFormData>({
    resolver: zodResolver(UserProfileInputSchema.pick({ firstName: true, lastName: true })),
    mode: 'onChange',
    defaultValues: {
      firstName: user.userProfile.firstName || '',
      lastName: user.userProfile.lastName || ''
    }
  });

  // Watch values for real-time updates
  const firstName = watch('firstName');
  const lastName = watch('lastName');

  const onSubmit = async (data: NameFormData) => {
    try {
      setIsWorking(true);
      const updatedUserProfile = await updateUserProfile(deviceInfo, data);
      if (updatedUserProfile) {
        user.userProfile = updatedUserProfile;          
        setUser(user);
        window.dispatchEvent(new CustomEvent('wizard-next'));
      }
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <FormLayout 
      subtitle={<>Tell me what you would like to be called.<br />Don&apos;t worry, we&apos;ll keep it private—just between us.</>}
      error={serverError}
    >
      <Form onSubmit={handleSubmit(onSubmit)}>
        <TextInput
          id="firstName"
          label="First Name"
          autoFocus
          autoComplete="given-name"
          value={firstName}
          error={errors.firstName?.message}
          required
          {...register('firstName')}
        />
        <TextInput
          id="lastName"
          label="Last Name"
          autoComplete="family-name" 
          value={lastName}
          error={errors.lastName?.message}
          required
          {...register('lastName')}
        />
        
        <Button
          type="submit"
          disabled={!isValid}
          className="py-3 w-auto min-w-28 self-end flex items-center justify-center"
        >
          Next
          <ChevronRight className='h-4 w-4 ml-2 -mr-1' strokeWidth={3} />
        </Button>
      </Form>
    </FormLayout>
  );
}