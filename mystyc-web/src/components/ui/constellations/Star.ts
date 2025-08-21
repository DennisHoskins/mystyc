export interface StarData {
  id: string;
  x: number;
  y: number;
  brightness: number;
  size: number;
}

export default class Star {
  id: string;
  relativeX: number;
  relativeY: number;
  brightness: number;
  baseSize: number;
  currentSize: number;
  sparkleTimer: number;
  isSparkle: boolean;
  sparkleIntensity: number;
  sparkleDelay: number;
  sparkleDuration: number;
  x: number;
  y: number;

  constructor(data: StarData) {
    this.id = data.id;
    this.relativeX = data.x;
    this.relativeY = data.y;
    this.brightness = data.brightness || 1.0;
    this.baseSize = ((data.size) || 1) * 3;
    
    // Animation properties
    this.currentSize = this.baseSize;
    this.sparkleTimer = 0;
    this.isSparkle = false;
    this.sparkleIntensity = 1.0;
    this.sparkleDelay = 0;
    this.sparkleDuration = 1500; // Default duration
    
    // Actual canvas coordinates
    this.x = 0;
    this.y = 0;
  }

  startSparkle(delay: number = 0, sparkleSpeed: number = 2500): void {
    this.sparkleDelay = delay;
    this.sparkleTimer = -delay;
    this.isSparkle = true;
    // Convert sparkleSpeed to actual duration (you can adjust this ratio)
    this.sparkleDuration = sparkleSpeed * 0.6; // 60% of sparkleSpeed for duration
  }

  update(deltaTime: number): void {
    if (this.isSparkle) {
      this.sparkleTimer += deltaTime;

      if (this.sparkleTimer > 0 && this.sparkleTimer < this.sparkleDuration) {
        const progress = this.sparkleTimer / this.sparkleDuration;
        let scale;
        
        if (progress < 0.5) {
          // Growing phase (0 to 0.5)
          scale = 1.0 + (progress * 2) * 2.0;
        } else {
          // Shrinking phase (0.5 to 1.0)
          scale = 3.0 - ((progress - 0.5) * 2) * 2.0;
        }
        
        this.currentSize = (this.baseSize / 2) * scale;
        this.sparkleIntensity = 1.0;
      } else if (this.sparkleTimer >= this.sparkleDuration) {
        // End sparkle
        this.isSparkle = false;
        this.sparkleIntensity = 1.0;
        this.currentSize = this.baseSize;
        this.sparkleDelay = 0;
      } else {
        // Still in delay period - keep normal appearance
        this.sparkleIntensity = 1.0;
        this.currentSize = this.baseSize;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, showLabels: boolean = false): void {
    const alpha = this.brightness * this.sparkleIntensity;

    // Calculate glow size based on current star size
    const glowSize = this.currentSize;
    const isSparklingNow = this.isSparkle && this.sparkleTimer > 0;

    ctx.globalAlpha = 1;

    // White glow that scales with sparkle
    if (isSparklingNow) {
      ctx.shadowColor = `white`;
      ctx.shadowBlur = glowSize;
    } else {
      ctx.shadowColor = `white`;
      ctx.shadowBlur = this.currentSize;
    }
    
    // Main star
    ctx.beginPath();
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.arc(this.x, this.y, this.currentSize, 0, Math.PI * 2);
    ctx.fill();

    if (showLabels) {
      ctx.textAlign = 'center';
      ctx.font = '10px Arial';
      ctx.fillText(this.id, this.x, this.y - 12.5);
    }

    ctx.globalAlpha = 1;
  }
}