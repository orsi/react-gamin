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
  entities: new Set(),
  getEntitiesWithComponents: () => [],
  height: 480,
  input: null,
  systems: [],
  updates: new Set(),
  width: 640,
};

export type GameStore = {
  entities: Set<EntityContext>;
  getEntitiesWithComponents: (...components: Comp<any>[]) => EntityWith<any>[];
  height: number;
  input: InputState;
  systems: SystemSubscriber[];
  updates: Set<UpdateSubscriber>;
  width: number;
};
export const GameContext = createContext<null | Store<GameStore>>(null);
console.log(GameContext);
interface GameProps extends PropsWithChildren {
  aspectRatio?: string;
  fps?: number;
  style?: CSSProperties;
  width?: number;
  height?: number;
}
export function Game(props: GameProps) {
  const { aspectRatio, children, fps, height, style, width } = props;

  const FRAME_MS = 1000 / (fps ?? 60);
  const [gameHeight, setHeight] = useState(height ?? 480);
  const [gameWidth, setWidth] = useState(width ?? 640);

  const getEntitiesWithComponents = (...components: Comp<any>[]) => {
    const entities = [...store.get().entities]?.filter((entity) => {
      const hasComponent = components?.every((value) =>
        entity.components.has(value._symbol)
      );
      return hasComponent;
    });
    return entities;
  };

  const input = useInputSystem();
  const store = createStore<GameStore>({
    ...initialGameState,
    height: gameHeight,
    width: gameWidth,
    input: input.current,
    getEntitiesWithComponents: getEntitiesWithComponents,
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
        // update systems

        store.get().systems.forEach((system) => {
          // pass only entities that have the components the system wants
          const entities = [...store.get().entities].filter((entity) => {
            const hasComponent = system.components?.every((value) =>
              entity.components.has(value._symbol)
            );
            return hasComponent;
          });
          system.run(entities as EntityWith<any>[], FRAME_MS);
        });

        // update entities
        [...store.get().updates].forEach((subscriber) => {
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
      id="react-gamin-container"
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
        id="react-gamin"
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

export const EntityContext = createContext<EntityContext>(null);
export interface EntityContext {
  _id: string;
  components: Map<symbol, [any, Dispatch<any>]>;
  getComponent: <T>(component: Comp<T>) => [T, Dispatch<T>];
}
type EntityWith<T> = EntityContext & {
  components: { [key in Comp<T>["_symbol"]]: T };
};
export interface EntityProps extends PropsWithChildren {}
export const Entity = forwardRef<EntityContext, EntityProps>(function Entity(
  { children },
  ref
) {
  const entityRef = useRef<EntityContext>({
    _id: crypto.randomUUID(),
    components: new Map(),
    getComponent: null,
  });

  const getComponent = <T,>(component: Comp<T>) => {
    const c = entityRef.current.components.get(component._symbol);
    if (!c) {
      console.warn(
        `Entity ${entityRef.current._id} does not have component ${component._symbol.description}`
      );
      return;
    }
    return c as [T, Dispatch<T>];
  };
  entityRef.current.getComponent = getComponent;
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

// hooks
type SystemSubscriber = {
  components: Comp<any>[];
  run: SystemFunction;
};
type SystemFunction = <T extends symbol[]>(
  entites: EntityWith<T>[],
  delta: number
) => void;
export function useSystem(callback: SystemFunction, components?: Comp<any>[]) {
  // make sure users aren't using systems inside entities
  const entity = useContext(EntityContext);
  if (entity) {
    throw Error("useNewSystem cannot be used within an Entity.");
  }

  const store = useGameStore();
  const memoCallback = useCallback(callback, []);
  const systemSubscriber = useRef<SystemSubscriber>({
    components,
    run: memoCallback,
  });

  useEffect(() => {
    store.get().systems = [...store.get().systems, systemSubscriber.current];
    return () => {
      store.get().systems = store
        .get()
        .systems.filter((system) => system !== systemSubscriber.current);
    };
  }, [callback, store]);
}

type UpdateSubscriber = (input: InputState, delta: number) => void;
export function useUpdate(
  callback: UpdateSubscriber,
  dependencies?: unknown[]
) {
  // make sure users are using update inside an entity
  const entity = useContext(EntityContext);
  if (!entity) {
    throw Error("useUpdate should be used within an Entity.");
  }

  const store = useGameStore();
  const memoCallback = useCallback(callback, [dependencies]);

  useEffect(() => {
    store.get().updates.add(memoCallback);
    return () => {
      store.get().updates.delete(memoCallback);
    };
  }, [callback, store]);
}

export function useEntity() {
  const context = useContext(EntityContext);
  if (!context) {
    console.warn("Game hooks must be used inside a <Game /> element.");
  }
  return context;
}

type Comp<T> = {
  _symbol: symbol;
  _defaultValue: T;
};
export function createComponent<T>(defaultValue: T) {
  return {
    _symbol: Symbol("react-gamin.component"),
    _defaultValue: defaultValue,
  } as Comp<T>;
}
export function useComponent<T>(component: Comp<T>, intialValue?: T) {
  const entity = useEntity();
  const state = useState(intialValue ?? component._defaultValue);

  useEffect(() => {
    entity.components.set(component._symbol, state);
    return () => {
      entity.components.delete(component._symbol);
    };
  }, [entity, state]);

  return state;
}

// default components
export interface Transform {
  x: number;
  y: number;
  z: number;
}
export const TransformComponent = createComponent<Transform>({
  x: 0,
  y: 0,
  z: 0,
});
export function useTransformComponent(initialValue?: Transform) {
  const componentState = useComponent(TransformComponent, initialValue);
  return componentState;
}

export interface Velocity {
  dx: number;
  dy: number;
  dz: number;
}
export const VelocityComponent = createComponent<Velocity>({
  dx: 0,
  dy: 0,
  dz: 0,
});
export function useVelocityComponent(initialValue?: Velocity) {
  const componentState = useComponent(VelocityComponent, initialValue);
  return componentState;
}

export interface Body {
  height: number;
  width: number;
}
export const BodyComponent = createComponent<Body>({ height: 10, width: 10 });
export function useBodyComponent(initialValue?: Body) {
  const componentState = useComponent(BodyComponent, initialValue);
  return componentState;
}
