import { Catenary } from 'catenary-curve';
import type { Position } from '../values';
import { Drawable } from './drawable';

export interface Chain {
  brushPosition: Position;
  pointerPosition: Position;
}
export class ChainEditable implements Drawable<Chain> {
  constructor(public brushPosition: Position, public pointerPosition: Position) {}
  private catenary = new Catenary({
    segments: 10,
    iterationLimit: 100,
  });

  draw(context: CanvasRenderingContext2D): void {
    context.beginPath();
    this.applyStyle(context);
    this.catenary.drawToCanvas(context, this.brushPosition, this.pointerPosition, 50);
    context.stroke();
    context.closePath();
  }

  applyStyle(context: CanvasRenderingContext2D): void {
    context.lineWidth = 1;
    context.strokeStyle = 'black';
  }
}
