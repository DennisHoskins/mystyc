'use server'

import { Sign, Element, Modality, EnergyType, ZodiacSignType } from 'mystyc-common/schemas';
import { DeviceInfo } from '@/interfaces/';
import { authTokenManager } from '@/server/services/authTokenManager';
import { logger } from '@/util/logger';
import { withSession } from '../util/withSession';

export interface ElementWithEnergyType extends Element {
  energyTypeData: EnergyType | null;
}

export interface ModalityWithEnergyType extends Modality {
  energyTypeData: EnergyType | null;
}

export interface SignWithRelatedData extends Sign {
  elementData: ElementWithEnergyType | null;
  modalityData: ModalityWithEnergyType | null;
  energyTypeData: EnergyType | null;
}

export async function getSign(params: {
  deviceInfo: DeviceInfo;
  sign: ZodiacSignType;
}): Promise<SignWithRelatedData | null> {
  return withSession(async (session) => {
    if (!session.authToken) {
      throw new Error(`Failed to fetch sign: No Auth Token`);
    }

    const nestResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/astrology/sign/${params.sign}`, {
      method: 'GET',
      headers: {
        'Authorization': authTokenManager.createAuthHeader(session.authToken),
      },
    });

    if (!nestResponse.ok) {
      logger.error('[getSign] Failed to fetch sign:', nestResponse.status);
      throw new Error(`Failed to fetch sign: ${nestResponse.status}`);
    }

    return nestResponse.json();
  }, params.deviceInfo, 'getSign');
}