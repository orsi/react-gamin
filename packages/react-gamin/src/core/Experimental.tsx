import {
  MutableRefObject,
  useRef,
  createContext,
  PropsWithChildren,
  CSSProperties,
  useState,
  useEffect,
  useLayoutEffect,
  useContext,
  useSyncExternalStore,
  useCallback,
  Dispatch,
  SetStateAction,
  forwardRef,
  useImperativeHandle,
} from "react";

type Store<A> = {
  set(newState: Partial<A>): void;
  get(): A;
  subscribe(subscriber: Subscriber): () => void;
};
type Subscriber = (...args: any[]) => void;
function createStore<A>(initialState: A) {
  const state: MutableRefObject<A> = useRef(initialState);
  const subscribers: Set<Subscriber> = new Set();
  const store = {
    _internal: {
      subscribers,
    },
    set(newState: Partial<A>) {
      state.current = {
        ...state.current,
        ...newState,
      };
    },
    get() {
      return state.current;
    },
    subscribe(subscriber: Subscriber) {
      subscribers.add(subscriber);
      return () => subscribers.delete(subscriber);
    },
  } as const;
  return store;
}

const initialGameState: GameStore = {
  height: 480,
  width: 640,
  input: null,
  updateSubscribers: new Set(),
  entities: new Set(),
};
export type GameStore = {
  height: number;
  width: number;
  input: InputState;
  updateSubscribers: Set<UpdateSubscriber>;
  entities: Set<IEntity>;
};
export const GameContext = createContext<null | Store<GameStore>>(null);
interface GameProps extends PropsWithChildren {
  aspectRatio?: string;
  fps?: number;
  style?: CSSProperties;
}
export function Game(props: GameProps) {
  const { aspectRatio, children, fps, style } = props;

  const FRAME_MS = 1000 / (fps ?? 60);
  const [height, setHeight] = useState(480);
  const [width, setWidth] = useState(640);

  const input = useInputSystem();
  const store = createStore<GameStore>({
    ...initialGameState,
    height,
    width,
    input: input.current,
  });
  // every rendered component will register themselves
  // into these refs via the game context
  const context = useRef<ReturnType<typeof createStore<GameStore>>>(store);

  // game update loop
  useEffect(() => {
    let frame = 0;
    let accumulator = 0;
    let lastUpdate = 0;
    function update(time: number) {
      accumulator += time - lastUpdate;
      let ticks = 0;
      // attempt to deplete accumulator by FRAME_MS each tick, but if this
      // takes more than 5 ticks, bail updating. By limiting the ticks this
      // loop can run, we allow the ability to catch up if the updates took
      // longer for some reason.
      while (accumulator > FRAME_MS && ticks < 5) {
        [...store.get().updateSubscribers].forEach((subscriber) => {
          subscriber(store.get().input, FRAME_MS);
        });
        ticks++;
        accumulator -= FRAME_MS;
        lastUpdate = time;
      }

      ticks = 0;
      frame = requestAnimationFrame(update);
    }
    frame = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [store]);

  const gameElementRef = useRef<HTMLDivElement>();
  useLayoutEffect(() => {
    if (gameElementRef.current) {
      const rect = gameElementRef.current.getBoundingClientRect();
      setHeight(rect.height);
      setWidth(rect.width);
    }
  }, []);

  return (
    <div
      ref={gameElementRef}
      style={{
        aspectRatio: aspectRatio ?? "4/3",
        height,
        margin: "0px auto",
        overflow: "hidden",
        width: width ?? "640px",
        ...style,
      }}
    >
      <div
        style={{
          height: "100%",
          position: "relative",
          width: "100%",
        }}
      >
        <GameContext.Provider value={context.current}>
          {children}
        </GameContext.Provider>
      </div>
    </div>
  );
}

type GameStoreSelector<T> = (state: GameStore) => T;
export function useGame<T>(selector: GameStoreSelector<T>): T;
export function useGame<T>(): GameStore;
export function useGame<T>(selector?: GameStoreSelector<T>) {
  const store = useContext(GameContext);
  if (!store)
    throw new Error(
      "Game hooks can only be used within the <Game /> component."
    );

  const state = useSyncExternalStore(store.subscribe, () =>
    selector ? selector(store.get()) : store.get()
  );
  return state;
}

export function useGameStore() {
  const store = useContext(GameContext);
  if (!store)
    throw new Error(
      "Game hooks can only be used within the <Game /> component."
    );
  return store;
}

type UpdateSubscriber = (input: InputState, delta: number) => void;
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

export function useUpdate(
  callback: UpdateSubscriber,
  dependencies?: unknown[]
) {
  const store = useGameStore();
  const memoCallback = useCallback(callback, [dependencies]);

  useEffect(() => {
    store.get().updateSubscribers.add(memoCallback);
    return () => {
      store.get().updateSubscribers.delete(memoCallback);
    };
  }, [callback, store]);
}

export function useInputOn(
  event: string,
  callback: UpdateSubscriber,
  dependencies?: unknown[]
) {
  const store = useGameStore();
  const memoCallback = useCallback(callback, [dependencies]);

  useEffect(() => {
    store.get().updateSubscribers.add(memoCallback);
    return () => {
      store.get().updateSubscribers.delete(memoCallback);
    };
  }, [callback, store]);
}

export const EntityContext = createContext<IEntity>(null);
export interface IEntity {
  _internal: {
    components: Map<string, [any, Dispatch<SetStateAction<any>>]>;
  };
  id: string;
  name?: string;
  type?: string;
  set: (type: string, data: any) => void;
  get: (type: string) => any;
}
export interface IEntityProps extends PropsWithChildren {
  id: string;
  type?: string;
  components?: any[];
}
export const Entity = forwardRef<IEntity, IEntityProps>(function Entity(
  { id, children, components, type },
  ref
) {
  const get = (name: string) => {
    const component = entityRef.current._internal.components.get(name);
    if (!component) {
      console.warn(
        `Entity ${entityRef.current.id} does not have component ${name}`
      );
      return;
    }

    const [state] = component;
    return state;
  };

  const set = (name: string, data: any) => {
    const component = entityRef.current._internal.components.get(name);
    if (!component) {
      console.warn(
        `Entity ${entityRef.current.id} does not have component ${name}`
      );
      return;
    }
    const [, setState] = component;
    setState(data);
  };

  const entityRef = useRef<IEntity>({
    _internal: {
      components: new Map(),
    },
    id,
    type: type ?? "unknown",
    get,
    set,
  });
  useImperativeHandle(ref, () => entityRef.current);

  const gameEntities = useGame((state) => state.entities);
  useEffect(() => {
    gameEntities.add(entityRef.current);
    return () => {
      gameEntities.delete(entityRef.current);
    };
  }, []);

  return (
    <EntityContext.Provider value={entityRef.current}>
      {children}
    </EntityContext.Provider>
  );
});

export function useEntity() {
  const context = useContext(EntityContext);
  if (!context) {
    console.warn("Game hooks must be used inside a <Game /> element.");
  }
  return context;
}

export function useComponent<T>(name: string, data: T) {
  const state = useState(data);
  const entity = useEntity();
  entity._internal.components.set(name, state);
  return state;
}

interface Component {}
interface PositionComponent extends Component {
  x: number;
  y: number;
  z: number;
}
export function usePositionComponent(
  initialValue?: Partial<PositionComponent>
) {
  const state = useComponent<PositionComponent>("position", {
    x: 0,
    y: 0,
    z: 0,
    ...initialValue,
  });
  return state;
}

interface VelocityComponent extends Component {
  dx: number;
  dy: number;
  dz: number;
}
export function useVelocityComponent(
  initialValue?: Partial<VelocityComponent>
) {
  const state = useComponent<VelocityComponent>("velocity", {
    dx: 0,
    dy: 0,
    dz: 0,
    ...initialValue,
  });
  return state;
}

interface BodyComponent extends Component {
  height: number;
  width: number;
}
export function useBodyComponent(initialValue?: Partial<BodyComponent>) {
  const state = useComponent<BodyComponent>("body", {
    height: 0,
    width: 0,
    ...initialValue,
  });
  return state;
}
