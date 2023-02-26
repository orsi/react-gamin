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
interface GameInput {
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
const initialState: GameInput = {
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
  subscribe: (callback: (input: GameInput) => void) => () => void;
} | null>(null);

interface GameInputProps {}
export function GameInput({ children }: PropsWithChildren<GameInputProps>) {
  // setup store
  const input = useRef(initialState);
  const subscribers = useRef(new Set<(input: GameInput) => void>());
  const subscribe = useCallback((callback: (input: GameInput) => void) => {
    subscribers.current.add(callback);
    return () => {
      subscribers.current.delete(callback);
    };
  }, []);

  const set = (value: Partial<GameInput>) => {
    input.current = { ...input.current, ...value };
    subscribers.current.forEach((subscriber) => subscriber(input.current));
  };

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
    e.preventDefault();

    if (e.code === "ArrowUp" && !input.current.KEYBOARD_UP) {
      set({ KEYBOARD_UP: true });
    }
    if (e.code === "ArrowDown" && !input.current.KEYBOARD_DOWN) {
      set({ KEYBOARD_DOWN: true });
    }
    if (e.code === "ArrowLeft" && !input.current.KEYBOARD_LEFT) {
      set({ KEYBOARD_LEFT: true });
    }
    if (e.code === "ArrowRight" && !input.current.KEYBOARD_RIGHT) {
      set({ KEYBOARD_RIGHT: true });
    }
    if (e.code === "Space" && !input.current.KEYBOARD_SPACE) {
      set({ KEYBOARD_SPACE: true });
    }
  }, []);

  const onKeyUp = useCallback((e: KeyboardEvent) => {
    e.preventDefault();

    if (e.code === "ArrowUp" && input.current.KEYBOARD_UP) {
      set({ KEYBOARD_UP: false });
    }
    if (e.code === "ArrowDown" && input.current.KEYBOARD_DOWN) {
      set({ KEYBOARD_DOWN: false });
    }
    if (e.code === "ArrowLeft" && input.current.KEYBOARD_LEFT) {
      set({ KEYBOARD_LEFT: false });
    }
    if (e.code === "ArrowRight" && input.current.KEYBOARD_RIGHT) {
      set({ KEYBOARD_RIGHT: false });
    }
    if (e.code === "Space" && input.current.KEYBOARD_SPACE) {
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

    if (gamepad.buttons[12].pressed && !input.current.GAMEPAD_BUTTON_12) {
      set({ GAMEPAD_BUTTON_12: true });
    } else if (
      !gamepad.buttons[12].pressed &&
      input.current.GAMEPAD_BUTTON_12
    ) {
      set({ GAMEPAD_BUTTON_12: false });
    }
    if (gamepad.buttons[13].pressed && !input.current.GAMEPAD_BUTTON_13) {
      set({ GAMEPAD_BUTTON_13: true });
    } else if (
      !gamepad.buttons[13].pressed &&
      input.current.GAMEPAD_BUTTON_13
    ) {
      set({ GAMEPAD_BUTTON_13: false });
    }
    if (gamepad.buttons[14].pressed && !input.current.GAMEPAD_BUTTON_14) {
      set({ GAMEPAD_BUTTON_14: true });
    } else if (
      !gamepad.buttons[14].pressed &&
      input.current.GAMEPAD_BUTTON_14
    ) {
      set({ GAMEPAD_BUTTON_14: false });
    }
    if (gamepad.buttons[15].pressed && !input.current.GAMEPAD_BUTTON_15) {
      set({ GAMEPAD_BUTTON_15: true });
    } else if (
      !gamepad.buttons[15].pressed &&
      input.current.GAMEPAD_BUTTON_15
    ) {
      set({ GAMEPAD_BUTTON_15: false });
    }
  }

  const onWindowFocus = useCallback((e: Event) => {
    startPollingInput();
  }, []);

  const onWindowBlur = useCallback((e: Event) => {
    stopPollingInput();
    input.current = initialState;
  }, []);

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

    // window focus
    window.addEventListener("focus", onWindowFocus);
    window.addEventListener("blur", onWindowBlur);

    startPollingInput();
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("click", onMouseClick);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("gamepadconnected", onGamepadConnected);
      window.removeEventListener("gamepaddisconnected", onGamepadDisonnected);
      window.removeEventListener("focus", onWindowFocus);
      window.removeEventListener("blur", onWindowBlur);
      stopPollingInput();
    };
  }, []);

  return (
    <GameInputStoreContext.Provider
      value={{
        subscribe,
      }}
    >
      {children}
    </GameInputStoreContext.Provider>
  );
}

export function useGameInput(callback: (input: GameInput) => void) {
  const storeContext = useContext(GameInputStoreContext);
  if (!storeContext) {
    throw Error("No input context.");
  }

  useEffect(() => {
    const unsubcribe = storeContext.subscribe(callback);
    return () => {
      unsubcribe();
    };
  }, [callback]);
}
