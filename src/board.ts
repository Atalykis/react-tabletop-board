import { LazyBrush } from "lazy-brush";
import { BrushEditable } from "./drawables/brush";
import { ChainEditable } from "./drawables/chain";
import { Line, LineEditable } from "./drawables/line";
import { PointerEditable } from "./drawables/pointer";
import { Token, TokenEditable } from "./drawables/token";
import { BrushOptions } from "./types/types";
import type { Position } from "./values";

export class Board {
  private lazyBrush = new LazyBrush({
    radius: 0,
    enabled: true,
  });
  public brush: BrushEditable;

  public lines: LineEditable[];
  public currentLine: LineEditable | undefined;
  public last: LineEditable | undefined;

  public tokens: TokenEditable[];

  public currentToken: TokenEditable | undefined;

  constructor(
    private readonly onDraw: (line: Line) => void,
    private readonly onTokenMove: (token: Token) => void,
    lines: Line[] = [],
    tokens: Token[] = [],
    private brushOptions: BrushOptions
  ) {
    this.lazyBrush.radius = this.brushOptions.lazyRadius;
    this.brush = new BrushEditable(
      this.lazyBrush.getBrushCoordinates(),
      this.brushOptions.color
    );
    this.lines = lines.map((line) => new LineEditable(line.color, line.points));
    this.tokens = tokens.map(
      (token) =>
        new TokenEditable(token.id, token.position, token.size, token.imageSrc)
    );
  }

  startLine(position: Position) {
    this.currentLine = new LineEditable(this.brush.color);
    this.currentLine.addPoint(position);
  }

  continueLine(position: Position) {
    this.currentLine?.addPoint(position);
  }

  endLine(position: Position) {
    this.currentLine?.addPoint(position);
    this.lines.push(this.currentLine!);
    this.onDraw(this.currentLine!);
    this.last = this.currentLine!;
    this.currentLine = undefined;
  }

  startMoveToken(token: TokenEditable, position: Position) {
    this.currentToken = token;
    this.moveToken(position);
  }

  endMoveToken(position: Position) {
    this.moveToken(position);
    this.onTokenMove(this.currentToken!);
    this.currentToken = undefined;
  }

  moveToken(position: Position) {
    this.currentToken?.move(position);
  }

  updateBrush(position: Position) {
    this.lazyBrush.update(position);
    this.brush.position = this.lazyBrush.getBrushCoordinates()
  }

  get pointer() {
    return new PointerEditable(this.lazyBrush.getPointerCoordinates());
  }

  get chain() {
    const brush = this.lazyBrush.getBrushCoordinates();
    const pointer = this.lazyBrush.getPointerCoordinates();
    return new ChainEditable(brush, pointer);
  }
}
