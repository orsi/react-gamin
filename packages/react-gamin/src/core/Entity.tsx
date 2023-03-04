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
