import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
} from "react";
import { EntityRef, useEntityContext } from "./Entity";

export interface IBaseSystemContext {
  getEntityRefs: () => EntityRef[];
  addEntityRef: (entity: EntityRef) => void;
  removeEntityRef: (entity: EntityRef) => void;
}
export type AdditionalContext<T> = {
  [K in keyof T]?: T[K];
};
export type SystemContext<T = undefined> = IBaseSystemContext &
  AdditionalContext<T>;

export interface SystemProps {}

/**
 * A utility function that returns:
 *
 *  1) A Context.Provider that the main <Game /> component can use to encapsulate all stages and entities
 *  2) A custom hook that can be used by entities in the Game.
 *
 * Using this function will automatically add and remove entities that use the hook when they mount
 * and unmount from the DOM.
 *
 * @param system A function that runs whenever an entity will use this system. The first argument
 * will be a ref to the entity trying to use the system, and the second argument will be all
 * current entity refs that have been added to the system. Additional parameters
 * can be added to require entities provide the system with the information it needs.
 *
 * @returns Systems can return anything they want to an entity: a function to call when
 * they want to perform an action, a value, etc.
 */
export function createSystem<T, U extends unknown[], V>(
  system: (entity: EntityRef, context: SystemContext<T>, ...props: U) => V,
  additionalContext?: T
) {
  const SystemContext = createContext<null | SystemContext<T>>(null);

  const Provider = ({ children }: PropsWithChildren) => {
    const entities = useRef(new Set<EntityRef>());

    return (
      <SystemContext.Provider
        value={{
          getEntityRefs: () => [...entities.current],
          addEntityRef: (entity: EntityRef) => {
            entities.current.add(entity);
          },
          removeEntityRef: (entity: EntityRef) => {
            entities.current.delete(entity);
          },
          ...additionalContext,
        }}
      >
        {children}
      </SystemContext.Provider>
    );
  };

  const useSystem = (...props: U) => {
    // get entity and register to this system
    const entityRef = useEntityContext();
    const context = useContext(SystemContext);
    if (!context) {
      throw Error("System could not be found. Did you add it to your game?");
    }

    useEffect(() => {
      context.addEntityRef(entityRef);
      return () => {
        context.removeEntityRef(entityRef);
      };
    }, []);

    // pass entity using system, system context, and original
    // props passed from entity to the system function
    return system(entityRef, context, ...props);
  };

  return {
    Provider,
    useSystem,
  };
}
