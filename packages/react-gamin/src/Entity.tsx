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

interface EntityProps extends PropsWithChildren {}
export const Entity = forwardRef<IEntity, EntityProps>(function Entity(
  { children },
  ref
) {
  const id = useId();

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
