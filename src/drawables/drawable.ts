export interface Drawable<T = any> {
  draw(context: CanvasRenderingContext2D): void;
  applyStyle?(context: CanvasRenderingContext2D): void;
}
