// Input System
import { useRef, useCallback, useEffect } from "react";
import { createSystem } from "../core/System";

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
export const { Provider: InputSystemProvider, useSystem: useInputSystem } =
  createSystem(function InputSystem(
    _entity,
    _context,
    callback: (input: GameInput) => void
  ) {
    const input = useRef({
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
      // set all input to false
      for (const [key, value] of Object.entries(input.current));
    }, []);

    useEffect(() => {
      // subscribe entity callback
      const unsubscribe = subscribe(callback);

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
        unsubscribe();
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
  });

// Movement System
import { Dispatch, SetStateAction } from "react";
import { Body, Position } from "../core/Components";

const SPEED = 2;
type TDirection = "up" | "down" | "left" | "right";
export const {
  Provider: MovementSystemProvider,
  useSystem: useMovementSystem,
} = createSystem(function MovementSystemLogic(
  entityRef,
  context,
  position: Position,
  setPosition: Dispatch<SetStateAction<Position>>,
  body: Body
) {
  return function move(direction: TDirection) {
    let nextPosition = {
      x: 0,
      y: 0,
      z: 0,
      ...position,
    };
    if (direction === "up") nextPosition.y = nextPosition.y - 1 * SPEED;
    if (direction === "right") nextPosition.x = nextPosition.x + 1 * SPEED;
    if (direction === "down") nextPosition.y = nextPosition.y + 1 * SPEED;
    if (direction === "left") nextPosition.x = nextPosition.x - 1 * SPEED;

    const eXMin = nextPosition.x;
    const eXMax = nextPosition.x + body.width!;
    const eYMin = nextPosition.y;
    const eYMax = nextPosition.y + body.height!;

    const foundEntity = context.getEntityRefs().find((otherEntity) => {
      const otherEntityPosition =
        otherEntity.current.components.get("position");
      const otherEntityBody = otherEntity.current.components.get("body");
      if (
        otherEntity === entityRef ||
        !otherEntityPosition ||
        !otherEntityBody
      ) {
        return false;
      }

      const [ePosition] = otherEntityPosition;
      const [eBody] = otherEntityBody;

      // if intersected entity is not solid, no need to calculate
      if (!eBody.solid) {
        return false;
      }

      const e2XMin = ePosition.x;
      const e2XMax = ePosition.x + eBody.width!;
      const e2YMin = ePosition.y;
      const e2YMax = ePosition.y + eBody.height!;
      const inRange =
        eXMax >= e2XMin &&
        eXMin <= e2XMax &&
        eYMax >= e2YMin &&
        eYMin <= e2YMax;
      return inRange;
    });

    // in the way
    if (foundEntity) {
      return;
    }

    setPosition(nextPosition);
  };
});
