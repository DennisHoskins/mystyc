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
  ZodiacSignType,
  PlanetType,
  ElementType,
  ModalityType,
  DynamicType,
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

export async function getSign(params: {
  deviceInfo: DeviceInfo;
  sign: ZodiacSignType;
}) {
  return withAdminAuth(async (session, { sign }) => {
    logger.log('[getSign] Fetching sign:', sign);
    return nestGet<Sign>(session, `admin/signs/${sign}`);
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

export async function getPlanet(params: {
  deviceInfo: DeviceInfo;
  planet: PlanetType;
}) {
  return withAdminAuth(async (session, { planet }) => {
    logger.log('[getPlanet] Fetching planet:', planet);
    return nestGet<Planet>(session, `admin/planets/${planet}`);
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

export async function getElement(params: {
  deviceInfo: DeviceInfo;
  element: ElementType;
}) {
  return withAdminAuth(async (session, { element }) => {
    logger.log('[getElement] Fetching element:', element);
    return nestGet<Element>(session, `admin/elements/${element}`);
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

export async function getModality(params: {
  deviceInfo: DeviceInfo;
  modality: ModalityType;
}) {
  return withAdminAuth(async (session, { modality }) => {
    logger.log('[getModality] Fetching modality:', modality);
    return nestGet<Modality>(session, `admin/modalities/${modality}`);
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

export async function getDynamic(params: {
  deviceInfo: DeviceInfo;
  dynamic: DynamicType;
}) {
  return withAdminAuth(async (session, { dynamic }) => {
    logger.log('[getDynamic] Fetching dynamic:', dynamic);
    return nestGet<Dynamic>(session, `admin/dynamics/${dynamic}`);
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

export async function getEnergyType(params: {
  deviceInfo: DeviceInfo;
  energyType: string;
}) {
  return withAdminAuth(async (session, { energyType }) => {
    logger.log('[getEnergyType] Fetching energyType:', energyType);
    return nestGet<EnergyType>(session, `admin/energy-types/${energyType}`);
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

export async function getPlanetaryPositionsBySign(params: {
  deviceInfo: DeviceInfo;
  sign: ZodiacSignType;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, { sign }) => {
    logger.log('[getPlanetaryPositionsBySign] Fetching planetary positions by sign:' + sign);
    return nestGet<PlanetaryPosition[]>(session, `admin/planetary-positions/${sign}`);
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