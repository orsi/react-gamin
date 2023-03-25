import {
  useRef,
  createContext,
  PropsWithChildren,
  CSSProperties,
  useState,
  useEffect,
  useLayoutEffect,
  useContext,
  useCallback,
  Dispatch,
  forwardRef,
  useImperativeHandle,
} from "react";

export type GameContext = {
  addEntity: (entity: IEntity) => void;
  addSystem: (system: SystemFunction) => void;
  addUpdate: (update: UpdateSubscriber) => void;
  changeScene: (scene: React.ReactNode) => void;
  getEntities: () => IEntity[];
  height: number;
  removeEntity: (entity: IEntity) => void;
  removeE: (entity: React.ReactNode) => void;
  removeSystem: (system: SystemFunction) => void;
  removeUpdate: (update: UpdateSubscriber) => void;
  width: number;
};
export const GameContext = createContext<null | GameContext>(null);
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
  const [scene, setScene] = useState<React.ReactNode>(children);

  const entities = useRef<IEntity[]>([]);
  const input = useInputSystem();
  const systems = useRef<SystemFunction[]>([]);
  const updates = useRef<UpdateSubscriber[]>([]);

  const getEntities = () => {
    return entities.current;
  };

  const addEntity = (entity: IEntity) => {
    entities.current = [...entities.current, entity];
  };

  const removeEntity = (entity: IEntity) => {
    entities.current = entities.current.filter((e) => e !== entity);
  };

  const removeE = (entity: React.ReactNode) => {
    // entities.current = entities.current.filter((e) => e !== entity);
  };

  const changeScene = (scene: React.ReactNode) => {
    setScene(scene);
  };

  const addSystem = (system: SystemFunction) => {
    systems.current = [...systems.current, system];
  };

  const removeSystem = (system: SystemFunction) => {
    systems.current = systems.current.filter((s) => s !== system);
  };

  const addUpdate = (update: UpdateSubscriber) => {
    updates.current = [...updates.current, update];
  };

  const removeUpdate = (update: UpdateSubscriber) => {
    updates.current = updates.current.filter((s) => s !== update);
  };

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

        systems.current.forEach((system) => {
          // pass only entities that have the components the system wants
          system(entities.current, FRAME_MS);
        });

        // update entities
        updates.current.forEach((subscriber) => {
          subscriber(input.current, FRAME_MS);
        });

        ticks++;
        accumulator -= FRAME_MS;
        lastUpdate = time;
      }

      ticks = 0;
      frame = requestAnimationFrame(update);
    }
    update(0);

    return () => {
      cancelAnimationFrame(frame);
      accumulator = 0;
      lastUpdate = 0;
    };
  }, []);

  const gameElementRef = useRef<HTMLDivElement>();
  useLayoutEffect(() => {
    if (gameElementRef.current) {
      const rect = gameElementRef.current.getBoundingClientRect();
      setHeight(rect.height);
      setWidth(rect.width);
    }
  }, []);

  return (
    <GameContext.Provider
      value={{
        addEntity,
        addSystem,
        addUpdate,
        changeScene,
        getEntities,
        height: gameHeight ?? 480,
        removeEntity,
        removeE,
        removeSystem,
        removeUpdate,
        width: gameWidth ?? 640,
      }}
    >
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
          {scene}
        </div>
      </div>
    </GameContext.Provider>
  );
}

