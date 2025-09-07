import { AstrologyCalculated, PlanetaryData, PlanetaryDegrees } from '../interfaces';
import { PlanetType, ZodiacSignType } from '../schemas';
import { getExactAspect } from './astrology-degrees';

export interface ChartComparisonOptions {
  primaryWeight: number;    // How much birth chart influences (0.7)
  cosmicWeight: number;     // How much cosmic chart influences (0.3)
  aspectOrb: number;        // Orb for cross-chart aspects (8 degrees)
  emphasizeTransits: boolean; // Boost scores for exact aspects (true)
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

export interface ChartComparisonResult {
  personalChart: AstrologyCalculated;
  cosmicChart: AstrologyCalculated;
  influences: DailyInfluence[];
  overallHarmony: number;
  strongestInfluence: string;
  challengingAspects: string[];
}

/**
 * Compare user's birth chart against cosmic energy to generate personal daily chart
 * @param birthChart - User's natal chart
 * @param cosmicChart - Today's cosmic energy chart  
 * @param options - Comparison configuration
 * @returns Personal daily energy chart with cosmic influences applied
 */
export function generatePersonalDailyChart(
  birthChart: AstrologyCalculated,
  cosmicChart: AstrologyCalculated,
  options: ChartComparisonOptions = {
    primaryWeight: 0.7,
    cosmicWeight: 0.3,
    aspectOrb: 8,
    emphasizeTransits: true
  }
): ChartComparisonResult {
  const planets: PlanetType[] = ['Sun', 'Moon', 'Rising', 'Venus', 'Mars'];
  const influences: DailyInfluence[] = [];
  
  // Calculate daily influences for each planet
  for (const planet of planets) {
    const birthPlanet = birthChart[planet.toLowerCase() as keyof AstrologyCalculated] as PlanetaryData;
    const cosmicPlanet = cosmicChart[planet.toLowerCase() as keyof AstrologyCalculated] as PlanetaryData;
    
    const influence = calculateDailyInfluence(
      planet,
      birthPlanet,
      cosmicPlanet,
      cosmicChart,
      options
    );
    
    influences.push(influence);
  }
  
  // Create personal chart by blending birth + cosmic with influences
  const personalChart = createPersonalChart(birthChart, cosmicChart, influences, options);
  
  // Calculate overall metrics
  const overallHarmony = influences.reduce((sum, inf) => sum + inf.dailyScore, 0) / influences.length;
  const strongestInfluence = influences
    .sort((a, b) => Math.abs(b.dailyScore) - Math.abs(a.dailyScore))[0]
    ?.influence || 'Balanced energy';
  
  const challengingAspects = influences
    .filter(inf => inf.dailyScore < -0.3)
    .map(inf => inf.influence);

  return {
    personalChart,
    cosmicChart,
    influences,
    overallHarmony,
    strongestInfluence,
    challengingAspects
  };
}

/**
 * Calculate how cosmic energy influences a specific birth planet today
 */
function calculateDailyInfluence(
  planet: PlanetType,
  birthPlanet: PlanetaryData,
  cosmicPlanet: PlanetaryData,
  fullCosmicChart: AstrologyCalculated,
  options: ChartComparisonOptions
): DailyInfluence {
  let aspectType: string | undefined;
  let aspectStrength = 0;
  let dailyScore = birthPlanet.totalScore; // Start with birth score
  
  // Check if we have degree data for aspect calculation
  if (birthPlanet.absoluteDegrees && cosmicPlanet.absoluteDegrees) {
    const aspect = getExactAspect(
      birthPlanet.absoluteDegrees,
      cosmicPlanet.absoluteDegrees,
      options.aspectOrb
    );
    
    if (aspect) {
      aspectType = aspect.type;
      aspectStrength = aspect.strength;
      
      // Apply cosmic influence based on aspect
      const cosmicInfluence = aspectStrength * options.cosmicWeight;
      dailyScore = (dailyScore * options.primaryWeight) + cosmicInfluence;
      
      // Emphasize strong transits
      if (options.emphasizeTransits && Math.abs(aspectStrength) > 0.7) {
        dailyScore *= 1.2;
      }
    }
  } else {
    // Fallback to sign-based influence
    const signInfluence = calculateSignInfluence(birthPlanet.sign, cosmicPlanet.sign);
    const cosmicInfluence = signInfluence * options.cosmicWeight;
    dailyScore = (dailyScore * options.primaryWeight) + cosmicInfluence;
  }
  
  // Cross-chart aspects (birth planet vs all cosmic planets)
  const crossAspects = calculateCrossChartAspects(birthPlanet, fullCosmicChart, options.aspectOrb);
  const crossInfluence = crossAspects.reduce((sum, asp) => sum + asp.strength, 0) / crossAspects.length || 0;
  dailyScore += crossInfluence * 0.1; // Subtle additional influence
  
  // Clamp to valid range
  dailyScore = Math.max(-1, Math.min(1, dailyScore));
  
  const influence = generateInfluenceDescription(planet, aspectType, aspectStrength);
  
  return {
    planet,
    birthPosition: {
      sign: birthPlanet.sign,
      degreesInSign: birthPlanet.degreesInSign || 0,
      absoluteDegrees: birthPlanet.absoluteDegrees || 0
    },
    cosmicPosition: {
      sign: cosmicPlanet.sign,
      degreesInSign: cosmicPlanet.degreesInSign || 0,
      absoluteDegrees: cosmicPlanet.absoluteDegrees || 0
    },
    aspectType,
    aspectStrength,
    dailyScore,
    influence
  };
}

/**
 * Create personal chart by blending birth chart with daily influences
 */
function createPersonalChart(
  birthChart: AstrologyCalculated,
  cosmicChart: AstrologyCalculated,
  influences: DailyInfluence[],
  options: ChartComparisonOptions
): AstrologyCalculated {
  const personalChart: AstrologyCalculated = {
    ...birthChart,
    createdAt: new Date(),
    lastCalculatedAt: new Date()
  };
  
  // Apply daily influences to each planet
  for (const influence of influences) {
    const planetKey = influence.planet.toLowerCase() as keyof AstrologyCalculated;
    const planetData = personalChart[planetKey] as PlanetaryData;
    
    if (planetData && typeof planetData === 'object') {
      planetData.totalScore = influence.dailyScore;
      
      // Blend interactions (birth chart weighted higher)
      if (planetData.interactions && birthChart[planetKey] && cosmicChart[planetKey]) {
        const birthInteractions = (birthChart[planetKey] as PlanetaryData).interactions || {};
        const cosmicInteractions = (cosmicChart[planetKey] as PlanetaryData).interactions || {};
        
        for (const [otherPlanet, interaction] of Object.entries(birthInteractions)) {
          if (cosmicInteractions[otherPlanet]) {
            const blendedScore = (interaction.score * options.primaryWeight) + 
                               (cosmicInteractions[otherPlanet].score * options.cosmicWeight);
            interaction.score = Math.round(blendedScore * 100) / 100;
          }
        }
      }
    }
  }
  
  // Recalculate total score
  const planetScores = influences.map(inf => inf.dailyScore);
  const weights = [5, 4, 3, 2, 2]; // Sun, Moon, Rising, Venus, Mars
  const weightedSum = planetScores.reduce((sum, score, idx) => sum + (score * weights[idx]), 0);
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  personalChart.totalScore = Math.round((weightedSum / totalWeight) * 100) / 100;
  
  return personalChart;
}

/**
 * Calculate cross-chart aspects (birth planet vs all cosmic planets)
 */
function calculateCrossChartAspects(
  birthPlanet: PlanetaryData,
  cosmicChart: AstrologyCalculated,
  orb: number
): Array<{ planet: string; strength: number; type: string }> {
  const aspects: Array<{ planet: string; strength: number; type: string }> = [];
  const planets: PlanetType[] = ['Sun', 'Moon', 'Rising', 'Venus', 'Mars'];
  
  if (!birthPlanet.absoluteDegrees) return aspects;
  
  for (const planet of planets) {
    const cosmicPlanet = cosmicChart[planet.toLowerCase() as keyof AstrologyCalculated] as PlanetaryData;
    
    if (cosmicPlanet?.absoluteDegrees) {
      const aspect = getExactAspect(birthPlanet.absoluteDegrees, cosmicPlanet.absoluteDegrees, orb);
      
      if (aspect) {
        aspects.push({
          planet: planet,
          strength: aspect.strength,
          type: aspect.type
        });
      }
    }
  }
  
  return aspects;
}

/**
 * Simple sign-based influence calculation (fallback)
 */
function calculateSignInfluence(birthSign: ZodiacSignType, cosmicSign: ZodiacSignType): number {
  if (birthSign === cosmicSign) return 0.5;  // Same sign amplification
  
  // Simple element compatibility
  const elements = {
    'Aries': 'Fire', 'Leo': 'Fire', 'Sagittarius': 'Fire',
    'Taurus': 'Earth', 'Virgo': 'Earth', 'Capricorn': 'Earth',
    'Gemini': 'Air', 'Libra': 'Air', 'Aquarius': 'Air',
    'Cancer': 'Water', 'Scorpio': 'Water', 'Pisces': 'Water'
  } as const;
  
  const birthElement = elements[birthSign];
  const cosmicElement = elements[cosmicSign];
  
  if (birthElement === cosmicElement) return 0.3;
  if ((birthElement === 'Fire' && cosmicElement === 'Air') || 
      (birthElement === 'Air' && cosmicElement === 'Fire')) return 0.2;
  if ((birthElement === 'Earth' && cosmicElement === 'Water') ||
      (birthElement === 'Water' && cosmicElement === 'Earth')) return 0.2;
  
  return 0.0; // Neutral influence
}

/**
 * Generate human-readable influence description
 */
function generateInfluenceDescription(
  planet: PlanetType,
  aspectType?: string,
  strength?: number
): string {
  const planetDescriptions = {
    Sun: 'core identity',
    Moon: 'emotional nature', 
    Rising: 'outward expression',
    Venus: 'relationships and values',
    Mars: 'drive and action'
  };
  
  const aspectDescriptions = {
    conjunction: 'amplifies',
    trine: 'harmonizes with',
    sextile: 'supports',
    square: 'challenges',
    opposition: 'balances'
  };
  
  if (aspectType && strength !== undefined) {
    const aspectDesc = aspectDescriptions[aspectType as keyof typeof aspectDescriptions] || 'interacts with';
    const intensity = Math.abs(strength) > 0.7 ? 'powerfully' : 'gently';
    return `Today's cosmic energy ${intensity} ${aspectDesc} your ${planetDescriptions[planet]}`;
  }
  
  return `Cosmic energy influences your ${planetDescriptions[planet]}`;
}

/**
 * Get default comparison options
 */
export function getDefaultComparisonOptions(): ChartComparisonOptions {
  return {
    primaryWeight: 0.7,      // Birth chart is primary influence
    cosmicWeight: 0.3,       // Cosmic energy is secondary
    aspectOrb: 8,           // Standard orb for aspects
    emphasizeTransits: true  // Boost exact aspects
  };
}