'use server'

import { AdminListResponse, BaseAdminQuery, AstrologySummary } from 'mystyc-common/admin';
import { 
  Sign,
  Planet,
  Element,
  Modality,
  Dynamic,
  EnergyType,
  PlanetaryPosition,
  ElementInteraction,
  ModalityInteraction,
  PlanetInteraction,
} from 'mystyc-common/schemas/';
import { DeviceInfo } from '@/interfaces/device-info.interface';
import { logger } from '@/util/logger';
import { withAdminAuth } from '@/server/util/admin/withAdminAuth';
import { nestGet } from '@/server/util/admin/nestClient';

// Astrology Summary
export async function getAstrologySummary(params: { deviceInfo: DeviceInfo }) {
  return withAdminAuth(async (session) => {
    logger.log('[getAstrologySummary] Fetching astrology summary');
    return nestGet<AstrologySummary>(session, 'admin/astrology/summary');
  }, params);
}

// Signs
export async function getSigns(params: {
  deviceInfo: DeviceInfo;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    logger.log('[getSigns] Fetching signs');
    const { deviceInfo, ...query } = fullParams;
    return nestGet<AdminListResponse<Sign>>(session, 'admin/signs', query);
  }, params);
}

// Planets
export async function getPlanets(params: {
  deviceInfo: DeviceInfo;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    logger.log('[getPlanets] Fetching planets');
    const { deviceInfo, ...query } = fullParams;
    return nestGet<AdminListResponse<Planet>>(session, 'admin/planets', query);
  }, params);
}

// Elements
export async function getElements(params: {
  deviceInfo: DeviceInfo;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    logger.log('[getElements] Fetching elements');
    const { deviceInfo, ...query } = fullParams;
    return nestGet<AdminListResponse<Element>>(session, 'admin/elements', query);
  }, params);
}

// Modalities
export async function getModalities(params: {
  deviceInfo: DeviceInfo;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    logger.log('[getModalities] Fetching modalities');
    const { deviceInfo, ...query } = fullParams;
    return nestGet<AdminListResponse<Modality>>(session, 'admin/modalities', query);
  }, params);
}

// Dynamics
export async function getDynamics(params: {
  deviceInfo: DeviceInfo;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    logger.log('[getDynamics] Fetching dynamics');
    const { deviceInfo, ...query } = fullParams;
    return nestGet<AdminListResponse<Dynamic>>(session, 'admin/dynamics', query);
  }, params);
}

// Energy Types
export async function getEnergyTypes(params: {
  deviceInfo: DeviceInfo;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    logger.log('[getEnergyTypes] Fetching energy types');
    const { deviceInfo, ...query } = fullParams;
    return nestGet<AdminListResponse<EnergyType>>(session, 'admin/energy-types', query);
  }, params);
}

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