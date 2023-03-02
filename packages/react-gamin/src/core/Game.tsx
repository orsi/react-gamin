import {
  useState,
  useEffect,
  PropsWithChildren,
  createContext,
  Dispatch,
  SetStateAction,
  forwardRef,
  useRef,
  useImperativeHandle,
  Children,
  useContext,
} from "react";
import { MissingStage } from "./Stage";

const DEVELOPMENT_MODE = import.meta.env.MODE === "development";

export type ReactState<S> = [S, Dispatch<SetStateAction<S>>];

export interface GameState {
  currentStage?: string;
  onStageChange?: (from: any, to: any) => void;
  systems?: (({ children }: { children?: React.ReactNode }) => JSX.Element)[];
  children?: React.ReactNode;
  [key: string]: any;
}

export const GameContext = createContext<null | GameState>(null);

interface GameProps extends PropsWithChildren {
  currentStage?: string;
  systems: (({ children }: PropsWithChildren) => JSX.Element)[];
}
export const Game = forwardRef<GameState, GameProps>(function Game(props, ref) {
  const { children, currentStage, systems } = props;

  const CurrentStage = Children.toArray(children).find((child) => {
    return child.props?.name === currentStage;
  }) ?? <MissingStage name={currentStage} />;

  // nest systems within each other so entire tree is contained
  // in the systems
  function wrapWithSystems(stage: JSX.Element) {
    let systemsWrappedStage = <>{stage}</>;
    for (let i = 0; i < systems.length; i++) {
      const System = systems[i];
      systemsWrappedStage = <System>{systemsWrappedStage}</System>;
    }
    return systemsWrappedStage;
  }

  // flag game has rendered
  const [isRendered, setIsRendered] = useState(false);
  useEffect(() => {
    setIsRendered(true);
  }, []);

  // provide game context to forwardedRef
  const gameContext = useRef({
    ...props,
    debug: DEVELOPMENT_MODE,
  });
  useImperativeHandle(ref, () => gameContext.current);

  return (
    <GameContext.Provider value={gameContext.current}>
      {wrapWithSystems(CurrentStage as JSX.Element)}
    </GameContext.Provider>
  );
});

export function useGameContext() {
  return useContext(GameContext);
}

const FPS = 60;
const FRAME_MS = 1000 / FPS;

/**
 * This hook will run the callback given to it continously
 * via a requestAnimationFrame loop.
 *
 * @param callback Code to run in a continuous loop
 * @param deps State dependencies
 */
export function useLoop(callback: () => void, deps?: React.DependencyList) {
  const lastUpdate = useRef(Date.now());

  useEffect(() => {
    let frameId = 0;
    const frame = (time: number) => {
      const now = Date.now();
      const delta = now - lastUpdate.current;
      if (delta > FRAME_MS) {
        callback();
        lastUpdate.current = now;
      }
      frameId = requestAnimationFrame(frame);
    };

    frameId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(frameId);
  }, [deps]);
}
