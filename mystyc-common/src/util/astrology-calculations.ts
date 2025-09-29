import { AstrologyCalculated, PlanetaryDegrees } from '../interfaces';
import { Sign, ZodiacSignType, ElementType, ModalityType, PolarityType, PlanetType } from '../schemas';
import { calculateAngularDistance, getExactAspect } from './astrology-degrees';

export interface CompatibilityScores {
  dynamic: 'harmony' | 'tension' | 'complementary' | 'amplification';
  elementScore: number;
  modalityScore: number;
  polarityScore: number;
  dynamicScore: number;
  totalScore: number;
  exactAspect?: {
    type: string;
    angle: number;
    orb: number;
    strength: number;
  } | null;
  degreeBasedScore?: number;
}

/**
 * Normalizes scores from theoretical range (-1.035 to 1.629) to (-1 to 1)
 * @param score - Raw score after all calculations including stellium multipliers
 * @returns Normalized score between -1 and 1
 */
function normalizeScore(score: number): number {
  const MIN_SCORE = -1.035;
  const MAX_SCORE = 1.629;
  const RANGE = MAX_SCORE - MIN_SCORE; // 2.664
  
  // Linear mapping from [MIN_SCORE, MAX_SCORE] to [-1, 1]
  return ((score - MIN_SCORE) / RANGE) * 2 - 1;
}

/**
 * Planetary interactions calculation with optional degree precision
 * @param signs - Record mapping planets to their zodiac signs
 * @param signData - Record mapping zodiac signs to their complete Sign data
 * @param positions - Optional: Record mapping planets to their exact positions
 * @returns AstrologyCalculated - All planetary interaction scores and totals
 */
export function calculatePlanetaryInteractions(
  signs: Record<PlanetType, ZodiacSignType>,
  signData: Record<ZodiacSignType, Sign>,
  positions?: Record<PlanetType, PlanetaryDegrees>
): AstrologyCalculated {
  const planets: PlanetType[] = ['Sun', 'Moon', 'Rising', 'Venus', 'Mars'];
  const planetImportance: Record<PlanetType, number> = {
    Sun: 5, Moon: 4, Rising: 3, Venus: 2, Mars: 2
  };

  const interactions: any = {};

  // Initialize all planet entries first
  for (let i = 0; i < planets.length; i++) {
    const planet = planets[i].toLowerCase() as keyof AstrologyCalculated;
    interactions[planet] = {
      sign: signs[planets[i]],
      // Store degree information if available
      degreesInSign: positions?.[planets[i]]?.degreesInSign,
      absoluteDegrees: positions?.[planets[i]]?.absoluteDegrees,
      interactions: {},
      totalScore: 0
    };
  }

  // Calculate all pairwise interactions (store bidirectionally)
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const planet1 = planets[i].toLowerCase() as keyof AstrologyCalculated;
      const planet2 = planets[j].toLowerCase() as keyof AstrologyCalculated;
      const sign1Data = signData[signs[planets[i]]];
      const sign2Data = signData[signs[planets[j]]];
      
      // Pass position data for degree-aware calculations
      const position1 = positions?.[planets[i]];
      const position2 = positions?.[planets[j]];
      
      const compatibility = calculateCompatibility(sign1Data, sign2Data, position1, position2);
      
      // Store interaction for both planets
      interactions[planet1].interactions[planet2] = { score: compatibility.totalScore };
      interactions[planet2].interactions[planet1] = { score: compatibility.totalScore };
    }
  }

  // Calculate weighted averages and apply stellium multipliers
  for (let i = 0; i < planets.length; i++) {
    const planet = planets[i].toLowerCase() as keyof AstrologyCalculated;
    const scores: number[] = [];
    const weights: number[] = [];

    // Collect all interaction scores for this planet
    for (let j = 0; j < planets.length; j++) {
      if (i !== j) {
        const otherPlanet = planets[j].toLowerCase() as keyof AstrologyCalculated;
        const score = interactions[planet].interactions[otherPlanet]?.score;
        if (score !== undefined) {
          scores.push(score);
          weights.push(planetImportance[planets[j]]);
        }
      }
    }

    // Calculate weighted average
    if (scores.length > 0) {
      const weightedSum = scores.reduce((sum, score, idx) => sum + (score * weights[idx]), 0);
      const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
      interactions[planet].totalScore = Math.round((weightedSum / totalWeight) * 100) / 100;
    }

    // Apply stellium multipliers based on conjunctions (enhanced with degrees)
    const conjunctionCount = positions 
      ? countConjunctionsWithDegrees(planets[i], signs, positions)
      : countConjunctions(planets[i], signs);
      
    let stelliumMultiplier = 1.0;
    if (conjunctionCount === 1) stelliumMultiplier = 1.2;
    if (conjunctionCount === 2) stelliumMultiplier = 1.4;
    if (conjunctionCount === 3) stelliumMultiplier = 1.6;
    if (conjunctionCount >= 4) stelliumMultiplier = 1.8;
    
    interactions[planet].totalScore *= stelliumMultiplier;
    interactions[planet].totalScore = normalizeScore(interactions[planet].totalScore);
    interactions[planet].totalScore = Math.round(interactions[planet].totalScore * 100) / 100;
  }

  // Calculate overall profile total score
  let totalWeightedScore = 0;
  let totalImportanceWeight = 0;

  for (let i = 0; i < planets.length; i++) {
    const planet = planets[i].toLowerCase() as keyof AstrologyCalculated;
    const planetScore = interactions[planet].totalScore;
    const planetWeight = planetImportance[planets[i]];
    
    totalWeightedScore += planetScore * planetWeight;
    totalImportanceWeight += planetWeight;
  }

  interactions.totalScore = totalImportanceWeight > 0 
    ? Math.round((totalWeightedScore / totalImportanceWeight) * 100) / 100
    : 0;

  // Normalize the final total score
  interactions.totalScore = normalizeScore(interactions.totalScore);
  interactions.totalScore = Math.round(interactions.totalScore * 100) / 100;

  return interactions as AstrologyCalculated;
}

