import {
  Dispatch,
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  AnimatedSpriteSheet,
  Game,
  SetState,
  Sprite,
  useSystem,
  useAudio,
  useKey,
  useScript,
  GameContext,
} from "react-gamin";

export default function App() {
  const [entities, setEntities] = useState([<TheGuy />, <TheOtherGuy />]);

  useEffect(() => {
    const interval = setInterval(() => {
      // entities.pop();
      // setEntities([...entities]);
    }, 2000);
    return () => {
      clearInterval(interval);
    };
  }, [entities]);

  return (
    <div
      style={{
        height: "100%",
      }}
      onMouseDown={() => {
        setEntities([...entities, <TheOtherGuy />]);
      }}
    >
      <Game development>
        {entities.map((e, index) => (
          <Fragment key={index}>{e}</Fragment>
        ))}
      </Game>
    </div>
  );
}

const useMoveSystem = <T extends { x: number; y: number; z: number }>(
  position: T
) => {
  const gameContext = useContext(GameContext);

  const move = (direction: "left" | "up") => {
    const positions = gameContext["move"].filter((i) => i !== position);
    const canMove =
      direction === "left" &&
      positions.every((p) => {
        return p.x + 30 < position.x;
      });

    return canMove;
  };

  useEffect(() => {
    if (gameContext["move"] == null) {
      gameContext["move"] = [];
    }
    gameContext["move"] = [...gameContext["move"], position];
    return () => {
      const index = gameContext["move"].findIndex((i: T) => i === position);
      gameContext["move"].splice(index, 1);
      gameContext["move"] = [...gameContext["move"]];
    };
  }, [position]);

  return move;
};

function TheOtherGuy() {
  const [id] = useState(crypto.randomUUID());
  const [position, setPosition] = useState({
    x: Math.random() * 200,
    y: Math.random() * 200,
    z: 0,
  });

  useMoveSystem(position);

  useScript(() => {
    // console.log("word", id);
  });

  return (
    <Sprite
      position={position}
      rotation={{
        x: 0,
        y: 1,
        z: 0,
        deg: 180,
      }}
      src="/monster-sprite.png"
    />
  );
}

function TheGuy() {
  const [position, setPosition] = useState({
    x: 500,
    y: 200,
    z: 0,
  });
  const [rotation, setRotation] = useState({ x: 0.5, y: 0.5, z: 0, deg: 45 });
  const [scale, setScale] = useState({ x: 1, y: 2, z: 0.5 });

  const move = useMoveSystem(position);

  // audio
  const sample = useAudio("/beep-03.wav");
  const satie = useAudio("/Gymnopedie_No._1.mp3");
  useKey("w", () => {
    if (move("up")) {
      setPosition((position) => ({
        ...position,
        y: position.y - 5,
      }));
    }
  });

  useKey("s", () => {
    setPosition((position) => ({
      ...position,
      y: position.y + 5,
    }));
  });

  useKey("a", () => {
    if (move("left")) {
      setPosition((position) => ({
        ...position,
        x: position.x - 5,
      }));
    }
  });

  useKey("d", () => {
    setPosition((position) => ({
      ...position,
      x: position.x + 5,
    }));
  });

  return (
    <>
      <AnimatedSpriteSheet
        position={position}
        src="/monster-sprite-sheet.png"
        animation="walk"
        animations={{
          walk: [
            {
              sprite: "sprite1",
            },
            {
              sprite: "sprite2",
            },
            {
              sprite: "sprite3",
            },
          ],
        }}
        sprites={{
          sprite1: {
            x: 0,
            y: 0,
            width: 24,
            height: 32,
          },
          sprite2: {
            x: 24,
            y: 0,
            width: 24,
            height: 32,
          },
          sprite3: {
            x: 48,
            y: 0,
            width: 24,
            height: 32,
          },
        }}
      />
    </>
  );
}
