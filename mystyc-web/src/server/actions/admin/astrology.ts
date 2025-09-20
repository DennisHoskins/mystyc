'use server'

import { AdminListResponse, BaseAdminQuery, AstrologySummary } from 'mystyc-common/admin';
import { 
  Sign,
  Planet,
  House,
  Element,
  Modality,
  Polarity,
  Dynamic,
  EnergyType,
  PlanetaryPosition,
  ElementInteraction,
  ModalityInteraction,
  PlanetInteraction,
  PolarityInteraction,
  ZodiacSignType,
  PlanetType,
  ElementType,
  ModalityType,
  PolarityType,
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

// Houses
export async function getHouses(params: {
  deviceInfo: DeviceInfo;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    logger.log('[getHouses] Fetching houses');
    const { deviceInfo, ...query } = fullParams;
    return nestGet<AdminListResponse<House>>(session, 'admin/houses', query);
  }, params);
}

export async function getHouse(params: {
  deviceInfo: DeviceInfo;
  house: number;
}) {
  return withAdminAuth(async (session, { house }) => {
    logger.log('[getHouse] Fetching house:', house);
    return nestGet<House>(session, `admin/houses/${house}`);
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

export async function getElementSigns(params: {
  deviceInfo: DeviceInfo;
  element: ElementType;
}) {
  return withAdminAuth(async (session, { element }) => {
    logger.log('[getElement] Fetching element signs:', element);
    return nestGet<Sign[]>(session, `admin/elements/signs/${element}`);
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

// Polarities
export async function getPolarities(params: {
  deviceInfo: DeviceInfo;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    logger.log('[getPolarities] Fetching polarities');
    const { deviceInfo, ...query } = fullParams;
    return nestGet<AdminListResponse<Polarity>>(session, 'admin/polarities', query);
  }, params);
}

export async function getPolarity(params: {
  deviceInfo: DeviceInfo;
  polarity: PolarityType;
}) {
  return withAdminAuth(async (session, { polarity }) => {
    logger.log('[getPolarity] Fetching polarity:', polarity);
    return nestGet<Polarity>(session, `admin/polarities/${polarity}`);
  }, params);
}

export async function getModalitySigns(params: {
  deviceInfo: DeviceInfo;
  modality: ModalityType;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, { modality }) => {
    logger.log('[getModalitySigns] Fetching modality signs by modality:' + modality);
    return nestGet<Sign[]>(session, `admin/signs/modalities/${modality}`);
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

export async function getPlanetaryPosition(params: {
  deviceInfo: DeviceInfo;
  planet: PlanetType;
  sign: ZodiacSignType;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, { planet, sign }) => {
    logger.log('[getPlanetaryPosition] Fetching planetary position:' + planet + "-" + sign);
    return nestGet<PlanetaryPosition>(session, `admin/planetary-positions/planetary-position/${planet}/${sign}`);
  }, params);
}

export async function getPlanetaryPositionsBySign(params: {
  deviceInfo: DeviceInfo;
  sign: ZodiacSignType;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, { sign }) => {
    logger.log('[getPlanetaryPositionsBySign] Fetching planetary positions by sign:' + sign);
    return nestGet<PlanetaryPosition[]>(session, `admin/planetary-positions/signs/${sign}`);
  }, params);
}

export async function getPlanetaryPositionsByPlanet(params: {
  deviceInfo: DeviceInfo;
  planet: PlanetType;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, { planet }) => {
    logger.log('[getPlanetaryPositionsByPlanet] Fetching planetary positions by planet:' + planet);
    return nestGet<PlanetaryPosition[]>(session, `admin/planetary-positions/planets/${planet}`);
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

export async function getElementInteraction(params: {
  deviceInfo: DeviceInfo;
  element1: ElementType;
  element2: ElementType;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, { element1, element2 }) => {
    logger.log('[getElementInteraction] Fetching element interactions by elements:' + element1 + "-" + element2);
    return nestGet<ElementInteraction>(session, `admin/element-interactions/element-interaction/${element1}/${element2}`);
  }, params);
}

export async function getElementInteractionsByElement(params: {
  deviceInfo: DeviceInfo;
  element: ElementType;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, { element }) => {
    logger.log('[getElementInteractionsByElement] Fetching element interactions by element:' + element);
    return nestGet<ElementInteraction[]>(session, `admin/element-interactions/elements/${element}`);
  }, params);
}

export async function getElementInteractionsByDynamic(params: {
  deviceInfo: DeviceInfo;
  dynamic: DynamicType;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, { dynamic }) => {
    logger.log('[getElementInteractionsByDynamic] Fetching element interactions by dynamic:' + dynamic);
    return nestGet<ElementInteraction[]>(session, `admin/element-interactions/dynamics/${dynamic}`);
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

export async function getModalityInteraction(params: {
  deviceInfo: DeviceInfo;
  modality1: ModalityType;
  modality2: ModalityType;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, { modality1, modality2 }) => {
    logger.log('[getModalityInteraction] Fetching modality interactions by modalities:' + modality1 + "-" + modality2);
    return nestGet<ModalityInteraction>(session, `admin/modality-interactions/modality-interaction/${modality1}/${modality2}`);
  }, params);
}

export async function getModalityInteractionsByModality(params: {
  deviceInfo: DeviceInfo;
  modality: ModalityType;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, { modality }) => {
    logger.log('[getModalityInteractionsByModality] Fetching modality interactions by modality:' + modality);
    return nestGet<ModalityInteraction[]>(session, `admin/modality-interactions/modalities/${modality}`);
  }, params);
}

export async function getModalityInteractionsByDynamic(params: {
  deviceInfo: DeviceInfo;
  dynamic: DynamicType;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, { dynamic }) => {
    logger.log('[getModalityInteractionsByDynamic] Fetching modality interactions by dynamic:' + dynamic);
    return nestGet<ModalityInteraction[]>(session, `admin/modality-interactions/dynamics/${dynamic}`);
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

export async function getPlanetInteraction(params: {
  deviceInfo: DeviceInfo;
  planet1: PlanetType;
  planet2: PlanetType;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, { planet1, planet2 }) => {
    logger.log('[getPlanetInteraction] Fetching planet interactions by planets:' + planet1 + "-" + planet2);
    return nestGet<PlanetInteraction>(session, `admin/planet-interactions/planet-interaction/${planet1}/${planet2}`);
  }, params);
}

export async function getPlanetInteractionsByPlanet(params: {
  deviceInfo: DeviceInfo;
  planet: PlanetType;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, { planet }) => {
    logger.log('[getPlanetInteractionsByPlanet] Fetching planet interactions by planet:' + planet);
    return nestGet<PlanetInteraction[]>(session, `admin/planet-interactions/planets/${planet}`);
  }, params);
}

export async function getPlanetInteractionsByDynamic(params: {
  deviceInfo: DeviceInfo;
  dynamic: DynamicType;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, { dynamic }) => {
    logger.log('[getPlanetInteractionsByDynamic] Fetching planet interactions by dynamic:' + dynamic);
    return nestGet<PlanetInteraction[]>(session, `admin/planet-interactions/dynamics/${dynamic}`);
  }, params);
}

// Polarity Interactions
export async function getPolarityInteractions(params: {
  deviceInfo: DeviceInfo;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, fullParams) => {
    logger.log('[getPolarityInteractions] Fetching polarity interactions');
    const { deviceInfo, ...query } = fullParams;
    return nestGet<AdminListResponse<PolarityInteraction>>(session, 'admin/polarity-interactions', query);
  }, params);
}

export async function getPolarityInteraction(params: {
  deviceInfo: DeviceInfo;
  polarity1: PolarityType;
  polarity2: PolarityType;
} & Partial<BaseAdminQuery>) {
  return withAdminAuth(async (session, { polarity1, polarity2 }) => {
    logger.log('[getPolarityInteraction] Fetching polarity interactions by polarities:' + polarity1 + "-" + polarity2);
    return nestGet<PolarityInteraction>(session, `admin/polarity-interactions/polarity-interaction/${polarity1}/${polarity2}`);
  }, params);
}
