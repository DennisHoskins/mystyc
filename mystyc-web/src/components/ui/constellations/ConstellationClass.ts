import Star, { StarData } from "./Star";
import StarLine from "./StarLine";

export interface ConstellationData {
  name: string;
  stars: StarData[];
  lines: string[][];
}

export class ConstellationClass {
  name: string;
  stars: Star[];
  starLines: StarLine[];
  starMap: Map<string, Star>;
  
  // Sparkle wash properties
  isSparkleSequenceActive: boolean;
  sparkleSequenceTimer: number;

  // Timing properties
  sparkleSpeed: number;
  animationDuration: number;

  showLabels: boolean;

  constructor(data: ConstellationData, sparkleSpeed: number = 2500, animationDuration: number = 2500, showLables: boolean = false) {
    this.name = data.name;
    this.sparkleSpeed = sparkleSpeed;
    this.animationDuration = animationDuration;
    this.showLabels = showLables;
    
    this.stars = data.stars.map(starData => new Star(starData));
    this.starMap = new Map();
    
    // Create lookup map for stars first
    this.stars.forEach(star => {
      this.starMap.set(star.id, star);
    });
    
    // Build StarLine objects from the line data
    this.starLines = data.lines
      .map(lineIds => {
        const startStar = this.starMap.get(lineIds[0]);
        const endStar = this.starMap.get(lineIds[1]);
        if (startStar && endStar) {
          return new StarLine(startStar, endStar);
        }
        console.warn(`Could not find stars for line: ${lineIds[0]} -> ${lineIds[1]}`);
        return null;
      })
      .filter((line): line is StarLine => line !== null);
    
    // Initialize sparkle sequence
    this.isSparkleSequenceActive = false;
    this.sparkleSequenceTimer = 0;
  }

  private triggerSparkleWash(): void {
    if (this.isSparkleSequenceActive) return;
    
    // Sort stars by x position (left to right)
    const sortedStars = [...this.stars].sort((a, b) => a.relativeX - b.relativeX);
    
    let cumulativeDelay = 0;
    
    // Trigger star sparkles and corresponding line animations in sequence
    sortedStars.forEach((star, index) => {
      if (index === 0) {
        // First star starts immediately
        star.startSparkle(0, this.sparkleSpeed);
      } else {
        // Calculate distance from previous star
        const prevStar = sortedStars[index - 1];
        const distance = Math.sqrt(
          Math.pow(star.relativeX - prevStar.relativeX, 2) + 
          Math.pow(star.relativeY - prevStar.relativeY, 2)
        );
        
        const delayIncrement = distance * this.sparkleSpeed;
        cumulativeDelay += delayIncrement;
        star.startSparkle(cumulativeDelay, this.sparkleSpeed);
      }
      
      // Find lines that start from this star and trigger them
      const outgoingLines = this.starLines.filter(line => line.startStar === star);
      
      outgoingLines.forEach(line => {
        // Line starts animating shortly after the star begins sparkling
        line.startAnimation(cumulativeDelay, this.animationDuration);
      });
    });
    
    this.isSparkleSequenceActive = true;
    this.sparkleSequenceTimer = 0;
  }

  update(deltaTime: number): void {
    if (!this.isSparkleSequenceActive && Math.random() < 0.05) {
      this.triggerSparkleWash();
    }
    
    if (this.isSparkleSequenceActive) {
      this.sparkleSequenceTimer += deltaTime;
      
      const anyStarSparkling = this.stars.some(star => star.isSparkle);
      const anyLineAnimating = this.starLines.some(line => line.isAnimating);
      
      if (!anyStarSparkling && !anyLineAnimating && this.sparkleSequenceTimer > 1000) {
        this.isSparkleSequenceActive = false;
        this.sparkleSequenceTimer = 0;
      }
    }
    
    // Update all stars and lines
    this.stars.forEach(star => star.update(deltaTime));
    this.starLines.forEach(line => line.update(deltaTime));
  }

  draw(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number): void {
    // Position all stars based on constellation position and scale
    this.stars.forEach(star => {
      star.x = x + (star.relativeX * scale);
      star.y = y + (star.relativeY * scale);
    });

    // Draw star lines using StarLine objects (handles both default and animated)
    this.starLines.forEach(line => line.draw(ctx));

    // Draw stars on top of lines
    this.stars.forEach(star => star.draw(ctx, this.showLabels));
  }
}