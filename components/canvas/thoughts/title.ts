import { wrapText } from "~/lib/canvas";
import type { ICanvasComponent } from "../drawInOrder";
import type { DataItem, TitleProps } from "./types";

export const title: ICanvasComponent<TitleProps, { data: DataItem }> = {
  prepareDrawing: (ctx: CanvasRenderingContext2D, { data: object }, camera) => {
    const textBox = ctx.measureText(object.title);
    const textHeight = textBox.actualBoundingBoxAscent + textBox.actualBoundingBoxDescent;
    const lineHeight = 20;

    const { lines, drawText } = wrapText(
      ctx,
      object.title,
      object.position.x + object.box.padding,
      object.position.y + object.box.padding,
      object.box.width - object.box.padding * 2,
      lineHeight,
      "16px Arial",
      camera.zoomLevel
    );
    return { height: lineHeight * lines, drawText };
  },
  draw: (ctx, { title }) => {
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    title.drawText();
  }
};

