import React, {
  createContext,
  CSSProperties,
  Dispatch,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Development } from "./components";

export type SetState<T> = Dispatch<React.SetStateAction<T>>;

const RAF_DELAY = 1000 / 30;

export type GameState<T = unknown> = {
  height: number;
  width: number;
} & T;

export type GameContext<T = unknown> = {
  addInput: Function;
  addSystem: Function;
  addScript: Function;
  state: GameState<T>;
};

export const GameContext = createContext<GameContext>(null);

export interface GameProps extends PropsWithChildren {
  development?: boolean;
  fps?: number;
  systems?: (({ children }: PropsWithChildren) => React.JSX.Element)[];
  style?: CSSProperties;
}

/**
 * The core <Game /> component used to cnetralize and sync all game
 * processes, updates, inputs, etc.
 */
export function Game({
  children,
  development = false,
  fps = RAF_DELAY,
  style,
  systems: _systems = [],
}: GameProps) {
  // sanity check!
  const gameContext = useContext(GameContext);
  if (gameContext != null) {
    throw Error("Why is there a game in a game?!?");
  }

  const inputs = useRef([]);
  const systems = useRef([]);
  const scripts = useRef([]);
  const lastUpdateRef = useRef(0);
  const frameDeltasRef = useRef([]);
  const requestAnimationFrameRef = useRef(0);
  const state = useRef<GameState>({
    height: null,
    width: null,
  });

  /**
   * Game update loop ran in requestAnimationFrame. This loop processes all
   * input, systems, and component scripts in their respective order.
   */
  useEffect(() => {
    const update = (time: number) => {
      const delta = time - lastUpdateRef.current;

      // saves only the last 50 frame deltas to determine
      // the average frames per second
      frameDeltasRef.current.push(delta);
      if (frameDeltasRef.current.length > 50) {
        frameDeltasRef.current.shift();
      }

      if (delta > fps) {
        for (const input of inputs.current) {
          input(time);
        }
        inputs.current = []; // don't want to re-execute inputs!

        for (const system of systems.current) {
          system(time, state);
        }

        for (const script of scripts.current) {
          script(time);
        }

        lastUpdateRef.current = time;
      }

      requestAnimationFrameRef.current = requestAnimationFrame(update);
    };

    requestAnimationFrameRef.current = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(requestAnimationFrameRef.current);
    };
  }, [state]);

  //
  // Game API for various hooks to register themselves
  //

  const addInput = (input: () => void) => {
    if (!inputs.current.some((i: () => void) => i === input)) {
      inputs.current.push(input);
    }
  };

  const addSystem = (system: Function) => {
    useEffect(() => {
      systems.current = [...systems.current, system];
      return () => {
        const index = systems.current.findIndex((i: Function) => i === system);
        systems.current.splice(index, 1);
        systems.current = [...systems.current];
      };
    }, [system]);
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
        ...state,
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
   * wrap the entire hierarchy of children. Idea is loosely inspired by
   * @pmndrs/its-fine.
   *
   * cf. https://github.com/pmndrs/its-fine/blob/main/src/index.tsx#L217
   */
  const SystemContextBridge = _systems.reduce(
    (Systems, System) =>
      ({ children }) =>
        (
          <System>
            <Systems>{children}</Systems>
          </System>
        ),
    ({ children }: PropsWithChildren) => <>{children}</>
  );

  return (
    <GameContext.Provider
      value={{
        addInput,
        addSystem: addSystem,
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

export type PropsWithComponents<C, P = unknown> = P & {
  components: C[];
};

export function createSystem<C, T = unknown, P = unknown>(
  systemFunction: ({
    components,
    ...props
  }: PropsWithComponents<C, P>) => (time: number) => void,
  systemHook?: (component: C, context: PropsWithComponents<C, P>) => T,
  displayName?: string
) {
  const Context = createContext<PropsWithComponents<C, P>>(null);
  Context.displayName = displayName ?? "SystemContext";

  const SystemProvider = ({
    children,
    ...props
  }: PropsWithChildren<Omit<P, "components">>) => {
    //                  ^ this doesn't seem right
    const components = useRef<C[]>([]);
    const { addSystem } = useGame();
    addSystem(
      systemFunction({ components: components.current, ...(props as P) })
    );
    return (
      <Context.Provider
        value={{ components: components.current, ...(props as P) }}
      >
        {children}
      </Context.Provider>
    );
  };

  const useSystemHook = (component: C) => {
    const context = useContext(Context);
    if (context == null) {
      console.warn(
        `${Context.displayName} is undefined. Did you pass it to <Game />?`
      );
    }

    // register component with system context
    useEffect(() => {
      context?.components?.push(component);
      return () => {
        const index = context?.components?.findIndex((i) => i === component);
        context?.components?.splice(index, 1);
      };
    }, [component, context]);

    // pass through original system hook
    return systemHook?.(component, context);
  };

  return [SystemProvider, useSystemHook] as const;
}
