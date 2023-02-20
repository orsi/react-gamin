import { useState } from "react";

type TOldEntityId = {
  id: string;
};
export type TOldEntity = TOldEntityId & { [key: string]: any };
export function useOldEntity(id: string) {
  const [entity] = useState({
    id,
  });
  return entity;
}

interface IOldBody {
  solid?: boolean;
  height?: number;
  width?: number;
}
export function useOldBody(entity: TOldEntity, initialBody?: IOldBody) {
  if (!entity) {
    throw Error("Entity does not exist.");
  }
  const state = useState<IOldBody>({
    solid: true,
    width: 10,
    height: 10,
    ...initialBody,
  });
  entity.body = state;
  return state[0];
}

interface IPosition {
  x?: number;
  y?: number;
  z?: number;
}
export function useOldPosition(entity: TOldEntity, initialPosition?: IPosition) {
  if (!entity) {
    throw Error("Entity does not exist.");
  }
  const position = useState<IPosition>({
    x: 0,
    y: 0,
    z: 0,
    ...initialPosition,
  });
  entity.position = position;
  return position;
}
