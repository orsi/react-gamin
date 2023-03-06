import {
  createContext,
  CSSProperties,
  Dispatch,
  forwardRef,
  MutableRefObject,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

export default function Pong() {
  const startGame = () => {
    setCurrentScene(<PlayScene onGameOver={showEndScene} />);
  };

  const showEndScene = (win: boolean) => {
    setCurrentScene(
      <EndScene text={win ? `YOU WIN` : `GAME OVER`} onPlayAgain={startGame} />
    );
  };

  const [currentScene, setCurrentScene] = useState(
    <TitleScene onStart={startGame} />
  );

  return <Game style={{ border: `1px solid white` }}>{currentScene}</Game>;
}

const BALL_SPEED = 5;
const PADDLE_SPEED = 6;
const MAX_SCORE = 5;

function TitleScene({ onStart }: { onStart: () => void }) {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        placeItems: "center",
        placeContent: "center",
      }}
    >
      <h1>PONG</h1>
      <button onClick={onStart}>START</button>
    </div>
  );
}

function EndScene({
  text,
  onPlayAgain,
}: {
  text: string;
  onPlayAgain: () => void;
}) {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        placeItems: "center",
        placeContent: "center",
      }}
    >
      <h1>{text}</h1>
      <button onClick={onPlayAgain}>PLAY AGAIN</button>
    </div>
  );
}

function PlayScene({ onGameOver }: { onGameOver?: (win: boolean) => void }) {
  const height = useGame((state) => state.height);
  const width = useGame((state) => state.width);
  const playerScoreRef = useRef<IEntity>();
  const opponentScoreRef = useRef<IEntity>();
  const playerPaddleRef = useRef<IEntity>();
  const opponentPaddleRef = useRef<IEntity>();
  const dividerRef = useRef<IEntity>();
  const ballRef = useRef<IEntity>();

  useUpdate((input, delta) => {
    // BALL BOUNCING
    if (
      ballRef.current.get("position").y + ballRef.current.get("body").height >=
      height
    ) {
      ballRef.current.set("velocity", {
        x: ballRef.current.get("velocity").x,
        y: -BALL_SPEED,
      });
    } else if (ballRef.current.get("position").y <= 0) {
      ballRef.current.set("velocity", {
        x: ballRef.current.get("velocity").x,
        y: BALL_SPEED,
      });
    }
    const newY =
      ballRef.current.get("position").y + ballRef.current.get("velocity").y;

    if (
      ballRef.current.get("position").x + ballRef.current.get("body").width >=
      width
    ) {
      ballRef.current.set("velocity", {
        x: -BALL_SPEED,
        y: ballRef.current.get("velocity").y,
      });
    } else if (ballRef.current.get("position").x <= 0) {
      ballRef.current.set("velocity", {
        x: BALL_SPEED,
        y: ballRef.current.get("velocity").y,
      });
    }
    const newX =
      ballRef.current.get("position").x + ballRef.current.get("velocity").x;
    ballRef.current.set("position", { x: newX, y: newY });

    // SCORE
    function resetBall(ball: IEntity) {
      const newX = width / 2 - ball.get("body").width;
      const newY = height / 2 - ball.get("body").height;
      ball.set("position", { x: newX, y: newY });
      const direction = Math.random() < 0.5 ? 1 : -1;
      ball.set("velocity", {
        x: BALL_SPEED * direction,
        y: ball.get("velocity").y,
      });
    }

    const currentPlayerScore = playerScoreRef.current.get("score");
    const currentOpponentScore = opponentScoreRef.current.get("score");
    if (
      ballRef.current.get("position").x + ballRef.current.get("body").width >=
      width
    ) {
      // player scores if hitting right wall
      const newPlayerScore = currentPlayerScore + 1;
      if (newPlayerScore < MAX_SCORE) {
        playerScoreRef.current.set("score", newPlayerScore);
        resetBall(ballRef.current);
      } else {
        // player won!
        onGameOver(true);
      }
    } else if (ballRef.current.get("position").x <= 0) {
      // opponent scores if hitting left wall
      const newOpponentScore = currentOpponentScore + 1;
      if (newOpponentScore < 2) {
        opponentScoreRef.current.set("score", newOpponentScore);
        resetBall(ballRef.current);
      } else {
        // opponent won :()
        onGameOver(false);
      }
    }

    // move opponent, and update if they hit walls
    const opponentY =
      opponentPaddleRef.current.get("position").y +
      opponentPaddleRef.current.get("velocity").y;
    opponentPaddleRef.current.set("position", {
      x: opponentPaddleRef.current.get("position").x,
      y: opponentY,
    });
    if (
      opponentPaddleRef.current.get("position").y +
        opponentPaddleRef.current.get("body").height >=
      height
    ) {
      opponentPaddleRef.current.set("velocity", {
        x: opponentPaddleRef.current.get("velocity").x,
        y: -PADDLE_SPEED,
      });
    } else if (opponentPaddleRef.current.get("position").y <= 0) {
      opponentPaddleRef.current.set("velocity", {
        x: opponentPaddleRef.current.get("velocity").x,
        y: PADDLE_SPEED,
      });
    }

    function collides(obj1: IEntity, obj2: IEntity) {
      const obj1Body = obj1.get("body");
      const obj1Position = obj1.get("position");
      const obj2Body = obj2.get("body");
      const obj2Position = obj2.get("position");
      return (
        obj1Position.x < obj2Position.x + obj2Body.width &&
        obj1Position.x + obj1Body.width > obj2Position.x &&
        obj1Position.y < obj2Position.y + obj2Body.height &&
        obj1Position.y + obj1Body.height > obj2Position.y
      );
    }

    const ballVelocity = ballRef.current.get("velocity");
    const ballPosition = ballRef.current.get("position");
    const ballBody = ballRef.current.get("body");
    const playerPosition = playerPaddleRef.current.get("position");
    const playerBody = playerPaddleRef.current.get("body");
    const opponentPosition = opponentPaddleRef.current.get("position");
    if (collides(ballRef.current, playerPaddleRef.current)) {
      ballRef.current.set("velocity", {
        x: ballVelocity.x * -1,
        y: ballVelocity.y,
      });
      ballRef.current.set("position", {
        x: playerPosition.x + playerBody.width,
        y: ballPosition.y,
      });
    } else if (collides(ballRef.current, opponentPaddleRef.current)) {
      ballRef.current.set("velocity", {
        x: ballVelocity.x * -1,
        y: ballVelocity.y,
      });

      ballRef.current.set("position", {
        x: opponentPosition.x - ballBody.width,
        y: ballPosition.y,
      });
    }
  });

  return (
    <>
      <Entity id="player-score" ref={playerScoreRef}>
        <Score x={24} />
      </Entity>
      <Entity id="opponent-score" ref={opponentScoreRef}>
        <Score x={width - 24} />
      </Entity>
      <Entity id="player" ref={playerPaddleRef}>
        <PlayerPaddle />
      </Entity>
      <Entity id="opponent" ref={opponentPaddleRef}>
        <OpponentPaddle />
      </Entity>
      <Entity id="divider" ref={dividerRef}>
        <Divider />
      </Entity>
      <Entity id="ball" ref={ballRef}>
        <Ball />
      </Entity>
    </>
  );
}