/**
 * Compatibility calculation with optional degree precision
 * @param sign1Data - Complete sign data for first sign
 * @param sign2Data - Complete sign data for second sign
 * @param position1 - Optional: Exact position of first planet
 * @param position2 - Optional: Exact position of second planet
 * @returns CompatibilityScores - All component scores plus enhanced degree-based scoring
 */
export function calculateCompatibility(
  sign1Data: Sign, 
  sign2Data: Sign,
  position1?: PlanetaryDegrees,
  position2?: PlanetaryDegrees
): CompatibilityScores {
  if (!sign1Data || !sign2Data) {
    return {
      dynamic: 'harmony',
      elementScore: 0.0,
      modalityScore: 0.0, 
      polarityScore: 0.0,
      dynamicScore: 0.0,
      totalScore: 0.0,
      exactAspect: null,
      degreeBasedScore: 0.0
    };    
  }
  const element1 = sign1Data.element;
  const element2 = sign2Data.element;
  const modality1 = sign1Data.modality;
  const modality2 = sign2Data.modality;
  const polarity1 = sign1Data.basics.polarity;
  const polarity2 = sign2Data.basics.polarity;
  
  // Use degree-aware distance calculation if positions available
  const distance = (position1 && position2) 
    ? getDegreeBasedDistance(position1, position2)
    : getSignDistance(sign1Data.sign, sign2Data.sign);
  
  let dynamic: CompatibilityScores['dynamic'];
  let elementScore: number;
  let modalityScore: number;
  let polarityScore: number;
  let dynamicScore: number;
  
  // Element compatibility scoring
  if (element1 === element2) {
    elementScore = 1.0;
  } else if ((element1 === 'Fire' && element2 === 'Air') || (element1 === 'Air' && element2 === 'Fire')) {
    elementScore = 0.7;
  } else if ((element1 === 'Earth' && element2 === 'Water') || (element1 === 'Water' && element2 === 'Earth')) {
    elementScore = 0.7;
  } else if ((element1 === 'Fire' && element2 === 'Water') || (element1 === 'Water' && element2 === 'Fire')) {
    elementScore = -0.8;
  } else if ((element1 === 'Earth' && element2 === 'Air') || (element1 === 'Air' && element2 === 'Earth')) {
    elementScore = -0.6;
  } else {
    elementScore = 0.0;
  }
  
  // Modality compatibility scoring
  if (modality1 === modality2) {
    if (modality1 === 'Cardinal') {
      modalityScore = -0.5;
    } else if (modality1 === 'Fixed') {
      modalityScore = 0.8;
    } else {
      modalityScore = 0.7;
    }
  } else {
    modalityScore = 0.4;
  }
  
  // Polarity compatibility scoring
  if (polarity1 === polarity2) {
    polarityScore = 0.2;
  } else {
    polarityScore = 0.7;
  }
  
  // Dynamic scoring with exact aspects
  let exactAspect;
  let degreeBasedScore;
  
  if (position1 && position2) {
    // Use exact aspect calculation for more precise scoring
    exactAspect = getExactAspect(position1.absoluteDegrees, position2.absoluteDegrees);
    
    if (exactAspect) {
      // Use exact aspect strength
      dynamicScore = exactAspect.strength;
      dynamic = getAspectDynamic(exactAspect.type);
      degreeBasedScore = exactAspect.strength;
    } else {
      // Fall back to sign-based calculation
      const aspectInfo = getSignBasedAspect(distance);
      dynamic = aspectInfo.dynamic;
      dynamicScore = aspectInfo.score;
    }
  } else {
    // Sign-based calculation
    const aspectInfo = getSignBasedAspect(distance);
    dynamic = aspectInfo.dynamic;
    dynamicScore = aspectInfo.score;
  }
  
  // Calculate total score (weighted average)
  const totalScore = (
    elementScore * 0.35 +    
    modalityScore * 0.25 +   
    polarityScore * 0.15 +   
    dynamicScore * 0.25      
  );
  
  return { 
    dynamic, 
    elementScore, 
    modalityScore, 
    polarityScore, 
    dynamicScore, 
    totalScore,
    exactAspect,
    degreeBasedScore
  };
}

