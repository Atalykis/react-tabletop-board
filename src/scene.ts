import { Board } from './board';
import { Line, LineEditable } from './drawables/line';
import type { Token } from './drawables/token';
import { Renderer } from './renderer';
import { BrushOptions } from './types/types';
import { closeable } from './utils';
import type { Position } from './values';

export class Scene {
  private renderer: Renderer;
  private board: Board;
  private closeableLineListen?: AsyncIterableIterator<Line> & { close: () => Promise<void> };

  private closeableTokenListen?: AsyncIterableIterator<Token> & { close: () => Promise<void> };
  constructor(
    private readonly canvas: HTMLCanvasElement,
    brushOptions: BrushOptions,
    private readonly onDraw: (line: Line) => void = () => {},

    private readonly onTokenMove: (token: Token) => void = () => {},
    private lines: Line[],

    private tokens: Token[],
    private lineListen?: AsyncIterableIterator<Line>,
    private tokenListen?: AsyncIterableIterator<Token>,
  ) {
    this.board = new Board(this.onDraw, this.onTokenMove, this.lines, this.tokens, brushOptions);
    this.renderer = new Renderer(this.canvas);
    canvas.addEventListener('mousedown', this.onMouseDown);
    canvas.addEventListener('mouseup', this.onMouseUp);
    canvas.addEventListener('mousemove', this.onMouseMove);
    this.render();
    if (!this.lineListen) return
    if (!this.tokenListen) return
    this.closeableLineListen = closeable(this.lineListen);
    this.closeableTokenListen = closeable(this.tokenListen);
    Promise.all([this.watchLines(),this.watchTokens()])
    this.render()
  }

  capture(event: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect(); // abs. size of element
    const scaleX = this.canvas.width / rect.width; // relationship bitmap vs. element for X
    const scaleY = this.canvas.height / rect.height; // relationship bitmap vs. element for Y

    return {
      x: (event.clientX - rect.left) * scaleX, // scale mouse coordinates after they have
      y: (event.clientY - rect.top) * scaleY, // been adjusted to be relative to element
    };
  }

  onMouseDown = (event: MouseEvent) => {
    event.preventDefault();
    const mousePosition = this.capture(event);
    const token = this.tokenPresence(mousePosition);
    if (token) {
      this.board.startMoveToken(token, mousePosition);
    } else {
      this.board.updateBrush(mousePosition);
      this.board.startLine(this.board.brush.position);
    }
  };

  onMouseMove = (event: MouseEvent) => {
    event.preventDefault();
    if (this.board.currentToken) {
      this.board.moveToken(this.capture(event));
      this.render();
    } else {
      this.board.updateBrush(this.capture(event));
      this.board.continueLine(this.board.brush.position);
      this.render();
    }
  };
  onMouseUp = (event: MouseEvent) => {
    event.preventDefault();
    if (this.board.currentToken) {
      this.board.endMoveToken(this.capture(event));
      this.render();
    } else {
      this.board.endLine(this.board.brush.position);
      this.render();
    }
  };

  tokenPresence(mousePosition: Position) {
    for (const token of this.board.tokens) {
      if (mousePosition.x < token.position.x || mousePosition.y < token.position.y) continue;
      if (mousePosition.x > token.position.x + token.size.width || mousePosition.y > token.position.y + token.size.height) continue;
      return token;
    }
  }

  render() {
    this.renderer.clear();
    this.renderer.draw(this.board.chain);
    this.renderer.draw(this.board.pointer);
    this.renderer.draw(this.board.brush);
    if (this.board.currentLine) {
      this.renderer.draw(this.board.currentLine);
    }
    this.renderer.drawMany([...this.board.lines]);
    this.renderer.drawMany([...this.board.tokens]);
  }

  destroy() {
    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    this.canvas.removeEventListener('mouseup', this.onMouseUp);
    this.canvas.removeEventListener('mousemove', this.onMouseMove);
    this.closeableLineListen?.close();
    this.closeableTokenListen?.close();
  }

  defineLines(lines: Line[]){
    this.lines = lines
  }

  defineTokens(tokens: Token[]){
    this.tokens = tokens
  }

  async watchLines() {
    if (!this.closeableLineListen) return;
    for await (const lineInput of this.closeableLineListen) {
      const line = new LineEditable(lineInput.color);
      this.board.lines.push(line);
      for (const point of lineInput.points) {
        line.addPoint(point);
        this.render();
        await new Promise((r) => setTimeout(r, 5));
      }
    }
  }

  async watchTokens() {
    if (!this.closeableTokenListen) return;
    for await (const tokenInput of this.closeableTokenListen) {
      const token = this.board.tokens.find((token) => token.id.adventure === tokenInput.id.adventure && token.id.name === tokenInput.id.name && token.id.owner === tokenInput.id.owner )
      if(!token) continue
      token.move(tokenInput.position)
      this.render();
    }
  }
}
