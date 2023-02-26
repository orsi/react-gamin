import {
  createContext,
  useId,
  useContext,
  useState,
  ReactNode,
  useRef,
} from "react";

export interface EntityId {
  id: string;
}
export const EntityContext =
  createContext<null | React.MutableRefObject<EntityId>>(null);
interface EntityProps {
  key: React.Key;
  children: ReactNode;
}
export function Entity({ children }: EntityProps) {
  const ref = useRef<EntityId>({
    id: useId(),
  });
  return (
    <EntityContext.Provider value={ref}>{children}</EntityContext.Provider>
  );
}

export interface Component<T extends string> {
  interface: T;
}
export type EntityComponentState<T> = [
  T,
  React.Dispatch<React.SetStateAction<T>>
];
export type EntityWithComponent<T extends Component<string>> = EntityId & {
  [P in T["type"]]: EntityComponentState<T>;
};

///

export interface BodyData {
  solid?: boolean;
  height?: number;
  width?: number;
}
export interface Body extends Component<"body">, BodyData {}
export function useBodyComponent(initialBody?: Partial<BodyData>) {
  const state = useState<Body>({
    interface: "body",
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

export interface PositionData {
  x: number;
  y: number;
  z: number;
}
export interface Position extends Component<"position">, PositionData {}
export function usePositionComponent(initialPosition?: Partial<PositionData>) {
  const state = useState<Position>({
    interface: "position",
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
