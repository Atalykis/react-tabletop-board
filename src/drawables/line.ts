import { midPoint, segments } from "../utils";
import type { Position } from "../values";
import { Drawable } from "./drawable";

export interface Line {
  points: Position[];
  color: string;
}

export class LineEditable implements Drawable<Line> {
  constructor(public color: string, public points: Position[] = []) {}

  addPoint(point: Position) {
    this.points.push(point);
  }

  applyStyle(context: CanvasRenderingContext2D): void {
    context.lineWidth = 10;
    context.strokeStyle = this.color;
    context.lineJoin = "round";
    context.lineCap = "round";
  }

  draw(context: CanvasRenderingContext2D): void {
    context.beginPath();
    this.applyStyle(context);
    for (const segment of segments(this.points)) {
      const mid = midPoint(segment[0], segment[1]);
      context.quadraticCurveTo(segment[0].x, segment[0].y, mid.x, mid.y);
    }

    context.lineTo(
      this.points[this.points.length - 1].x,
      this.points[this.points.length - 1].y
    );
    context.stroke();
    context.closePath();
  }
}
