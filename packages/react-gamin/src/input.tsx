import { useRef, useEffect, useContext, useCallback } from "react";
import { GameContext } from "./core";

export const FPS_60_MS = 1000 / 60;

export const KEYBOARD_KEY_CODES = {
  Alt: "AltLeft",
  ArrowDown: "ArrowDown",
  ArrowLeft: "ArrowLeft",
  ArrowRight: "ArrowRight",
  ArrowUp: "ArrowUp",
  Backspace: "Backspace",
  CapsLock: "CapsLock",
  Clear: "NumLock",
  Control: "ControlLeft",
  Delete: "Delete",
  End: "End",
  Enter: "NumpadEnter",
  Escape: "Escape",
  F1: "F1",
  F2: "F2",
  F3: "F3",
  F4: "F4",
  F5: "F5",
  F6: "F6",
  F7: "F7",
  F8: "F8",
  F9: "F9",
  F10: "F10",
  F12: "F12",
  F13: "F13",
  F14: "F14",
  F15: "F15",
  F16: "F16",
  F17: "F17",
  F18: "F18",
  F19: "F19",
  Home: "Home",
  Meta: "OSLeft",
  PageDown: "PageDown",
  PageUp: "PageUp",
  Shift: "ShiftRight",
  Tab: "Tab",
  " ": "Space",
  "0": "Digit0",
  "1": "Digit1",
  "2": "Digit2",
  "3": "Digit3",
  "4": "Digit4",
  "5": "Digit5",
  "6": "Digit6",
  "7": "Digit7",
  "8": "Digit8",
  "9": "Digit9",
  A: "KeyA",
  B: "KeyB",
  C: "KeyC",
  D: "KeyD",
  E: "KeyE",
  F: "KeyF",
  G: "KeyG",
  H: "KeyH",
  I: "KeyI",
  J: "KeyJ",
  K: "KeyK",
  L: "KeyL",
  M: "KeyM",
  N: "KeyN",
  O: "KeyO",
  P: "KeyP",
  Q: "KeyQ",
  R: "KeyR",
  S: "KeyS",
  T: "KeyT",
  U: "KeyU",
  V: "KeyV",
  W: "KeyW",
  X: "KeyX",
  Y: "KeyY",
  Z: "KeyZ",
  a: "KeyA",
  b: "KeyB",
  c: "KeyC",
  d: "KeyD",
  e: "KeyE",
  f: "KeyF",
  g: "KeyG",
  h: "KeyH",
  i: "KeyI",
  j: "KeyJ",
  k: "KeyK",
  l: "KeyL",
  m: "KeyM",
  n: "KeyN",
  o: "KeyO",
  p: "KeyP",
  q: "KeyQ",
  r: "KeyR",
  s: "KeyS",
  t: "KeyT",
  u: "KeyU",
  v: "KeyV",
  w: "KeyW",
  x: "KeyX",
  y: "KeyY",
  z: "KeyZ",
  "~": "Backquote",
  "!": "Digit1",
  "@": "Digit2",
  "#": "Digit3",
  $: "Digit4",
  "%": "Digit5",
  "^": "Digit6",
  "&": "Digit7",
  "(": "Digit9",
  ")": "Digit0",
  _: "Minus",
  "|": "Backslash",
  "}": "BracketRight",
  "{": "BracketLeft",
  ":": "Semicolon",
  "?": "Slash",
  ">": "Period",
  "<": "Comma",
  "`": "Backquote",
  "[": "BracketLeft",
  "]": "BracketRight",
  "\\": "Backslash",
  "/": "Slash",
  ".": "NumpadDecimal",
  ";": "Semicolon",
  "'": "Quote",
  '"': "Quote",
  ",": "Comma",
  "*": "Digit8",
  "+": "Equal",
  "-": "Minus",
  "=": "Equal",
} as const;

export type KeyboardKey = keyof typeof KEYBOARD_KEY_CODES;

export type KeyboardCode =
  (typeof KEYBOARD_KEY_CODES)[keyof typeof KEYBOARD_KEY_CODES];

export const useKey = (target: KeyboardKey, listener: () => void) => {
  const gameContext = useContext(GameContext);
  if (gameContext == null) {
    throw Error("No game :(.");
  }

  const keyDownRef = useRef(false);
  const requestAnimationFrameRef = useRef(0);

  const update = () => {
    if (
      keyDownRef.current &&
      !gameContext.input.some((i: () => void) => i === listener)
    ) {
      gameContext.input.push(listener);
    }
    requestAnimationFrameRef.current = requestAnimationFrame(update);
  };

  const onKeydown = ({ code, key }: KeyboardEvent) => {
    if (key === target) {
      keyDownRef.current = true;
    }
  };

  const onKeyup = ({ code, key }: KeyboardEvent) => {
    if (key === target) {
      keyDownRef.current = false;
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", onKeydown);
    window.addEventListener("keyup", onKeyup);
    requestAnimationFrameRef.current = requestAnimationFrame(update);
    return () => {
      window.removeEventListener("keydown", onKeydown);
      window.removeEventListener("keyup", onKeyup);
      cancelAnimationFrame(requestAnimationFrameRef.current);
    };
  }, [listener]);
};

