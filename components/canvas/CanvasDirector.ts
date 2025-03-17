export const lerp = (a: number, b: number, t: number) => {
  return a * (1 - t) + b * t;
}

export const clamp = (min: number, val: number, max: number) => Math.min(
  max, 
  Math.max(val, min)
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
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }
  normalize(): Vec2 {
    const length = Math.sqrt(this.x ** 2 + this.y ** 2);
    if (length === 0) return this;
    this.x /= length;
    this.y /= length;
    return this;
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
    this.x = lerp(this.x, other.x, t);
    this.y = lerp(this.y, other.y, t);
    return this;
  }
  lerpInt(other: Vec2, t: number): Vec2 {
    this.x = Math.round(lerp(this.x, Math.round(other.x), t));
    this.y = Math.round(lerp(this.y, Math.round(other.y), t));
    return this;
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
  subScalar(n: number): Vec2 {
    this.x -= n;
    this.y -= n;
    return this;
  }
}

class Vec2Pool {
  private pool: Vec2[] = [];
  get(x: number, y: number): Vec2 {
    return this.pool.length ? this.pool.pop()!.set(x, y) : new Vec2(x, y);
  }
  release(v: Vec2): void {
    this.pool.push(v);
  }
}

interface Viewport {
  position: Vec2;
  zoomLevel: number;
  width: number;
  height: number;
}

// Расширенный интерфейс Renderable с поддержкой followers
export interface Renderable {
  position: { x: number; y: number };
  box: { width: number; height: number; padding?: number };
  zIndex: number;
  followers?: Follower[]; // Добавлено поле для объектов, следующих за entity
  [key: string]: any;
}

// Интерфейс для объектов, следующих за entity
export interface Follower {
  type: 'button:icon:add' | 'button:icon:resize'
  offset: Vec2; // Относительное смещение от entity
  position: { x: number; y: number }; // Абсолютная позиция (обновляется автоматически)
  box: { width: number; height: number }; // Размеры для рендеринга
  zIndex?: number; // Опциональный zIndex (по умолчанию чуть выше entity)
  payload: { [key: string]: any }
}

type ActiveEntityStates<T> = { selected: T | null; hovered: T | null };

interface InputEvents {
  onClick?(x: number, y: number, entity: Renderable | null, viewport: Viewport): void;
  onTap?(x: number, y: number, entity: Renderable | null, viewport: Viewport): void;
  onKeyPress?(key: string, viewport: Viewport): void;
  onSelect(entity: Renderable, viewport: Viewport): void;
  onDeselect(entity: Renderable, viewport: Viewport): void;

  onFollowerMousedown(entity: Follower, viewport: Viewport): void;
  onFollowerMousein(entity: Follower, viewport: Viewport): void;
  onFollowerMouseout(entity: Follower, viewport: Viewport): void;
  onFollowerMouseup(entity: Follower, viewport: Viewport): void;
  onFollowerDrag(entity: Follower, viewport: Viewport, payload: { deltaX: number, deltaY: number }): void;
}

interface RenderFunction<T extends Renderable> {
  (ctx: CanvasRenderingContext2D, viewport: Viewport, entity: T): void;
}

class ViewportManager implements Viewport {
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

class SceneRenderer<T extends Renderable> {
  private entities: T[] = [];
  public visibleEntities: T[] = [];
  private visibilityBuffer: Vec2 = Object.freeze(new Vec2(140, 140));
  private state: ActiveEntityStates<T>

  constructor(initialEntities: T[] = [], state: ActiveEntityStates<T>) {
    this.entities = initialEntities;
    this.state = state;
  }

