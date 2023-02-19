import { Dispatch, PropsWithChildren, SetStateAction, useState } from "react";

type TComponent = [any, Dispatch<SetStateAction<any>>];
type TEntityComponent = {
  [key: string]: TComponent;
};
type TEntityId = {
  id: string;
};
export type TEntity = TEntityId & { [key: string]: any };
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
export function useBody(entity: TEntity, initialBody?: Body) {
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
export function usePosition(entity: TEntity, initialPosition?: Position) {
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

export default function Entity({
  children,
  id,
}: PropsWithChildren<{ id: string }>) {
  return <>{children}</>;
}
