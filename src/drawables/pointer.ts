import type { Position } from '../values';
import { Drawable } from './drawable';

export interface Pointer {
  position: Position;
}

export class PointerEditable implements Drawable<Pointer> {
  constructor(public position: Position) {}

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
    context.fillStyle = '#000000';
  }
}