  updateVisibleEntities(viewport: Viewport): void {
    const zoomedWidth = viewport.width / viewport.zoomLevel;
    const zoomedHeight = viewport.height / viewport.zoomLevel;
    const minX = viewport.position.x - zoomedWidth * 0.5 - this.visibilityBuffer.x;
    const maxX = viewport.position.x + zoomedWidth * 0.5 + this.visibilityBuffer.x;
    const minY = viewport.position.y - zoomedHeight * 0.5 - this.visibilityBuffer.y;
    const maxY = viewport.position.y + zoomedHeight * 0.5 + this.visibilityBuffer.y;

    this.visibleEntities = this.entities
      .filter((entity) => {
        const { x, y } = entity.position;
        return x >= minX && x <= maxX && y >= minY && y <= maxY;
      })
      .sort((a, b) => a.zIndex - b.zIndex);
  }

  render(ctx: CanvasRenderingContext2D, viewport: Viewport, renderFn: RenderFunction<T>): void {
    this.updateVisibleEntities(viewport);
    this.visibleEntities.forEach((entity) => {
      // Рендеринг основного entity
      renderFn(ctx, viewport, entity);

      // Рендеринг followers, если они есть
      if (entity.followers) {
        entity.followers.forEach((follower) => {
          const followerEntity: Renderable = {
            position: follower.position,
            box: follower.box,
            zIndex: follower.zIndex ?? entity.zIndex + 1, // По умолчанию выше entity
          };          
          renderFn(ctx, viewport, followerEntity as T);
        });
      }
    });
  }

  findEntityAt(x: number, y: number): T | null {
    for (let i = this.visibleEntities.length - 1; i >= 0; i--) {
      if (this.isPointWithinBounds(x, y, this.visibleEntities[i])) {
        return this.visibleEntities[i];
      }
    }
    return null;
  }

  findFollowerAt(x: number, y: number): Follower | null {
    if (this.state.selected && this.state.selected.followers) {
      for (let i = this.state.selected.followers.length - 1; i >= 0; i--) {
        if (this.isPointWithinBounds(x, y, this.state.selected.followers[i])) {
          return this.state.selected.followers[i];
        }
      }
    }
    return null;
  }

  private isPointWithinBounds(x: number, y: number, entity: Renderable | Follower): boolean {
    const { x: x2, y: y2 } = entity.position;
    const { width, height } = entity.box;
    return x >= x2 && x <= x2 + width && y >= y2 && y <= y2 + height;
  }
}

class AnimationEngine<T extends Renderable> {
  private frameId: number = 0;
  private smoothViewport: Viewport;
  private state: ActiveEntityStates<T>;
  public readonly targetPosition = { x: 0, y: 0 };
  private transformMatrix: [number, number, number, number, number, number] = [1, 0, 0, 1, 0, 0];

  constructor(ctx: CanvasRenderingContext2D, state: { selected: T | null; hovered: T | null }) {
    this.smoothViewport = new ViewportManager(ctx);
    this.state = state;
  }

  updateTransform(viewport: Viewport): void {
    this.transformMatrix = [
      viewport.zoomLevel,
      0,
      0,
      viewport.zoomLevel,
      viewport.width * 0.5 - viewport.position.x * viewport.zoomLevel,
      viewport.height * 0.5 - viewport.position.y * viewport.zoomLevel
    ];
  }

  run(
    ctx: CanvasRenderingContext2D,
    targetViewport: Viewport,
    renderer: SceneRenderer<T>,
    renderFn: RenderFunction<T>
  ): void {
    this.smoothViewport.position.lerp(targetViewport.position, 0.2);
    this.smoothViewport.zoomLevel = lerp(this.smoothViewport.zoomLevel, targetViewport.zoomLevel, 0.2);

    if (this.state.selected) {
      // Обновление позиции выбранного entity
      this.state.selected.position.x = lerp(this.state.selected.position.x, this.targetPosition.x, 0.2);
      this.state.selected.position.y = lerp(this.state.selected.position.y, this.targetPosition.y, 0.2);

      // Обновление позиций followers
      if (this.state.selected.followers) {
        this.state.selected.followers.forEach((follower) => {
          follower.position.x = this.state.selected!.position.x + follower.offset.x;
          follower.position.y = this.state.selected!.position.y + follower.offset.y;
        });
      }
    }

    this.updateTransform(this.smoothViewport);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.setTransform(...this.transformMatrix);
    const zoomedWidth = targetViewport.width + 100 / targetViewport.zoomLevel;
    const zoomedHeight = targetViewport.height + 100 / targetViewport.zoomLevel;

    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(-zoomedWidth * 2, -zoomedHeight * 2, zoomedWidth * 4, zoomedHeight * 4);

    renderer.render(ctx, targetViewport, renderFn);
    this.frameId = requestAnimationFrame(() => this.run(ctx, targetViewport, renderer, renderFn));
  }

