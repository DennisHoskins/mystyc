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

  // Canvas coords
  x: number = 0;
  y: number = 0;

  // Scheduling
  sparkleStart: number = 0;
  sparkleEnd: number = 0;
  sparkleDuration: number = 0;

  constructor(data: StarData) {
    this.id = data.id;
    this.relativeX = data.x;
    this.relativeY = data.y;
    this.brightness = (data.brightness || 1.0) / 2;
    this.baseSize = (data.size || 1);
  }

  schedule(start: number, sparkleSpeed: number) {
    this.sparkleStart = start;
    this.sparkleDuration = sparkleSpeed;
    this.sparkleEnd = start + sparkleSpeed;
  }

  update(currentTime: number) {
    if (currentTime < this.sparkleStart) return { active: false };
    if (currentTime > this.sparkleEnd) return { active: false };

    const progress = (currentTime - this.sparkleStart) / this.sparkleDuration;
    const half = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
    const sizeScale = 1 + half * 2; // pulsates between 1–3
    return {
      active: true,
      currentSize: this.baseSize * sizeScale,
      alpha: this.brightness,
    };
  }

  draw(ctx: CanvasRenderingContext2D, currentTime: number, brightness: number, showLabels = false) {
    const state = this.update(currentTime);
    const size = state.active ? state.currentSize : this.baseSize;
    const alpha = ((state.active ? state.alpha : this.brightness) || 0) * brightness;

    ctx.globalAlpha = alpha;
    ctx.shadowColor = "white";
    ctx.shadowBlur = size || 0;

    ctx.beginPath();
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.arc(this.x, this.y, size || 0, 0, Math.PI * 2);
    ctx.fill();

    if (showLabels) {
      ctx.textAlign = "center";
      ctx.font = "10px Arial";
      ctx.fillText(this.id, this.x, this.y - 12.5);
    }

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }
}
