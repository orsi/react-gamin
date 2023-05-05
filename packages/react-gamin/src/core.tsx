import { useCallback, useState } from "react";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
} from "react";

export type SetState<T> = Dispatch<React.SetStateAction<T>>;

const RAF_DELAY = 1000 / 30;

export type GameContext = {
  input: any[];
  systems: Record<string, any[]>;
  scripts: (() => void)[];
};
export const GameContext = createContext<Record<string, any>>(null);
export interface GameProps extends PropsWithChildren {
  development?: boolean;
}
export function Game({ children, development = false }: GameProps) {
  const gameContext = useContext(GameContext);
  if (gameContext != null) {
    throw Error("Why is there a game in a game?!?");
  }

  const store = useRef<GameContext>({
    input: [],
    systems: {},
    scripts: [],
  });
  const [devString, setDevString] = useState(``);

  const lastUpdateRef = useRef(0);
  const frameDeltasRef = useRef([]);
  const requestAnimationFrameRef = useRef(0);

  // game loop
  const update = useCallback(
    (time: number) => {
      const delta = time - lastUpdateRef.current;

      frameDeltasRef.current.push(delta);
      if (frameDeltasRef.current.length > 50) {
        frameDeltasRef.current.shift();
      }

      if (delta > RAF_DELAY) {
        setDevString(
          `${Math.round(
            1000 /
              (frameDeltasRef.current.reduce((acc, time) => acc + time, 0) /
                frameDeltasRef.current.length)
          )}`
        );
        // update order
        // input => systems => scripts

        // execute input
        for (let i = 0; i < store.current.input.length; ++i) {
          store.current.input[i]();
        }
        store.current.input = [];

        // run systems
        for (const key of Object.keys(store.current.systems)) {
          for (const callback of store.current.systems[key]) {
            callback(time);
          }
        }

        // component scripts
        for (let i = 0; i < store.current.scripts.length; ++i) {
          store.current.scripts[i]();
        }

        lastUpdateRef.current = time;
      }

      requestAnimationFrameRef.current = requestAnimationFrame(update);
    },
    [lastUpdateRef, requestAnimationFrameRef, store]
  );
  useEffect(() => {
    requestAnimationFrameRef.current = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(requestAnimationFrameRef.current);
    };
  }, [update]);

  return (
    <GameContext.Provider value={store.current}>
      {development && (
        <span
          style={{
            bottom: `0px`,
            padding: `12px`,
            position: "absolute",
            right: `0px`,
          }}
        >
          {devString}
        </span>
      )}
      {children}
    </GameContext.Provider>
  );
}

export function useSystem(name: string, callback: () => void) {
  const gameContext = useContext(GameContext);

  useEffect(() => {
    let callbacks = gameContext.systems[name];
    if (callbacks == null) {
      callbacks = [];
    }
    gameContext.systems[name] = [...callbacks, callback];
    return () => {
      const index = gameContext.systems[name].findIndex(
        (i: () => void) => i === callback
      );
      gameContext.systems[name].splice(index, 1);
    };
  }, [callback]);
}

export function useScript<T>(fn: (args?: T) => void) {
  const gameContext = useContext(GameContext);

  useEffect(() => {
    gameContext.scripts = [...gameContext.scripts, fn];
    return () => {
      const index = gameContext.scripts.findIndex((i: any) => i === fn);
      gameContext.scripts.splice(index, 1);
    };
  }, [fn]);
}
