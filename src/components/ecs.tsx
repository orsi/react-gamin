import { Dispatch, SetStateAction, useState } from "react";

type Component = [any, Dispatch<SetStateAction<any>>];
type EntityComponent = {
  [key: string]: Component;
};
type EntityId = {
  id: string;
};
export type Entity = EntityId & { [key: string]: any };
export function useEntity(id: string) {
  const [entity] = useState({
    id,
  });
  return entity;
}

interface Body {
  solid?: boolean;
  height?: number;
  width?: number;
}
export function useBody(entity: Entity, initialBody?: Body) {
  if (!entity) {
    throw Error("Entity does not exist.");
  }
  const state = useState<Body>({
    solid: true,
    width: 10,
    height: 10,
    ...initialBody,
  });
  entity.body = state;
  return state[0];
}

interface Position {
  x?: number;
  y?: number;
  z?: number;
}
export function usePosition(entity: Entity, initialPosition?: Position) {
  if (!entity) {
    throw Error("Entity does not exist.");
  }
  const position = useState<Position>({
    x: 0,
    y: 0,
    z: 0,
    ...initialPosition,
  });
  entity.position = position;
  return position;
}
