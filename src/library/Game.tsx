import {
  useState,
  useEffect,
  PropsWithChildren,
  createContext,
  Dispatch,
  SetStateAction,
  forwardRef,
  ReactNode,
  useRef,
  MutableRefObject,
} from "react";
import { EntityId } from "./Entity";
import { GameInput } from "./Input";
import Stage from "./Stage";

export type ReactState<S> = [S, Dispatch<SetStateAction<S>>];

export interface TGameStore {
  entities: Set<EntityId>;
}
export const GameContext = createContext<null | MutableRefObject<TGameStore>>(
  null
);
interface GameProps {
  stages: ReactNode[];
  systems: (({ children }: PropsWithChildren) => JSX.Element)[];
}
export default forwardRef<HTMLDivElement, GameProps>(function Game(
  { stages, systems },
  ref
) {
  const gameStore = useRef<TGameStore>({
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
