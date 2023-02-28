import {
  createContext,
  useId,
  useContext,
  useState,
  useRef,
  PropsWithChildren,
  forwardRef,
  useImperativeHandle,
  MutableRefObject,
  useEffect,
} from "react";
import { GameContext, ReactState } from "./Game";

export interface IEntity {
  id: string;
}
export type EntityRef<T> = MutableRefObject<IEntity> & { current: T };

export interface Component {}

export type EntityWithComponent<
  K extends string,
  C extends Component
> = IEntity & {
  [key in K]: ReactState<C>;
};

export const EntityContext =
  createContext<null | React.MutableRefObject<IEntity>>(null);

interface EntityProps extends PropsWithChildren {
  id: string;
}
export const Entity = forwardRef<IEntity, EntityProps>(
  ({ children, id }, ref) => {
    const entityRef = useRef<IEntity>({
      id,
    });
    useImperativeHandle(ref, () => entityRef.current);

    return (
      <EntityContext.Provider value={entityRef}>
        {children}
      </EntityContext.Provider>
    );
  }
);

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

  const entityRef = useContext(EntityContext);
  useEffect(() => {
    entityRef.current.position = state;
  }, []);

  return state;
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

  const entityRef = useContext(EntityContext);
  useEffect(() => {
    entityRef.current.body = state;
  }, []);

  return state;
}
