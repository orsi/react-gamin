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

import { useRef, PropsWithChildren, useEffect, useCallback } from "react";
import { createStore } from "./createStore";

const INPUT_FRAME_MS = 1000 / 60;
export type KEYBOARD = "up" | "down" | "left" | "right" | "space";
export type GAMEPAD = `button-${number}`;
export type MOUSE = "left-click" | "right-click" | "move";

interface IGameInputStore {
  KEYBOARD_UP: boolean;
  KEYBOARD_DOWN: boolean;
  KEYBOARD_LEFT: boolean;
  KEYBOARD_RIGHT: boolean;
  GAMEPAD_BUTTON_12: boolean;
  GAMEPAD_BUTTON_13: boolean;
  GAMEPAD_BUTTON_14: boolean;
  GAMEPAD_BUTTON_15: boolean;
}
const GameInputStore = createStore({
  KEYBOARD_UP: false,
  KEYBOARD_DOWN: false,
  KEYBOARD_LEFT: false,
  KEYBOARD_RIGHT: false,
  GAMEPAD_BUTTON_12: false,
  GAMEPAD_BUTTON_13: false,
  GAMEPAD_BUTTON_14: false,
  GAMEPAD_BUTTON_15: false,
});

export const useGameInput = GameInputStore.useStore;

interface GameInputProps {}
export function GameInput({ children }: PropsWithChildren<GameInputProps>) {
  return (
    <GameInputStore.Provider>
      <GameInputController>{children}</GameInputController>
    </GameInputStore.Provider>
  );
}

function GameInputController({ children }: PropsWithChildren) {
  const [inputStore, setInputStore] = GameInputStore.useStore();

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

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === "ArrowUp") {
        setInputStore({ KEYBOARD_UP: true });
      }
    },
    [inputStore, setInputStore]
  );

  const onKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === "ArrowUp") {
        setInputStore({ KEYBOARD_UP: false });
      }
    },
    [inputStore, setInputStore]
  );

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

  return <>{children}</>;
}
