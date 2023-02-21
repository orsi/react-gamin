import {
  useState,
  useEffect,
  PropsWithChildren,
  useRef,
  createContext,
  CSSProperties,
  useCallback,
  useContext,
  useId,
  Dispatch,
  SetStateAction,
  useSyncExternalStore,
} from "react";
import { createStore, Store } from "./createStore";
import { GameInput } from "./Input";

export type ReactState<S> = [S, Dispatch<SetStateAction<S>>];

export type TGameState = {
  entities: Set<TEntity>;
};
export const GameContext = createContext<Store<TGameState> | null>(null);
interface GameProps {}
export default function Game({ children }: PropsWithChildren<GameProps>) {
  const ref = useRef<HTMLDivElement>(null);
  const gameStore = createStore<TGameState>({
    entities: new Set<TEntity>(),
  });

  const [width, setWidth] = useState(640);
  const [height, setHeight] = useState(480);

  function onWindowResize() {
    const bounds = document.body.getBoundingClientRect();
    setHeight(bounds.height);
    setWidth(bounds.width);
  }

  useEffect(() => {
    window.addEventListener("resize", onWindowResize);
    onWindowResize();

    return () => {
      window.removeEventListener("resize", onWindowResize);
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        height,
        width,
      }}
    >
      <GameContext.Provider value={gameStore}>
        <GameInput>{children}</GameInput>
      </GameContext.Provider>
    </div>
  );
}

export function useGameStore<O>() {
  const store = useContext(GameContext);
  if (!store) {
    throw new Error("No game context.");
  }
  return store.get();
}

export function useGameState<O>(selector: (game: TGameState) => O): O;
export function useGameState(): TGameState;
export function useGameState<O>(selector?: (game: TGameState) => O) {
  const store = useContext(GameContext);
  if (!store) {
    throw new Error("No game context.");
  }
  const state = useSyncExternalStore(store.subscribe, () =>
    selector ? selector(store.get()) : store.get()
  );
  return state;
}

type TEntity = {
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
type TBodyComponent = TComponent<"Body", IBody>;
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

export interface IPosition {
  x?: number;
  y?: number;
  z?: number;
}
type TPositionComponent = TComponent<"Position", IPosition>;
export function usePosition(initialPosition?: IPosition) {
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
