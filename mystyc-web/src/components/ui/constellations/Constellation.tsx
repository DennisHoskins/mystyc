import React, { useRef, useCallback, useEffect, useState } from "react";
import Star, { StarData } from "./Star";
import StarLine from "./StarLine";

interface ConstellationData {
  name: string;
  stars: StarData[];
  lines: string[][];
}

interface ConstellationProps {
  constellationData: ConstellationData | null;
  sparkleSpeed?: number;
  animationDuration?: number;
  dimBrightness?: number;
  sparkleBrightness?: number;
  sparkleChance?: number;  // Probability of sparkling (0-1)
  minDelay?: number;       // Min delay between sparkles (ms)
  maxDelay?: number;       // Max delay between sparkles (ms)
  showLabels?: boolean;
  className?: string;
}

export default function Constellation({
  constellationData,
  sparkleSpeed = 1000,
  animationDuration = 2500,
  dimBrightness = 0,
  sparkleBrightness = 1,
  sparkleChance = 0.6,
  minDelay = 1000,
  maxDelay = 3000,
  showLabels = false,
  className,
}: ConstellationProps) {

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isActive, setIsActive] = useState(false);

  const starsRef = useRef<Star[]>([]);
  const linesRef = useRef<StarLine[]>([]);
  const totalDurationRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);

  // Track the last constellationData object initialized
  const lastInitializedRef = useRef<ConstellationData | null>(null);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    const size = Math.min(displayWidth, displayHeight);

    canvas.width = size;
    canvas.height = size;
  }, []);

  const setupAnimation = useCallback(() => {
    if (!constellationData) return;
    
    // Only rebuild constellation data if it changed
    if (lastInitializedRef.current !== constellationData) {
      lastInitializedRef.current = constellationData;

      const stars = constellationData.stars.map((s) => new Star(s));
      const starMap = new Map(stars.map((s) => [s.id, s]));
      const lines = constellationData.lines.map(([a, b]) => {
        return new StarLine(starMap.get(a)!, starMap.get(b)!);
      });

      const sorted = [...stars].sort((a, b) => {
        if (a.relativeX !== b.relativeX) return a.relativeX - b.relativeX;
        return a.relativeY - b.relativeY;
      });

      const root = sorted[0];
      root.schedule(0, sparkleSpeed);

      const queue: Star[] = [root];
      let maxTime = 0;

      while (queue.length) {
        const current = queue.shift()!;
        const currentEnd = current.sparkleEnd;

        const connected = lines.filter(
          (l) => l.startStar === current || l.endStar === current
        );

        connected.forEach((line) => {
          const next = line.getOtherStar(current);
          line.scheduleFromStar(next, current.sparkleStart, animationDuration);

          if (next.sparkleStart === 0 && next !== root) {
            next.schedule(line.endTime, sparkleSpeed);
            queue.push(next);
            maxTime = Math.max(maxTime, next.sparkleEnd);
          }
        });
        maxTime = Math.max(maxTime, currentEnd);
      }

      starsRef.current = stars;
      linesRef.current = lines;
      totalDurationRef.current = maxTime;
    }
    
    // Always reset start time for each animation cycle
    startTimeRef.current = performance.now();
  }, [constellationData, sparkleSpeed, animationDuration]);

  const scheduleNextSparkle = useCallback(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Random chance to sparkle
    if (Math.random() < sparkleChance) {
      // Random delay between min and max
      const delay = minDelay + Math.random() * (maxDelay - minDelay);
      
      timeoutRef.current = setTimeout(() => {
        setIsActive(true);
      }, delay);
    } else {
      // Try again after a short delay
      timeoutRef.current = setTimeout(() => {
        scheduleNextSparkle();
      }, 1000);
    }
  }, [sparkleChance, minDelay, maxDelay]);

  const animate = useCallback(
    (time: number) => {
      if (!isActive) return;

      const canvas = canvasRef.current;
      if (!canvas || !constellationData) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (!startTimeRef.current) return;
      const elapsed = time - startTimeRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const padding = 0.1;
      const scale = Math.min(canvas.width, canvas.height) * (1 - padding);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      starsRef.current.forEach((s) => {
        s.x = cx + (s.relativeX - 0.5) * scale;
        s.y = cy + (s.relativeY - 0.5) * scale;
      });

      let brightness = dimBrightness;
      if (elapsed < totalDurationRef.current) {
        const p = elapsed / totalDurationRef.current;
        brightness =
          p < 0.5
            ? dimBrightness + (sparkleBrightness - dimBrightness) * (p * 2)
            : sparkleBrightness -
              (sparkleBrightness - dimBrightness) * ((p - 0.5) * 2);
      }

      ctx.globalAlpha = brightness;
      linesRef.current.forEach((l) => l.draw(ctx, elapsed, brightness));
      starsRef.current.forEach((s) => s.draw(ctx, elapsed, brightness, showLabels));

      ctx.globalAlpha = 1;

      if (elapsed < totalDurationRef.current) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete - schedule next sparkle
        setIsActive(false);
        scheduleNextSparkle();
      }
    },
    [isActive, constellationData, dimBrightness, sparkleBrightness, showLabels, scheduleNextSparkle]
  );

  // Handle active state changes
  useEffect(() => {
    if (isActive && constellationData) {
      setupAnimation();
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [isActive, constellationData, setupAnimation, animate]);

  // Handle canvas resize
  useEffect(() => {
    resizeCanvas();
    const handleResize = () => resizeCanvas();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [resizeCanvas]);

  // Initial sparkle scheduling
  useEffect(() => {

    if (constellationData) {
      scheduleNextSparkle();
    }

    return () => {
      cancelAnimationFrame(animationRef.current);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [constellationData, scheduleNextSparkle]);

  return <canvas ref={canvasRef} className={`w-full aspect-square block ${className}`} />;
}