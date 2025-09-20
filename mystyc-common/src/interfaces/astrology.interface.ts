import { 
  Sign, 
  Element, 
  Modality, 
  EnergyType, 
  Planet, 
  PlanetType,
  Polarity,
  House,
  Dynamic,
  SignInteraction,
  ElementInteraction,
  ModalityInteraction,
  PolarityInteraction,
  PlanetaryPosition,
  PlanetInteraction,
  ZodiacSignType
} from '../schemas';

export interface ElementComplete extends Element {
  energyTypeData: EnergyType | null;
}

export interface ModalityComplete extends Modality {
  energyTypeData: EnergyType | null;
}

export interface PolarityComplete extends Polarity {
  energyTypeData: EnergyType | null;
}

export interface PlanetComplete extends Planet {
  energyTypeData: EnergyType | null;
}

export interface HouseComplete extends House {
  naturalRulerSignData: Sign | null;
  energyTypeData: EnergyType | null;
}

export interface SignComplete extends Sign {
  houseData: HouseComplete | null;
  elementData: ElementComplete | null;
  modalityData: ModalityComplete | null;
  polarityData: PolarityComplete | null;
  energyTypeData: EnergyType | null;
  
  // Best and worst compatibility interactions
  bestInteraction?: SignInteraction | null;
  worstInteraction?: SignInteraction | null;
}

export interface ElementInteractionComplete extends ElementInteraction {
  dynamicData: Dynamic | null;
  energyTypeData: EnergyType | null;
}

export interface ModalityInteractionComplete extends ModalityInteraction {
  dynamicData: Dynamic | null;
  energyTypeData: EnergyType | null;
}

export interface PolarityInteractionComplete extends PolarityInteraction {
  dynamicData: Dynamic | null;
  energyTypeData: EnergyType | null;
}

export interface PlanetInteractionComplete extends PlanetInteraction {
  dynamicData: Dynamic | null;
  energyTypeData: EnergyType | null;
}

export interface SignInteractionComplete extends SignInteraction {
  // Complete data for both signs
  sign1Data: SignComplete;
  sign2Data: SignComplete;
  
  // Sign interaction level data
  dynamicData: Dynamic | null;
  energyTypeData: EnergyType | null;
  
  // Cross-sign interaction data
  elementInteractionData: ElementInteractionComplete | null;
  modalityInteractionData: ModalityInteractionComplete | null;
  polarityInteractionData: PolarityInteractionComplete | null;
}

// Calculated Astrology Interfaces
export interface PlanetaryInteractionScore {
  score: number;
  description?: string;
}

export interface AISummary {
  description?: string;
  strengths?: string;
  challenges?: string;
  action?: string;
}

export interface PlanetaryData {
  sign: ZodiacSignType;
  degreesInSign?: number;
  absoluteDegrees?: number;
  totalScore: number;
  summary?: AISummary;
  interactions?: Record<string, PlanetaryInteractionScore>;
}

export interface AstrologyCalculated {
  sun: PlanetaryData;
  moon: PlanetaryData;
  rising: PlanetaryData;
  venus: PlanetaryData;
  mars: PlanetaryData;
  totalScore: number;
  summary?: AISummary;
  createdAt: Date;
  lastCalculatedAt: Date;
}

export interface PlanetaryDegrees {
  sign: ZodiacSignType;
  degreesInSign: number;
  absoluteDegrees: number;
}

export interface PlanetaryPositionComplete extends PlanetaryPosition {
  signData: SignComplete;
  energyTypeData: EnergyType | null;
}

export interface PlanetaryCompleteData {
  sign: ZodiacSignType;
  totalScore: number;
  interactions: Record<string, { score: number }>;
  signData: SignComplete;
  planetData: Planet;
  positionData: PlanetaryPositionComplete;
}

export interface AstrologyComplete {
  totalScore: number;

  sun: PlanetaryCompleteData;
  moon: PlanetaryCompleteData;
  rising: PlanetaryCompleteData;
  venus: PlanetaryCompleteData;
  mars: PlanetaryCompleteData;

  // Rich interaction data between planets
  planetaryInteractions: {
    'sun-moon': PlanetInteractionComplete;
    'sun-rising': PlanetInteractionComplete;
    'sun-mars': PlanetInteractionComplete;
    'sun-venus': PlanetInteractionComplete;
    'moon-rising': PlanetInteractionComplete;
    'moon-venus': PlanetInteractionComplete;
    'moon-mars': PlanetInteractionComplete;
    'rising-venus': PlanetInteractionComplete;
    'rising-mars': PlanetInteractionComplete;
    'venus-mars': PlanetInteractionComplete;
  };
  
  createdAt: Date;
  lastCalculatedAt: Date;
}



export interface DailyInfluence {
  planet: PlanetType;
  birthPosition: PlanetaryDegrees;
  cosmicPosition: PlanetaryDegrees;
  aspectType?: string;      // 'trine', 'square', etc.
  aspectStrength?: number;  // Aspect strength (-1 to 1)
  dailyScore: number;       // This planet's energy for the day
  influence: string;        // Brief description
}