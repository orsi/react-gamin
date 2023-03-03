import { useState } from "react";
import { IComponent, useEntityWithComponent } from "react-gamin";

export interface Position extends IComponent {
  x: number;
  y: number;
  z: number;
}

export function usePosition(initialPosition?: Partial<Position>) {
  const state = useState<Position>({
    x: 0,
    y: 0,
    z: 0,
    ...initialPosition,
  });

  useEntityWithComponent("position", state);

  return state;
}

type RectangleBody = {
  height?: number;
  width?: number;
};
type PolyBody = {
  lines: { x: number; y: number }[];
};
export interface Body {
  height?: number;
  width?: number;
}
export function useBody(initialBody?: Partial<Body>) {
  const state = useState<Body>({
    width: 10,
    height: 10,
    ...initialBody,
  });

  useEntityWithComponent("body", state);

  return state;
}
