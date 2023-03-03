import {
  useEffect,
  PropsWithChildren,
  createContext,
  Dispatch,
  SetStateAction,
  forwardRef,
  useRef,
  useImperativeHandle,
  useContext,
  MutableRefObject,
  useState,
} from "react";
import { Entity } from "./Entity";
import { GameInputState, useInputSystem } from "./Input";
import { Stage } from "./Stage";
import { System } from "./System";

const FPS = 60;
const FRAME_MS = 1000 / FPS;

export type ReactState<S> = [S, Dispatch<SetStateAction<S>>];

export interface GameContext {
  state: ExecutionState;
  input: MutableRefObject<GameInputState>;
  entities: Set<Entity>;
  systems: Set<System>;
  stages: Set<Stage>;
  loops: Set<Loop>;
}

export type ExecutionState = "setup" | "running" | "paused";

export const GameContext = createContext<null | MutableRefObject<GameContext>>(
  null
);

interface GameProps extends PropsWithChildren {
  aspectRatio?: string;
  height?: string;
  width?: string;
}

export const Game = forwardRef<GameContext, GameProps>(function Game(
  props,
  ref
) {
  const { aspectRatio, children, height, width } = props;

  const [gameState, setGameState] = useState<ExecutionState>("setup");

  // every rendered component will register themselves
  // into these refs via the game context
  const inputRef = useInputSystem();
  const gameContext = useRef<GameContext>({
    state: gameState,
    input: inputRef,
    entities: new Set(),
    systems: new Set(),
    stages: new Set(),
    loops: new Set<Loop>(),
  });
  useImperativeHandle(ref, () => gameContext.current);

  // game update loop
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    setGameState("running");
    let frame = 0;
    const update = (time: number) => {
      const delta = time - lastUpdateRef.current;
      if (delta > FRAME_MS) {
        [...gameContext.current.loops.values()].forEach((cb) => {
          cb(gameContext.current);
        });
        lastUpdateRef.current = time;
      }
      frame = requestAnimationFrame(update);
    };

    frame = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      style={{
        aspectRatio: aspectRatio ?? "4/3",
        height,
        margin: "0px auto",
        overflow: "hidden",
        width: width ?? "640px",
      }}
    >
      <div
        style={{
          height: "100%",
          position: "relative",
          width: "100%",
        }}
      >
        <GameContext.Provider value={gameContext}>
          {children}
        </GameContext.Provider>
      </div>
    </div>
  );
});

export function useGame() {
  return useContext(GameContext).current;
}

type Loop = (input?: GameContext) => void;
/**
 * This hook will run the callback given to it continously
 * via a requestAnimationFrame loop.
 *
 * @param callback Code to run in a continuous loop
 * @param deps State dependencies
 */
export function useLoop(callback: Loop, dependencies?: any[]) {
  const game = useGame();
  useEffect(() => {
    game.loops.add(callback);
    return () => {
      game.loops.delete(callback);
    };
  }, [dependencies]);
}

export function useEntityInGame(entity: Entity) {
  const game = useGame();
  useEffect(() => {
    game.entities.add(entity);
    return () => {
      game.entities.delete(entity);
    };
  }, []);
}

export function useStageInGame(stage: Stage) {
  const game = useGame();
  useEffect(() => {
    game.stages.add(stage);
    return () => {
      game.stages.delete(stage);
    };
  }, []);
}

export function useSystemInGame(system: System) {
  const game = useGame();
  useEffect(() => {
    game.systems.add(system);
    return () => {
      game.systems.delete(system);
    };
  }, []);
}