  stop(): void {
    cancelAnimationFrame(this.frameId);
  }

  setTargetPosition(x: number, y: number): void {
    this.targetPosition.x = x;
    this.targetPosition.y = y;
  }
}

class InputManager<T extends Renderable> {
  private readonly MAX_ZOOM = 6;
  private readonly MIN_ZOOM = 0.25;
  private canvas: HTMLCanvasElement;
  private viewport: Viewport;
  private renderer: SceneRenderer<T>;
  private events: InputEvents;
  private animationEngine: AnimationEngine<T>;
  private vec2Pool = new Vec2Pool();

  constructor(
    canvas: HTMLCanvasElement,
    viewport: Viewport,
    renderer: SceneRenderer<T>,
    events: InputEvents,
    animationEngine: AnimationEngine<T>
  ) {
    this.canvas = canvas;
    this.viewport = viewport;
    this.renderer = renderer;
    this.events = events;
    this.animationEngine = animationEngine;
  }

  private toWorldCoordinates(screenX: number, screenY: number): Vec2 {
    const zoomFactor = 1 / this.viewport.zoomLevel;
    return this.vec2Pool.get(
      (screenX - this.canvas.width * 0.5) * zoomFactor + this.viewport.position.x,
      (screenY - this.canvas.height * 0.5) * zoomFactor + this.viewport.position.y
    );
  }

  handleMousePanOrDrag = (e: MouseEvent): void => {
    let lastX = e.clientX;
    let lastY = e.clientY;

    const rect = this.canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const worldPos = this.toWorldCoordinates(screenX, screenY);
    const entity = this.renderer.findEntityAt(worldPos.x, worldPos.y);
    const follower = this.renderer.findFollowerAt(worldPos.x, worldPos.y);

    if (!follower) this.setSelected(entity);
    else if (this.events.onFollowerMousedown) this.events.onFollowerMousedown(follower, this.viewport)
    this.vec2Pool.release(worldPos);

    const move = (e: MouseEvent): void => {
      const zoomFactor = 1 / this.viewport.zoomLevel;
      const deltaX = (lastX - e.clientX) * zoomFactor;
      const deltaY = (lastY - e.clientY) * zoomFactor;
      if (follower) {
        if (this.events.onFollowerDrag) this.events.onFollowerDrag(follower, this.viewport, { deltaX, deltaY  })
      } else if (this.state.selected) {
        this.animationEngine.setTargetPosition(
          this.animationEngine.targetPosition.x - deltaX,
          this.animationEngine.targetPosition.y - deltaY
        );
      } else  {
        this.viewport.position.add(new Vec2(deltaX, deltaY));
      }

      lastX = e.clientX;
      lastY = e.clientY;
    };

    const end = (): void => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", end);
      if (follower) {
        if (this.events.onFollowerMouseup) this.events.onFollowerMouseup(follower, this.viewport)
      }
    };

    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", end);
  };

  handleZoom = (e: WheelEvent): void => {
    this.viewport.zoomLevel = clamp(
      this.MIN_ZOOM,
      this.viewport.zoomLevel * Math.pow(1.01, -e.deltaY * 0.2),
      this.MAX_ZOOM
    );
  };

