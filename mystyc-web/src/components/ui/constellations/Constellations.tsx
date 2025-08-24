'use client'

import styles from './Constellations.module.css';
import { data } from './data';
import { BackgroundStars } from './BackgroundStars';
import NatalChart from './NatalChart';
import Constellation from './Constellation'; // Make sure this imports the new autonomous version

interface ConstellationsProps {
  className?: string;
  constellationRadius?: number; // Distance from center
  constellationSize?: number;   // Size of each constellation container
}

export default function Constellations({ 
  className = '',
  constellationRadius = 500,
  constellationSize = 200
}: ConstellationsProps) {
  
  const sparkleSpeed = 5000;
  const animationDuration = 2500;

  // Get constellation names in order
  const constellationNames = Object.keys(data);
  
  // Create 12 constellation configs
  const constellations = Array.from({ length: 12 }, (_, index) => {

    // Get constellation name (cycle through available names)
    const constellationName = constellationNames[index % constellationNames.length];
    const constellationData = data[constellationName as keyof typeof data];

    const angle = ((index * 30) - 90) - constellationData.degrees;
    const angleRad = (angle * Math.PI) / 180;
    
    // Position from center
    const x = constellationRadius * Math.cos(angleRad);
    const y = constellationRadius * Math.sin(angleRad);
    
    // Rotation so bottom edge is perpendicular to radius
    const rotation = angle + 90;
    
    
    return {
      id: `constellation-${index}`,
      x,
      y,
      rotation,
      constellationData,
      name: constellationName
    };
  });

  return (
    <div className={`relative w-full h-full ${className}`}>
      <BackgroundStars density={100} />

      <div className={`absolute inset-0 flex w-full -mt-[25%] aspect-square items-center justify-center ${styles.constellations}`}>
        <NatalChart className="w-full aspect-square opacity-10" />

        <div className="absolute inset-0 flex items-center justify-center">
          {constellations.map((config) => (
            <div
              key={config.id}
              className="absolute"
              style={{
                transform: `translate(${config.x}px, ${config.y}px) rotate(${config.rotation}deg)`,
                width: `${constellationSize}px`,
                height: `${constellationSize}px`,
                transformOrigin: 'center center'
              }}
            >
              <Constellation
                constellationData={config.constellationData}
                sparkleSpeed={sparkleSpeed}
                animationDuration={animationDuration}
                dimBrightness={0.75}
                sparkleBrightness={1}
                sparkleChance={0.333}
                minDelay={1000}
                maxDelay={5000}
                showLabels={false}
                className="w-full h-full"
              />
            </div>
          ))}
        </div>
        
      </div>
    </div>
  );
}