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

import {
  useRef,
  PropsWithChildren,
  useEffect,
  useCallback,
  createContext,
  useContext,
  useSyncExternalStore,
} from "react";

const INPUT_FRAME_MS = 1000 / 60;
export type KEYBOARD = "up" | "down" | "left" | "right" | "space";
export type GAMEPAD = `button-${number}`;
export type MOUSE = "left-click" | "right-click" | "move";

interface IGameInputStore {
  KEYBOARD_UP: boolean;
  KEYBOARD_DOWN: boolean;
  KEYBOARD_LEFT: boolean;
  KEYBOARD_RIGHT: boolean;
  KEYBOARD_SPACE: boolean;
  KEYBOARD_ENTER: boolean;
  KEYBOARD_SHIFT_LEFT: boolean;
  GAMEPAD_BUTTON_12: boolean;
  GAMEPAD_BUTTON_13: boolean;
  GAMEPAD_BUTTON_14: boolean;
  GAMEPAD_BUTTON_15: boolean;
}

const initialState: IGameInputStore = {
  KEYBOARD_UP: false,
  KEYBOARD_DOWN: false,
  KEYBOARD_LEFT: false,
  KEYBOARD_RIGHT: false,
  KEYBOARD_SPACE: false,
  KEYBOARD_ENTER: false,
  KEYBOARD_SHIFT_LEFT: false,
  GAMEPAD_BUTTON_12: false,
  GAMEPAD_BUTTON_13: false,
  GAMEPAD_BUTTON_14: false,
  GAMEPAD_BUTTON_15: false,
};

function useGameInputStore() {
  const store = useRef(initialState);
  const subscribers = useRef(new Set<() => void>());

  const get = useCallback(() => store.current, []);
  const set = useCallback((value: Partial<IGameInputStore>) => {
    store.current = Object.assign({}, store.current, value);
    subscribers.current.forEach((callback) => callback());
  }, []);
  const subscribe = useCallback((callback: () => void) => {
    subscribers.current.add(callback);
    return () => {
      subscribers.current.delete(callback);
    };
  }, []);

  return {
    get,
    set,
    subscribe,
  };
}

const GameInputStoreContext = createContext<ReturnType<
  typeof useGameInputStore
> | null>(null);
interface GameInputProps {}
export function GameInput({ children }: PropsWithChildren<GameInputProps>) {
  const store = useGameInputStore();
  const gamepadRequestAnimationFrame = useRef(0);
  const lastUpdate = useRef(Date.now());

  function startPollingGamepadInputs() {
    const now = Date.now();
    const delta = now - lastUpdate.current;

    if (delta > INPUT_FRAME_MS) {
      handleGamepads();
      lastUpdate.current = now;
    }

    gamepadRequestAnimationFrame.current = requestAnimationFrame(
      startPollingGamepadInputs
    );
  }

  function stopPollingGamepadInputs() {
    if (gamepadRequestAnimationFrame.current) {
      cancelAnimationFrame(gamepadRequestAnimationFrame.current);
    }
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

    // if gamepad bindings, do action
  }

  function onGamepadConnected(event: GamepadEvent) {
    startPollingGamepadInputs();
  }

  function onGamepadDisonnected(event: GamepadEvent) {
    stopPollingGamepadInputs();
  }

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === "ArrowUp" && !store.get().KEYBOARD_UP) {
      store.set({ KEYBOARD_UP: true });
    }
    if (e.code === "ArrowDown" && !store.get().KEYBOARD_DOWN) {
      store.set({ KEYBOARD_DOWN: true });
    }
    if (e.code === "ArrowLeft" && !store.get().KEYBOARD_LEFT) {
      store.set({ KEYBOARD_LEFT: true });
    }
    if (e.code === "ArrowRight" && !store.get().KEYBOARD_RIGHT) {
      store.set({ KEYBOARD_RIGHT: true });
    }
    if (e.code === "Space" && !store.get().KEYBOARD_SPACE) {
      store.set({ KEYBOARD_SPACE: true });
    }
    if (e.code === "ShiftLeft" && !store.get().KEYBOARD_SHIFT_LEFT) {
      store.set({ KEYBOARD_SHIFT_LEFT: true });
    }
    if (e.code === "Enter" && !store.get().KEYBOARD_ENTER) {
      store.set({ KEYBOARD_ENTER: true });
    }
  }, []);

  const onKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.code === "ArrowUp" && store.get().KEYBOARD_UP) {
      store.set({ KEYBOARD_UP: false });
    }
    if (e.code === "ArrowDown" && store.get().KEYBOARD_DOWN) {
      store.set({ KEYBOARD_DOWN: false });
    }
    if (e.code === "ArrowLeft" && store.get().KEYBOARD_LEFT) {
      store.set({ KEYBOARD_LEFT: false });
    }
    if (e.code === "ArrowRight" && store.get().KEYBOARD_RIGHT) {
      store.set({ KEYBOARD_RIGHT: false });
    }
    if (e.code === "Space" && store.get().KEYBOARD_SPACE) {
      store.set({ KEYBOARD_SPACE: false });
    }
    if (e.code === "ShiftLeft" && store.get().KEYBOARD_SHIFT_LEFT) {
      store.set({ KEYBOARD_SHIFT_LEFT: false });
    }
    if (e.code === "Enter" && store.get().KEYBOARD_ENTER) {
      store.set({ KEYBOARD_ENTER: false });
    }
  }, []);

  function onMouseMove(e: MouseEvent) {
    // for each mousemovement, do action
  }

  function onMouseClick(e: MouseEvent) {
    // for each mousemovement, do action
  }

  useEffect(() => {
    // if any key bindings
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    // if any mouse bindings
    window.addEventListener("click", onMouseClick);
    window.addEventListener("mousemove", onMouseMove);

    // if any gamepad bindings
    window.addEventListener("gamepadconnected", onGamepadConnected);
    window.addEventListener("gamepaddisconnected", onGamepadDisonnected);
    const gamepads = navigator.getGamepads();
    if (gamepads) {
      gamepadRequestAnimationFrame.current = requestAnimationFrame(
        startPollingGamepadInputs
      );
    }

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("click", onMouseClick);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("gamepadconnected", onGamepadConnected);
      window.removeEventListener("gamepaddisconnected", onGamepadDisonnected);
      cancelAnimationFrame(gamepadRequestAnimationFrame.current);
    };
  }, []);

  return (
    <GameInputStoreContext.Provider value={store}>
      {children}
    </GameInputStoreContext.Provider>
  );
}

export function useGameInput() {
  const storeContext = useContext(GameInputStoreContext);
  if (!storeContext) {
    throw Error("No game input context.");
  }
  const state = useSyncExternalStore(storeContext.subscribe, storeContext.get);
  return state;
}
