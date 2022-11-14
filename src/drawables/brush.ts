import type { Position } from "../values";
import { Drawable } from "./drawable";

export interface Brush {
  position: Position;
  color: string;
}

export class BrushEditable implements Drawable<Brush> {
  constructor(public position: Position, public color: string) {}
  draw(context: CanvasRenderingContext2D): void {
    context.beginPath();
    this.applyStyle(context);
    context.arc(this.position.x, this.position.y, 5, 0, 2 * Math.PI);
    context.fill();
    context.stroke();
    context.closePath();
  }

  applyStyle(context: CanvasRenderingContext2D): void {
    context.lineWidth = 1;
    context.fillStyle = this.color;
  }
}
