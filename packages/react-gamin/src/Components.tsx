import { useState, useEffect } from "react";
import { useEntityContext } from "./Entity";

export interface Component {}

export interface Position extends Component {
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
  
  const entityRef = useEntityContext();
  useEffect(() => {
    entityRef.current.position = state;
    return () => {
      delete entityRef.current.position;
    };
  }, []);

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

  const entityRef = useEntityContext();
  useEffect(() => {
    entityRef.current.body = state;
    return () => {
      delete entityRef.current.body;
    };
  }, []);

  return state;
}
