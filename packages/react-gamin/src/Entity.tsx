import {
  createContext,
  useContext,
  useRef,
  PropsWithChildren,
  forwardRef,
  useImperativeHandle,
  MutableRefObject,
  ComponentState,
} from "react";

export interface IEntity {
  id: string;
  components: Map<string, ComponentState>;
}
export type EntityRef = MutableRefObject<IEntity>;

export const EntityContext =
  createContext<null | React.MutableRefObject<IEntity>>(null);

interface EntityProps extends PropsWithChildren {
  id: string;
}
export const Entity = forwardRef<IEntity, EntityProps>(function Entity(
  { children, id },
  ref
) {
  const entityRef = useRef<IEntity>({
    id,
    components: new Map(),
  });
  useImperativeHandle(ref, () => entityRef.current);
  return (
    <EntityContext.Provider value={entityRef}>
      {children}
    </EntityContext.Provider>
  );
});

export function useEntityContext() {
  return useContext(EntityContext);
}
