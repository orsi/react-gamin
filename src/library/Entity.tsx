import {
  createContext,
  useId,
  useContext,
  useState,
  ReactNode,
  useRef,
  PropsWithChildren,
} from "react";
import { ReactState } from "./Game";

export interface EntityId {
  id: string;
}

export interface Component {}

export type EntityWithComponent<
  K extends string,
  C extends Component
> = EntityId & {
  [key in K]: ReactState<C>;
};

export const EntityContext =
  createContext<null | React.MutableRefObject<EntityId>>(null);

interface EntityProps extends PropsWithChildren {}
export function Entity({ children }: EntityProps) {
  const ref = useRef<EntityId>({
    id: useId(),
  });
  return (
    <EntityContext.Provider value={ref}>{children}</EntityContext.Provider>
  );
}

export interface Body {
  solid?: boolean;
  height?: number;
  width?: number;
}
export function useBodyComponent(initialBody?: Partial<Body>) {
  const state = useState<Body>({
    solid: true,
    width: 10,
    height: 10,
    ...initialBody,
  });
  const ref = useContext(EntityContext);
  const entity = ref.current as EntityWithComponent<"body", Body>;
  entity.body = state;
  return state;
}

export interface Position extends Component {
  x: number;
  y: number;
  z: number;
}
export function usePositionComponent(initialPosition?: Partial<Position>) {
  const state = useState<Position>({
    x: 0,
    y: 0,
    z: 0,
    ...initialPosition,
  });

  const ref = useContext(EntityContext);
  const entity = ref.current as EntityWithComponent<"position", Position>;
  entity.position = state;
  return state;
}
