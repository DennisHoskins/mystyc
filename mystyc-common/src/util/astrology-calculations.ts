import { Sign, ZodiacSignType, ElementType, ModalityType, PolarityType, PlanetType } from '../schemas';

export interface CompatibilityScores {
  dynamic: 'harmony' | 'tension' | 'complementary' | 'amplification';
  elementScore: number;
  modalityScore: number;
  polarityScore: number;
  dynamicScore: number;
  totalScore: number;
}

export interface PlanetaryInteractionResult {
  score: number;
}

export interface PlanetaryCalculations {
  sun: { sign: ZodiacSignType; totalScore: number; interactions: Record<string, PlanetaryInteractionResult> };
  moon: { sign: ZodiacSignType; totalScore: number; interactions: Record<string, PlanetaryInteractionResult> };
  rising: { sign: ZodiacSignType; totalScore: number; interactions: Record<string, PlanetaryInteractionResult> };
  venus: { sign: ZodiacSignType; totalScore: number; interactions: Record<string, PlanetaryInteractionResult> };
  mars: { sign: ZodiacSignType; totalScore: number; };
}

/**
 * Calculates all planetary interactions and weighted totals for a user's chart
 * @param signs - Record mapping planets to their zodiac signs
 * @param signData - Record mapping zodiac signs to their complete Sign data
 * @returns PlanetaryCalculations - All planetary interaction scores and totals
 */
export function calculatePlanetaryInteractions(
  signs: Record<PlanetType, ZodiacSignType>,
  signData: Record<ZodiacSignType, Sign>
): PlanetaryCalculations {
  const planets: PlanetType[] = ['Sun', 'Moon', 'Rising', 'Venus', 'Mars'];
  const planetImportance: Record<PlanetType, number> = {
    Sun: 5, Moon: 5, Rising: 4, Venus: 3, Mars: 3
  };

  const interactions: any = {};

  // Calculate all pairwise interactions
  for (let i = 0; i < planets.length; i++) {
    const planet1 = planets[i].toLowerCase() as keyof PlanetaryCalculations;
    interactions[planet1] = {
      sign: signs[planets[i]],
      interactions: {},
      totalScore: 0
    };

    const scores: number[] = [];
    const weights: number[] = [];

    for (let j = i + 1; j < planets.length; j++) {
      const planet2 = planets[j].toLowerCase() as keyof PlanetaryCalculations;
      const sign1Data = signData[signs[planets[i]]];
      const sign2Data = signData[signs[planets[j]]];
      
      const compatibility = calculateCompatibility(sign1Data, sign2Data);
      interactions[planet1].interactions[planet2] = { score: compatibility.totalScore };
      
      scores.push(compatibility.totalScore);
      weights.push(planetImportance[planets[j]]);
    }

    // Calculate weighted average for this planet
    if (scores.length > 0) {
      const weightedSum = scores.reduce((sum, score, idx) => sum + (score * weights[idx]), 0);
      const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
      interactions[planet1].totalScore = Math.round((weightedSum / totalWeight) * 100) / 100;
    }
  }

  return interactions as PlanetaryCalculations;
}

/**
 * Calculates comprehensive compatibility scores between two zodiac signs
 * @param sign1Data - Complete sign data for first sign
 * @param sign2Data - Complete sign data for second sign
 * @returns CompatibilityScores - All component scores plus total weighted score
 */
