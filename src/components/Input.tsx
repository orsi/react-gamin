import {
  useRef,
  useCallback,
  createContext,
  PropsWithChildren,
  useEffect,
  useContext,
  useSyncExternalStore,
} from "react";

interface IGameInput {
  UP: boolean;
  RIGHT: boolean;
  DOWN: boolean;
  LEFT: boolean;
}
function useGameInputStore() {
  const gameInput = useRef({
    UP: false,
    RIGHT: false,
    DOWN: false,
    LEFT: false,
  });

  const subscribers = useRef(new Set<() => void>());
  const subscribe = useCallback((callback: () => void) => {
    subscribers.current.add(callback);
    return () => {
      subscribers.current.delete(callback);
    };
  }, []);

  const get = useCallback(() => gameInput.current, []);

  const set = useCallback((value: Partial<IGameInput>) => {
    const nextState = { ...gameInput.current, ...value };
    let update = false;
    for (const [key, value] of Object.entries(nextState)) {
      if (!gameInput.current[key] === value) {
        update = true;
        gameInput.current = nextState;
        break;
      }
    }

    if (!update) {
      return;
    }

    subscribers.current.forEach((callback) => callback());
  }, []);

  return {
    subscribe,
    get,
    set,
  };
}

export const GameInputContext = createContext<null | ReturnType<
  typeof useGameInputStore
>>(null);

export function GameInputProvider({ children }: PropsWithChildren) {
  const gameInputStore = useGameInputStore();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.code === "ArrowUp") {
        gameInputStore.set({ UP: true });
      }
      if (e.code === "ArrowRight") {
        gameInputStore.set({ RIGHT: true });
      }
      if (e.code === "ArrowDown") {
        gameInputStore.set({ DOWN: true });
      }
      if (e.code === "ArrowLeft") {
        gameInputStore.set({ LEFT: true });
      }
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.code === "ArrowUp") {
        gameInputStore.set({ UP: false });
      }
      if (e.code === "ArrowRight") {
        gameInputStore.set({ RIGHT: false });
      }
      if (e.code === "ArrowDown") {
        gameInputStore.set({ DOWN: false });
      }
      if (e.code === "ArrowLeft") {
        gameInputStore.set({ LEFT: false });
      }
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  return (
    <GameInputContext.Provider value={gameInputStore}>
      {children}
    </GameInputContext.Provider>
  );
}

export function useGameInput(
  callback: (input: IGameInput | IGameInput[keyof IGameInput]) => void,
  selector?: (input: IGameInput) => IGameInput[keyof IGameInput]
) {
  const gameInputStore = useContext(GameInputContext);
  if (!gameInputStore) {
    throw new Error("Game Input Store not available.");
  }

  const state = useSyncExternalStore(gameInputStore.subscribe, () =>
    selector !== undefined
      ? selector(gameInputStore.get())
      : gameInputStore.get()
  );

  useEffect(() => {
    callback(state);
  }, [state]);
}
