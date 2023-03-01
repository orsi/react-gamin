import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import { Position, Body } from "./Components";
import { IEntity, EntityRef, EntityContext, useEntityContext } from "./Entity";

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
export function InputSystem({ children }: PropsWithChildren<GameInputProps>) {
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

const MovementSystemContext = createContext<any>(null);
export function MovementSystem({ children }: PropsWithChildren) {
  const entities = useRef(new Set<EntityRef<any>>());

  const get = () => [...entities.current];
  const add = (entity: EntityRef<any>) => entities.current.add(entity);
  const remove = (entity: EntityRef<any>) => {
    entities.current.delete(entity);
  };

  return (
    <MovementSystemContext.Provider
      value={{
        get,
        add,
        remove,
      }}
    >
      {children}
    </MovementSystemContext.Provider>
  );
}

export function useMovementSystemContext() {
  return useContext(MovementSystemContext);
}

const SPEED = 2;
type TDirection = "up" | "down" | "left" | "right";
export function useMovementSystem(
  position: Position,
  setPosition: Dispatch<SetStateAction<Position>>,
  body: Body
) {
  const entityRef = useEntityContext();
  const context = useMovementSystemContext();
  const { get, add, remove } = context;
  const entities = get() as EntityRef<any>[];

  useEffect(() => {
    add(entityRef);
    return () => {
      remove(entityRef);
    };
  }, []);

  const move = (direction: TDirection) => {
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

    const foundEntity = [...entities].find((otherEntity) => {
      if (
        otherEntity === entityRef ||
        !otherEntity.current.position ||
        !otherEntity.current.body
      ) {
        return false;
      }

      const [ePosition] = otherEntity.current.position;
      const [eBody] = otherEntity.current.body;

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

    // nothing is there
    if (!foundEntity) {
      setPosition(nextPosition);
      return true;
    }

    // entity there is not solid
    if (foundEntity && !foundEntity.current.body?.[0]?.solid) {
      setPosition(nextPosition);
      return true;
    }

    // nope
    return false;
  };

  return move;
}

const InteractSystemContext = createContext<any>(null);
export function InteractSystem({ children }: PropsWithChildren) {
  const entities = useRef(new Set());

  return (
    <InteractSystemContext.Provider
      value={{
        get: () => [...entities.current],
        add: (entity: IEntity) => entities.current.add(entity),
        remove: (entity: IEntity) => entities.current.delete(entity),
      }}
    >
      {children}
    </InteractSystemContext.Provider>
  );
}

export function useInteractSystem(callback?: () => void) {
  const entityRef = useContext(EntityContext);
  const context = useContext(InteractSystemContext);
  if (!context) {
    throw Error("System context not found. Did you create the system?");
  }
  const { get, add, remove } = context;
  const entities = get() as EntityRef<any>[];

  useEffect(() => {
    entityRef.current.onInteracted = callback ?? function () {};
    add(entityRef);
    return () => {
      delete entityRef.current.onInteracted;
      remove(entityRef);
    };
  }, []);

  return () => {
    const [position] = entityRef.current.position;
    const foundEntity = Object.values(entities).find((otherEntity) => {
      if (
        otherEntity === entityRef ||
        !otherEntity.current?.position ||
        !otherEntity.current?.body
      ) {
        return;
      }

      const [ePosition] = otherEntity.current?.position;
      const [eBody] = otherEntity.current?.body;
      const xMin = ePosition.x! - eBody.width! / 2;
      const xMax = ePosition.x! + eBody.width! / 2;
      const yMin = ePosition.y! - eBody.height! / 2;
      const yMax = ePosition.y! + eBody.height! / 2;
      const inRange =
        position.x >= xMin &&
        position.x <= xMax &&
        position.y >= yMin &&
        position.y <= yMax;
      return inRange;
    });

    // nothing is there
    if (!foundEntity) {
      return;
    }

    foundEntity.onInteracted(entityRef);
  };
}
