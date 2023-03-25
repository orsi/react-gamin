import { useRef, useCallback, useEffect } from "react";

const initialInputState = {
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
export type InputState = typeof initialInputState;
export function useInputSystem() {
  const inputRef = useRef(initialInputState);

  const pollingInputFrame = useRef(0);
  const startPollingInput = () => {
    collectGamepadInput();
    pollingInputFrame.current = requestAnimationFrame(startPollingInput);
  };

  const stopPollingInput = useCallback(() => {
    cancelAnimationFrame(pollingInputFrame.current);
  }, []);

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === "ArrowUp") {
      inputRef.current.KEYBOARD_UP = true;
    }
    if (e.code === "ArrowDown") {
      inputRef.current.KEYBOARD_DOWN = true;
    }
    if (e.code === "ArrowLeft") {
      inputRef.current.KEYBOARD_LEFT = true;
    }
    if (e.code === "ArrowRight") {
      inputRef.current.KEYBOARD_RIGHT = true;
    }
    if (e.code === "Space") {
      inputRef.current.KEYBOARD_SPACE = true;
    }
  }, []);

  const onKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.code === "ArrowUp") {
      inputRef.current.KEYBOARD_UP = false;
    }
    if (e.code === "ArrowDown") {
      inputRef.current.KEYBOARD_DOWN = false;
    }
    if (e.code === "ArrowLeft") {
      inputRef.current.KEYBOARD_LEFT = false;
    }
    if (e.code === "ArrowRight") {
      inputRef.current.KEYBOARD_RIGHT = false;
    }
    if (e.code === "Space") {
      inputRef.current.KEYBOARD_SPACE = false;
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
  function collectGamepadInput() {
    // 8bitDo controller buttons
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
    const gamepads = navigator.getGamepads();
    if (!gamepads) {
      return;
    }
    const gamepad = gamepads[0];
    if (!gamepad) {
      return;
    }

    inputRef.current.GAMEPAD_BUTTON_12 = gamepad.buttons[12].pressed;
    inputRef.current.GAMEPAD_BUTTON_13 = gamepad.buttons[13].pressed;
    inputRef.current.GAMEPAD_BUTTON_14 = gamepad.buttons[14].pressed;
    inputRef.current.GAMEPAD_BUTTON_15 = gamepad.buttons[15].pressed;
  }

  const onWindowBlur = useCallback((_e: Event) => {
    // set all input to false when user leaves window focus
    for (const [key, value] of Object.entries(inputRef.current)) {
      inputRef.current[key as keyof InputState] = false;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("click", onMouseClick);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("touchcancel", onTouchCancel);
    window.addEventListener("gamepadconnected", onGamepadConnected);
    window.addEventListener("gamepaddisconnected", onGamepadDisonnected);
    window.addEventListener("blur", onWindowBlur);

    pollingInputFrame.current = requestAnimationFrame(startPollingInput);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("click", onMouseClick);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchCancel);
      window.removeEventListener("gamepadconnected", onGamepadConnected);
      window.removeEventListener("gamepaddisconnected", onGamepadDisonnected);
      window.removeEventListener("blur", onWindowBlur);
      stopPollingInput();
    };
  }, []);

  return inputRef;
}
