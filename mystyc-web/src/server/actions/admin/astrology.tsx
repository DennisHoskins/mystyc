'use server'

import { AdminListResponse, BaseAdminQuery } from 'mystyc-common/admin';
import { 
  PlanetaryPosition,
  ElementInteraction,
  ModalityInteraction,
  PlanetInteraction
} from 'mystyc-common/schemas/';
import { DeviceInfo } from '@/interfaces/device-info.interface';
import { logger } from '@/util/logger';
import { withAdminAuth } from '@/server/util/admin/withAdminAuth';
import { nestGet } from '@/server/util/admin/nestClient';

// Planetary Positions
export async function getPlanetaryPositions(params: {
  deviceInfo: DeviceInfo;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    logger.log('[getPlanetaryPositions] Fetching planetary positions');
    const { deviceInfo, ...query } = fullParams;
    return nestGet<AdminListResponse<PlanetaryPosition>>(session, 'admin/planetary-positions', query);
  }, params);
}

// Element Interactions
export async function getElementInteractions(params: {
  deviceInfo: DeviceInfo;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    logger.log('[getElementInteractions] Fetching element interactions');
    const { deviceInfo, ...query } = fullParams;
    return nestGet<AdminListResponse<ElementInteraction>>(session, 'admin/element-interactions', query);
  }, params);
}

// Modality Interactions
export async function getModalityInteractions(params: {
  deviceInfo: DeviceInfo;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    logger.log('[getModalityInteractions] Fetching modality interactions');
    const { deviceInfo, ...query } = fullParams;
    return nestGet<AdminListResponse<ModalityInteraction>>(session, 'admin/modality-interactions', query);
  }, params);
}

// Planet Interactions
export async function getPlanetInteractions(params: {
  deviceInfo: DeviceInfo;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    logger.log('[getPlanetInteractions] Fetching planet interactions');
    const { deviceInfo, ...query } = fullParams;
    return nestGet<AdminListResponse<PlanetInteraction>>(session, 'admin/planet-interactions', query);
  }, params);
}