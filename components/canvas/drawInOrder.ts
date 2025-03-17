export interface ICanvasComponent<
  TReturn = unknown,
  TPreparedData extends Record<string, any> = Record<string, any>
> {
  prepareDrawing(ctx: CanvasRenderingContext2D, preparedData: TPreparedData, camera: any): TReturn;
  draw(ctx: CanvasRenderingContext2D, preparedData: TPreparedData & { [key: string]: TReturn }, camera: any): void;
}

type Components<TData> = {
  [key: string]: ICanvasComponent<any, { data: TData } & Record<string, any>>;
};

export function drawInOrder<TData>(
  ctx: CanvasRenderingContext2D,
  camera: any,
  data: TData,
  components: Components<TData>,
  orderRendering: (keyof Components<TData>)[],
  orderCalculus: (keyof Components<TData>)[] = orderRendering
): void {
  const preparedData: { data: TData } & Record<string, any> = { data };
  for (const componentKey of orderCalculus) {
    preparedData[componentKey] = components[componentKey].prepareDrawing(ctx, preparedData, camera);
  }
  for (const componentKey of orderRendering) {
    components[componentKey].draw(ctx, preparedData, camera);
  }
}