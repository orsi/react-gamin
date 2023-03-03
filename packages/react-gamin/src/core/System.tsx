import {
  Children,
  createContext,
  forwardRef,
  MutableRefObject,
  PropsWithChildren,
  ReactNode,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
} from "react";
import { Entity, EntityContextProvider } from "./Entity";
import { useEntityInGame } from "./Game";

export type SystemRef = MutableRefObject<System>;
export interface System {
  id: string;
  name?: string;
  entities: Set<Entity>;
}
export const SystemContext = createContext<null | SystemRef>(null);
interface SystemProps extends PropsWithChildren {
  name: string;
}
export const System = forwardRef<System, SystemProps>(function System(
  { children, name },
  ref
) {
  const id = useId();
  const systemRef = useRef({
    id,
    name,
    entities: new Set<Entity>(),
  });
  useImperativeHandle(ref, () => systemRef.current);

  return (
    <SystemContext.Provider value={systemRef}>
      {children}
    </SystemContext.Provider>
  );
});

export function useSystem() {
  return useContext(SystemContext).current;
}

export function useEntityInSystem(entity: Entity) {
  useEntityInGame(entity);

  const system = useSystem();
  useEffect(() => {
    system.entities.add(entity);
    return () => {
      system.entities.delete(entity);
    };
  }, []);
}
