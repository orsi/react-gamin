import {
  useState,
  useEffect,
  PropsWithChildren,
  useRef,
  createContext,
  useContext,
  Dispatch,
  SetStateAction,
  useSyncExternalStore,
} from "react";
import { createStore, Store } from "./createStore";
import { TEntity } from "./Entity";
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
