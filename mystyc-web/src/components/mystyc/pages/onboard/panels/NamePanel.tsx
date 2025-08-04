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
import TextInput from '@/components/ui/form/TextInput';
import Button from '@/components/ui/Button';

interface NamePanelProps {
  user: AppUser;
  deviceInfo: DeviceInfo;
  setIsWorking: (working: boolean) => void;
}

export default function NamePanel({ user, deviceInfo, setIsWorking }: NamePanelProps) {
  const { setUser } = useUserStore();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ firstName?: string[]; lastName?: string[] }>({});
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    setIsWorking(false);
    // Pre-populate if user already has names
    if (user.userProfile.firstName) setFirstName(user.userProfile.firstName);
    if (user.userProfile.lastName) setLastName(user.userProfile.lastName);
  }, [setIsWorking, user.userProfile.firstName, user.userProfile.lastName]);

  if (!user) {
    return null;
  }

  const validateField = (field: 'firstName' | 'lastName', value: string) => {
    if (field === 'firstName') {
      const result = UserProfileInputSchema.pick({ firstName: true }).safeParse({ firstName: value });
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        setFieldErrors(prev => ({ ...prev, firstName: errors.firstName }));
      } else {
        setFieldErrors(prev => ({ ...prev, firstName: undefined }));
      }
    } else {
      const result = UserProfileInputSchema.pick({ lastName: true }).safeParse({ lastName: value });
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        setFieldErrors(prev => ({ ...prev, lastName: errors.lastName }));
      } else {
        setFieldErrors(prev => ({ ...prev, lastName: undefined }));
      }
    }
  };

  const handleBlur = (field: 'firstName' | 'lastName', value: string) => {
    if (value.trim()) {
      validateField(field, value.trim());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    
    // Validate both required fields
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    
    const schema = UserProfileInputSchema.pick({ firstName: true, lastName: true });
    const result = schema.safeParse({
      firstName: trimmedFirstName,
      lastName: trimmedLastName
    });
    
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      setFieldErrors(errors);
      return;
    }

    try {
      setIsWorking(true);
      
      const updatedUser = await updateUserProfile(deviceInfo, {
        firstName: trimmedFirstName,
        lastName: trimmedLastName
      });
      
      if (updatedUser) {
        setUser(updatedUser);
        window.dispatchEvent(new CustomEvent('wizard-next'));
      } else {
        throw new Error('No user data returned from server');
      }
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsWorking(false);
    }
  };

  const hasFieldErrors = Object.values(fieldErrors).some(errors => errors && errors.length > 0);
  const isFormValid = firstName.trim() && lastName.trim() && !hasFieldErrors;

  return (
    <FormLayout 
      title="What's your name?"
      subtitle={
        <>
          Tell me what you would like to be called.
          <br />
          Don&apos;t worry, we&apos;ll keep it private—just between us.
        </>
      } 
      error={serverError}
    >
      <Form onSubmit={handleSubmit}>
        <TextInput
          id="firstName"
          name="firstName"
          type="text"
          label='First Name'
          autoComplete="given-name"
          value={firstName}
          onChange={e => setFirstName(e.target.value)}
          onBlur={e => handleBlur('firstName', e.target.value)}
          error={fieldErrors.firstName?.[0]}
          required
        />
        <TextInput
          id="lastName"
          name="lastName"
          type="text"
          label='Last Name'
          autoComplete="family-name"
          value={lastName}
          onChange={e => setLastName(e.target.value)}
          onBlur={e => handleBlur('lastName', e.target.value)}
          error={fieldErrors.lastName?.[0]}
          required
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