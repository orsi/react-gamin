import React, {
  createContext,
  CSSProperties,
  Dispatch,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
} from "react";
import { Development } from "./components";
import { System, SystemContext, useGame } from "./hooks";

const DEFAULT_FPS = 30;
const DEFAULT_FRAME_RATE = 1000 / DEFAULT_FPS;

export type SetState<T> = Dispatch<React.SetStateAction<T>>;

export type GameState<T = unknown> = {
  height: number;
  width: number;
} & T;

export type GameContext<T = unknown> = {
  inputs: React.MutableRefObject<InputComponent[]>;
  scripts: React.MutableRefObject<ScriptComponent[]>;
  state: GameState<T>;
};

export const GameContext = createContext<GameContext>(null);

export interface GameProps<T = unknown> extends PropsWithChildren {
  development?: boolean;
  frameRate?: number;
  initialState?: T;
  systems?: System[];
  style?: CSSProperties;
}

/**
 * The core <Game /> component used to cnetralize and sync all game
 * processes, updates, inputs, etc.
 */
export function Game<T = unknown>({
  children,
  development = false,
  frameRate = DEFAULT_FRAME_RATE,
  initialState,
  style,
  systems: _systems = [],
}: GameProps<T>) {
  // sanity check!
  const gameContext = useContext(GameContext);
  if (gameContext != null) {
    throw Error("Why is there a game in a game?!?");
  }

  const inputs = useInputManager();
  const systems = useSystemManager<T>();
  const scripts = useScriptManager();

  const lastUpdateRef = useRef(0);
  const accumulatorRef = useRef(0);
  const frameDeltasRef = useRef([]);
  const requestAnimationFrameRef = useRef(0);
  const state = useRef<GameState<T>>({
    height: null,
    width: null,
    components: [],
    ...initialState,
  });

  /**
   * Game update loop ran in requestAnimationFrame. This loop processes all
   * input, systems, and component scripts in their respective order.
   */
  useEffect(() => {
    const update = (time: number) => {
      const delta = time - lastUpdateRef.current;
      accumulatorRef.current += delta;

      // saves only the last 50 frame deltas to determine
      // the average frames per second
      frameDeltasRef.current.push(delta);
      if (frameDeltasRef.current.length > 50) {
        frameDeltasRef.current.shift();
      }

      // special input polling for gamepads
      const gamepads = navigator?.getGamepads();

      // fixed-time loop
      // TODO:
      //  Something is wrong here, as the speed of the ball and paddles
      //  in Pong are still dependent on the throttled RAF time
      while (accumulatorRef.current > frameRate) {
        for (const input of inputs.current) {
          if (input.type !== "gamepad" && input.canProcess) {
            input.fn(frameRate);
          } else if (input.type === "gamepad") {
            // special case for gamepad as we need to poll
            // every loop for what buttons are pushed
            const gamepad = gamepads?.[input.data.pad];
            if (gamepad && gamepad.buttons[input.data.button].pressed) {
              input.fn(frameRate);
            }
          }
        }

        for (const system of systems.current) {
          system(frameRate, state.current);
        }

        for (const script of scripts.current) {
          script(frameRate);
        }

        accumulatorRef.current -= frameRate;
      }

      lastUpdateRef.current = time;
      requestAnimationFrameRef.current = requestAnimationFrame(update);
    };

    requestAnimationFrameRef.current = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(requestAnimationFrameRef.current);
    };
  }, []);

  const containerRef = useRef<HTMLDivElement>();
  useEffect(() => {
    const setDimensions = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      state.current = {
        ...state.current,
        height: rect?.height,
        width: rect?.width,
      };
    };
    window.addEventListener("resize", setDimensions);
    setDimensions();
    return () => {
      window.removeEventListener("resize", setDimensions);
    };
  }, []);

  /**
   * System Context bridge to ensure all systems provided to <Game />
   * wrap the entire hierarchy of children. If the system has a function,
   * we add it to the game loop, making sure it always is passed its own
   * context.
   *
   * Idea is loosely inspired by @pmndrs/its-fine.
   * cf. https://github.com/pmndrs/its-fine/blob/main/src/index.tsx#L217
   */
  const SystemContextBridge = _systems.reduce(
    (Systems, System) =>
      ({ children }) => {
        const contextRef = useRef<SystemContext<unknown>>({
          components: [],
        });

        const fn =
          System.Function != null
            ? System.Function(contextRef.current)
            : () => {};

        useEffect(() => {
          systems.current = [...systems.current, fn];
          return () => {
            const index = systems.current.findIndex((i) => i === fn);
            systems.current.splice(index, 1);
            systems.current = [...systems.current];
          };
        }, [fn]);

        return (
          <Systems>
            <System.Context.Provider value={contextRef.current}>
              {children}
            </System.Context.Provider>
          </Systems>
        );
      },
    ({ children }: PropsWithChildren) => <>{children}</>
  );

  return (
    <GameContext.Provider
      value={{
        scripts,
        inputs,
        state: state.current,
      }}
    >
      <div
        ref={containerRef}
        style={{
          position: "relative",
          ...style,
        }}
      >
        <SystemContextBridge>
          {development && <Development frameDeltasRef={frameDeltasRef} />}
          {children}
        </SystemContextBridge>
      </div>
    </GameContext.Provider>
  );
}

