import type { Renderable, Vec2 } from "~/components/canvas/CanvasDirector";

export interface Follower {
  type: 'button:icon:add' | 'button:icon:resize'
  offset: Vec2; // Относительное смещение от entity
  position: { x: number; y: number }; // Абсолютная позиция (обновляется автоматически)
  box: { width: number; height: number }; // Размеры для рендеринга
  zIndex?: number; // Опциональный zIndex (по умолчанию чуть выше entity)
  payload: { [key: string]: any };
  parent: null | UIControl<IFollower>;
  recalculate(): void;
  render(ctx: CanvasRenderingContext2D): void;
}

export interface IFollower extends Follower {}

export class UIControl<T extends Follower> {
  public followers: Follower[]
  public entity: Renderable
  constructor(entity: Renderable, ...followers: T[]) {
    this.followers = followers
    this.entity = entity
    for (const follower of followers) follower.parent = this
  }
  render(ctx: CanvasRenderingContext2D): void {
    this.followers.forEach(follower => follower.render(ctx))
  }
  recalculate() {
    this.followers.forEach(follower => follower.recalculate())
  }
}