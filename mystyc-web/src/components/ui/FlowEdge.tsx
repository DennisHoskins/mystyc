import React, { useEffect, useRef } from 'react';

interface FlowEdgeProps {
  height?: number;
  wavelength?: number;
  amplitude?: number;
  speedX?: number;
  speedY?: number;
  edgeColor?: string;
  startColor?: string;
  endColor?: string;
}

export function FlowEdge({ 
  height = 60,
  wavelength = 200,
  amplitude = 20,
  speedX = 0.01,
  speedY = 0.05,
  edgeColor = '#FFFFFF',
  startColor = '#FFFFFF',
  endColor = '#000000',
}: FlowEdgeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);

  useEffect(() => {
    const draw = (currentTime: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = window.innerWidth;
      canvas.height = height;

      if (!startTimeRef.current) {
        startTimeRef.current = currentTime;
        lastFrameTimeRef.current = currentTime;
      }

      // Detect large time gaps (e.g., tab was inactive, computer sleep, etc.)
      const deltaTime = currentTime - lastFrameTimeRef.current;
      if (deltaTime > 1000) { // Gap larger than 1 second
        startTimeRef.current += deltaTime;
      }
      lastFrameTimeRef.current = currentTime;

      const timeOffsetX = (currentTime - startTimeRef.current) * speedX * 0.002;
      const timeOffsetY = (currentTime - startTimeRef.current) * speedY * 0.002;

      const gradient = ctx.createLinearGradient(0, 0, 1, canvas.height);
      gradient.addColorStop(0, startColor);
      gradient.addColorStop(1, endColor);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Build the wave path
      const wavePath = new Path2D();
      wavePath.moveTo(0, 0);

      for (let x = 0; x <= canvas.width; x++) {
        const currentAmplitude = amplitude * Math.sin(timeOffsetY + Math.PI/2);
        const y = Math.sin((x / wavelength + timeOffsetX) * Math.PI * 2) * currentAmplitude + amplitude;
        wavePath.lineTo(x, y + 5);
      }

      const fillPath = new Path2D(wavePath);
      fillPath.lineTo(canvas.width, canvas.height);
      fillPath.lineTo(0, canvas.height);
      fillPath.closePath();
      ctx.fillStyle = gradient;
      ctx.fill(fillPath);

      ctx.strokeStyle = edgeColor;
      ctx.lineWidth = 0.5;
      ctx.stroke(wavePath);

      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);

    const handleResize = () => {
      // Animation loop handles redrawing, so we don't need separate resize logic
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [height, wavelength, amplitude, speedX, speedY, edgeColor, startColor, endColor]);

  return (
    <canvas 
      ref={canvasRef}
      style={{ 
        display: 'block',
        width: '100%',
        height: `${height}px`
      }}
    />
  );
}