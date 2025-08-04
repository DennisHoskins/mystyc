'use client'

import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';

import { AppUser } from '@/interfaces/app/app-user.interface';
import { DeviceInfo } from '@/interfaces/';
import { UserProfileInputSchema } from 'mystyc-common/schemas/user-profile.schema';
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

export default function BirthPanel({ user, deviceInfo, setIsWorking }: BirthPanelProps) {
  const { setUser } = useUserStore();
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [timeOfBirth, setTimeOfBirth] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ dateOfBirth?: string[]; timeOfBirth?: string[] }>({});
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    setIsWorking(false);
    // Pre-populate if user already has birth data
    if (user.userProfile.dateOfBirth) {
      // Convert Date to YYYY-MM-DD format for date input
      const date = new Date(user.userProfile.dateOfBirth);
      const formattedDate = date.toISOString().split('T')[0];
      setDateOfBirth(formattedDate);
    }
    if (user.userProfile.timeOfBirth) {
      setTimeOfBirth(user.userProfile.timeOfBirth);
    }
  }, [setIsWorking, user.userProfile.dateOfBirth, user.userProfile.timeOfBirth]);

  if (!user) {
    return null;
  }

  const validateField = (field: 'dateOfBirth' | 'timeOfBirth', value: string) => {
    if (field === 'dateOfBirth') {
      if (!value) {
        setFieldErrors(prev => ({ ...prev, dateOfBirth: ['Date of birth is required'] }));
        return;
      }
      
      const result = UserProfileInputSchema.pick({ dateOfBirth: true }).safeParse({ 
        dateOfBirth: new Date(value) 
      });
      
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        setFieldErrors(prev => ({ ...prev, dateOfBirth: errors.dateOfBirth }));
      } else {
        setFieldErrors(prev => ({ ...prev, dateOfBirth: undefined }));
      }
    } else if (field === 'timeOfBirth') {
      // Time is optional, but if provided, must be valid format
      if (value && value.trim()) {
        const result = UserProfileInputSchema.pick({ timeOfBirth: true }).safeParse({ 
          timeOfBirth: value.trim() 
        });
        
        if (!result.success) {
          const errors = result.error.flatten().fieldErrors;
          setFieldErrors(prev => ({ ...prev, timeOfBirth: errors.timeOfBirth }));
        } else {
          setFieldErrors(prev => ({ ...prev, timeOfBirth: undefined }));
        }
      } else {
        // Empty time is valid, will default to 12:00
        setFieldErrors(prev => ({ ...prev, timeOfBirth: undefined }));
      }
    }
  };

  const handleBlur = (field: 'dateOfBirth' | 'timeOfBirth', value: string) => {
    validateField(field, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    
    // Validate required date
    if (!dateOfBirth.trim()) {
      setFieldErrors({ dateOfBirth: ['Date of birth is required'] });
      return;
    }

    // Validate both fields
    const birthDate = new Date(dateOfBirth);
    const trimmedTime = timeOfBirth.trim();
    
    // Validate date
    const dateResult = UserProfileInputSchema.pick({ dateOfBirth: true }).safeParse({
      dateOfBirth: birthDate
    });
    
    if (!dateResult.success) {
      const errors = dateResult.error.flatten().fieldErrors;
      setFieldErrors(prev => ({ ...prev, dateOfBirth: errors.dateOfBirth }));
      return;
    }

    // Validate time if provided
    if (trimmedTime) {
      const timeResult = UserProfileInputSchema.pick({ timeOfBirth: true }).safeParse({
        timeOfBirth: trimmedTime
      });
      
      if (!timeResult.success) {
        const errors = timeResult.error.flatten().fieldErrors;
        setFieldErrors(prev => ({ ...prev, timeOfBirth: errors.timeOfBirth }));
        return;
      }
    }

    try {
      setIsWorking(true);
      
      const profileUpdate: any = {
        dateOfBirth: birthDate,
        timeOfBirth: trimmedTime || "", // Empty string will be handled by server action
        // hasTimeOfBirth will be set by server action based on whether timeOfBirth is empty
      };
      
      const updatedUser = await updateUserProfile(deviceInfo, profileUpdate);
      
      if (updatedUser) {
        setUser(updatedUser);
        window.dispatchEvent(new CustomEvent('wizard-next'));
      } else {
        throw new Error('No user data returned from server');
      }
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Failed to update birth information');
    } finally {
      setIsWorking(false);
    }
  };

  const hasFieldErrors = Object.values(fieldErrors).some(errors => errors && errors.length > 0);
  const isFormValid = dateOfBirth.trim() && !hasFieldErrors;

  return (
    <FormLayout 
      title="When were you born?"
      subtitle={
        <>
          Your birth date and time shape your astrological profile.
          <br />
          If you&apos;re not sure of the time, take your best guess.
        </>
      } 
      error={serverError}
    >
      <Form onSubmit={handleSubmit}>
        <DateInput
          id="dateOfBirth"
          name="dateOfBirth"
          label='Date of Birth'
          autoComplete="bday"
          placeholder="Enter the day you were born"
          value={dateOfBirth}
          onChange={e => setDateOfBirth(e.target.value)}
          onBlur={e => handleBlur('dateOfBirth', e.target.value)}
          error={fieldErrors.dateOfBirth?.[0]}
          required
        />
        <TimeInput
          id="timeOfBirth"
          name="timeOfBirth"
          label='Time of Birth'
          autoComplete="off"
          placeholder="Enter the time you were born (optional)"
          value={timeOfBirth}
          onChange={e => setTimeOfBirth(e.target.value)}
          onBlur={e => handleBlur('timeOfBirth', e.target.value)}
          error={fieldErrors.timeOfBirth?.[0]}
        />
        
        <Button
          type="submit"
          disabled={!isFormValid}
          loadingContent="Working..."
          className="py-3 w-auto min-w-28 self-end flex items-center justify-center"
        >
          Next
          <ChevronRight className='h-4 w-4 ml-2 -mr-1' strokeWidth={3} />
        </Button>
      </Form>
    </FormLayout>
  );
}