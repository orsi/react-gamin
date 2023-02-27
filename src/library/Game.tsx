import {
  useState,
  useEffect,
  PropsWithChildren,
  createContext,
  Dispatch,
  SetStateAction,
  forwardRef,
  useRef,
  MutableRefObject,
  useImperativeHandle,
  Children,
} from "react";
import { EntityRef, IEntity } from "./Entity";
import { GameInput } from "./Input";
import { MissingStage } from "./Stage";

export type ReactState<S> = [S, Dispatch<SetStateAction<S>>];

export interface GameState {
  width: number;
  height: number;
  entities: Set<EntityRef<any>>;
  currentStage?: string;
  onStageChange?: (from: any, to: any) => void;
  systems: (({ children }: { children?: React.ReactNode }) => JSX.Element)[];
  children?: React.ReactNode;
}

export const GameContext = createContext<null | GameState>(null);

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

interface GameProps extends PropsWithChildren {
  currentStage?: string;
  systems: (({ children }: PropsWithChildren) => JSX.Element)[];
}
export default forwardRef<GameState, GameProps>((props, ref) => {
  const { children, currentStage, systems } = props;
  const [width, setWidth] = useState<number>();
  const [height, setHeight] = useState<number>();

  // function onWindowResize() {
  //   const bounds = document.body.getBoundingClientRect();
  //   setHeight(bounds.height);
  //   setWidth(bounds.width);
  // }

  // useEffect(() => {
  //   window.addEventListener("resize", onWindowResize);
  //   onWindowResize();

  //   return () => {
  //     window.removeEventListener("resize", onWindowResize);
  //   };
  // }, []);

  const gameContext = {
    ...props,
    width,
    height,
    entities: new Set<EntityRef<any>>(),
  };

  useImperativeHandle(ref, () => gameContext);


  const [isRendered, setIsRendered] = useState(false);
  useEffect(() => {
    setIsRendered(true);
  }, []);
  const CurrentStage = Children.toArray(children).find((child) => {
    return child.props?.name === currentStage;
  }) ?? <MissingStage name={currentStage} />;

  // nest systems within each other so entire tree is contained
  // in the systems
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

  return (
    // <div
    //   style={{
    //     position: "relative",
    //     height: height ?? `100vh`,
    //     width: width ?? `100vw`,
    //   }}
    // >
    <GameContext.Provider value={gameContext}>
      <GameInput>
        <Systems>{CurrentStage}</Systems>
      </GameInput>
    </GameContext.Provider>
    // </div>
  );
});
