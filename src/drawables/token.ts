import type { Position, Size } from '../values';
import { Drawable } from './drawable';

interface TokenId {
  name: string;
  owner: string;
  adventure:string;
}

export interface Token {
  id: TokenId
  position: Position;
  size: Size;
  image?: HTMLImageElement;
  imageSrc: string
}

export class TokenEditable implements Drawable<Token> {
  public image : HTMLImageElement
  constructor(public id: TokenId, public position: Position, public size: Size, public imageSrc: string) {
    this.image = new Image(50,50)
    this.image.src = imageSrc
  }

  draw(context: CanvasRenderingContext2D): void {
    context.beginPath();
    context.drawImage(this.image, this.position.x, this.position.y);
    context.closePath();
  }
  move(position: Position) {
    this.position = {
      x: position.x - this.size.width / 2,
      y: position.y - this.size.height / 2,
    };
  }
}
