import {
  createContext,
  Dispatch,
  PropsWithChildren,
  forwardRef,
  useRef,
  useImperativeHandle,
  useEffect,
  useContext,
  useState,
} from "react";
import { useGame } from "./game";

// From https://stackoverflow.com/a/50375286
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

// From: https://stackoverflow.com/a/53955431
type IsUnion<T> = [T] extends [UnionToIntersection<T>] ? false : true;

// Here we come!
type SingleKey<T> = IsUnion<keyof T> extends true
  ? never
  : {} extends T
  ? never
  : T;

type Entity<T extends Record<PropertyKey, any>[]> = {
  id: string;
} & UnionToIntersection<T[number]>;

type Component<T> = SingleKey<T>;

export const Transform = {
  transform: {
    x: 0,
    y: 0,
    z: 0,
  },
};

export const Body = {
  body: {
    width: 100,
    height: 100,
  },
};

export function useComponent<T>(
  component: Component<T>,
  initialValue?: T[keyof T]
) {
  const property = Object.keys(component)[0];
  let entity = useEntity();

  // passing useState() a function that returns the initial value will
  // ensure components can store functions as state as well, instead of
  // useState() interpretting the function as a state setter
  const state = useState(() => initialValue ?? Object.values(component)[0]);

  useEffect(() => {
    entity = Object.assign(
      {},
      entity,
      { [property]: initialValue } ?? component
    );
  }, []);

  return state as [T[keyof T], Dispatch<React.SetStateAction<T[keyof T]>>];
}

const getE = <T extends SingleKey<T>[]>(...types: T): Entity<T> => {
  return { id: 3 } as Entity<T>;
};

export const EntityContext = createContext<Entity<any>>(null);
export interface EntityProps extends PropsWithChildren {}
export const Entity = forwardRef<Entity<any>, EntityProps>(function Entity(
  { children },
  ref
) {
  const entityRef = useRef<Entity<any>>({
    id: crypto.randomUUID(),
  });

  useImperativeHandle(ref, () => entityRef.current);

  const game = useGame();
  useEffect(() => {
    game.entities = [...game.entities, entityRef.current];
    return () => {
      game.entities = game.entities.filter((e) => e !== entityRef.current);
    };
  }, []);

  return (
    <EntityContext.Provider value={entityRef.current}>
      {children}
    </EntityContext.Provider>
  );
});

export function useEntity<T = {}>() {
  const context = useContext(EntityContext);
  if (!context) {
    console.warn("useEntity must be used inside a <Entity /> context.");
  }
  return context as Entity<[T]>;
}

// default components
// export interface Velocity {
//   dx: number;
//   dy: number;
//   dz: number;
// }

// export const VelocityComponent = createComponent("velocity", {
//   dx: 0,
//   dy: 0,
//   dz: 0,
// });

// export function useVelocityComponent(initialValue?: Velocity) {
//   return useComponent("velocity", initialValue);
// }

// export interface Body {
//   height: number;
//   width: number;
// }

// export const BodyComponent = createComponent("body", {
//   width: 100,
//   height: 100,
// });

// export function useBodyComponent(initialValue?: Body) {
//   return useComponent("body", initialValue);
// }
