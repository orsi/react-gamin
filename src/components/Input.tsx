import {
  useRef,
  useCallback,
  createContext,
  PropsWithChildren,
  useEffect,
  useContext,
  useSyncExternalStore,
} from "react";

interface IGameInput {
  UP: boolean;
  RIGHT: boolean;
  DOWN: boolean;
  LEFT: boolean;
}
function useGameInputStore() {
  const gameInput = useRef({
    UP: false,
    RIGHT: false,
    DOWN: false,
    LEFT: false,
  });

  const subscribers = useRef(new Set<() => void>());
  const subscribe = useCallback((callback: () => void) => {
    subscribers.current.add(callback);
    return () => {
      subscribers.current.delete(callback);
    };
  }, []);

  const get = useCallback(() => gameInput.current, []);

  const set = useCallback((value: Partial<IGameInput>) => {
    const nextState = { ...gameInput.current, ...value };
    let update = false;
    for (const [key, value] of Object.entries(nextState)) {
      if (!gameInput.current[key] === value) {
        update = true;
        gameInput.current = nextState;
        break;
      }
    }

    if (!update) {
      return;
    }

    subscribers.current.forEach((callback) => callback());
  }, []);

  return {
    subscribe,
    get,
    set,
  };
}
export const GameInputContext = createContext<null | ReturnType<
  typeof useGameInputStore
>>(null);

export function useGameInput(
  selector: (input: IGameInput) => IGameInput[keyof IGameInput]
): IGameInput[keyof IGameInput];
export function useGameInput(
  selector?: (input: IGameInput) => IGameInput[keyof IGameInput]
): IGameInput;
export function useGameInput(
  selector?: (input: IGameInput) => IGameInput[keyof IGameInput]
) {
  const gameInputStore = useContext(GameInputContext);
  if (!gameInputStore) {
    throw new Error("Game Input Store not available.");
  }

  const state = useSyncExternalStore(gameInputStore.subscribe, () =>
    selector !== undefined
      ? selector(gameInputStore.get())
      : gameInputStore.get()
  );
  return state;
}

export const GamepadButtons = {
  BUTTON_0: 0,
  BUTTON_1: 1,
  BUTTON_2: 2,
  BUTTON_3: 3,
  BUTTON_4: 4,
  BUTTON_5: 5,
  BUTTON_6: 6,
  BUTTON_7: 7,
  BUTTON_8: 8,
  BUTTON_9: 9,
  BUTTON_10: 10,
  BUTTON_11: 11,
  BUTTON_12: 12,
  BUTTON_13: 13,
  BUTTON_14: 14,
  BUTTON_15: 15,
  BUTTON_16: 16,
} as const;
export const KeyboardInputs = {
  UP: "ArrowUp",
  RIGHT: "ArrowRight",
  DOWN: "ArrowDown",
  LEFT: "ArrowLeft",
} as const;
export const Inputs = {
  keyboard: KeyboardInputs,
  gamepad: GamepadButtons,
} as const;
interface GameActionInputMap {
  [key: string]: any;
}

// 8bit controller buttons
// 0 - B
// 1 - A
// 2 - Y
// 3 - X
// 4 - L
// 5 - R
// 6 - L2
// 7 - R2
// 8 - Select
// 9 - Start
// 10 - L3
// 11 - R3
// 12 - Up
// 13 - Down
// 14 - Left
// 15 - Right
// 16 - Home/8bit

const INPUT_FRAME_MS = 1000 / 60;
export function createGameInput(inputMap?: GameActionInputMap) {
  function GameInputProvider({ children }: PropsWithChildren) {
    const gameInputStore = useGameInputStore();

    const inputFrames = useRef(0);
    const lastUpdate = useRef(Date.now());
    function handleInputs() {
      const now = Date.now();
      const delta = now - lastUpdate.current;

      if (delta > INPUT_FRAME_MS) {
        handleGamepads();
        lastUpdate.current = now;
      }

      inputFrames.current = requestAnimationFrame(handleInputs);
    }

    function handleGamepads() {
      const gamepads = navigator.getGamepads();
      if (!gamepads) {
        return;
      }
      const gamepad = gamepads[0];
      if (!gamepad) {
        return;
      }

      if (gamepad.buttons[12].pressed) {
        gameInputStore.set({ UP: true });
      } else {
        gameInputStore.set({ UP: false });
      }

      if (gamepad.buttons[15].pressed) {
        gameInputStore.set({ RIGHT: true });
      } else {
        gameInputStore.set({ RIGHT: false });
      }

      if (gamepad.buttons[13].pressed) {
        gameInputStore.set({ DOWN: true });
      } else {
        gameInputStore.set({ DOWN: false });
      }

      if (gamepad.buttons[14].pressed) {
        gameInputStore.set({ LEFT: true });
      } else {
        gameInputStore.set({ LEFT: false });
      }
    }

    function onGamepadConnected(event: GamepadEvent) {
      handleInputs();
    }

    function onGamepadDisonnected(event: GamepadEvent) {
      if (inputFrames.current) {
        cancelAnimationFrame(inputFrames.current);
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.code === "ArrowUp") {
        gameInputStore.set({ UP: true });
      }
      if (e.code === "ArrowRight") {
        gameInputStore.set({ RIGHT: true });
      }
      if (e.code === "ArrowDown") {
        gameInputStore.set({ DOWN: true });
      }
      if (e.code === "ArrowLeft") {
        gameInputStore.set({ LEFT: true });
      }
    }

    function onKeyUp(e: KeyboardEvent) {
      if (e.code === "ArrowUp") {
        gameInputStore.set({ UP: false });
      }
      if (e.code === "ArrowRight") {
        gameInputStore.set({ RIGHT: false });
      }
      if (e.code === "ArrowDown") {
        gameInputStore.set({ DOWN: false });
      }
      if (e.code === "ArrowLeft") {
        gameInputStore.set({ LEFT: false });
      }
    }

    useEffect(() => {
      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("keyup", onKeyUp);
      window.addEventListener("gamepadconnected", onGamepadConnected);
      window.addEventListener("gamepaddisconnected", onGamepadDisonnected);

      const gamepads = navigator.getGamepads();
      if (gamepads) {
        inputFrames.current = requestAnimationFrame(handleInputs);
      }

      return () => {
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("keyup", onKeyUp);
        window.removeEventListener("gamepadconnected", onGamepadConnected);
        window.removeEventListener("gamepaddisconnected", onGamepadDisonnected);
        cancelAnimationFrame(inputFrames.current);
      };
    }, []);

    return (
      <GameInputContext.Provider value={gameInputStore}>
        {children}
      </GameInputContext.Provider>
    );
  }

  useEffect(() => {}, []);

  return GameInputProvider;
}
