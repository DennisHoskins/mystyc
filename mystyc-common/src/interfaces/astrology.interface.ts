import { 
  Sign, 
  Element, 
  Modality, 
  EnergyType, 
  Planet, 
  Polarity,
  House
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
}
