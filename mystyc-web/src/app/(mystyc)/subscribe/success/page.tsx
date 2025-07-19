'use client';

import { useEffect, useState } from 'react';

import { apiClient } from '@/api/apiClient';
import { useAppStore } from '@/store/appStore';
import { useUser } from '@/components/ui/layout/context/AppContext';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';
import { useUserStore } from '@/store/userStore';

export default function SubscribeSuccessPage() {
  const router = useTransitionRouter();
  const { setSubscribed } = useAppStore();
  const { setUser } = useUserStore();
  const user = useUser();
  const [isUpdating, setIsUpdating] = useState(true);

  useEffect(() => {
    const updateUserSubscription = async () => {
      if (!user) {
        // If no user, just redirect
        setSubscribed(true);
        router.replace("/");
        return;
      }

      try {
        // Fetch updated user data from server
        const updatedUser = await apiClient.getUser();
        
        // Update Zustand with new subscription info
        setUser(updatedUser);
        
        // Set subscribed flag for toast
        setSubscribed(true);
        
        // Redirect to home
        router.replace("/");
        
      } catch (error) {
        console.error('Failed to update user subscription info:', error);
        
        // Still show success and redirect even if update fails
        setSubscribed(true);
        router.replace("/");
      } finally {
        setIsUpdating(false);
      }
    };

    updateUserSubscription();
  }, [user, setUser, setSubscribed, router]);

  // Show loading state while updating
  if (isUpdating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Updating your subscription...</p>
        </div>
      </div>
    );
  }

  return null;
}