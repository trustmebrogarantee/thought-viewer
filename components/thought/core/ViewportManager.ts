import type { Thought } from "~/types/Thought";
import { Vec2 } from "~/lib/math";

export class ViewportManager implements Thought.Viewport {
  position: Vec2;
  zoomLevel: number;
  width: number;
  height: number;

  constructor(ctx: CanvasRenderingContext2D) {
    this.position = new Vec2(0, 0);
    this.zoomLevel = 1;
    this.width = ctx.canvas.width;
    this.height = ctx.canvas.height;
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }
}