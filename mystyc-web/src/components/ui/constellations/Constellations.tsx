'use client'

import { useRef, useEffect, useState } from 'react';
import styles from './Constellations.module.css';
import { data } from './data';
import { BackgroundStars } from './BackgroundStars';
import NatalChart from './NatalChart';
import Constellation from './Constellation'; // Make sure this imports the new autonomous version

interface ConstellationsProps {
  className?: string;
  constellationRadius?: number; // Percentage of container size (0-100)
  constellationSize?: number;   // Percentage of container size (0-100)
}

export default function Constellations({ 
  className = '',
  constellationRadius = 65,
  constellationSize = 10
}: ConstellationsProps) {
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [isInitialized, setIsInitialized] = useState(false);
  
  const sparkleSpeed = 5000;
  const animationDuration = 2500;

  // Measure container size
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const newSize = { width: rect.width, height: rect.height };
        setContainerSize(newSize);
        
        // Mark as initialized once we have real dimensions
        if (!isInitialized && newSize.width > 0 && newSize.height > 0) {
          setIsInitialized(true);
        }
      }
    };

    // Use ResizeObserver for better performance and immediate detection
    const resizeObserver = new ResizeObserver(updateSize);
    
    // Also trigger on mount
    updateSize();
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Fallback resize listener
    window.addEventListener('resize', updateSize);
    
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, [isInitialized]);

  // Calculate actual pixel values from percentages
  const containerDimension = Math.min(containerSize.width, containerSize.height);
  const actualRadius = (containerDimension * constellationRadius) / 200;
  const actualSize = (containerDimension * constellationSize) / 100;

  // Get constellation names in order
  const constellationNames = Object.keys(data);
  
  // Create 12 constellation configs
  const constellations = Array.from({ length: 12 }, (_, index) => {

    // Get constellation name (cycle through available names)
    const constellationName = constellationNames[index % constellationNames.length];
    const constellationData = data[constellationName as keyof typeof data];

    const angle = ((index * 30) - 90) - constellationData.degrees;
    const angleRad = (angle * Math.PI) / 180;
    
    // Position from center using calculated radius
    const x = actualRadius * Math.cos(angleRad);
    const y = actualRadius * Math.sin(angleRad);
    
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
    <div className={`relative w-full h-full ${className} scale-[2] md:scale-[1.5] lg:scale-100 overflow-hidden`}>
      <BackgroundStars density={100} />

      <div 
        ref={containerRef}
        className={`absolute inset-0 flex w-full mt-[25%] md:mt-[-10%] xl:-mt-[25%] aspect-square items-center justify-center ${styles.constellations}`}
      >
        <NatalChart className="w-full aspect-square opacity-10" />

        <div className="absolute inset-0 flex items-center justify-center">
          {/* Only render constellations once we have proper dimensions */}
          {isInitialized && actualSize > 0 && constellations.map((config) => (
            <div
              key={config.id}
              className="absolute"
              style={{
                transform: `translate(${config.x}px, ${config.y}px) rotate(${config.rotation}deg)`,
                width: `${actualSize}px`,
                height: `${actualSize}px`,
                transformOrigin: 'center center'
              }}
            >
              <Constellation
                constellationData={config.constellationData}
                sparkleSpeed={sparkleSpeed}
                animationDuration={animationDuration}
                dimBrightness={0.5}
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