import {
  createContext,
  useContext,
  useRef,
  PropsWithChildren,
  forwardRef,
  useImperativeHandle,
  MutableRefObject,
  ComponentState,
  ReactNode,
  useId,
} from "react";
import { useEntityInStage } from "./Stage";

export interface Entity {
  id?: string;
  type?: string;
  components: Map<string, ComponentState>;
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
