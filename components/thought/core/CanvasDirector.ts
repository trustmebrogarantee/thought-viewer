import type { Thought } from "~/types/Thought";
import { SceneRenderer } from "./SceneRenderer";
import { AnimationEngine } from "./AnimationEngine";
import { InputManager } from "./InputManager";
import { ViewportManager } from "./ViewportManager";

export class CanvasDirector<T extends Thought.Renderable> {
  private viewport: ViewportManager;
  private renderer: SceneRenderer<T>;
  private animationEngine: AnimationEngine<T>;
  private inputManager: InputManager<T>;
  private ctx: CanvasRenderingContext2D;
  private state: Thought.ActiveEntityStates<T>;

  constructor(
    canvasRef: Ref<HTMLCanvasElement>,
    entities: T[] = [],
    state: Thought.ActiveEntityStates<T>,
    inputEvents: Thought.InputEvents = {}
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
    
    this.initialize((ctx: CanvasRenderingContext2D, viewport: Thought.Viewport, entity: T) => {
      entity.render(ctx, viewport, entity)
      if (entity.followers) entity.followers.forEach(f => f.render(ctx, viewport, entity))
    });
  }

  public moveSelectedByNotAnimated(deltaX: number, deltaY: number) {
    this.animationEngine.setTargetPosition(
      this.animationEngine.targetPosition.x + deltaX,
      this.animationEngine.targetPosition.y + deltaY
    );
    this.state.selected!.position.set(
      this.animationEngine.targetPosition.x, 
      this.animationEngine.targetPosition.y
    );
  }

  private initialize(renderEntity: Thought.RenderFunction<T>): void {
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

  getViewport(): Thought.Viewport {
    return this.viewport;
  }
}