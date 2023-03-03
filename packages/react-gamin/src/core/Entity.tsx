import {
  createContext,
  useContext,
  useRef,
  PropsWithChildren,
  forwardRef,
  useImperativeHandle,
  MutableRefObject,
  ReactNode,
  useId,
  useEffect,
  useState,
  Dispatch,
  SetStateAction,
} from "react";
import { ReactState, useGame } from "./Game";
import { useEntityInStage } from "./Stage";

export interface Entity {
  id?: string;
  type?: string;
  components: Map<string, ComponentState<any>>;
  element?: ReactNode;
}

export type EntityRef = MutableRefObject<Entity>;

export const EntityContext = createContext<null | EntityRef>(null);

interface EntityProps extends PropsWithChildren {
  type?: string;
}
export const EntityContextProvider = forwardRef<Entity, EntityProps>(
  function Entity({ children, type }, ref) {
    const id = useId();
    const entityRef = useRef<Entity>({
      id,
      type: type ?? "unknown",
      components: new Map(),
      element: children,
    });
    useImperativeHandle(ref, () => entityRef.current);

    useEntityInStage(entityRef.current);

    return (
      <EntityContext.Provider value={entityRef}>
        {children}
      </EntityContext.Provider>
    );
  }
);

export function useEntityContext() {
  return useContext(EntityContext).current;
}

export interface IComponent {}
export type ComponentState<T extends IComponent> = [
  T,
  React.Dispatch<React.SetStateAction<T>>
];
export function useEntityWithComponent<T>(
  component: string,
  state: ComponentState<T>
) {
  const entity = useEntityContext();

  useEffect(() => {
    entity.components.set(component, state);
    return () => {
      entity.components.delete(component);
    };
  }, []);
}

export function getEntityComponent<T extends ComponentState<T>>(
  component: string
) {
  const entity = useEntityContext();
  return entity.components.get(component) as T | undefined;
}

// experiment
export function experimental_useEntity(
  type?: string,
  components?: { type: string; state: ReactState<any> }[]
) {
  const game = useGame();
  const id = useId();
  const entity = useRef<any>({
    id,
    type: type ?? "unknown",
    components: components.reduce((acc, c) => {
      acc[c.type] = c.state;
      return acc;
    }, {} as Record<string, ReactState<any>>),
  });

  useEffect(() => {
    game.entities.add(entity.current);
    return () => {
      game.entities.delete(entity.current);
    };
  }, []);

  useEffect(() => {
    const entity = [...game.entities].find(
      (e) => e.id === id
    ) as unknown as experimental_Entity;
    entity.components = components.reduce((acc, c) => {
      acc[c.type] = c.state;
      return acc;
    }, {} as Record<string, ReactState<any>>);
  }, [components]);

  return entity.current;
}

export function experiment_useComponent<T>(name: string, initialValue: T) {
  const state = useState<T>(initialValue);
  return state;
}

export interface experimental_Entity {
  id: string;
  type: string;
  components: Record<string, ReactState<any>>;
}
