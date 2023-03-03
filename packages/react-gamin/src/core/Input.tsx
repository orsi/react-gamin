import {
  useRef,
  useCallback,
  useEffect,
  forwardRef,
  PropsWithChildren,
  useImperativeHandle,
  MutableRefObject,
} from "react";

const INPUT_TICK_MS = 1000 / 60;
export interface GameInputState {
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
export const Input = forwardRef<GameInputState, PropsWithChildren>(
  function InputSystem({ children }, ref) {
    const inputRef = useRef({
      KEYBOARD_UP: false,
      KEYBOARD_DOWN: false,
      KEYBOARD_LEFT: false,
      KEYBOARD_RIGHT: false,
      KEYBOARD_SPACE: false,
      GAMEPAD_BUTTON_12: false,
      GAMEPAD_BUTTON_13: false,
      GAMEPAD_BUTTON_14: false,
      GAMEPAD_BUTTON_15: false,
    });

    const pollingInputFrame = useRef(0);
    const lastUpdate = useRef(0);
    const startPollingInput = useCallback((time: number) => {
      const delta = time - lastUpdate.current;

      if (delta > INPUT_TICK_MS) {
        handleGamepads();
        lastUpdate.current = time;
      }

      pollingInputFrame.current = requestAnimationFrame(startPollingInput);
    }, []);

    const stopPollingInput = useCallback(() => {
      handleGamepads();
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
    function handleGamepads() {
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

    const onWindowFocus = useCallback((e: Event) => {
      startPollingInput(0);
    }, []);

    const onWindowBlur = useCallback((e: Event) => {
      stopPollingInput();
      // set all input to false
      for (const [key, value] of Object.entries(inputRef.current));
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

      startPollingInput(0);

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

    useImperativeHandle(ref, () => inputRef.current, [inputRef.current]);

    return <>{children}</>;
  }
);
