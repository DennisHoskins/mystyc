import { AstrologyCalculated } from '../interfaces';
import { Sign, ZodiacSignType, ElementType, ModalityType, PolarityType, PlanetType } from '../schemas';

export interface CompatibilityScores {
  dynamic: 'harmony' | 'tension' | 'complementary' | 'amplification';
  elementScore: number;
  modalityScore: number;
  polarityScore: number;
  dynamicScore: number;
  totalScore: number;
}

/**
 * Counts how many other planets are in the same sign as the target planet
 * @param targetPlanet - The planet to check conjunctions for
 * @param signs - Record mapping planets to their zodiac signs
 * @returns number - Count of other planets in same sign
 */
function countConjunctions(
  targetPlanet: PlanetType, 
  signs: Record<PlanetType, ZodiacSignType>
): number {
  const targetSign = signs[targetPlanet];
  let conjunctionCount = 0;
  
  for (const planet in signs) {
    if (planet !== targetPlanet && signs[planet as PlanetType] === targetSign) {
      conjunctionCount++;
    }
  }
  return conjunctionCount;
}

/**
 * Calculates all planetary interactions and weighted totals for a user's chart
 * @param signs - Record mapping planets to their zodiac signs
 * @param signData - Record mapping zodiac signs to their complete Sign data
 * @returns AstrologyCalculated - All planetary interaction scores and totals
 */
export function calculatePlanetaryInteractions(
  signs: Record<PlanetType, ZodiacSignType>,
  signData: Record<ZodiacSignType, Sign>
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
      
      const compatibility = calculateCompatibility(sign1Data, sign2Data);
      
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

    // Apply stellium multipliers based on conjunctions
    const conjunctionCount = countConjunctions(planets[i], signs);
    let stelliumMultiplier = 1.0;
    if (conjunctionCount === 1) stelliumMultiplier = 1.2;      // 2 planets together
    if (conjunctionCount === 2) stelliumMultiplier = 1.4;      // 3 planets together  
    if (conjunctionCount === 3) stelliumMultiplier = 1.6;      // 4 planets together
    if (conjunctionCount >= 4) stelliumMultiplier = 1.8;       // 5+ planets (rare)
    
    interactions[planet].totalScore *= stelliumMultiplier;
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

  return interactions as AstrologyCalculated;
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
  
  // Element compatibility scoring (expanded range: -0.8 to 1.0)
  if (element1 === element2) {
    elementScore = 1.0; // Same element harmony (was 0.8)
  } else if ((element1 === 'Fire' && element2 === 'Air') || (element1 === 'Air' && element2 === 'Fire')) {
    elementScore = 0.7; // Fire + Air complementary
  } else if ((element1 === 'Earth' && element2 === 'Water') || (element1 === 'Water' && element2 === 'Earth')) {
    elementScore = 0.7; // Earth + Water complementary  
  } else if ((element1 === 'Fire' && element2 === 'Water') || (element1 === 'Water' && element2 === 'Fire')) {
    elementScore = -0.8; // Fire + Water tension (was -0.3)
  } else if ((element1 === 'Earth' && element2 === 'Air') || (element1 === 'Air' && element2 === 'Earth')) {
    elementScore = -0.6; // Earth + Air tension (was -0.2)
  } else {
    elementScore = 0.0; // Neutral
  }
  
  // Modality compatibility scoring (expanded range: -0.5 to 0.8)
  if (modality1 === modality2) {
    if (modality1 === 'Cardinal') {
      modalityScore = -0.5; // Cardinal + Cardinal tension (was -0.2)
    } else if (modality1 === 'Fixed') {
      modalityScore = 0.8; // Fixed + Fixed amplification (was 0.6)
    } else { // Mutable
      modalityScore = 0.7; // Mutable + Mutable harmony (was 0.5)
    }
  } else {
    modalityScore = 0.4; // Cross-modality complementary
  }
  
  // Polarity compatibility scoring (unchanged)
  if (polarity1 === polarity2) {
    polarityScore = 0.2; // Same polarity - comfortable but less magnetic
  } else {
    polarityScore = 0.7; // Opposite polarities - magnetic attraction
  }
  
  // Astrological aspect-based dynamic (expanded negative range)
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
    dynamicScore = -0.8; // Was -0.5
  } else if (distance === 6) { // Opposition
    dynamic = 'complementary';
    dynamicScore = 0.7;
  } else if (distance === 1 || distance === 5) { // Adjacent/quincunx
    dynamic = 'tension';
    dynamicScore = -0.4; // Was -0.2
  } else {
    dynamic = 'harmony';
    dynamicScore = 0.3;
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