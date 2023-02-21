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
import { createStore, Store } from "../components/createStore";
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

interface RenderProps extends PropsWithChildren {
  position?: IPosition;
}
export function Render({ children, position }: RenderProps) {
  return (
    <div
      style={{
        position: "absolute",
        top: "0",
        left: "0",
        transform: `translate(${position?.x}px, ${position?.y}px)`,
      }}
    >
      {children}
    </div>
  );
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

// SYSTEMS
const SPEED = 5;

type TDirection = "up" | "down" | "left" | "right";
export function useMovementSystem() {
  const entity = useEntityState();
  const entities = useGameState((game) => game.entities);

  const move = useCallback((direction: TDirection) => {
    if (!entity?.components?.position) {
      return false;
    }

    const [position, setPosition] = entity?.components?.position;

    let nextPosition = { x: 0, y: 0, z: 0, ...position };
    if (direction === "up") nextPosition.y = nextPosition.y - 1 * SPEED;
    if (direction === "right") nextPosition.x = nextPosition.x + 1 * SPEED;
    if (direction === "down") nextPosition.y = nextPosition.y + 1 * SPEED;
    if (direction === "left") nextPosition.x = nextPosition.x - 1 * SPEED;

    const e2 = Array.from(entities).find((e) => {
      if (e === entity) {
        return false;
      }
      if (!e?.components?.position || !e?.components?.body) {
        return false;
      }
      const [ePosition] = e?.components?.position;
      const [eBody] = e?.components?.body;
      const xMin = ePosition.x! - eBody.width! / 2;
      const xMax = ePosition.x! + eBody.width! / 2;
      const yMin = ePosition.y! - eBody.height! / 2;
      const yMax = ePosition.y! + eBody.height! / 2;
      const inRange =
        nextPosition.x >= xMin &&
        nextPosition.x <= xMax &&
        nextPosition.y >= yMin &&
        nextPosition.y <= yMax;
      return inRange;
    });
    console.log("move", entity, e2, entities);

    // nothing is there
    if (!e2) {
      setPosition(nextPosition);
      return true;
    }

    // entity there is not solid
    if (e2 && !e2?.components?.body?.[0]?.solid) {
      setPosition(nextPosition);
      return true;
    }

    // nope
    return false;
  }, []);

  return move;
}
