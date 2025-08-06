'use client'

import { useState, useEffect, useCallback } from 'react';

import { 
  PlanetaryPosition,
  ElementInteraction,
  ModalityInteraction,
  PlanetInteraction
} from 'mystyc-common/schemas';
import { AdminListResponse } from 'mystyc-common/admin';
import { 
  getPlanetaryPositions,
  getElementInteractions,
  getModalityInteractions,
  getPlanetInteractions
} from '@/server/actions/admin/astrology';
import { getDefaultListQuery } from '@/util/admin/getQuery';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import AstrologyIcon from '@/components/admin/ui/icons/AstrologyIcon';
import {
  PlanetaryPositionsTable,
  ElementInteractionsTable,
  ModalityInteractionsTable,
  PlanetInteractionsTable
} from './AstrologyTables';

export default function AstrologyPage() {
  const { setBusy, isBusy } = useBusy();
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [planetaryPositions, setPlanetaryPositions] = useState<AdminListResponse<PlanetaryPosition> | null>(null);
  const [elementInteractions, setElementInteractions] = useState<AdminListResponse<ElementInteraction> | null>(null);
  const [modalityInteractions, setModalityInteractions] = useState<AdminListResponse<ModalityInteraction> | null>(null);
  const [planetInteractions, setPlanetInteractions] = useState<AdminListResponse<PlanetInteraction> | null>(null);
  
  // Page states
  const [planetaryPositionsPage, setPlanetaryPositionsPage] = useState(0);
  const [elementInteractionsPage, setElementInteractionsPage] = useState(0);
  const [modalityInteractionsPage, setModalityInteractionsPage] = useState(0);
  const [planetInteractionsPage, setPlanetInteractionsPage] = useState(0);

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Astrology' },
  ];

  // Load planetary positions
  const loadPlanetaryPositions = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);

      const listQuery = getDefaultListQuery(page);
      const response = await getPlanetaryPositions({deviceInfo: getDeviceInfo(), ...listQuery});

      setPlanetaryPositions(response);
      setPlanetaryPositionsPage(page);
    } catch (err) {
      logger.error('Failed to load planetary positions:', err);
      setError('Failed to load planetary positions. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  // Load element interactions
  const loadElementInteractions = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);

      const listQuery = getDefaultListQuery(page);
      const response = await getElementInteractions({deviceInfo: getDeviceInfo(), ...listQuery});

      setElementInteractions(response);
      setElementInteractionsPage(page);
    } catch (err) {
      logger.error('Failed to load element interactions:', err);
      setError('Failed to load element interactions. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  // Load modality interactions
  const loadModalityInteractions = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);

      const listQuery = getDefaultListQuery(page);
      const response = await getModalityInteractions({deviceInfo: getDeviceInfo(), ...listQuery});

      setModalityInteractions(response);
      setModalityInteractionsPage(page);
    } catch (err) {
      logger.error('Failed to load modality interactions:', err);
      setError('Failed to load modality interactions. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  // Load planet interactions
  const loadPlanetInteractions = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);

      const listQuery = getDefaultListQuery(page);
      const response = await getPlanetInteractions({deviceInfo: getDeviceInfo(), ...listQuery});

      setPlanetInteractions(response);
      setPlanetInteractionsPage(page);
    } catch (err) {
      logger.error('Failed to load planet interactions:', err);
      setError('Failed to load planet interactions. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  // Load all data on mount
  useEffect(() => {
    loadPlanetaryPositions(0);
    loadElementInteractions(0);
    loadModalityInteractions(0);
    loadPlanetInteractions(0);
  }, [loadPlanetaryPositions, loadElementInteractions, loadModalityInteractions, loadPlanetInteractions]);

  const retryAll = () => {
    loadPlanetaryPositions(0);
    loadElementInteractions(0);
    loadModalityInteractions(0);
    loadPlanetInteractions(0);
  };

  return (
   <AdminListLayout
      error={error}
      onRetry={retryAll}
      breadcrumbs={breadcrumbs}
      icon={AstrologyIcon}
      description="View astrology knowledge base including planetary positions and interactions between elements, modalities, and planets"
      sideContent={
        <div className="text-center bg-gray-50 p-4 rounded-md">
          <div className="text-2xl font-bold text-blue-600">
            {(planetaryPositions?.pagination.totalItems || 0) + 
             (elementInteractions?.pagination.totalItems || 0) + 
             (modalityInteractions?.pagination.totalItems || 0) + 
             (planetInteractions?.pagination.totalItems || 0)}
          </div>
          <div className="text-sm text-gray-500">Total Astrology Records</div>
        </div>
      }
      tableContent={[
        <PlanetaryPositionsTable
          key='planetary-positions'
          label="Planetary Positions"
          data={planetaryPositions?.data}
          pagination={planetaryPositions?.pagination}
          loading={isBusy}
          currentPage={planetaryPositionsPage}
          onPageChange={loadPlanetaryPositions}
          onRefresh={() => loadPlanetaryPositions(0)}
        />,
        <ElementInteractionsTable
          key='element-interactions'
          label="Element Interactions"
          data={elementInteractions?.data}
          pagination={elementInteractions?.pagination}
          loading={isBusy}
          currentPage={elementInteractionsPage}
          onPageChange={loadElementInteractions}
          onRefresh={() => loadElementInteractions(0)}
        />,
        <ModalityInteractionsTable
          key='modality-interactions'
          label="Modality Interactions"
          data={modalityInteractions?.data}
          pagination={modalityInteractions?.pagination}
          loading={isBusy}
          currentPage={modalityInteractionsPage}
          onPageChange={loadModalityInteractions}
          onRefresh={() => loadModalityInteractions(0)}
        />,
        <PlanetInteractionsTable
          key='planet-interactions'
          label="Planet Interactions"
          data={planetInteractions?.data}
          pagination={planetInteractions?.pagination}
          loading={isBusy}
          currentPage={planetInteractionsPage}
          onPageChange={loadPlanetInteractions}
          onRefresh={() => loadPlanetInteractions(0)}
        />
      ]}
    />   
  );
}