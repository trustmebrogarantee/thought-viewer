import type { Thought } from "~/types/Thought";
import { Renderable } from "./Renderable";
import { wrapText } from "~/lib/canvas";

export class UIComponentCard extends Renderable implements Thought.Renderable {
  constructor(document: Thought.Document) {
    super(document);
  }

  override render(ctx: CanvasRenderingContext2D, viewport: Thought.Viewport, entity: Thought.Renderable): void {
    const lineHeight = 20
    const { height: textHeight, render: renderText } = wrapText(
      ctx,
      entity.title,
      entity.position.x + entity.box.padding,
      entity.position.y + entity.box.padding,
      entity.box.width - entity.box.padding * 2,
      lineHeight,
      "16px Arial",
      viewport.zoomLevel
    );

    entity.box.height = Math.max(textHeight + entity.box.padding * 2, entity.box.height)

    if (entity._editorState.selected) {
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = 'rgb(22, 115, 197)';
      ctx.lineWidth = 2;
      ctx.strokeRect(entity.position.x, entity.position.y, entity.box.width, entity.box.height);
    }

    ctx.beginPath();
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.rect(entity.position.x, entity.position.y, entity.box.width, entity.box.height);
    ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
    ctx.shadowBlur = 8;
    ctx.fill();

    renderText()
  }
}