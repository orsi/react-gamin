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
  useLayoutEffect,
  CSSProperties,
  useId,
  useCallback,
} from "react";
import { Entity } from "./Entity";
import { GameInputState, useInputSystem } from "./Input";
import { Stage } from "./Stage";
import { System } from "./System";

const FPS = 60;
const FRAME_MS = 1000 / FPS;

export type ReactState<S> = [S, Dispatch<SetStateAction<S>>];

export interface GameContext {
  entities: Set<Entity>;
  height: number;
  input: MutableRefObject<GameInputState>;
  stages: Set<Stage>;
  state: ExecutionState;
  systems: Set<System>;
  loops: Set<Loop>;
  width: number;
}

export type ExecutionState = "setup" | "running" | "paused";

export const GameContext = createContext<null | MutableRefObject<GameContext>>(
  null
);

interface GameProps extends PropsWithChildren {
  aspectRatio?: string;
  height?: string;
  width?: string;
  style?: CSSProperties;
  systems?: ((game: GameContext) => void)[];
}

export const Game = forwardRef<GameContext, GameProps>(function Game(
  props,
  ref
) {
  const { aspectRatio, children, height, style, systems, width } = props;

  const [gameState, setGameState] = useState<ExecutionState>("setup");

  // every rendered component will register themselves
  // into these refs via the game context
  const inputRef = useInputSystem();
  const gameContext = useRef<GameContext>({
    height: 480,
    width: 640,
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
        // run systems
        systems?.forEach((fn) => {
          fn(gameContext.current);
        });

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

  const gameElementRef = useRef<HTMLDivElement>();
  useLayoutEffect(() => {
    if (gameElementRef.current) {
      const rect = gameElementRef.current.getBoundingClientRect();
      gameContext.current.height = rect.height;
      gameContext.current.width = rect.width;
    }
  }, []);

  return (
    <div
      ref={gameElementRef}
      style={{
        aspectRatio: aspectRatio ?? "4/3",
        height,
        margin: "0px auto",
        overflow: "hidden",
        width: width ?? "640px",
        ...style,
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
          {children ?? <NoGameChildren />}
        </GameContext.Provider>
      </div>
    </div>
  );
});

function NoGameChildren() {
  return <div>No children</div>;
}

export function useGame() {
  return useContext(GameContext).current;
}

export function useInput() {
  const game = useGame();
  return game.input.current;
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