  handleClick = (e: MouseEvent): void => {
    if (e.button !== 0 || !this.events.onClick) return;

    const rect = this.canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const worldPos = this.toWorldCoordinates(screenX, screenY);
    const entity = this.renderer.findEntityAt(worldPos.x, worldPos.y);

    this.events.onClick(worldPos.x, worldPos.y, entity, { ...this.viewport });
    this.vec2Pool.release(worldPos);
    e.preventDefault();
  };

  handleTouchInteraction = (e: TouchEvent): void => {
    e.preventDefault();

    let lastTouch1: { x: number; y: number } | null = null;
    let lastTouch2: { x: number; y: number } | null = null;
    let lastDistance: number | null = null;
    let follower: null | Follower = null
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const screenX = touch.clientX - rect.left;
      const screenY = touch.clientY - rect.top;
      const worldPos = this.toWorldCoordinates(screenX, screenY);
      const entity = this.renderer.findEntityAt(worldPos.x, worldPos.y);
      follower = this.renderer.findFollowerAt(worldPos.x, worldPos.y);
  
      if (!follower) this.setSelected(entity);
      this.vec2Pool.release(worldPos);
    }

    const move = (e: TouchEvent): void => {
      e.preventDefault();
      const touches = e.touches;
      const rect = this.canvas.getBoundingClientRect();

      if (touches.length === 1) {
        const currentTouch = {
          x: touches[0].clientX - rect.left,
          y: touches[0].clientY - rect.top,
        };

        if (lastTouch1) {
          const zoomFactor = 1 / this.viewport.zoomLevel;
          const deltaX = (lastTouch1.x - currentTouch.x) * zoomFactor;
          const deltaY = (lastTouch1.y - currentTouch.y) * zoomFactor;

          if (follower) {
            if (this.events.onFollowerDrag) this.events.onFollowerDrag(follower, this.viewport, { deltaX, deltaY  })
          } else if (this.state.selected) {
            this.animationEngine.setTargetPosition(
              this.animationEngine.targetPosition.x - deltaX,
              this.animationEngine.targetPosition.y - deltaY
            );
          } else {
            this.viewport.position.add(new Vec2(deltaX, deltaY));
          }
        }
        lastTouch1 = currentTouch;
      } else if (touches.length === 2) {
        const touch1 = {
          x: touches[0].clientX - rect.left,
          y: touches[0].clientY - rect.top,
        };
        const touch2 = {
          x: touches[1].clientX - rect.left,
          y: touches[1].clientY - rect.top,
        };

        const currentDistance = Math.hypot(touch1.x - touch2.x, touch1.y - touch2.y);

        if (lastTouch1 && lastTouch2 && lastDistance) {
          const scaleFactor = currentDistance / lastDistance;
          const adjustedScaleFactor = lerp(1, scaleFactor, 0.5);
          this.viewport.zoomLevel = clamp(
            this.MIN_ZOOM,
            this.viewport.zoomLevel * adjustedScaleFactor,
            this.MAX_ZOOM
          );

          const centerX = (touch1.x + touch2.x) * 0.5;
          const centerY = (touch1.y + touch2.y) * 0.5;
          const lastCenterX = (lastTouch1.x + lastTouch2.x) * 0.5;
          const lastCenterY = (lastTouch1.y + lastTouch2.y) * 0.5;
          const zoomFactor = 1 / this.viewport.zoomLevel;

          this.viewport.position.add(
            new Vec2(
              (lastCenterX - centerX) * zoomFactor,
              (lastCenterY - centerY) * zoomFactor
            )
          );
        }

        lastTouch1 = touch1;
        lastTouch2 = touch2;
        lastDistance = currentDistance;
      }
    };

    const end = (): void => {
      lastTouch1 = null;
      lastTouch2 = null;
      lastDistance = null;
      document.removeEventListener("touchmove", move);
      document.removeEventListener("touchend", end);
      document.removeEventListener("touchcancel", end);
    };

