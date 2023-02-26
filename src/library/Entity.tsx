import {
  createContext,
  useId,
  useContext,
  useState,
  ReactNode,
  useRef,
} from "react";

export type EntityId = {
  id: string;
};
export const EntityContext =
  createContext<null | React.MutableRefObject<EntityId>>(null);
type EntityProps = {
  key: React.Key;
  children: ReactNode;
};
export function Entity({ children }: EntityProps) {
  const ref = useRef<EntityId>({
    id: useId(),
  });
  return (
    <EntityContext.Provider value={ref}>{children}</EntityContext.Provider>
  );
}

export type Component<T extends string> = {
  type: T;
};
export type EntityComponentState<T> = [
  T,
  React.Dispatch<React.SetStateAction<T>>
];
export type EntityWithComponent<T extends Component<string>> = EntityId & {
  [P in T["type"]]: EntityComponentState<T>;
};

///

export type BodyData = {
  solid?: boolean;
  height?: number;
  width?: number;
};
export type Body = Component<"body"> & BodyData;
export function useBodyComponent(initialBody?: Partial<BodyData>) {
  const state = useState<Body>({
    type: "body",
    solid: true,
    width: 10,
    height: 10,
    ...initialBody,
  });
  const ref = useContext(EntityContext);
  const entity = ref.current as EntityWithComponent<Body>;
  entity.body = state;
  return state;
}

export type PositionData = {
  x: number;
  y: number;
  z: number;
};
export type Position = Component<"position"> & PositionData;
export function usePositionComponent(initialPosition?: Partial<PositionData>) {
  const state = useState<Position>({
    type: "position",
    x: 0,
    y: 0,
    z: 0,
    ...initialPosition,
  });

  const ref = useContext(EntityContext);
  const entity = ref.current as EntityWithComponent<Position>;
  entity.position = state;
  return state;
}
