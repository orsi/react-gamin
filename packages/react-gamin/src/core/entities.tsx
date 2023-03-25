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
import { useGame } from "./ecs";

interface EntitiesProps {
  entities: React.ReactNode[];
}
export function Entities({ entities }: EntitiesProps) {
  return (
    <>
      {entities.map((entity, i) => (
        <Entity key={i}>{entity}</Entity>
      ))}
    </>
  );
}

export function useEntityManager() {
  const game = useGame();
  if (!game) {
    throw new Error(
      "You can only call useEntityManager in a <Game /> context."
    );
  }

  return {
    remove: (entity: React.ReactNode) => {
      console.log("remove", entity);
      game.removeE(entity);
    },
  };
}

// this type is magic!
export type EntityComponentsMap<T extends Component<any, any>[]> =
  T extends undefined
    ? Record<string, any>
    : {
        [Key in `${number}` &
          keyof T as T[Key]["name"]]: T[Key]["type"] extends Function
          ? // Readonly<T[Key]["type"]> somehow removes call signatures,
            // so functions being stored here will not be callable despite
            // not being modified. cf. https://github.com/microsoft/TypeScript/issues/32566
            Function
          : Readonly<T[Key]["type"]>;
      };
export const EntityContext = createContext<IEntity>(null);
export interface IEntity<T extends Component<any, any>[] = any> {
  _id: string;
  _state: Record<PropertyKey, [any, Dispatch<any>]>;
  components: EntityComponentsMap<T>;
  update: <K extends string, T>(
    componentType: Component<K, T>,
    data: T
  ) => void;
  has: (...components: T[]) => boolean;
}
export interface EntityProps extends PropsWithChildren {}
export const Entity = forwardRef<IEntity, EntityProps>(function Entity(
  { children },
  ref
) {
  const entityRef = useRef<IEntity>({
    _id: crypto.randomUUID(),
    _state: {},
    components: {},
    update: null,
    has: null,
  });

  const has = <T extends Component<any, any>[]>(...components: T) => {
    for (const component of components) {
      if (entityRef.current.components[component.name] == null) {
        return false;
      }
    }

    return true;
  };
  entityRef.current.has = has;

  const update = <K extends string, T>(
    componentType: Component<K, T>,
    data: T
  ) => {
    const component = entityRef.current._state[componentType.name];
    if (!component) {
      console.warn(
        `Entity ${entityRef.current._id} does not have component ${componentType.name}`
      );
      return;
    }

    const [, setState] = component;
    setState(data);
  };
  entityRef.current.update = update;
  useImperativeHandle(ref, () => entityRef.current);

  const game = useGame();
  useEffect(() => {
    game.addEntity(entityRef.current);
    return () => {
      game.removeEntity(entityRef.current);
    };
  }, []);

  return (
    <EntityContext.Provider value={entityRef.current}>
      {children}
    </EntityContext.Provider>
  );
});

export function useEntity<T extends Component<any, any>[] = []>() {
  const context = useContext(EntityContext);
  if (!context) {
    console.warn("useEntity must be used inside a <Entity /> context.");
  }
  return context as IEntity<T>;
}

export type Component<K extends string, T> = {
  readonly name: K;
  readonly type: T;
};

export function createComponent<K extends string, T>(
  name: K,
  type: T
): Component<K, T> {
  return {
    name,
    type,
  };
}

export function useComponent<K extends string, T>(name: K, intialValue?: T) {
  const entity = useEntity<[any]>();
  //                         ^
  // TODO: This is a hack I'm already seeing too often

  // passing useState() a function that returns the initial value will
  // ensure components can store functions as state as well, instead of
  // useState() interpretting the function as a state setter
  const [state, setState] = useState(() => intialValue);

  useEffect(() => {
    entity.components[name] = state;
    entity._state[name] = [state, setState];
  }, [state]);

  return [state, setState] as [T, Dispatch<T>];
}

// default components
export interface Transform {
  x: number;
  y: number;
  z: number;
}

export const TransformComponent = createComponent("transform", {
  x: 0,
  y: 0,
  z: 0,
});

export function useTransformComponent(initialValue?: Transform) {
  return useComponent("transform", initialValue);
}

export interface Velocity {
  dx: number;
  dy: number;
  dz: number;
}

export const VelocityComponent = createComponent("velocity", {
  dx: 0,
  dy: 0,
  dz: 0,
});

export function useVelocityComponent(initialValue?: Velocity) {
  return useComponent("velocity", initialValue);
}

export interface Body {
  height: number;
  width: number;
}

export const BodyComponent = createComponent("body", {
  width: 100,
  height: 100,
});

export function useBodyComponent(initialValue?: Body) {
  return useComponent("body", initialValue);
}
