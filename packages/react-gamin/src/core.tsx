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

export type SetState<T> = Dispatch<React.SetStateAction<T>>;

const DEFAULT_FPS = 30;
const DEFAULT_FRAME_RATE = 1000 / DEFAULT_FPS;

export type GameState<T = unknown> = {
  height: number;
  width: number;
  components: unknown[];
} & T;

export type GameContext<T = unknown> = {
  addInput: Function;
  addScript: Function;
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

  const inputs = useRef([]);
  const systems = useRef([]);
  const scripts = useRef([]);
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

      // fixed-time loop
      while (accumulatorRef.current > frameRate) {
        for (const input of inputs.current) {
          input(frameRate);
        }
        inputs.current = []; // don't want to re-execute inputs!

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

  // Game APIs for various hooks to register themselves
  const addInput = (input: () => void) => {
    if (!inputs.current.some((i: () => void) => i === input)) {
      inputs.current.push(input);
    }
  };

  const addScript = (script: () => void) => {
    useEffect(() => {
      scripts.current = [...scripts.current, script];
      return () => {
        const index = scripts.current.findIndex((i: any) => i === script);
        scripts.current.splice(index, 1);
      };
    }, [script]);
  };

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
            const index = systems.current.findIndex(
              (f: ReturnType<SystemFunction>) => f === fn
            );
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
        addInput,
        addScript,
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

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw Error("No game context!");
  }
  return context;
}

export function useScript(script: (time?: number) => void) {
  const { addScript } = useGame();
  addScript(script);
}

export type SystemFunction<C = unknown, T = unknown> = (
  system: SystemContext<C>
) => (time: number, game: GameContext<T>["state"]) => void;

export type SystemContext<C = unknown> = {
  components: C[];
};

export type System<C = unknown> = {
  Context: React.Context<SystemContext<C>>;
  Function: SystemFunction<C>;
};

export function createSystem<C = unknown, T = unknown>(
  fn?: SystemFunction<C, T>,
  displayName?: string
) {
  const Context = createContext<SystemContext<C>>(null);
  Context.displayName = displayName ?? "SystemContext";
  return { Context, Function: fn } as System<C>;
}

export function createSystemHook<C, T = unknown>(
  system: System<C>,
  systemHook?: (component: C, systemContext: SystemContext<C>) => T
) {
  return (component: C) => {
    const { state } = useGame();
    const systemContext = useContext<SystemContext<C>>(system.Context);
    if (systemContext == null) {
      console.warn(
        `${system.Context.displayName} is undefined. Did you pass it to <Game />?`
      );
    }

    // register component with system and game contexts
    useEffect(() => {
      state.components = [...state.components, component];
      systemContext.components = [...systemContext.components, component];
      return () => {
        const gameComponentIndex = state.components.findIndex(
          (i) => i === component
        );
        state.components.splice(gameComponentIndex, 1);
        state.components = [...state.components];

        const systemComponentIndex = systemContext.components.findIndex(
          (i) => i === component
        );
        systemContext.components.splice(systemComponentIndex, 1);
        systemContext.components = [...systemContext.components];
      };
    }, [component, state, systemContext]);

    // pass through original system hook
    return systemHook ? systemHook(component, systemContext) : undefined;
  };
}
