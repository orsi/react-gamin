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
} from "react";
import { IEntity, EntityContext, Component } from "./entities";
import { useInputSystem, InputState } from "./input";

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
        return components.every((c) => e.components.hasOwnProperty(c.name));
      }) as IEntity<T>[];
    },
  };
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
