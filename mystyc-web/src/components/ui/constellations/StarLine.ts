import Star from "./Star";

export default class StarLine {
  startStar: Star;
  endStar: Star;

  // Animation direction (might differ from normalized direction)
  animationStartStar: Star;
  animationEndStar: Star;

  // Scheduling
  startTime: number = 0;
  endTime: number = 0;
  duration: number = 0;

  constructor(startStar: Star, endStar: Star) {
    // Normalize: start should be leftmost, or if same x then topmost
    if (startStar.relativeX > endStar.relativeX || 
        (startStar.relativeX === endStar.relativeX && startStar.relativeY > endStar.relativeY)) {
      // Swap the stars
      this.startStar = endStar;
      this.endStar = startStar;
    } else {
      this.startStar = startStar;
      this.endStar = endStar;
    }

    // Default animation direction matches normalized direction
    this.animationStartStar = this.startStar;
    this.animationEndStar = this.endStar;
  }

  // Schedule animation FROM a specific star TO the other star
  scheduleFromStar(fromStar: Star, startTime: number, baseDuration: number) {
    if (fromStar === this.startStar) {
      this.animationStartStar = this.startStar;
      this.animationEndStar = this.endStar;
    } else if (fromStar === this.endStar) {
      this.animationStartStar = this.endStar;
      this.animationEndStar = this.startStar;
    } else {
      throw new Error("fromStar must be one of the line's endpoints");
    }

    const dx = this.animationEndStar.relativeX - this.animationStartStar.relativeX;
    const dy = this.animationEndStar.relativeY - this.animationStartStar.relativeY;
    const length = Math.sqrt(dx * dx + dy * dy);

    this.duration = baseDuration * length; // scale with distance
    this.startTime = startTime;
    this.endTime = startTime + this.duration;
  }

  // Legacy method for backward compatibility
  schedule(start: number, baseDuration: number) {
    this.scheduleFromStar(this.startStar, start, baseDuration);
  }

  // Get the "other" star given one star
  getOtherStar(star: Star): Star {
    if (star === this.startStar) return this.endStar;
    if (star === this.endStar) return this.startStar;
    throw new Error("Star is not part of this line");
  }

  update(currentTime: number) {
    if (currentTime < this.startTime) return { active: false };
    if (currentTime > this.endTime) return { active: false };

    const progress = (currentTime - this.startTime) / this.duration;
    return { active: true, progress };
  }

  draw(ctx: CanvasRenderingContext2D, currentTime: number, brightness: number) {
    const state = this.update(currentTime);

    // always draw faint background line (using normalized positions)
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.1 * brightness;
    ctx.beginPath();
    ctx.moveTo(this.startStar.x, this.startStar.y);
    ctx.lineTo(this.endStar.x, this.endStar.y);
    ctx.stroke();

    // animated glowing segment (using animation direction)
    if (state.active) {
      const { progress } = state;
      const x = this.animationStartStar.x + (this.animationEndStar.x - this.animationStartStar.x) * (progress || 0);
      const y = this.animationStartStar.y + (this.animationEndStar.y - this.animationStartStar.y) * (progress || 0);

      const gradient = ctx.createLinearGradient(
        this.animationStartStar.x,
        this.animationStartStar.y,
        this.animationEndStar.x,
        this.animationEndStar.y
      );
      gradient.addColorStop(0, "rgba(255,255,255,0)");
      gradient.addColorStop(0.5, "rgba(255,255,255,1)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");

      ctx.globalAlpha = 0.5 * brightness;

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.animationStartStar.x, this.animationStartStar.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  }
}