    document.addEventListener("touchmove", move, { passive: false });
    document.addEventListener("touchend", end);
    document.addEventListener("touchcancel", end);
  };

  setSelected(entity: T | null): void {
    if (this.state.selected && entity !== this.state.selected) {
      if (this.events.onDeselect) this.events.onDeselect(this.state.selected, this.viewport)
      this.state.selected._editorState.selected = false;
      this.state.selected.zIndex = 0;
      this.state.selected = null
    }

    if (entity) {
      this.animationEngine.setTargetPosition(entity.position.x, entity.position.y);
      entity._editorState.selected = true;
      this.state.selected = entity;
      this.state.selected.zIndex = 1;
      if (this.events.onSelect) this.events.onSelect(this.state.selected, this.viewport)
    }
  }

  handleTap = (e: TouchEvent): void => {
    if (!this.events.onTap || e.touches.length !== 1) return;

    const touch = e.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const screenX = touch.clientX - rect.left;
    const screenY = touch.clientY - rect.top;
    const worldPos = this.toWorldCoordinates(screenX, screenY);
    const entity = this.renderer.findEntityAt(worldPos.x, worldPos.y);
    this.events.onTap(worldPos.x, worldPos.y, entity, { ...this.viewport });
    this.vec2Pool.release(worldPos);
    e.preventDefault();
  };

  private get state() {
    return this.animationEngine['state'];
  }
}

export class CanvasDirector<T extends Renderable> {
  private viewport: Viewport;
  private renderer: SceneRenderer<T>;
  private animationEngine: AnimationEngine<T>;
  private inputManager: InputManager<T>;
  private ctx: CanvasRenderingContext2D;
  private state: ActiveEntityStates<T>;

  constructor(
    canvasRef: Ref<HTMLCanvasElement>,
    entities: T[] = [],
    state: ActiveEntityStates<T>,
    renderEntity: RenderFunction<T>,
    inputEvents: InputEvents = {}
  ) {
    const ctx = canvasRef.value.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("Failed to initialize 2D rendering context");

    this.ctx = ctx;
    this.ctx.textRendering = "optimizeLegibility";
    this.viewport = new ViewportManager(ctx);
    this.renderer = new SceneRenderer<T>(entities, state);
    this.animationEngine = new AnimationEngine<T>(ctx, state);
    this.inputManager = new InputManager<T>(
      canvasRef.value,
      this.viewport,
      this.renderer,
      inputEvents,
      this.animationEngine
    );
    this.state = state
    this.initialize(renderEntity);
  }

  public moveSelectedByNotAnimated(deltaX: number, deltaY: number) {
    this.animationEngine.setTargetPosition(
      this.animationEngine.targetPosition.x + deltaX,
      this.animationEngine.targetPosition.y + deltaY
    );
    this.state.selected!.position = { ...this.animationEngine.targetPosition }
  }

  private initialize(renderEntity: RenderFunction<T>): void {
    this.viewport.resize(this.ctx.canvas.width, this.ctx.canvas.height);
    this.renderer.updateVisibleEntities(this.viewport);

    const canvas = this.ctx.canvas;
    canvas.addEventListener("mousedown", this.inputManager.handleMousePanOrDrag);
    canvas.addEventListener("wheel", this.inputManager.handleZoom, { passive: true });
    canvas.addEventListener("click", this.inputManager.handleClick);
    canvas.addEventListener("touchstart", this.inputManager.handleTouchInteraction, { passive: false });
    canvas.addEventListener("touchstart", this.inputManager.handleTap, { passive: false });

    this.animationEngine.run(this.ctx, this.viewport, this.renderer, renderEntity);
  }

  shutdown(): void {
    this.animationEngine.stop();
    const canvas = this.ctx.canvas;
    canvas.removeEventListener("mousedown", this.inputManager.handleMousePanOrDrag);
    canvas.removeEventListener("wheel", this.inputManager.handleZoom);
    canvas.removeEventListener("click", this.inputManager.handleClick);
    canvas.removeEventListener("touchstart", this.inputManager.handleTouchInteraction);
    canvas.removeEventListener("touchstart", this.inputManager.handleTap);
  }

  getViewport(): Viewport {
    return this.viewport;
  }
}