import React, { useRef, useEffect } from "react";
import ReactDOM from "react-dom/client";
import type { Line } from "../src/drawables/line";
import type { Token } from "../src/drawables/token";
import { Scene } from "./scene";
import { BrushOptions } from "./types/types";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

interface DrawingBoardProps {
  id: number;
  lines: Line[];
  tokens: Token[];
  brushOptions: BrushOptions;

  onDraw?: (line: Line) => void;

  OnTokenMove?: (token: Token) => void;

  linesListen?: AsyncIterableIterator<Line>;

  tokensListen?: AsyncIterableIterator<Token>;
}

export function DrawingBoard({
  id,
  onDraw,
  OnTokenMove,
  brushOptions,
  lines,
  tokens,
  linesListen,
  tokensListen,
}: DrawingBoardProps) {
  const canvas = useRef<HTMLCanvasElement>(null);

  const scene = useRef<Scene>();

  useEffect(() => {
    if (!canvas.current) return;
    scene.current = new Scene(
      canvas.current,
      brushOptions,
      onDraw,
      OnTokenMove,
      lines,
      tokens,
      linesListen,
      tokensListen
    );
    return () => scene.current?.destroy();
  }, [canvas, onDraw, OnTokenMove, linesListen, tokensListen]);

  useEffect(() => {
    if (!scene.current) return;
    scene.current.defineLines(lines);
    scene.current.defineTokens(tokens);
  }, [lines, tokens]);

  return (
    <canvas
      className="w-[800px] h-[800px] border cursor-none"
      width={800}
      height={800}
      ref={canvas}
    ></canvas>
  );
}

root.render(
  <React.StrictMode>
    <DrawingBoard
      id={1}
      brushOptions={{ size: 5, lazyRadius: 20, color: "#FF00FF" }}
      onDraw={() => console.log("line drawed")}
      OnTokenMove={() => console.log("token moved")}
      lines={[]}
      tokens={[]}
    />
  </React.StrictMode>
);
