import type { ICanvasComponent } from "../drawInOrder";
import type { CardProps, DataItem, TitleProps } from "./types";

export const card: ICanvasComponent<CardProps, { data: DataItem; title: TitleProps }> = {
  prepareDrawing: (_, { data: object, title }) => {
    object.box.height = Math.max(title.height + object.box.padding * 2, object.box.height)
    return object
  },
  draw: (ctx, { data: object }) => {
    if (object._editorState.selected) {
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = 'rgb(22, 115, 197)';
      ctx.lineWidth = 2;
      ctx.strokeRect(object.position.x, object.position.y, object.box.width, object.box.height);
    }

    ctx.beginPath();
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.rect(object.position.x, object.position.y, object.box.width, object.box.height);
    ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
    ctx.shadowBlur = 8;
    ctx.fill();

    if (object.followers) {
      for (const follower of object.followers) follower.render(ctx) 
    }
  }
};