/**
 * Conjunction counting using exact degrees
 * @param targetPlanet - The planet to check conjunctions for
 * @param signs - Record mapping planets to their zodiac signs
 * @param positions - Record mapping planets to their exact positions
 * @returns number - Count of planets within orb of conjunction
 */
function countConjunctionsWithDegrees(
  targetPlanet: PlanetType,
  signs: Record<PlanetType, ZodiacSignType>,
  positions: Record<PlanetType, PlanetaryDegrees>
): number {
  const targetPosition = positions[targetPlanet];
  if (!targetPosition) return countConjunctions(targetPlanet, signs);
  
  let conjunctionCount = 0;
  const conjunctionOrb = 8; // degrees
  
  for (const planet in signs) {
    if (planet !== targetPlanet) {
      const otherPosition = positions[planet as PlanetType];
      if (otherPosition) {
        const distance = calculateAngularDistance(
          targetPosition.absoluteDegrees,
          otherPosition.absoluteDegrees
        );
        if (distance <= conjunctionOrb) {
          conjunctionCount++;
        }
      }
    }
  }
  
  return conjunctionCount;
}

/**
 * Get degree-aware distance between planetary positions
 * @param position1 - First planetary position
 * @param position2 - Second planetary position  
 * @returns number - Traditional aspect distance (0-6) enhanced with degree precision
 */
function getDegreeBasedDistance(position1: PlanetaryDegrees, position2: PlanetaryDegrees): number {
  const angle = calculateAngularDistance(position1.absoluteDegrees, position2.absoluteDegrees);
  
  // Map angular distance to traditional aspect distances with enhanced precision
  if (angle <= 15) return 0;      // Conjunction (0-15°)
  if (angle <= 45) return 1;      // Semi-sextile/Semi-square (15-45°)
  if (angle <= 75) return 2;      // Sextile (45-75°)
  if (angle <= 105) return 3;     // Square (75-105°)
  if (angle <= 135) return 4;     // Trine (105-135°)
  if (angle <= 165) return 5;     // Quincunx (135-165°)
  return 6;                       // Opposition (165-180°)
}

/**
 * Get dynamic type from exact aspect name
 * @param aspectType - Type of aspect (conjunction, trine, etc.)
 * @returns Dynamic classification
 */
function getAspectDynamic(aspectType: string): 'harmony' | 'tension' | 'complementary' | 'amplification' {
  switch (aspectType) {
    case 'conjunction': return 'amplification';
    case 'trine': return 'harmony';
    case 'sextile': return 'complementary';
    case 'square': return 'tension';
    case 'opposition': return 'complementary';
    default: return 'harmony';
  }
}

/**
 * Get sign-based aspect information (extracted from original logic)
 * @param distance - Sign distance (0-6)
 * @returns Aspect dynamic and score
 */
function getSignBasedAspect(distance: number): { dynamic: CompatibilityScores['dynamic']; score: number } {
  if (distance === 0) {
    return { dynamic: 'amplification', score: 0.5 };
  } else if (distance === 4) {
    return { dynamic: 'harmony', score: 1.0 };
  } else if (distance === 2) {
    return { dynamic: 'complementary', score: 0.7 };
  } else if (distance === 3) {
    return { dynamic: 'tension', score: -0.8 };
  } else if (distance === 6) {
    return { dynamic: 'complementary', score: 0.7 };
  } else if (distance === 1 || distance === 5) {
    return { dynamic: 'tension', score: -0.4 };
  } else {
    return { dynamic: 'harmony', score: 0.3 };
  }
}

export function countConjunctions(
  targetPlanet: PlanetType, 
  signs: Record<PlanetType, ZodiacSignType>
): number {
  // ... existing implementation unchanged
  const targetSign = signs[targetPlanet];
  let conjunctionCount = 0;
  
  for (const planet in signs) {
    if (planet !== targetPlanet && signs[planet as PlanetType] === targetSign) {
      conjunctionCount++;
    }
  }
  return conjunctionCount;
}

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