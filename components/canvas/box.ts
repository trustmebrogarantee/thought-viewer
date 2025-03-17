import { Vec2 } from "~/lib/math";
import type { ICanvasComponent } from "./drawInOrder";

type BoxData = {
  position: Vec2,
  box: { width: number, height: number, padding: number }
}

function box (data: BoxData): ICanvasComponent<BoxData> {
  return {
    prepareDrawing(ctx) {
      return { position: data.position, box: data.box };
    },
    draw(ctx, preparedData) {
      const { position, box } = preparedData;
      ctx.fillStyle = 'blue';
      ctx.fillRect(position.x - box.width / 2, position.y - box.height / 2, box.width, box.height);
    }
  };
}

const circleComponent: ICanvasComponent<CircleData> = {
  prepareDrawing() {
    return { radius: 10, x: 50, y: 50 };
  },
  draw(preparedData) {
    console.log('Drawing circle with:', preparedData['circle']);
  }
};