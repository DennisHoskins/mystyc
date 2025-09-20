import React from 'react';

type PhaseName = 'New Moon' | 'Waxing Crescent' | 'First Quarter' | 'Waxing Gibbous' | 
                 'Full Moon' | 'Waning Gibbous' | 'Last Quarter' | 'Waning Crescent';

interface MoonPhaseIconProps {
  phase?: PhaseName;
  percent?: number;
  size?: number;
  color?: string;
}

const MoonPhaseIcon: React.FC<MoonPhaseIconProps> = ({ 
  phase = 'New Moon', 
  percent = 0, 
  size = 24, 
  color = '#ffffff',
}) => {
  // Convert phase to 0-1 value for rendering
  const convertToPhaseValue = (phaseName: PhaseName, percent: number): number => {
    const phasePositions: Record<PhaseName, number> = {
      'New Moon': 0,
      'Waxing Crescent': 0.125,
      'First Quarter': 0.25,
      'Waxing Gibbous': 0.375,
      'Full Moon': 0.5,
      'Waning Gibbous': 0.625,
      'Last Quarter': 0.75,
      'Waning Crescent': 0.875
    };

    const phases: PhaseName[] = [
      'New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous',
      'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'
    ];

    const currentIndex = phases.indexOf(phaseName);
    const nextIndex = (currentIndex + 1) % 8;
    
    const current = phasePositions[phaseName];
    const next = phasePositions[phases[nextIndex]];
    
    // Handle wrap from Waning Crescent back to New Moon
    if (phaseName === 'Waning Crescent') {
      const result = current + (percent * (1 - current));
      return result >= 1 ? 0 : result;
    }
    
    const result = current + (percent * (next - current));
    return result;
  };

  const phaseValue = convertToPhaseValue(phase, percent);

  let shadowOffset;
  
  if (phaseValue <= 0.5) {
    // Waxing: illuminated area grows from right side
    // Shadow (illuminated circle) moves from far right to center
    shadowOffset = size - (phaseValue * size * 2);
  } else {
    // Waning: illuminated area shrinks from right side  
    // Shadow (illuminated circle) moves from center to far left
    shadowOffset = -((phaseValue - 0.5) * size * 2);
  }

  const wrapperStyle: React.CSSProperties = {
    display: 'flex',
    position: 'relative',
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    border: `0.5px solid ${color}`,
    backgroundColor: 'black',
    overflow: 'hidden',
    boxSizing: 'content-box',
  };
  
  const shadowStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: '50%',
    width: `${size}px`,
    height: `${size}px`,
    backgroundColor: color,
    borderRadius: '50%',
    transform: `translateX(calc(-50% + ${shadowOffset}px))`,
  };
  
  return (
    <div style={wrapperStyle}>
      <div style={shadowStyle} />
    </div>
  );
};

export type { PhaseName, MoonPhaseIconProps };
export default MoonPhaseIcon;