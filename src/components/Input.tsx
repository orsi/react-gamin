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

const INPUT_TICK_MS = 1000 / 60;
interface IGameInputStore {
  KEYBOARD_UP: boolean;
  KEYBOARD_DOWN: boolean;
  KEYBOARD_LEFT: boolean;
  KEYBOARD_RIGHT: boolean;
  KEYBOARD_SPACE: boolean;
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
  GAMEPAD_BUTTON_12: false,
  GAMEPAD_BUTTON_13: false,
  GAMEPAD_BUTTON_14: false,
  GAMEPAD_BUTTON_15: false,
};

const GameInputStoreContext = createContext<{
  get: () => IGameInputStore;
  subscribe: (callback: () => void) => () => void;
} | null>(null);

export function useGameInput<T>(selector: (store: IGameInputStore) => T): T;
export function useGameInput<T>(): IGameInputStore;
export function useGameInput<T>(selector?: (store: IGameInputStore) => T) {
  const storeContext = useContext(GameInputStoreContext);
  if (!storeContext) {
    throw Error("No input context.");
  }
  const state = useSyncExternalStore(storeContext.subscribe, () =>
    selector ? selector(storeContext.get()) : storeContext.get()
  );
  return state;
}

interface GameInputProps {}
export function GameInput({ children }: PropsWithChildren<GameInputProps>) {
  // setup store
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

  const pollingInputFrame = useRef(0);
  const lastUpdate = useRef(Date.now());

  const startPollingInput = useCallback(() => {
    const now = Date.now();
    const delta = now - lastUpdate.current;

    if (delta > INPUT_TICK_MS) {
      handleGamepads();
      lastUpdate.current = now;
    }

    pollingInputFrame.current = requestAnimationFrame(startPollingInput);
  }, []);

  const stopPollingInput = useCallback(() => {
    handleGamepads();
    cancelAnimationFrame(pollingInputFrame.current);
  }, []);

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === "ArrowUp" && !get().KEYBOARD_UP) {
      set({ KEYBOARD_UP: true });
    }
    if (e.code === "ArrowDown" && !get().KEYBOARD_DOWN) {
      set({ KEYBOARD_DOWN: true });
    }
    if (e.code === "ArrowLeft" && !get().KEYBOARD_LEFT) {
      set({ KEYBOARD_LEFT: true });
    }
    if (e.code === "ArrowRight" && !get().KEYBOARD_RIGHT) {
      set({ KEYBOARD_RIGHT: true });
    }
    if (e.code === "Space" && !get().KEYBOARD_SPACE) {
      set({ KEYBOARD_SPACE: true });
    }
  }, []);

  const onKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.code === "ArrowUp" && get().KEYBOARD_UP) {
      set({ KEYBOARD_UP: false });
    }
    if (e.code === "ArrowDown" && get().KEYBOARD_DOWN) {
      set({ KEYBOARD_DOWN: false });
    }
    if (e.code === "ArrowLeft" && get().KEYBOARD_LEFT) {
      set({ KEYBOARD_LEFT: false });
    }
    if (e.code === "ArrowRight" && get().KEYBOARD_RIGHT) {
      set({ KEYBOARD_RIGHT: false });
    }
    if (e.code === "Space" && get().KEYBOARD_SPACE) {
      set({ KEYBOARD_SPACE: false });
    }
  }, []);

  function onMouseMove(e: MouseEvent) {}
  function onMouseClick(e: MouseEvent) {}
  function onTouchStart(e: TouchEvent) {}
  function onTouchMove(e: TouchEvent) {}
  function onTouchEnd(e: TouchEvent) {}
  function onTouchCancel(e: TouchEvent) {}
  function onGamepadConnected(e: GamepadEvent) {}
  function onGamepadDisonnected(e: GamepadEvent) {}
  function handleGamepads() {
    const gamepads = navigator.getGamepads();
    if (!gamepads) {
      return;
    }
    const gamepad = gamepads[0];
    if (!gamepad) {
      return;
    }

    if (gamepad.buttons[12].pressed && !get().GAMEPAD_BUTTON_12) {
      set({ GAMEPAD_BUTTON_12: true });
    } else if (!gamepad.buttons[12].pressed && get().GAMEPAD_BUTTON_12) {
      set({ GAMEPAD_BUTTON_12: false });
    }
    if (gamepad.buttons[13].pressed && !get().GAMEPAD_BUTTON_13) {
      set({ GAMEPAD_BUTTON_13: true });
    } else if (!gamepad.buttons[13].pressed && get().GAMEPAD_BUTTON_13) {
      set({ GAMEPAD_BUTTON_13: false });
    }
    if (gamepad.buttons[14].pressed && !get().GAMEPAD_BUTTON_14) {
      set({ GAMEPAD_BUTTON_14: true });
    } else if (!gamepad.buttons[14].pressed && get().GAMEPAD_BUTTON_14) {
      set({ GAMEPAD_BUTTON_14: false });
    }
    if (gamepad.buttons[15].pressed && !get().GAMEPAD_BUTTON_15) {
      set({ GAMEPAD_BUTTON_15: true });
    } else if (!gamepad.buttons[15].pressed && get().GAMEPAD_BUTTON_15) {
      set({ GAMEPAD_BUTTON_15: false });
    }
  }

  useEffect(() => {
    // keyboard
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    // mouse
    window.addEventListener("click", onMouseClick);
    window.addEventListener("mousemove", onMouseMove);

    // touch
    window.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("touchcancel", onTouchCancel);

    // gamepad
    window.addEventListener("gamepadconnected", onGamepadConnected);
    window.addEventListener("gamepaddisconnected", onGamepadDisonnected);

    startPollingInput();
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("click", onMouseClick);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("gamepadconnected", onGamepadConnected);
      window.removeEventListener("gamepaddisconnected", onGamepadDisonnected);
      stopPollingInput();
    };
  }, []);

  return (
    <GameInputStoreContext.Provider
      value={{
        get,
        subscribe,
      }}
    >
      {children}
    </GameInputStoreContext.Provider>
  );
}
