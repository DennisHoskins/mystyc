'use client';

import { useEffect, useCallback } from 'react';

import { apiClientAdmin } from '@/api/apiClientAdmin';
import { useSessionErrorHandler } from '@/hooks/useSessionErrorHandler';
import { logger } from '@/util/logger';

import Card from '@/components/ui/Card';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';

export default function AdminHome() {
  const { handleSessionError } = useSessionErrorHandler();

  const loadDashboard = useCallback(async () => {
    try {
      console.log("[AdminHome] loadDashboard");

      const response = await apiClientAdmin.getDashboard({});
      console.log("[AdminHome] loadDashboard --> response: ", response);
    } catch (err) {
      const wasSessionError = await handleSessionError(err, 'UsersPage');
      if (!wasSessionError) {
        logger.error('Failed to load users:', err);
      }
    }
  }, [handleSessionError]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return(
    <Card>
      <Heading level={2}>Admin</Heading>
      <Text>Overview of system activity, key metrics, and quick access to administrative tasks</Text>
    </Card>
  );
};