// cf. https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button#value
// 0: Main button pressed, usually the left button or the un-initialized state
// 1: Auxiliary button pressed, usually the wheel button or the middle button (if present)
// 2: Secondary button pressed, usually the right button
// 3: Fourth button, typically the Browser Back button
// 4: Fifth button, typically the Browser Forward button
export const MouseButtonMap = {
  0: "left",
  1: "wheel",
  2: "right",
  3: "back",
  4: "forward",
} as const;

export type MouseButtonMapKey = keyof typeof MouseButtonMap;

export type MouseButton = (typeof MouseButtonMap)[MouseButtonMapKey];

export type MiniMouseEvent = {
  button: MouseButton | undefined | null;
  x: number;
  y: number;
};

export const useMouse = (
  target: MouseButton | "move",
  listener: (ev: MiniMouseEvent) => void,
  continuous = false
) => {
  const mouseEventRef = useRef<MiniMouseEvent>({
    button: null,
    x: null,
    y: null,
  });
  const requestAnimationFrameRef = useRef(0);
  const lastUpdateRef = useRef<number>(0);

  const update = () => {
    const now = Date.now();
    const delta = now - lastUpdateRef.current;
    if (mouseEventRef.current?.button === target && delta > FPS_60_MS) {
      listener(mouseEventRef.current);
      lastUpdateRef.current = now;
    }
    requestAnimationFrameRef.current = requestAnimationFrame(update);
  };

  const onMousedown = ({ button, clientX, clientY }: MouseEvent) => {
    mouseEventRef.current = {
      button: MouseButtonMap[button as MouseButtonMapKey],
      x: clientX,
      y: clientY,
    };
    if (mouseEventRef.current?.button === target) {
      listener(mouseEventRef.current);
    }
  };

  const onMouseup = ({ button, clientX, clientY }: MouseEvent) => {
    mouseEventRef.current = {
      button: null,
      x: clientX,
      y: clientY,
    };
  };

  const onMousemove = ({ button, clientX, clientY }: MouseEvent) => {
    mouseEventRef.current = {
      ...mouseEventRef.current,
      x: clientX,
      y: clientY,
    };
    if (target === "move") {
      listener(mouseEventRef.current);
    }
  };

  useEffect(() => {
    window.addEventListener("mousedown", onMousedown);
    window.addEventListener("mouseup", onMouseup);
    window.addEventListener("mousemove", onMousemove);
    return () => {
      window.removeEventListener("mousedown", onMousedown);
      window.removeEventListener("mouseup", onMouseup);
      window.addEventListener("mousemove", onMousemove);
    };
  }, [listener]);

  useEffect(() => {
    if (continuous === true) {
      lastUpdateRef.current = Date.now();
      requestAnimationFrameRef.current = requestAnimationFrame(update);
    }
    return () => {
      cancelAnimationFrame(requestAnimationFrameRef.current);
    };
  }, [continuous, listener]);
};

// 8bitDo controller buttons
// 0 1 2 3 4 5 6  7  8      9     10 11 12 13   14   15    16
// B A Y X L R L2 R2 Select Start L3 R3 Up Down Left Right Home
export const GamepadButtonMap = {
  0: "B",
  1: "A",
  2: "Y",
  3: "X",
  4: "L",
  5: "R",
  6: "L2",
  7: "R2",
  8: "Select",
  9: "Start",
  10: "L3",
  11: "R3",
  12: "Up",
  13: "Down",
  14: "Left",
  15: "Right",
  16: "Home", // unnecessary?
} as const;

export type GamepadButtonMapKey = keyof typeof GamepadButtonMap;

export type GamepadButton = (typeof GamepadButtonMap)[GamepadButtonMapKey];

export const useGamepad = (
  target: GamepadButton,
  listener: () => void,
  continuous = false
) => {
  const buttonIndex = Object.keys(GamepadButtonMap).find(
    (key) => GamepadButtonMap[key as `${GamepadButtonMapKey}`] === target
  );
  const gamepadPressedRef = useRef(false);
  const requestAnimationFrameRef = useRef(0);
  const lastUpdateRef = useRef<number>(0);

  const update = () => {
    const gamepads = navigator.getGamepads();
    const lastPressed = gamepadPressedRef.current;
    gamepadPressedRef.current = gamepads?.[0]?.buttons?.[+buttonIndex]?.pressed;

    const now = Date.now();
    const delta = now - lastUpdateRef.current;
    if (
      delta > FPS_60_MS &&
      ((continuous && gamepadPressedRef.current === true) ||
        (lastPressed === false && gamepadPressedRef.current === true))
    ) {
      console.log("update");
      listener();
      lastUpdateRef.current = now;
    }
    requestAnimationFrameRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    lastUpdateRef.current = Date.now();
    requestAnimationFrameRef.current = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(requestAnimationFrameRef.current);
    };
  }, [listener]);
};
