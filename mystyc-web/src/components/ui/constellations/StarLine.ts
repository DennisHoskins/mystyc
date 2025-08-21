import Star from './Star';

export default class StarLine {
  startStar: Star;
  endStar: Star;
  isAnimating: boolean;
  animationTimer: number;
  animationDelay: number;
  animationDuration: number;
  cProgress: number;  // 0-1 along the line (faster point)
  dProgress: number;  // 0-1 along the line (slower point)
  speedUpStartTime: number; // Track when speed change happens
  dProgressAtSpeedUp: number; // Track dProgress value when speed change happens

  constructor(startStar: Star, endStar: Star) {
    // Normalize: ensure startStar is always the leftmost star for left-to-right flow
    if (startStar.relativeX <= endStar.relativeX) {
      this.startStar = startStar;
      this.endStar = endStar;
    } else {
      // Swap them so animation flows left-to-right
      this.startStar = endStar;
      this.endStar = startStar;
    }
    
    this.isAnimating = false;
    this.animationTimer = 0;
    this.animationDelay = 0;
    this.animationDuration = 2500; // Default duration
    this.cProgress = 0;
    this.dProgress = 0;
    this.speedUpStartTime = -1;
    this.dProgressAtSpeedUp = 0;
  }

  startAnimation(delay: number = 0, duration: number = 2500): void {
    this.animationDelay = delay;
    this.animationTimer = -delay; // Start negative for delay countdown
    this.animationDuration = duration;
    this.isAnimating = true;
    this.cProgress = 0;
    this.dProgress = 0;
    this.speedUpStartTime = -1;
    this.dProgressAtSpeedUp = 0;
  }

  update(deltaTime: number): void {
    if (!this.isAnimating) return;

    this.animationTimer += deltaTime;

    // Still in delay period
    if (this.animationTimer <= 0) {
      return;
    }

    const activeTime = this.animationTimer;

    // C moves faster
    const cSpeed = 1.5;
    this.cProgress = Math.min(1, (activeTime / this.animationDuration) * cSpeed);

    // Handle D progress with speed change
    if (this.cProgress >= 1 && this.speedUpStartTime === -1) {
      // Mark when speed change happens
      this.speedUpStartTime = activeTime;
      this.dProgressAtSpeedUp = this.dProgress;
    }

    if (this.speedUpStartTime === -1) {
      // Before speed change - slow speed
      this.dProgress = Math.min(1, (activeTime / this.animationDuration) * 0.333);
    } else {
      // After speed change - fast speed
      const timeSinceSpeedUp = activeTime - this.speedUpStartTime;
      const additionalProgress = (timeSinceSpeedUp / this.animationDuration) * 1;
      this.dProgress = Math.min(1, this.dProgressAtSpeedUp + additionalProgress);
    }

    // Animation complete when both points reach the end
    if (this.cProgress >= 1 && this.dProgress >= 1) {
      this.isAnimating = false;
      this.animationTimer = 0;
      this.cProgress = 0;
      this.dProgress = 0;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.75;

    ctx.beginPath();
    ctx.moveTo(this.startStar.x, this.startStar.y);
    ctx.lineTo(this.endStar.x, this.endStar.y);
    ctx.stroke();

    ctx.globalAlpha = 1;

    // Draw animated glowing segment if active
    if (this.isAnimating && this.animationTimer > 0 && this.cProgress > this.dProgress) {
      const deltaX = this.endStar.x - this.startStar.x;
      const deltaY = this.endStar.y - this.startStar.y;

      // Calculate current positions of C and D points
      const cX = this.startStar.x + deltaX * this.cProgress;
      const cY = this.startStar.y + deltaY * this.cProgress;
      const dX = this.startStar.x + deltaX * this.dProgress;
      const dY = this.startStar.y + deltaY * this.dProgress;

      // Calculate pulsing line width based on segment stretch
      const segmentLength = Math.sqrt(Math.pow(cX - dX, 2) + Math.pow(cY - dY, 2));
      const maxPossibleLength = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2)) * 1;
      
      // Normalize segment length to 0-1, then create pulse curve
      const stretchRatio = Math.min(segmentLength / maxPossibleLength, 1);
      
      // Lerp between min and max width
      const minWidth = 0.01;
      const maxWidth = 1;
      const pulseWidth = minWidth + (maxWidth - minWidth) * stretchRatio;

      // Fade in to midpoint, then fade out
      const animationProgress = this.animationTimer / this.animationDuration; // 0 to 1 over full animation
      const minAlpha = 0.1;
      const maxAlpha = 1.0;
      let fadeAlpha;
      
      if (animationProgress <= 0.5) {
        // Fade in: 0 to 0.5 progress maps to 0.1 to 1.0 alpha
        const fadeInProgress = animationProgress / 0.5; // 0 to 1
        fadeAlpha = minAlpha + (maxAlpha - minAlpha) * fadeInProgress;
      } else if (animationProgress < 1) {
        // Fade out: 0.5 to 1.0 progress maps to 1.0 to 0.1 alpha
        const fadeOutProgress = (animationProgress - 0.5) / 0.5; // 0 to 1
        fadeAlpha = maxAlpha - (maxAlpha - minAlpha) * fadeOutProgress;
      } else {
        fadeAlpha = 0;
      }

      // Create gradient from transparent to white to transparent
      const gradient = ctx.createLinearGradient(dX, dY, cX, cY);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');     // transparent
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 1)');   // white
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');     // transparent

      // Bright glowing animated segment with pulsing width and fade alpha
      ctx.globalAlpha = fadeAlpha;
      ctx.strokeStyle = gradient;
      ctx.lineWidth = pulseWidth;

      ctx.beginPath();
      ctx.moveTo(dX, dY);
      ctx.lineTo(cX, cY);
      ctx.stroke();
    }
  }
}