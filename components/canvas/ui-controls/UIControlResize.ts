import { Vec2, type Renderable } from "~/components/canvas/CanvasDirector";
import { UIControl } from ".";
import type { Follower } from ".";

export interface ResizeFollowerPayload {
  direction: 'top-center' | 'bottom-center' | 'left-center' | 'right-center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

export class ResizeFollower implements Follower {
  public type: Follower["type"]
  public offset: Follower["offset"]
  public position:  Follower["position"]
  public box: Follower["box"]
  public zIndex?: Follower["zIndex"]
  public payload: ResizeFollowerPayload
  public entity: Renderable
  public parent: UIControlResize | null
  private prevState: { box: Follower["box"] }

  constructor(entity: Renderable, width: number, height: number, direction: ResizeFollowerPayload["direction"]) {
    this.type = 'button:icon:resize'
    this.offset = new Vec2(0, 0); // Относительное смещение от entity
    this.position = { x: 0, y: 0 }; // Абсолютная позиция (обновляется автоматически)
    this.box = { width, height }; // Размеры для рендеринга
    this.payload = { direction }
    this.entity = entity
    this.parent = null
    this.recalculate()
    this.prevState = { box: { ...this.box } }
  }

  recalculate (): void {
    const halfMyWidth = this.box.width / 2
    const halfMyHeight = this.box.height / 2
    const myWidth = this.box.width
    const myHeight = this.box.height
    if (this.payload.direction === 'top-left') this.offset = new Vec2(0, 0).sub(new Vec2(halfMyWidth, halfMyHeight))
    else if (this.payload.direction === 'top-right') this.offset = new Vec2(this.entity.box.width, 0).sub(new Vec2(halfMyWidth, halfMyHeight))
    else if (this.payload.direction === 'bottom-left') this.offset = new Vec2(0, this.entity.box.height).sub(new Vec2(halfMyWidth, halfMyHeight))
    else if (this.payload.direction === 'bottom-right') this.offset = new Vec2(this.entity.box.width, this.entity.box.height).sub(new Vec2(halfMyWidth, halfMyHeight))

    else if (this.payload.direction === 'left-center') this.offset = new Vec2(0, 0).sub(new Vec2(myWidth, halfMyHeight - this.entity.box.height / 2))
    else if (this.payload.direction === 'right-center') this.offset = new Vec2(this.entity.box.width, 0).sub(new Vec2(0, halfMyHeight - this.entity.box.height / 2))
    else if (this.payload.direction === 'bottom-center') this.offset = new Vec2(0, this.entity.box.height).sub(new Vec2(halfMyHeight - this.entity.box.width / 2, 0))
    else if (this.payload.direction === 'top-center') this.offset = new Vec2(0, 0).sub(new Vec2(halfMyWidth - this.entity.box.width / 2, myHeight))
  }

  render (ctx: CanvasRenderingContext2D): void {
    if (this.payload.direction.includes('center')) {
      ctx.beginPath();
      ctx.fillStyle = 'rgb(22, 115, 197)';
      ctx.rect(this.position.x, this.position.y, this.box.width, this.box.height)
      ctx.fill();
    } else {
      const buttonRadius = this.box.width / 2
      const x = this.position.x + buttonRadius 
      const y = this.position.y + buttonRadius
      ctx.beginPath();
      ctx.arc(x, y, buttonRadius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgb(22, 115, 197)';
      ctx.fill();
    }
  }

  resizeEntity(deltaX: number, deltaY: number, shiftEntity: (dx: number, dy: number) => void) {
    const MIN_WIDTH = 30
    const MIN_HEIGHT = 30
    const changeSizesBy = (dw: number, dh: number) => {
      this.entity.box.width = Math.max(this.entity.box.width + dw, MIN_WIDTH)
      this.entity.box.height = Math.max(this.entity.box.height + dh, MIN_HEIGHT)
    }

    if (this.payload.direction === 'top-left') {
      changeSizesBy(deltaX, deltaY)
      shiftEntity(-deltaX, -deltaY)
    } else if (this.payload.direction === 'top-right') {
      changeSizesBy(-deltaX, deltaY)
      shiftEntity(0, -deltaY)
    } else if (this.payload.direction === 'bottom-left') {
      changeSizesBy(deltaX, -deltaY)
      shiftEntity(-deltaX, 0)
    } else if (this.payload.direction === 'bottom-right') {
      changeSizesBy(-deltaX, -deltaY)
      shiftEntity(0, 0)
    } else if (this.payload.direction === 'left-center') {
      changeSizesBy(deltaX, 0)
      shiftEntity(-deltaX, 0)
    } else if (this.payload.direction === 'right-center') {
      changeSizesBy(-deltaX, 0)
      shiftEntity(0, 0)
    } else if (this.payload.direction === 'bottom-center') {
      changeSizesBy(0, -deltaY)
      shiftEntity(0, 0)
    } else if (this.payload.direction === 'top-center') {
      changeSizesBy(0, deltaY)
      shiftEntity(0, -deltaY)
    }
    if (this.parent) this.parent.recalculate()
  }

  styleDragStart() {
    this.prevState = { box: { ...this.box } }
    this.box.width *= 1.2
    this.box.height *= 1.2
    this.recalculate()
  }

  styleDragStop() {
    this.box = { ...this.prevState.box }
    this.recalculate()
  }
}

export class UIControlResize extends UIControl<ResizeFollower> {
  constructor(entity: Renderable) {
    super(
      entity,
      new ResizeFollower(entity, 10, 10, 'left-center'),
      new ResizeFollower(entity, 10, 10, 'right-center'),
      new ResizeFollower(entity, 10, 10, 'bottom-center'),
      new ResizeFollower(entity, 10, 10, 'top-center'),

      new ResizeFollower(entity, 12, 12, 'top-left'),
      new ResizeFollower(entity, 12, 12, 'top-right'),
      new ResizeFollower(entity, 12, 12, 'bottom-left'),
      new ResizeFollower(entity, 12, 12, 'bottom-right')
    )
  }
}