function Score({ x }: { x: number }) {
  const [score] = useComponent("score", 0);
  return (
    <div
      style={{
        position: "absolute",
        top: "0px",
        left: "0px",
        transform: `translate(${x}px, 25px)`,
      }}
    >
      {score}
    </div>
  );
}

function Divider() {
  const width = useGame((state) => state.width);
  return (
    <div
      style={{
        border: `5px dashed #fff`,
        height: "100%",
        width: `0px`,
        position: "absolute",
        top: "0px",
        left: "0px",
        transform: `translate(${width / 2 - 3}px, 0px)`,
      }}
    ></div>
  );
}

function PlayerPaddle() {
  const height = useGame((state) => state.height);
  const [body] = useBodyComponent({
    width: 15,
    height: 100,
  });
  const [position, setPosition] = usePositionComponent({
    x: 30,
    y: height / 2 - 50,
  });
  const [velocity] = useVelocityComponent({
    x: PADDLE_SPEED,
    y: PADDLE_SPEED,
  });

  useUpdate(
    (input) => {
      if ((input.KEYBOARD_UP || input.GAMEPAD_BUTTON_12) && position.y >= 0) {
        setPosition({
          x: position.x,
          y: position.y - velocity.y,
          z: 0,
        });
      } else if (
        (input.KEYBOARD_DOWN || input.GAMEPAD_BUTTON_13) &&
        position.y + body.height <= height
      ) {
        setPosition({
          x: position.x,
          y: position.y + velocity.y,
          z: 0,
        });
      }
    },
    [position, body, velocity]
  );

  return (
    <div
      style={{
        backgroundColor: "white",
        height: `${body.height}px`,
        left: "0px",
        position: "absolute",
        top: "0px",
        transform: `translate(${position.x}px, ${position.y}px)`,
        width: `${body.width}px`,
      }}
    ></div>
  );
}

function OpponentPaddle() {
  const height = useGame((state) => state.height);
  const width = useGame((state) => state.width);
  const [body] = useBodyComponent({
    width: 15,
    height: 100,
  });
  const [position] = usePositionComponent({
    x: width - 30,
    y: height / 2 - 50,
  });
  const [velocity] = useVelocityComponent({
    x: PADDLE_SPEED,
    y: PADDLE_SPEED,
  });

  return (
    <div
      style={{
        backgroundColor: "white",
        height: `${body.height}px`,
        left: "0px",
        position: "absolute",
        top: "0px",
        transform: `translate(${position.x}px, ${position.y}px)`,
        width: `${body.width}px`,
      }}
    ></div>
  );
}

function Ball() {
  const height = useGame((state) => state.height);
  const width = useGame((state) => state.width);
  const [position] = useComponent("position", {
    x: width / 2 - 25,
    y: height / 2 - 25,
  });
  const velocity = useComponent("velocity", {
    x: BALL_SPEED,
    y: BALL_SPEED,
  });
  const [body] = useComponent("body", {
    width: 25,
    height: 25,
  });

  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "100%",
        left: "0px",
        height: `${body.height}px`,
        position: "absolute",
        top: "0px",
        transform: `translate(${position.x}px, ${position.y}px)`,
        width: `${body.width}px`,
      }}
    ></div>
  );
}

/**
 * STORE
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *******************************************************************************************************/

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

/** GAME
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *******************************************************************************************************/

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

/** INPUT/LOGIC LOOPS
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *******************************************************************************************************/

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

/** ENTITY/COMPONENT
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *******************************************************************************************************/

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

interface PositionComponent {
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

interface VelocityComponent {
  x: number;
  y: number;
  z: number;
}
export function useVelocityComponent(
  initialValue?: Partial<VelocityComponent>
) {
  const state = useComponent<VelocityComponent>("velocity", {
    x: 0,
    y: 0,
    z: 0,
    ...initialValue,
  });
  return state;
}

interface BodyComponent {
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
