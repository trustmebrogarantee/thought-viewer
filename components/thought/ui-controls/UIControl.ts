import type { Thought } from "~/types/Thought"

export class UIControl<T extends Thought.Follower> implements Thought.UIControl<T> {
  public followers: T[]
  public entity: Thought.Renderable
  constructor(entity: Thought.Renderable, ...followers: T[]) {
    this.followers = followers
    this.entity = entity
    for (const follower of followers) follower.parent = this
  }
  render(ctx: CanvasRenderingContext2D, viewport: Thought.Viewport, entity: Thought.Renderable): void {
    this.followers.forEach(follower => follower.render(ctx, viewport, entity))
  }
  recalculate() {
    this.followers.forEach(follower => follower.recalculate())
  }
}