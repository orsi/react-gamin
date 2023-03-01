import {
  createContext,
  useId,
  useContext,
  useRef,
  PropsWithChildren,
  forwardRef,
  useImperativeHandle,
  MutableRefObject,
  useEffect,
} from "react";

export interface IEntity {
  id?: string;
}
export type EntityRef<T> = MutableRefObject<IEntity> & { current: T };

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
