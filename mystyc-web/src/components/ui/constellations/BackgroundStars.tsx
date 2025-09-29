import React, { useEffect, useRef, useCallback } from 'react';

export interface BackgroundStar {
  x: number; // Relative position 0-1
  y: number; // Relative position 0-1
  brightness: number;
  size: number;
  twinkleOffset: number;
  isSparkle: boolean;
  sparkleTimer: number;
}

interface BackgroundStarsProps {
  density?: number; // Stars per 100,000 pixels
  className?: string;
}

export function BackgroundStars({ 
  density = 125,
  className = ''
}: BackgroundStarsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const staticCanvasRef = useRef<HTMLCanvasElement>(null);
  // const sparkleCanvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<BackgroundStar[]>([]);
  // const animationRef = useRef<number>(0);
  const resizeTimeoutRef = useRef<NodeJS.Timeout>(null);
  const lastDrawSizeRef = useRef({ width: 0, height: 0 });

  // Generate stars with relative positions
  const generateStars = useCallback((width: number, height: number): BackgroundStar[] => {
    const starCount = Math.floor((width * height) / (100000 / density));
    const stars: BackgroundStar[] = [];
    
    for (let i = 0; i < starCount; i++) {
      const starType = Math.random();
      let brightness, size;
      
      if (starType < 0.7) {
        // Dim stars (70%)
        brightness = Math.random() * 0.3 + 0.2;
        size = Math.random() * 1 + 0.5;
      } else if (starType < 0.95) {
        // Medium stars (25%)
        brightness = Math.random() * 0.4 + 0.4;
        size = Math.random() * 1.5 + 0.8;
      } else {
        // Bright background stars (5%)
        brightness = Math.random() * 0.3 + 0.6;
        size = Math.random() * 2 + 1;
      }
      
      stars.push({
        x: Math.random(), // Relative position 0-1
        y: Math.random(), // Relative position 0-1
        brightness,
        size: size / 3,
        twinkleOffset: Math.random() * Math.PI * 2,
        isSparkle: false,
        sparkleTimer: 0
      });
    }
    
    console.log(`Generated ${stars.length} background stars`);
    return stars;
  }, [density]);

  // Draw static stars (non-sparkling)
  const drawStaticStars = useCallback(() => {
    const canvas = staticCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = 0.5;
    ctx.shadowColor = `rgba(255, 255, 255, 1)`;

    starsRef.current.forEach(star => {
      // if (star.isSparkle) return; // Skip sparkling stars

      const x = star.x * width;
      const y = star.y * height;
      const alpha = star.brightness;
      
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.arc(x, y, star.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Add glow for brighter stars
      if (star.brightness > 0.6) {
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.3})`;
        ctx.arc(x, y, star.size * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.globalAlpha = 1;
  }, []);

  // // Draw only sparkling stars
  // const drawSparklingStars = useCallback(() => {
  //   const canvas = sparkleCanvasRef.current;
  //   if (!canvas) return;

  //   const ctx = canvas.getContext('2d');
  //   if (!ctx) return;

  //   const { width, height } = canvas;
  //   ctx.clearRect(0, 0, width, height);
  //   ctx.globalAlpha = 0.5;

  //   let hasSparklingStars = false;

  //   starsRef.current.forEach(star => {
  //     // Random chance to start sparkling
  //     if (!star.isSparkle && Math.random() < 0.001) {
  //       star.isSparkle = true;
  //       star.sparkleTimer = 0;
  //     }

  //     if (!star.isSparkle) return;

  //     hasSparklingStars = true;
  //     star.sparkleTimer += 16;

  //     const x = star.x * width;
  //     const y = star.y * height;
      
  //     if (star.sparkleTimer < 1000) {
  //       const progress = star.sparkleTimer / 1000;
  //       let fadeAlpha, sizeMultiplier;
        
  //       if (progress < 0.5) {
  //         // Fade in
  //         const fadeProgress = progress * 2;
  //         fadeAlpha = star.brightness * fadeProgress;
  //         sizeMultiplier = 1.0 + fadeProgress * 0.3;
  //       } else {
  //         // Fade out
  //         const fadeProgress = (progress - 0.5) * 2;
  //         fadeAlpha = star.brightness * (1 - fadeProgress);
  //         sizeMultiplier = 1.3 - fadeProgress * 0.3;
  //       }
        
  //       const size = star.size * sizeMultiplier * 2;
        
  //       ctx.beginPath();
  //       ctx.fillStyle = `rgba(255, 255, 255, ${fadeAlpha})`;
  //       ctx.arc(x, y, size, 0, Math.PI * 2);
  //       ctx.fill();
  //     } else {
  //       // End sparkle
  //       star.isSparkle = false;
  //       star.sparkleTimer = 0;
  //     }
  //   });

  //   ctx.globalAlpha = 1;
  //   return hasSparklingStars;
  // }, []);

  // Debounced resize handler
  const handleResize = useCallback(() => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }

    resizeTimeoutRef.current = setTimeout(() => {
      const container = containerRef.current;
      const staticCanvas = staticCanvasRef.current;
      // const sparkleCanvas = sparkleCanvasRef.current;
      
      // if (!container || !staticCanvas || !sparkleCanvas) return;
      if (!container || !staticCanvas) return;

      const width = container.clientWidth;
      const height = container.clientHeight;

      // Only regenerate if size actually changed significantly
      if (Math.abs(width - lastDrawSizeRef.current.width) > 10 || 
          Math.abs(height - lastDrawSizeRef.current.height) > 10) {
        
        staticCanvas.width = width;
        staticCanvas.height = height;
        // sparkleCanvas.width = width;
        // sparkleCanvas.height = height;

        // If no stars exist, generate them
        if (starsRef.current.length === 0) {
          starsRef.current = generateStars(width, height);
        }

        drawStaticStars();
        lastDrawSizeRef.current = { width, height };
        console.log(`Resized canvases to ${width}x${height}`);
      }
    }, 150); // 150ms debounce
  }, [generateStars, drawStaticStars]);

  // Animation loop for sparkling stars only
  // useEffect(() => {
  //   const animate = () => {
  //     // drawSparklingStars();
  //     animationRef.current = requestAnimationFrame(animate);
  //   };

  //   animationRef.current = requestAnimationFrame(animate);

  //   return () => {
  //     if (animationRef.current) {
  //       cancelAnimationFrame(animationRef.current);
  //       animationRef.current = 0;
  //     }
  //   };
  // }, [drawSparklingStars]);

  // Initial setup and resize listener
  useEffect(() => {
    handleResize(); // Initial draw
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [handleResize]);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full min-h-0 ${className}`}
    >
      <canvas
        ref={staticCanvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}
      />
      {/* <canvas
        ref={sparkleCanvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}
      /> */}
    </div>
  );
}