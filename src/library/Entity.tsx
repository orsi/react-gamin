import {
  createContext,
  useId,
  useContext,
  useState,
  ReactNode,
  useRef,
} from "react";

export type TEntity = {
  id: string;
  [key: string]: any;
};
export const EntityContext = createContext<React.MutableRefObject<TEntity>>({
  current: {
    id: "default",
  },
});
type EntityProps = {
  key: React.Key;
  children: ReactNode;
};
export function Entity({ children }: EntityProps) {
  const entity = useRef<TEntity>({
    id: useId(),
  });

  // const stage = useContext(StageContext);
  // const [state, setState] = useState({});

  // useEffect(() => {
  //   // stage.add(state);
  //   () => {
  //     // stage.delete(state);
  //   };
  // }, []);

  return (
    <EntityContext.Provider value={entity}>{children}</EntityContext.Provider>
  );
}

export interface IBody {
  solid?: boolean;
  height?: number;
  width?: number;
}
export function useBodyComponent(initialBody?: IBody) {
  const entity = useContext(EntityContext);
  const state = useState<IBody>({
    solid: true,
    width: 10,
    height: 10,
    ...initialBody,
  });
  entity.current.body = state;
  return state;
}

export interface IPosition {
  x: number;
  y: number;
  z: number;
}
export function usePositionComponent(initialPosition?: Partial<IPosition>) {
  const entity = useContext(EntityContext);
  const state = useState<IPosition>({
    x: 0,
    y: 0,
    z: 0,
    ...initialPosition,
  });
  entity.current.position = state;
  return state;
}
