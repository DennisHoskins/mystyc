import { 
  Sign, 
  Element, 
  Modality, 
  EnergyType, 
  Planet, 
  Polarity,
  House,
  Dynamic,
  SignInteraction,
  ElementInteraction,
  ModalityInteraction,
  PolarityInteraction,
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
}

export interface PlanetaryData {
  sign: ZodiacSignType;
  totalScore: number;
  interactions?: Record<string, PlanetaryInteractionScore>;
}

export interface AstrologyCalculated {
  sun: PlanetaryData;
  moon: PlanetaryData;
  rising: PlanetaryData;
  venus: PlanetaryData;
  mars: PlanetaryData;
  createdAt: Date;
  lastCalculatedAt: Date;
}