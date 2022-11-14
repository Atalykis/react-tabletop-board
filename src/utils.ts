import { Point } from "./types/types";

export function midPoint(p1: Point, p2: Point) {
  return {
    x: p1.x + (p2.x - p1.x) / 2,
    y: p1.y + (p2.y - p1.y) / 2,
  };
}

export function* segments(iterable: Iterable<Point>) {
  let last: Point | undefined = undefined;
  for (const point of iterable) {
    if (last) {
      yield [last, point];
    }
    last = point;
  }
}

export function closeable<T>(
  iterable: AsyncIterableIterator<T>,
  onClose?: () => Promise<void>,
): AsyncIterableIterator<T> & { close: () => Promise<void> } {
  const resolves = new Set<(value: unknown) => void>();
  let done = false;

  return {
    [Symbol.asyncIterator]() {
      return this;
    },
    async next() {
      if (done) {
        return { done: done };
      }

      let resolve: (value: unknown) => void;

      const next = new Promise((r) => {
        resolve = r;
        resolves.add(r);
      });

      const defer = iterable.next();

      defer.then(({ done, value }) => {
        resolves.delete(resolve);
        resolve({ done, value });
      });

      return next;
    },
    close() {
      done = true;
      for (const r of resolves) {
        r({ done: true });
      }
      return onClose?.();
    },
  } as any;
}