type GameStoreSelector<T> = (state: GameContext) => T;
export function useGame<T>(selector: GameStoreSelector<T>): T;
export function useGame<T>(): GameContext;
export function useGame<T>(selector?: GameStoreSelector<T>) {
  const context = useContext(GameContext);
  if (!context)
    throw new Error(
      "Game hooks can only be used within the <Game /> component."
    );

  const [state] = useState(selector ? selector(context) : context);
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

export function useQuery<T extends Component<any, any>[]>(...components: T) {
  const context = useGame();
  if (!context) {
    throw new Error(
      "Game hooks can only be used within the <Game /> component."
    );
  }
  return {
    get: () => {
      return context.getEntities().filter((e) => {
        return components.every((c) => e.components[c.name] != null);
      }) as IEntity<T>[];
    },
  };
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

export function useSceneManager() {
  const game = useGame();
  if (!game) {
    throw new Error("You can only call useSceneManager in a <Game /> context.");
  }

  return {
    change: (scene: React.ReactNode) => {
      game.changeScene(scene);
    },
  };
}

export function useEntityManager() {
  const game = useGame();
  if (!game) {
    throw new Error(
      "You can only call useEntityManager in a <Game /> context."
    );
  }

  return {
    remove: (entity: React.ReactNode) => {
      console.log("remove", entity);
      game.removeE(entity);
    },
  };
}

// this type is magic!
export type EntityComponentsMap<T extends Component<any, any>[]> =
  T extends undefined
    ? any
    : {
        [Key in `${number}` &
          keyof T as T[Key]["name"]]: T[Key]["type"] extends Function
          ? // Readonly<T[Key]["type"]> somehow removes call signatures,
            // so functions being stored here will not be callable despite
            // not being modified. cf. https://github.com/microsoft/TypeScript/issues/32566
            Function
          : Readonly<T[Key]["type"]>;
      };
export const EntityContext = createContext<IEntity>(null);
export interface IEntity<T extends Component<any, any>[] = any> {
  _id: string;
  _state: Record<PropertyKey, [any, Dispatch<any>]>;
  components: EntityComponentsMap<T>;
  update: <K extends string, T>(
    componentType: Component<K, T>,
    data: T
  ) => void;
  has: (...components: T[]) => boolean;
}
export interface EntityProps extends PropsWithChildren {}
export const Entity = forwardRef<IEntity, EntityProps>(function Entity(
  { children },
  ref
) {
  const entityRef = useRef<IEntity>({
    _id: crypto.randomUUID(),
    _state: {},
    components: {},
    update: null,
    has: null,
  });

  const has = <T extends Component<any, any>[]>(...components: T) => {
    for (const component of components) {
      if (entityRef.current.components[component.name] == null) {
        return false;
      }
    }

    return true;
  };
  entityRef.current.has = has;

  const update = <K extends string, T>(
    componentType: Component<K, T>,
    data: T
  ) => {
    const component = entityRef.current._state[componentType.name];
    if (!component) {
      console.warn(
        `Entity ${entityRef.current._id} does not have component ${componentType.name}`
      );
      return;
    }

    const [, setState] = component;
    setState(data);
  };
  entityRef.current.update = update;
  useImperativeHandle(ref, () => entityRef.current);

  const game = useGame();
  useEffect(() => {
    game.addEntity(entityRef.current);
    return () => {
      game.removeEntity(entityRef.current);
    };
  }, []);

  return (
    <EntityContext.Provider value={entityRef.current}>
      {children}
    </EntityContext.Provider>
  );
});

export type SystemFunction = (entites: IEntity[], delta: number) => void;
export function useSystem(callback: SystemFunction) {
  const gameContext = useGame();
  if (!gameContext) {
    throw Error("useSystem must be used inside a <Game /> context.");
  }

  const memoCallback = useCallback(callback, []);

  useEffect(() => {
    gameContext.addSystem(memoCallback);
    return () => {
      gameContext.removeSystem(memoCallback);
    };
  }, [callback, gameContext]);
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

  const gameContext = useGame();
  const memoCallback = useCallback(callback, [dependencies]);

  useEffect(() => {
    gameContext.addUpdate(memoCallback);
    return () => {
      gameContext.removeUpdate(memoCallback);
    };
  }, [callback, gameContext]);
}

export function useEntity<T extends Component<any, any>[] = []>() {
  const context = useContext(EntityContext);
  if (!context) {
    console.warn("useEntity must be used inside a <Entity /> context.");
  }
  return context as IEntity<T>;
}

export type Component<K extends string, T> = {
  readonly name: K;
  readonly type: T;
};

export function createComponent<K extends string, T>(
  name: K,
  type: T
): Component<K, T> {
  return {
    name,
    type,
  };
}

export function useComponent<K extends string, T>(name: K, intialValue?: T) {
  const entity = useEntity<[any]>();
  //                         ^
  // TODO: This is a hack I'm already seeing too often

  // passing useState() a function that returns the initial value will
  // ensure components can store functions as state as well, instead of
  // useState() interpretting the function as a state setter
  const [state, setState] = useState(() => intialValue);

  useEffect(() => {
    entity.components[name] = state;
    entity._state[name] = [state, setState];
  }, [state]);

  return [state, setState] as [T, Dispatch<T>];
}

// default components
export interface Transform {
  x: number;
  y: number;
  z: number;
}

export const TransformComponent = createComponent("transform", {
  x: 0,
  y: 0,
  z: 0,
});

export function useTransformComponent(initialValue?: Transform) {
  return useComponent("transform", initialValue);
}

export interface Velocity {
  dx: number;
  dy: number;
  dz: number;
}

export const VelocityComponent = createComponent("velocity", {
  dx: 0,
  dy: 0,
  dz: 0,
});

export function useVelocityComponent(initialValue?: Velocity) {
  return useComponent("velocity", initialValue);
}

export interface Body {
  height: number;
  width: number;
}

export const BodyComponent = createComponent("body", {
  width: 100,
  height: 100,
});

export function useBodyComponent(initialValue?: Body) {
  return useComponent("body", initialValue);
}
