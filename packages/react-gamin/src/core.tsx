import {
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

export type System<T> = {
  system: (time: number, components: T[], state: GameContext["state"]) => void;
  components: T[];
};

const RAF_DELAY = 1000 / 30;

export type GameState<T = {}> = {
  height: number;
  width: number;
} & T;
export type GameContext<T = {}> = {
  addInput: Function;
  addComponent: Function;
  addScript: Function;
  state: GameState<T>;
};
export const GameContext = createContext<GameContext>(null);
export interface GameProps extends PropsWithChildren {
  development?: boolean;
  fps?: number;
  systems?: System<any>[];
  style?: CSSProperties;
}
export function Game<T>({
  children,
  development = false,
  fps = RAF_DELAY,
  style,
  systems = [],
}: GameProps) {
  // sanity check!
  const gameContext = useContext(GameContext);
  if (gameContext != null) {
    throw Error("Why is there a game in a game?!?");
  }

  const inputs = useRef([]);
  const scripts = useRef([]);
  const [state, setState] = useState<GameState>({
    height: null,
    width: null,
  });
  const lastUpdateRef = useRef(0);
  const frameDeltasRef = useRef<number[]>([]);
  const requestAnimationFrameRef = useRef(0);

  // game loop
  useEffect(() => {
    const update = (time: number) => {
      const delta = time - lastUpdateRef.current;

      frameDeltasRef.current.push(delta);
      if (frameDeltasRef.current.length > 50) {
        frameDeltasRef.current.shift();
      }

      if (delta > fps) {
        // update order
        // input => systems => scripts

        // execute and clear inputs
        for (const input of inputs.current) {
          input(time);
        }
        inputs.current = [];

        // run systems
        for (const system of systems) {
          system.system(time, system.components, state);
        }

        // component scripts
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
  }, [systems]);

  const addInput = (input: () => void) => {
    if (!inputs.current.some((i: () => void) => i === input)) {
      inputs.current.push(input);
    }
  };

  const addComponent = <T,>(system: System<T>, component: T) => {
    useEffect(() => {
      const systemRef = systems.find((i) => i === system);
      systemRef.components.push(component);
      return () => {
        const index = systemRef.components.findIndex(
          (i: any) => i === component
        );
        systemRef.components.splice(index, 1);
      };
    }, [system, component]);
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
      setState({
        ...state,
        height: rect?.height,
        width: rect?.width,
      });
    };
    window.addEventListener("resize", setDimensions);
    setDimensions();
    return () => {
      window.removeEventListener("resize", setDimensions);
    };
  }, []);

  return (
    <GameContext.Provider
      value={{
        addInput,
        addComponent,
        addScript,
        state,
      }}
    >
      <div
        ref={containerRef}
        style={{
          position: "relative",
          ...style,
        }}
      >
        {development && <Development frameDeltasRef={frameDeltasRef} />}
        {children}
      </div>
    </GameContext.Provider>
  );
}

export function createSystem<T>(
  system: (time: number, components: T[], state: GameContext["state"]) => void
): System<T> {
  return {
    system,
    components: [],
  };
}
export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw Error("No game context!");
  }
  return context;
}

export function useGameState() {
  const game = useGame();
  return game.state;
}

export function useSystem<T>(system: System<T>, component: T) {
  const { addComponent } = useGame();
  addComponent(system, component);
}

export function useScript(script: (time?: number) => void) {
  const { addScript } = useGame();
  addScript(script);
}
