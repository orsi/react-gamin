import {
  useState,
  useEffect,
  PropsWithChildren,
  createContext,
  useContext,
  Dispatch,
  SetStateAction,
  useSyncExternalStore,
  forwardRef,
  ReactNode,
} from "react";
import { createStore, Store } from "./createStore";
import { EntityId } from "./Entity";
import { GameInput } from "./Input";
import Stage from "./Stage";

export type ReactState<S> = [S, Dispatch<SetStateAction<S>>];

export interface TGameStore {
  entities: Set<EntityId>;
}
export const GameContext = createContext<Store<TGameStore> | null>(null);
interface GameProps {
  stages: ReactNode[];
  systems: (({ children }: PropsWithChildren) => JSX.Element)[];
}
export default forwardRef<HTMLDivElement, GameProps>(function Game(
  { stages, systems },
  ref
) {
  const gameStore = createStore<TGameStore>({
    entities: new Set<EntityId>(),
  });
  const [width, setWidth] = useState<number>();
  const [height, setHeight] = useState<number>();

  const [currentStage, setCurrentStage] = useState(stages[0]);

  const Systems = systems.reduce(
    (AccSystems, System) =>
      ({ children }: PropsWithChildren) =>
        (
          <AccSystems>
            <System children={children} />
          </AccSystems>
        ),
    ({ children }: PropsWithChildren) => <>{children}</>
  );

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
        height: height ?? `100vh`,
        width: width ?? `100vw`,
      }}
    >
      <GameContext.Provider value={gameStore}>
        <GameInput>
          <Systems>
            <Stage>{currentStage}</Stage>
          </Systems>
        </GameInput>
      </GameContext.Provider>
    </div>
  );
});

export function useGameStore<O>() {
  const store = useContext(GameContext);
  if (!store) {
    throw new Error("No game context.");
  }
  return store.get();
}

export function useGameState<O>(selector: (game: TGameStore) => O): O;
export function useGameState(): TGameStore;
export function useGameState<O>(selector?: (game: TGameStore) => O) {
  const store = useContext(GameContext);
  if (!store) {
    throw new Error("No game context.");
  }
  const state = useSyncExternalStore(store.subscribe, () =>
    selector ? selector(store.get()) : store.get()
  );
  return state;
}
