import {
  createContext,
  useId,
  useEffect,
  useContext,
  useSyncExternalStore,
  useState,
  PropsWithChildren,
} from "react";
import { Store, createStore } from "./createStore";
import { useGameState } from "./Game";
import { StageContext } from "./Stage";

export type TEntity = {
  id: string;
  components: { [key: string]: any };
};
const EntityContext = createContext<Store<TEntity> | null>(null);
export const createEntity =
  (Component: ({ ...props }) => JSX.Element) =>
  ({ ...props }) => {
    const id = useId();
    const store = createStore({
      id,
      components: {},
    });

    const entities = useGameState((game) => game.entities);

    useEffect(() => {
      entities.add(store.get());
      () => {
        entities.delete(store.get());
      };
    }, []);

    return (
      <EntityContext.Provider value={store}>
        <Component {...props} />
      </EntityContext.Provider>
    );
  };

export function useEntity(ref: any) {
  const [state, setState] = useState({
    id: useId(),
    ref,
  });
  return state;
}
export function Entity({ children }: PropsWithChildren) {
  const stage = useContext(StageContext);
  const [state, setState] = useState({});

  useEffect(() => {
    // stage.add(state);
    () => {
      // stage.delete(state);
    };
  }, []);

  return (
    <EntityContext.Provider value={state}>{children}</EntityContext.Provider>
  );
}

export function useEntityStore() {
  const store = useContext(EntityContext);
  if (!store) {
    throw new Error("No entity context.");
  }

  return store.get();
}

export function useEntityState<O>(selector: (entity: TEntity) => O): O;
export function useEntityState(): TEntity;
export function useEntityState<O>(selector?: (entity: TEntity) => O) {
  const entity = useContext(EntityContext);
  if (!entity) {
    throw new Error("No entity context.");
  }

  const state = useSyncExternalStore(entity.subscribe, () =>
    selector ? selector(entity.get()) : entity.get()
  );

  return state;
}

type TComponentState<C> = [C, React.Dispatch<C>];
type TComponent<T, C> = {
  name: T;
} & C;
export interface IBody {
  solid?: boolean;
  height?: number;
  width?: number;
}
export function useBody(initialBody?: IBody) {
  const state = useState<IBody>({
    solid: true,
    width: 10,
    height: 10,
    ...initialBody,
  });
  const entity = useEntityState();
  entity.components.body = state;
  return state;
}
export function useBodyComponent(entity: any, initialBody?: IBody) {
  const state = useState<IBody>({
    solid: true,
    width: 10,
    height: 10,
    ...initialBody,
  });
  entity.body = state;
  return state;
}

export interface IPosition {
  x: number;
  y: number;
  z: number;
}
export function usePosition(initialPosition?: Partial<IPosition>) {
  const state = useState<IPosition>({
    x: 0,
    y: 0,
    z: 0,
    ...initialPosition,
  });
  const entity = useEntityState();
  entity.components.position = state;
  return state;
}

export function usePositionComponent(
  entity: any,
  initialPosition?: Partial<IPosition>
) {
  const state = useState<IPosition>({
    x: 0,
    y: 0,
    z: 0,
    ...initialPosition,
  });
  entity.position = state;
  return state;
}
