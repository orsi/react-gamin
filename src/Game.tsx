import {
  useState,
  useEffect,
  createContext,
  useRef,
  ReactNode,
  PropsWithChildren,
  useCallback,
  Dispatch,
  SetStateAction,
  useContext,
  useSyncExternalStore,
} from "react";
import Character1 from "./Character1";

const SPEED = 5;

type Component = [any, Dispatch<SetStateAction<any>>];
type EntityComponent = {
  [key: string]: Component;
};
type EntityId = {
  id: string;
};
type Entity = EntityId & { [key: string]: any };
export function useEntity(id: string) {
  const [entity] = useState({
    id,
  });
  return entity;
}

interface Body {
  solid: boolean;
}
export function useBody(entity: Entity) {
  if (!entity) {
    throw Error("Entity does not exist.");
  }
  const body = useState<Body>({ solid: true });
  entity.body = body;
  return body;
}

interface Position {
  x: number;
  y: number;
  z: number;
}
export function usePosition(entity: Entity, initialPosition: Position) {
  if (!entity) {
    throw Error("Entity does not exist.");
  }
  const position = useState<Position>({
    x: initialPosition?.x ?? 0,
    y: initialPosition?.y ?? 0,
    z: initialPosition?.z ?? 0,
  });
  entity.position = position;
  return position;
}

const movementMap = new Map<string, Entity>();
export function useMovement(entity: Entity) {
  if (!entity.position || !entity.body) {
    throw Error("Entity has no position or body.");
  }

  // save entity to movement system map
  const [position] = entity.position;
  const at = `${position.x}-${position.y}-${position.z}`;
  movementMap.set(at, entity);

  // function used to ask system to move
  const move = useCallback(
    (direction: "up" | "right" | "down" | "left") => {
      const currentPosition = entity.position[0];
      let nextPosition = { ...currentPosition };
      if (direction === "up") nextPosition.y = nextPosition.y - 1 * SPEED;
      if (direction === "right") nextPosition.x = nextPosition.x + 1 * SPEED;
      if (direction === "down") nextPosition.y = nextPosition.y + 1 * SPEED;
      if (direction === "left") nextPosition.x = nextPosition.x - 1 * SPEED;

      const currentPositionKey = `${currentPosition.x}-${currentPosition.y}-${currentPosition.z}`;
      const nextPositionKey = `${nextPosition.x}-${nextPosition.y}-${nextPosition.z}`;
      const entityAtToPosition = movementMap.get(nextPositionKey);
      if (entityAtToPosition && entityAtToPosition.body[0].solid) {
        return false;
      } else {
        entity.position[1](nextPosition);
        movementMap.delete(currentPositionKey);
        movementMap.set(nextPositionKey, entity);
        return true;
      }
    },
    [entity]
  );

  return move;
}

const gameState = {
  test: 123,
  keys: {
    up: false,
    right: false,
    down: false,
    left: false,
  },
};

export const GameContext = createContext<any>(gameState);

export default function Game() {
  const [width, setWidth] = useState(640);
  const [height, setHeight] = useState(480);
  const [gameState, setGameState] = useState({
    test: Math.random() * 100,
    keys: {
      up: false,
      right: false,
      down: false,
      left: false,
    },
  });

  useEffect(() => {
    function onWindowResize() {
      const bounds = document.body.getBoundingClientRect();
      setHeight(bounds.height);
      setWidth(bounds.width);
    }
    onWindowResize();
    return () => {
      window.removeEventListener("resize", onWindowResize);
    };
  }, []);

  return (
    <GameContext.Provider value={gameState}>
      <GameInputProvider>
        <div
          style={{
            position: "relative",
            height,
            width,
          }}
        >
          <FirstScene />
        </div>
      </GameInputProvider>
    </GameContext.Provider>
  );
}

function FirstScene() {
  return (
    <div
      style={{
        position: "relative",
      }}
    >
      <DefaultMap />
      <Character1 />
    </div>
  );
}

import overworldImage from "./assets/Overworld.png";
import useSpriteSheet from "./components/useSpriteSheet";
import { GameInputProvider } from "./components/Input";
function DefaultMap() {
  const mapSprites = useSpriteSheet({
    cellWidth: 16,
    cellHeight: 16,
    width: 640,
    height: 576,
    src: overworldImage,
  });

  function Tile(sprites: ReactNode[]) {
    const entity = useEntity("tile");
    const body = useBody(entity);
    const [position, setPosition] = usePosition(entity, {
      x: 240,
      y: 240,
      z: 0,
    });
    const move = useMovement(entity);

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: "absolute",
          transform: `translate(${position.x}px, ${position.y}px)`,
        }}
      >
        {sprites}
      </div>
    );
  }

  const boxTitle = Tile([mapSprites[30], mapSprites[70]]);
  return <>{boxTitle}</>;
}

function useFrame(effect: () => void) {
  const frame = useRef(0);
  useEffect(() => {
    frame.current = requestAnimationFrame(() => {
      effect();
    });

    return () => {
      if (frame.current) {
        cancelAnimationFrame(frame.current);
      }
    };
  }, []);
}

function Animation({
  sprites,
  durationMs,
  animate = true,
  reset = true,
  delay = 0,
}: {
  sprites: any[];
  durationMs: number;
  animate?: boolean;
  reset?: boolean;
  delay?: number;
}) {
  const frameDuration = durationMs / sprites.length;
  const [currentFrame, setCurrentFrame] = useState(0);

  useEffect(() => {
    if (!animate && reset) {
      setCurrentFrame(0);
    }

    let interval = setInterval(() => {
      setCurrentFrame((value) => {
        const nextFrame = (value + 1) % sprites.length;
        return animate ? nextFrame : value;
      });
    }, frameDuration);

    return () => {
      clearInterval(interval);
    };
  }, [animate, reset]);

  return <>{sprites[currentFrame]}</>;
}