export interface InputComponent {
  type: "key" | "mouse" | "gamepad";
  fn: (...args: any[]) => void;
  canProcess: boolean;
  data?: any;
}

function useInputManager() {
  const inputs = useRef<InputComponent[]>([]);

  const onKeydown = ({ key }: KeyboardEvent) => {
    for (const input of inputs.current) {
      if (key === input.data.key) {
        input.canProcess = true;
      }
    }
  };

  const onKeyup = ({ key }: KeyboardEvent) => {
    for (const input of inputs.current) {
      if (key === input.data.key) {
        input.canProcess = false;
      }
    }
  };

  // TODO:
  // Should mousedown and mouseup events be handled fundamentally different
  // from mousemove events? Do we even need to handle mousemove events? Probably...
  const onMousedown = ({ button, clientX, clientY }: MouseEvent) => {
    // mouseEventRef.current = {
    //   button: MouseButtonMap[button as MouseButtonMapKey],
    //   x: clientX,
    //   y: clientY,
    // };
    // if (mouseEventRef.current?.button === target) {
    //   listener(mouseEventRef.current);
    // }
  };

  const onMouseup = ({ button, clientX, clientY }: MouseEvent) => {
    // mouseEventRef.current = {
    //   button: null,
    //   x: clientX,
    //   y: clientY,
    // };
  };

  const onMousemove = ({ button, clientX, clientY }: MouseEvent) => {
    // mouseEventRef.current = {
    //   ...mouseEventRef.current,
    //   x: clientX,
    //   y: clientY,
    // };
    // if (target === "move") {
    //   listener(mouseEventRef.current);
    // }
  };

  // setup global input handlers
  useEffect(() => {
    window.addEventListener("keydown", onKeydown);
    window.addEventListener("keyup", onKeyup);
    window.addEventListener("mousedown", onMousedown);
    window.addEventListener("mouseup", onMouseup);
    window.addEventListener("mousemove", onMousemove);
    return () => {
      window.removeEventListener("keydown", onKeydown);
      window.removeEventListener("keyup", onKeyup);
      window.removeEventListener("mousedown", onMousedown);
      window.removeEventListener("mouseup", onMouseup);
      window.removeEventListener("mousemove", onMousemove);
    };
  }, []);

  return inputs;
}

export type SystemComponent<T> = (time: number, state: GameState<T>) => void;

function useSystemManager<T>() {
  const systems = useRef<SystemComponent<T>[]>([]);
  return systems;
}

export type ScriptComponent = (time: number) => void;

function useScriptManager() {
  const scripts = useRef<ScriptComponent[]>([]);
  return scripts;
}
