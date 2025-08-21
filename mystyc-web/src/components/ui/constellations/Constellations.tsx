import React, { useState, useEffect, useRef, useCallback } from 'react';

import { data } from './data';
import { BackgroundStars } from './BackgroundStars';
import { ConstellationClass, ConstellationData } from './ConstellationClass';
import Constellation from './Constellation';

interface ConstellationInstance {
  name: string;
  constellation: ConstellationClass;
  scale: number;
  x: number;
  y: number;
}

interface ConstellationsProps {
  className?: string;
}

export default function Constellations({ className = '' }: ConstellationsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [constellations, setConstellations] = useState<ConstellationInstance[]>([]);

  const calculatePositions = useCallback(() => {
    if (!containerRef.current) return;

    const zodiacData: Record<string, ConstellationData> = {
      "Aquarius": data.aquarius,
      "Aries": data.aries,
      "Cancer": data.cancer,
      "Capricorn": data.capricorn,
      "Gemini": data.gemini,
      "Leo": data.leo,
      "Libra": data.libra,
      "Pisces": data.pisces,
      "Sagittarius": data.sagittarius,
      "Scorpio": data.scorpio,
      "Taurus": data.taurus,
      "Virgo": data.virgo
    };

    const constellationNames = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Calculate dynamic scales based on container space
    const cols = 4;
    const rows = 3;
    const pad = height * 0.075;
    const gridWidth = width / cols;
    const gridHeight = (height - pad) / rows;
    const maxScale = Math.min(gridWidth, gridHeight) * 0.8;
    const minScale = maxScale * 0.6;

    // Variation factors for each constellation
    const sizeVariations = [0.95, 1.0, 0.85, 0.75, 1.0, 0.9, 0.8, 0.95, 1.0, 0.85, 0.9, 0.8];

    // Generate organic positions with overlap prevention
    const positions: Array<{x: number, y: number}> = [];
    
    const instances: ConstellationInstance[] = constellationNames
      .filter(name => zodiacData[name])
      .map((name, index) => {
        const variationFactor = sizeVariations[index] || 0.85;
        const calculatedScale = Math.max(minScale, maxScale * variationFactor) * 1.25;

        const col = index % cols;
        const row = Math.floor(index / cols);
        
        // Base grid position
        const baseX = col * gridWidth + gridWidth / 2;
        const baseY = row * gridHeight + gridHeight / 2;
        
        // Add organic offset
        const maxOffsetX = gridWidth * 1;
        const maxOffsetY = gridHeight * 0.1;
        
        // Use index-based pseudo-random for consistent positioning
        const seedX = (index * 127) % 1000 / 1000;
        const seedY = (index * 311) % 1000 / 1000;
        
        const offsetX = (seedX - 0.25) * maxOffsetX;
        const offsetY = (seedY - 0.5) * maxOffsetY;
        
        let candidateX = baseX + offsetX;
        let candidateY = baseY + offsetY;
        
        // Ensure constellation stays within bounds
        const margin = calculatedScale / 2;
        candidateX = Math.max(margin, Math.min(width - margin, candidateX));
        candidateY = Math.max(margin, Math.min(height - margin, candidateY));
        
        // Check for overlaps and adjust
        const minDistance = calculatedScale + 10;
        let attempts = 0;
        let hasOverlap = true;
        
        while (hasOverlap && attempts < 10) {
          hasOverlap = false;
          
          for (const pos of positions) {
            const distance = Math.sqrt(
              Math.pow(candidateX - pos.x, 2) + Math.pow(candidateY - pos.y, 2)
            );
            
            if (distance < minDistance) {
              hasOverlap = true;
              const angle = Math.atan2(candidateY - pos.y, candidateX - pos.x);
              candidateX = pos.x + Math.cos(angle) * minDistance;
              candidateY = pos.y + Math.sin(angle) * minDistance;
              
              // Keep within bounds
              candidateX = Math.max(margin, Math.min(width - margin, candidateX));
              candidateY = Math.max(margin, Math.min(height - margin, candidateY));
              break;
            }
          }
          attempts++;
        }
        
        positions.push({x: candidateX, y: candidateY});

        return {
          name,
          constellation: new ConstellationClass(zodiacData[name], 2000, 2000),
          scale: calculatedScale * 1.15,
          x: candidateX,
          y: candidateY
        };
      });

    setConstellations(instances);
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    // Recalculate positions for new size
    calculatePositions();
  }, [calculatePositions]);

  // Clear canvas on each frame (since individual constellations will draw to it)
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    animationRef.current = requestAnimationFrame(clearCanvas);
  }, []);

  useEffect(() => {
    calculatePositions();
    
    const handleResize = () => {
      setTimeout(resizeCanvas, 100); // Debounce resize
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculatePositions, resizeCanvas]);

  // Start canvas clearing animation
  useEffect(() => {
    if (constellations.length > 0) {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        animationRef.current = requestAnimationFrame(clearCanvas);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [constellations, clearCanvas]);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full ${className}`}
    >
      <BackgroundStars density={150} />
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}
      />
      {constellations.map((item) => (
        <Constellation
          key={item.name}
          constellation={item.constellation}
          render={{
            x: item.x - item.scale / 2,
            y: item.y - item.scale / 2,
            width: item.scale,
            height: item.scale,
            canvas: canvasRef
          }}
          resolution={256}
          dimBrightness={0.25}
          sparkleBrightness={1}
          sparkleSpeed={2000}
          animationDuration={2000}
        />
      ))}
    </div>
  );
}