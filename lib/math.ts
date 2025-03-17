export const lerp = (a: number, b: number, t: number) => {
  return a * (1 - t) + b * t;
}

export const clamp = (min: number, val: number, max: number) => Math.min(
  max, 
  Math.max(
    val,
    min
  )
)


export class Vec2 {
  constructor(public x: number, public y: number) {}
  add(other: Vec2): Vec2 {
    this.x += other.x;
    this.y += other.y;
    return this;
  }
  sub(other: Vec2): Vec2 {
    this.x -= other.x;
    this.y -= other.y;
    return this;
  }
  mul(scalar: number): Vec2 {
    return new Vec2(this.x * scalar, this.y * scalar);
  }
  normalize(): Vec2 {
    const length = Math.sqrt(this.x ** 2 + this.y ** 2);
    if (length === 0) return this;
    return new Vec2(this.x / length, this.y / length);
  }
  dot(other: Vec2): number {
    return this.x * other.x + this.y * other.y;
  }
  distanceTo(other: Vec2): number {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  lerp(other: Vec2, t: number): Vec2 {
    this.x = lerp(this.x, other.x, t),
    this.y = lerp(this.y, other.y, t)
    return this
  }

  lerpInt(other: Vec2, t: number): Vec2 {
    this.x = Math.round(lerp(this.x, Math.round(other.x), t)),
    this.y = Math.round(lerp(this.y, Math.round(other.y), t))
    return this
  }

  set(x: number, y2: number): Vec2 {
    this.x = x;
    this.y = y2;
    return this;
  }

  equals(other: Vec2): boolean {
    return this.x === other.x && this.y === other.y;
  }

  addScalar(n: number): Vec2 {
    this.x += n;
    this.y += n;
    return this;
  }
}