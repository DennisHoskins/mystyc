'use client'

import { useState, useEffect } from 'react';
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
import DateInput from '@/components/ui/form/DateInput';
import TimeInput from '@/components/ui/form/TimeInput';
import Button from '@/components/ui/Button';

interface BirthPanelProps {
  user: AppUser;
  deviceInfo: DeviceInfo;
  setIsWorking: (working: boolean) => void;
}

// Match your schema's optional fields
type BirthFormData = {
  dateOfBirth?: Date | null;
  timeOfBirth?: string;
  hasTimeOfBirth?: boolean;
};

export default function BirthPanel({ user, deviceInfo, setIsWorking }: BirthPanelProps) {
  const { setUser } = useUserStore();
  const [serverError, setServerError] = useState<string | null>(null);

  const { 
    register, 
    handleSubmit, 
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<BirthFormData>({
    resolver: zodResolver(UserProfileInputSchema.pick({ 
      dateOfBirth: true, 
      timeOfBirth: true,
      hasTimeOfBirth: true 
    })),
    mode: 'onChange',
    defaultValues: {
      dateOfBirth: user.userProfile.dateOfBirth ? 
        new Date(user.userProfile.dateOfBirth) : null,
      timeOfBirth: user.userProfile.timeOfBirth || '',
      hasTimeOfBirth: user.userProfile.hasTimeOfBirth || false
    }
  });

  // Watch values for real-time updates
  const dateOfBirth = watch('dateOfBirth');
  const timeOfBirth = watch('timeOfBirth');

  // Convert date to string for DateInput
  const dateString = dateOfBirth ? 
    new Date(dateOfBirth).toISOString().split('T')[0] : '';

  // Auto-set hasTimeOfBirth based on whether time is provided
  useEffect(() => {
    setValue('hasTimeOfBirth', Boolean(timeOfBirth?.trim()));
  }, [timeOfBirth, setValue]);

  const onSubmit = async (data: BirthFormData) => {
    try {
      setIsWorking(true);
      
      const submitData = {
        dateOfBirth: data.dateOfBirth,
        timeOfBirth: data.timeOfBirth || "12:00", // Default to noon if empty
        hasTimeOfBirth: Boolean(data.timeOfBirth?.trim())
      };
      
      const updatedUserProfile = await updateUserProfile(deviceInfo, submitData);
      if (updatedUserProfile) {
        user.userProfile = updatedUserProfile;
        setUser(user);
        window.dispatchEvent(new CustomEvent('wizard-next'));
      }
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Failed to update birth information');
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <FormLayout 
      subtitle={<>Your birth date and time shape your astrological profile.<br />If you&apos;re not sure of the time, take your best guess.</>}
      error={serverError}
    >
      <Form onSubmit={handleSubmit(onSubmit)}>
        <DateInput
          id="dateOfBirth"
          label='Date of Birth'
          autoFocus
          autoComplete="bday"
          placeholder="Enter the day you were born"
          value={dateString}
          error={errors.dateOfBirth?.message}
          required
          {...register('dateOfBirth', {
            setValueAs: (value: string) => value ? new Date(value) : null
          })}
        />
        <TimeInput
          id="timeOfBirth"
          label='Time of Birth'
          autoComplete="off"
          placeholder="Enter the time you were born (optional)"
          value={timeOfBirth || ''}
          error={errors.timeOfBirth?.message}
          {...register('timeOfBirth')}
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