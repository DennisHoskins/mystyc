import React from 'react';

type PhaseName = 'New Moon' | 'First Quarter' | 'Full Moon' | 'Last Quarter';

interface PhaseType {
  name: PhaseName;
  targetAngle: number;
}

interface MoonPhaseIconProps {
  phase?: PhaseName;
  percent?: number;
  size?: number;
  color?: string;
  border?: string;
}

const phaseTypes: PhaseType[] = [
  { name: 'New Moon', targetAngle: 0 },
  { name: 'First Quarter', targetAngle: 90 },
  { name: 'Full Moon', targetAngle: 180 },
  { name: 'Last Quarter', targetAngle: 270 }
];

const getNormalizedPhase = (phase: number): number => (phase <= 0.5 ? phase : 1 - phase);

const getRotationRad = (phase: number): number => {
  const normalizedPhase = getNormalizedPhase(phase);
  const rad = (Math.PI * normalizedPhase) / 0.5;
  return rad;
};

const convertToPhaseValue = (phaseName: PhaseName, percent: number): number => {
  const currentPhase = phaseTypes.find(p => p.name === phaseName);
  if (!currentPhase) return 0;
  
  const currentIndex = phaseTypes.indexOf(currentPhase);
  const nextIndex = (currentIndex + 1) % phaseTypes.length;
  
  // Convert angles to 0-1 scale (360° = 1.0)
  const currentAngle = currentPhase.targetAngle / 360;
  const nextAngle = phaseTypes[nextIndex].targetAngle / 360;
  
  // Handle wrapping from Last Quarter (270°) to New Moon (0°)
  const angleDiff = nextAngle >= currentAngle ? 
    nextAngle - currentAngle : 
    (1 - currentAngle) + nextAngle;
  
  return currentAngle + (percent * angleDiff);
};

const MoonPhaseIcon: React.FC<MoonPhaseIconProps> = ({ 
  phase = 'New Moon', 
  percent = 0, 
  size = 24, 
  color = '#ffffff',
}) => {
  const phaseValue = convertToPhaseValue(phase, percent);
  
  const wrapperStyle: React.CSSProperties = {
    display: 'flex',
    position: 'relative',
    backgroundColor: 'transparent',
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    border: `0.5px solid ${color}`,
    boxSizing: 'content-box',
  };
  
  const halfStyle: React.CSSProperties = {
    width: '100%',
    overflow: 'hidden'
  };
  
  const circleStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    backgroundColor: color,
    borderRadius: '50%',
  };
  
  const differenceStyle: React.CSSProperties = {
    position: 'absolute',
    zIndex: 1,
    left: '50%',
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    backgroundColor: 0.5 / getNormalizedPhase(phaseValue) > 2 ? 'transparent' : color,
    transform: `translateX(-50%) rotateY(${getRotationRad(phaseValue)}rad)`
  };
  
  return (
    <div style={wrapperStyle}>
      <div 
        style={{
          ...halfStyle,
          opacity: phaseValue >= 0.5 ? 1 : 0
        }}
      >
        <div style={circleStyle} />
      </div>
      
      <div style={differenceStyle} />
      
      <div 
        style={{
          ...halfStyle,
          transform: 'scaleX(-1)',
          opacity: phaseValue <= 0.5 ? 1 : 0
        }}
      >
        <div style={circleStyle} />
      </div>
    </div>
  );
};

export type { PhaseName, MoonPhaseIconProps };
export default MoonPhaseIcon;