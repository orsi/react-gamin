import { createContext, useRef, useEffect, useContext } from "react";
import {
  GameContext,
  InputComponent,
  ScriptComponent,
  SystemComponent,
} from "./core";
import {
  GamepadButton,
  GamepadButtonMap,
  KeyboardKey,
  MiniMouseEvent,
  MouseButton,
} from "./types";

/**
 * Returns the current game context.
 * @returns GameContext
 */
export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw Error("No game context!");
  }
  return context;
}

/**
 * Runs the given function while key is pressed.
 * @param key
 * @param fn
 */
export const useKey = (key: KeyboardKey, fn: (time: number) => void) => {
  const game = useGame();
  const inputComponentRef = useRef<InputComponent>({
    canProcess: false,
    data: {
      key: key,
    },
    fn: fn,
    type: "key",
  });

  useEffect(() => {
    inputComponentRef.current.data = { key: key };
    inputComponentRef.current.fn = fn;
  }, [key, fn]);

  useEffect(() => {
    game.inputs.current = [...game.inputs.current, inputComponentRef.current];
    return () => {
      const index = game.inputs.current.findIndex(
        (i) => i === inputComponentRef.current
      );
      game.inputs.current.splice(index, 1);
      game.inputs.current = [...game.inputs.current];
    };
  }, []);
};

/**
 * Runs the given function while the gamepad button is pressed.
 * TODO:
 *  - add option for which gamepad
 *  - support for axes?
 *  - support for button.touched or button.value (trigger depressed)?
 * @param button
 * @param fn
 */
export const useGamepad = (
  button: GamepadButton,
  fn: (time: number) => void
) => {
  const game = useGame();
  const inputComponentRef = useRef<InputComponent>({
    type: "gamepad",
    fn: fn,
    canProcess: false,
    data: {
      pad: 0,
      button: Object.entries(GamepadButtonMap).find(
        ([, value]) => value === button
      )[0],
    },
  });

  useEffect(() => {
    inputComponentRef.current.fn = fn;
    inputComponentRef.current.data.button = Object.entries(
      GamepadButtonMap
    ).find(([, value]) => value === button)[0];
  }, [button, fn]);

  useEffect(() => {
    game.inputs.current = [...game.inputs.current, inputComponentRef.current];
    return () => {
      const index = game.inputs.current.findIndex(
        (i) => i === inputComponentRef.current
      );
      game.inputs.current.splice(index, 1);
      game.inputs.current = [...game.inputs.current];
    };
  }, [button, fn]);
};

/**
 * Runs the given function while the mouse button is down.
 * TODO:
 *  Need to really understand how to handle buttons vs move.
 * @param target
 * @param fn
 */
export const useMouse = (
  target: MouseButton | "move",
  fn: (ev: MiniMouseEvent) => void
) => {
  const game = useGame();
  const inputComponentRef = useRef<InputComponent>({
    type: "mouse",
    fn: fn,
    canProcess: false,
    data: {
      action: target,
      button: null,
      x: null,
      y: null,
    },
  });

  useEffect(() => {
    game.inputs.current = [...game.inputs.current, inputComponentRef.current];
    return () => {
      const index = game.inputs.current.findIndex(
        (i) => i === inputComponentRef.current
      );
      game.inputs.current.splice(index, 1);
      game.inputs.current = [...game.inputs.current];
    };
  }, []);
};

/**
 * Runs the given function within the game loop.
 * @param fn
 */
export function useScript(fn: ScriptComponent) {
  const game = useGame();
  useEffect(() => {
    game.scripts.current = [...game.scripts.current, fn];
    return () => {
      const index = game.scripts.current.findIndex((i) => i === fn);
      game.scripts.current.splice(index, 1);
      game.scripts.current = [...game.scripts.current];
    };
  }, [fn]);
}

export type SystemFunction<C = unknown, T = unknown> = (
  system: SystemContext<C>
) => SystemComponent<T>;

export type SystemContext<C = unknown> = {
  components: C[];
};

export type System<C = unknown> = {
  Context: React.Context<SystemContext<C>>;
  Function: SystemFunction<C>;
};

/**
 * Creates a system for the game that will run in the game loop.
 * @param fn
 * @param displayName
 * @returns
 */
export function createSystem<C = unknown, T = unknown>(
  fn?: SystemFunction<C, T>,
  displayName?: string
) {
  const Context = createContext<SystemContext<C>>(null);
  Context.displayName = displayName ?? "SystemContext";
  return { Context, Function: fn } as System<C>;
}

/**
 * Creates a hook for the provided system that components
 * can use to register their state to.
 * @param system 
 * @param systemHook 
 * @returns 
 */
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
      systemContext.components = [...systemContext.components, component];
      return () => {
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