export function calculateCompatibility(sign1Data: Sign, sign2Data: Sign): CompatibilityScores {
  const element1 = sign1Data.element;
  const element2 = sign2Data.element;
  const modality1 = sign1Data.modality;
  const modality2 = sign2Data.modality;
  const polarity1 = sign1Data.basics.polarity;
  const polarity2 = sign2Data.basics.polarity;
  const distance = getSignDistance(sign1Data.sign, sign2Data.sign);
  
  let dynamic: CompatibilityScores['dynamic'];
  let elementScore: number;
  let modalityScore: number;
  let polarityScore: number;
  let dynamicScore: number;
  
  // Element compatibility scoring
  if (element1 === element2) {
    elementScore = 0.8; // Same element harmony
  } else if ((element1 === 'Fire' && element2 === 'Air') || (element1 === 'Air' && element2 === 'Fire')) {
    elementScore = 0.7; // Fire + Air complementary
  } else if ((element1 === 'Earth' && element2 === 'Water') || (element1 === 'Water' && element2 === 'Earth')) {
    elementScore = 0.7; // Earth + Water complementary  
  } else if ((element1 === 'Fire' && element2 === 'Water') || (element1 === 'Water' && element2 === 'Fire')) {
    elementScore = -0.3; // Fire + Water tension
  } else if ((element1 === 'Earth' && element2 === 'Air') || (element1 === 'Air' && element2 === 'Earth')) {
    elementScore = -0.2; // Earth + Air tension
  } else {
    elementScore = 0.0; // Neutral
  }
  
  // Modality compatibility scoring  
  if (modality1 === modality2) {
    if (modality1 === 'Cardinal') {
      modalityScore = -0.2; // Cardinal + Cardinal tension
    } else if (modality1 === 'Fixed') {
      modalityScore = 0.6; // Fixed + Fixed amplification
    } else { // Mutable
      modalityScore = 0.5; // Mutable + Mutable harmony
    }
  } else {
    modalityScore = 0.4; // Cross-modality complementary
  }
  
  // Polarity compatibility scoring
  if (polarity1 === polarity2) {
    polarityScore = 0.2; // Same polarity - comfortable but less magnetic
  } else {
    polarityScore = 0.7; // Opposite polarities - magnetic attraction
  }
  
  // Astrological aspect-based dynamic
  if (distance === 0) {
    dynamic = 'amplification';
    dynamicScore = 0.5;
  } else if (distance === 4) { // Trine (same element)
    dynamic = 'harmony';
    dynamicScore = 1.0;
  } else if (distance === 2) { // Sextile
    dynamic = 'complementary';
    dynamicScore = 0.7;
  } else if (distance === 3) { // Square
    dynamic = 'tension';
    dynamicScore = -0.5;
  } else if (distance === 6) { // Opposition
    dynamic = 'complementary';
    dynamicScore = 0.7;
  } else if (distance === 1 || distance === 5) { // Adjacent/quincunx
    dynamic = 'tension';
    dynamicScore = -0.2;
  } else {
    dynamic = 'harmony';
    dynamicScore = 0.3;
  }
  
  // Calculate total score (weighted average including polarity)
  const totalScore = (
    elementScore * 0.35 +    // Reduced from 0.4 to make room for polarity
    modalityScore * 0.25 +   // Reduced from 0.3 
    polarityScore * 0.15 +   // NEW - polarity contribution
    dynamicScore * 0.25      // Reduced from 0.3
  );
  
  return { 
    dynamic, 
    elementScore, 
    modalityScore, 
    polarityScore, 
    dynamicScore, 
    totalScore 
  };
}

/**
 * Calculates the distance between two zodiac signs
 * @param sign1 - First zodiac sign
 * @param sign2 - Second zodiac sign
 * @returns number - Distance between signs (0-6)
 */
export function getSignDistance(sign1: ZodiacSignType, sign2: ZodiacSignType): number {
  const signs: ZodiacSignType[] = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  
  const index1 = signs.indexOf(sign1);
  const index2 = signs.indexOf(sign2);
  
  if (index1 === -1 || index2 === -1) {
    throw new Error(`Invalid zodiac sign: ${sign1} or ${sign2}`);
  }
  
  const rawDistance = Math.abs(index1 - index2);
  // Return the shorter distance around the zodiac wheel
  return Math.min(rawDistance, 12 - rawDistance);
}

/**
 * Gets the element for a zodiac sign
 * @param sign - Zodiac sign
 * @returns ElementType - The element of the sign
 */
export function getElement(sign: ZodiacSignType): ElementType {
  const elementMap: Record<ZodiacSignType, ElementType> = {
    'Aries': 'Fire', 'Leo': 'Fire', 'Sagittarius': 'Fire',
    'Taurus': 'Earth', 'Virgo': 'Earth', 'Capricorn': 'Earth',
    'Gemini': 'Air', 'Libra': 'Air', 'Aquarius': 'Air',
    'Cancer': 'Water', 'Scorpio': 'Water', 'Pisces': 'Water'
  };
  
  return elementMap[sign];
}

/**
 * Gets the modality for a zodiac sign
 * @param sign - Zodiac sign
 * @returns ModalityType - The modality of the sign
 */
export function getModality(sign: ZodiacSignType): ModalityType {
  const modalityMap: Record<ZodiacSignType, ModalityType> = {
    'Aries': 'Cardinal', 'Cancer': 'Cardinal', 'Libra': 'Cardinal', 'Capricorn': 'Cardinal',
    'Taurus': 'Fixed', 'Leo': 'Fixed', 'Scorpio': 'Fixed', 'Aquarius': 'Fixed',
    'Gemini': 'Mutable', 'Virgo': 'Mutable', 'Sagittarius': 'Mutable', 'Pisces': 'Mutable'
  };
  
  return modalityMap[sign];
}

/**
 * Gets the polarity for a zodiac sign
 * @param sign - Zodiac sign
 * @returns PolarityType - The polarity of the sign
 */
export function getPolarity(sign: ZodiacSignType): PolarityType {
  const polarityMap: Record<ZodiacSignType, PolarityType> = {
    'Aries': 'Masculine', 'Gemini': 'Masculine', 'Leo': 'Masculine', 'Libra': 'Masculine', 
    'Sagittarius': 'Masculine', 'Aquarius': 'Masculine',
    'Taurus': 'Feminine', 'Cancer': 'Feminine', 'Virgo': 'Feminine', 'Scorpio': 'Feminine',
    'Capricorn': 'Feminine', 'Pisces': 'Feminine'
  };
  
  return polarityMap[sign];
}