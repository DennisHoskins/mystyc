import React, { useRef, useEffect, useCallback } from 'react';
import { ConstellationClass } from './ConstellationClass';

interface RenderProps {
  x: number;
  y: number;
  width: number;
  height: number;
  canvas?: React.RefObject<HTMLCanvasElement | null>;
}

interface ConstellationProps {
  constellation: ConstellationClass;
  render?: RenderProps;
  resolution?: number;
  dimBrightness?: number;
  sparkleBrightness?: number;
  sparkleSpeed?: number;
  animationDuration?: number;
  className?: string;
}

export default function Constellation({
  constellation,
  render,
  resolution = 512,
  dimBrightness = 0,
  sparkleBrightness = 1.3,
  sparkleSpeed = 2500,
  animationDuration = 2500,
  className = '',
}: ConstellationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Initialize offscreen canvas
  useEffect(() => {
    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
    }
    
    // Update constellation timing
    constellation.sparkleSpeed = sparkleSpeed;
    constellation.animationDuration = animationDuration;
  }, [constellation, sparkleSpeed, animationDuration, resolution]);

  // Calculate brightness based on sparkle activity
  const getCurrentBrightness = useCallback((): number => {
    const anyStarSparkling = constellation.stars.some(star => star.isSparkle);
    const anyLineAnimating = constellation.starLines.some(line => line.isAnimating);
    
    if (anyStarSparkling || anyLineAnimating) {
      // Calculate actual total sequence duration
      const sortedStars = [...constellation.stars].sort((a, b) => a.relativeX - b.relativeX);
      
      let totalDelay = 0;
      for (let i = 1; i < sortedStars.length; i++) {
        const prevStar = sortedStars[i - 1];
        const currentStar = sortedStars[i];
        const distance = Math.sqrt(
          Math.pow(currentStar.relativeX - prevStar.relativeX, 2) + 
          Math.pow(currentStar.relativeY - prevStar.relativeY, 2)
        );
        totalDelay += distance * sparkleSpeed;
      }
      
      // Total sequence time = delay to start last star + duration of animations
      const maxSparkleTime = totalDelay + Math.max(sparkleSpeed * 0.6, animationDuration);
      
      const progress = Math.min(constellation.sparkleSequenceTimer / maxSparkleTime, 1);
      
      let fadeMultiplier;
      if (progress <= 0.5) {
        fadeMultiplier = dimBrightness + (sparkleBrightness - dimBrightness) * (progress * 2);
      } else {
        fadeMultiplier = sparkleBrightness - (sparkleBrightness - dimBrightness) * ((progress - 0.5) * 2);
      }
      
      return fadeMultiplier;
    }
    
    return dimBrightness;
  }, [constellation, dimBrightness, sparkleBrightness, sparkleSpeed, animationDuration]);

  const updateAndRender = useCallback((currentTime: number) => {
    const offscreenCanvas = offscreenCanvasRef.current;
    if (!offscreenCanvas) return;

    const deltaTime = currentTime - lastTimeRef.current;
    lastTimeRef.current = currentTime;

    // Update constellation
    constellation.update(deltaTime);

    // Set up offscreen canvas size
    offscreenCanvas.width = resolution;
    offscreenCanvas.height = resolution;

    const offscreenCtx = offscreenCanvas.getContext('2d');
    if (!offscreenCtx) return;

    // Clear offscreen canvas
    offscreenCtx.clearRect(0, 0, resolution, resolution);

    // Draw constellation to offscreen canvas (centered) - no brightness applied here
    const scale = resolution * 0.8; // Leave some padding
    const centerX = resolution / 2;
    const centerY = resolution / 2;
    constellation.draw(offscreenCtx, centerX - scale / 2, centerY - scale / 2, scale);

    // Handle rendering based on render prop
    if (render?.canvas?.current) {
      // Draw to shared canvas - brightness already applied to offscreen canvas
      const sharedCtx = render.canvas.current.getContext('2d');
      if (sharedCtx) {
        const brightness = getCurrentBrightness();
        sharedCtx.globalAlpha = brightness;
        sharedCtx.drawImage(
          offscreenCanvas,
          render.x,
          render.y,
          render.width,
          render.height
        );
      }
    } else if (canvasRef.current) {
      // Draw to own canvas - brightness already applied to offscreen canvas
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(
          offscreenCanvas,
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );
      }
    }

    animationRef.current = requestAnimationFrame(updateAndRender);
  }, [resolution, constellation, render, getCurrentBrightness]);

  // Set up canvas size for standalone mode
  const resizeCanvas = useCallback(() => {
    if (!render && canvasRef.current) {
      const canvas = canvasRef.current;
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    }
  }, [render]);

  // Start animation
  useEffect(() => {
    resizeCanvas();
    animationRef.current = requestAnimationFrame(updateAndRender);

    const handleResize = () => {
      if (!render) {
        setTimeout(resizeCanvas, 100);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [updateAndRender, resizeCanvas, render]);

  // If render prop provided, we don't return a visible component
  if (render) {
    return null;
  }

  // Return standalone canvas
  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${className}`}
      style={{
        display: 'block'
      }}
    />
  );
}