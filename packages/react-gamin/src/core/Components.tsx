import { useState, useEffect } from "react";
import { useEntityContext } from "./Entity";

export type ComponentState<T extends IComponent> = [
  T,
  React.Dispatch<React.SetStateAction<T>>
];
export interface IComponent {}
export interface Position extends IComponent {
  x: number;
  y: number;
  z: number;
}

export function useEntityWithComponent<T>(
  component: string,
  state: ComponentState<T>
) {
  const entityRef = useEntityContext();

  useEffect(() => {
    entityRef.current.components.set(component, state);
    return () => {
      entityRef.current.components.delete(component);
    };
  }, []);
}

export function getEntityComponent<T extends ComponentState<T>>(
  component: string
) {
  const entityRef = useEntityContext();
  return entityRef.current.components.get(component) as T | undefined;
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

export interface Body {
  solid?: boolean;
  height?: number;
  width?: number;
}
export function useBody(initialBody?: Partial<Body>) {
  const state = useState<Body>({
    solid: true,
    width: 10,
    height: 10,
    ...initialBody,
  });

  useEntityWithComponent("body", state);

  return state;
}
