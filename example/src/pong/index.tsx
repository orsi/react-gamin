import {
  createContext,
  CSSProperties,
  Dispatch,
  forwardRef,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { GameInputState, useInputSystem } from "react-gamin/src/core/Input";

const BALL_SPEED = 5;
const PADDLE_SPEED = 6;

export default function Pong() {
  const ref = useRef<GameState>();

  const playerScoreRef = useRef<IEntity>();
  const opponentScoreRef = useRef<IEntity>();
  const playerPaddleRef = useRef<IEntity>();
  const opponentPaddleRef = useRef<IEntity>();
  const dividerRef = useRef<IEntity>();
  const ballRef = useRef<IEntity>();

  const accumulatorRef = useRef(0);

  useLogic((game, delta) => {
    accumulatorRef.current += delta;
    if (accumulatorRef.current > 1000) {
      accumulatorRef.current = 0;
    }
    const { height, width } = game;

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

    if (
      ballRef.current.get("position").x + ballRef.current.get("body").width >=
      width
    ) {
      // player scores if hitting right wall
      playerScoreRef.current.set(
        "score",
        playerScoreRef.current.get("score") + 1
      );
      resetBall(ballRef.current);
    } else if (ballRef.current.get("position").x <= 0) {
      // opponent scores if hitting left wall
      opponentScoreRef.current.set(
        "score",
        opponentScoreRef.current.get("score") + 1
      );
      resetBall(ballRef.current);
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
    <Game
      style={{
        border: "1px solid #eee",
      }}
      ref={ref}
    >
      <Entity id="player-score" ref={playerScoreRef}>
        <Score x={24} />
      </Entity>
      <Entity id="opponent-score" ref={opponentScoreRef}>
        <Score x={ref.current?.width - 24} />
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
    </Game>
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
  const game = useGame();
  return (
    <div
      style={{
        border: `5px dashed #fff`,
        height: "100%",
        width: `0px`,
        position: "absolute",
        top: "0px",
        left: "0px",
        transform: `translate(${game?.width / 2 - 3}px, 0px)`,
      }}
    ></div>
  );
}

function PlayerPaddle() {
  const { height } = useGame();
  const [body] = useComponent("body", {
    width: 15,
    height: 100,
  });
  const [position, setPosition] = useComponent("position", {
    x: 30,
    y: height / 2 - 50,
  });
  const [velocity] = useComponent("velocity", {
    x: PADDLE_SPEED,
    y: PADDLE_SPEED,
  });

  useLogic(
    (game) => {
      const input = game.input;
      if (input.KEYBOARD_UP || input.GAMEPAD_BUTTON_12) {
        if (position.y <= 0) {
          return;
        }
        setPosition({
          x: position.x,
          y: position.y - velocity.y,
        });
      } else if (input.KEYBOARD_DOWN || input.GAMEPAD_BUTTON_13) {
        if (position.y + body.height >= height) {
          return;
        }
        setPosition({
          x: position.x,
          y: position.y + velocity.y,
        });
      }
    },
    [body, position, velocity]
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
  const { height, width } = useGame();
  const [body] = useComponent("body", {
    width: 15,
    height: 100,
  });
  const [position] = useComponent("position", {
    x: width - 30,
    y: height / 2 - 50,
  });
  const [velocity] = useComponent("velocity", {
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
  const { height, width } = useGame();
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
  const entity = useEntity();

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

// experimental

export function useComponent<T>(name: string, data: T) {
  const entity = useEntity();
  const state = useState<T>(data);
  entity.components[name] = state;
  return state;
}

export function experiment_useComponent<T>(name: string, initialValue: T) {
  const state = useState<T>(initialValue);
  return state;
}
export function useEntity() {
  return useContext(EntityContext);
}

export const EntityContext = createContext<IEntity>(null);
export interface IEntity {
  components: Record<string, [unknown, Dispatch<SetStateAction<unknown>>]>;
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
  const game = useContext(GameContext);

  const get = (type: string) => {
    if (!entityRef.current.components[type]) {
      console.warn(
        `Entity ${entityRef.current.id} does not have component ${type}`
      );
      return;
    }

    return entityRef.current.components[type][0];
  };
  const set = (type: string, data: any) => {
    if (!entityRef.current.components[type]) {
      console.warn(
        `Entity ${entityRef.current.id} does not have component ${type}`
      );
      return;
    }

    entityRef.current.components[type][1](data);
  };

  const entity = {
    id,
    type: type ?? "unknown",
    components: {},
    get,
    set,
  };
  const entityRef = useRef<IEntity>(entity);
  useImperativeHandle(ref, () => entityRef.current);

  useEffect(() => {
    // game.entities.add(entity.current);
    return () => {
      // game.entities.delete(entity.current);
    };
  }, []);

  useEffect(() => {
    // const entity = [...game.entities].find(
    //   (e) => e.id === id
    // ) as unknown as Entity;
    // entity.components = components.reduce((acc, c) => {
    //   acc[c.type] = c.state;
    //   return acc;
    // }, {} as Record<string, ReactState<any>>);
  }, [components]);

  return (
    <EntityContext.Provider value={entityRef.current}>
      {children}
    </EntityContext.Provider>
  );
});

export interface GameState {
  height: number;
  width: number;
  input: GameInputState;
}
export const GameContext = createContext<null | GameState>(null);
interface GameProps extends PropsWithChildren {
  aspectRatio?: string;
  fps?: number;
  style?: CSSProperties;
  systems?: ((game: GameState) => void)[];
}

export const Game = forwardRef<GameState, GameProps>(function Game(props, ref) {
  const { aspectRatio, fps, children, style, systems } = props;

  const FRAME_MS = 1000 / (fps ?? 60);
  const [height, setHeight] = useState(480);
  const [width, setWidth] = useState(640);

  // every rendered component will register themselves
  // into these refs via the game context
  const inputRef = useInputSystem();
  const gameContext = useRef<GameState>({
    height: 480,
    width: 640,
    input: inputRef.current,
    // state: gameState,
    // entities: new Set(),
    // systems: new Set(),
    // stages: new Set(),
    // loops: new Set<Loop>(),
  });
  useImperativeHandle(ref, () => gameContext.current);

  // game update loop
  const store = useStore();
  const lastTimeRef = useRef(0);
  const accumulatorRef = useRef(0);
  const lastFrameRef = useRef(0);
  const update = (time: number) => {
    accumulatorRef.current += time - lastTimeRef.current;
    if (accumulatorRef.current > FRAME_MS) {
      [...store.subscribers].forEach((subscriber) => {
        const context = {
          ...gameContext.current,
          input: inputRef.current,
        };
        subscriber(context, accumulatorRef.current);
      });
      accumulatorRef.current = 0;
      lastTimeRef.current = time;
    }
    lastFrameRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    lastFrameRef.current = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(lastFrameRef.current);
    };
  }, []);

  const gameElementRef = useRef<HTMLDivElement>();
  useLayoutEffect(() => {
    if (gameElementRef.current) {
      const rect = gameElementRef.current.getBoundingClientRect();
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
        <GameContext.Provider
          value={{
            height,
            width,
          }}
        >
          {children}
        </GameContext.Provider>
      </div>
    </div>
  );
});

export function useGame() {
  return useContext(GameContext);
}

interface SystemProps extends PropsWithChildren {
  name?: string;
}
export function System({ name, children }: SystemProps) {
  return <>{children}</>;
}

export function useLogic(
  callback: (game: GameState, delta: number) => void,
  dependencies?: unknown[]
) {
  const store = useStore();
  const subscribe = store.subscribe;

  // memoize callback
  const memoCallback = useCallback(callback, [dependencies]);

  useEffect(() => subscribe(memoCallback), [subscribe, store]);
}

type LogicCallback = (game: GameState, delta: number) => void;
let state: Partial<GameState> = {};
const subscribers: Set<LogicCallback> = new Set();
export function useStore() {
  const get = () => [{ ...state }];
  const set = (newState: Partial<GameState>) => {
    state = {
      ...state,
      ...newState,
    };
  };
  const subscribe = (callback: LogicCallback) => {
    subscribers.add(callback);
    return () => {
      subscribers.delete(callback);
    };
  };
  return {
    get,
    set,
    subscribe,
    subscribers,
  };
}
