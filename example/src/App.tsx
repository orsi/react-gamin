import { Fragment, useEffect, useState } from "react";
import {
  AnimatedSpriteSheet,
  Game,
  OtherSystem,
  Sprite,
  TestSystem,
  useAudio,
  useKey,
  useOtherSystem,
  useScript,
  useTestSystem,
} from "react-gamin";

export default function App() {
  const [entities, setEntities] = useState([<TheGuy />, <TheOtherGuy />]);

  const removeDude = ({ key }: KeyboardEvent) => {
    if (key === "1") {
      setEntities([...entities.slice(0, -1)]);
    }
  };

  useEffect(() => {
    window.addEventListener("keyup", removeDude);
    return () => {
      window.removeEventListener("keyup", removeDude);
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
      <Game development systems={[TestSystem, OtherSystem]}>
        {entities.map((e, index) => (
          <Fragment key={index}>{e}</Fragment>
        ))}
      </Game>
    </div>
  );
}

function TheOtherGuy() {
  const [id] = useState(crypto.randomUUID());
  const [position, setPosition] = useState({
    x: Math.random() * 200,
    y: Math.random() * 200,
    z: 0,
  });

  useOtherSystem(id);
  useTestSystem(position);
  useScript((time) => {
    // console.log("word", time, id);
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

  // useTestSystem(position, "hi");
  const test = useTestSystem(position);

  // audio
  const sample = useAudio("/beep-03.wav");
  const satie = useAudio("/Gymnopedie_No._1.mp3");
  useKey("w", () => {
    setPosition((position) => ({
      ...position,
      y: position.y - 5,
    }));
  });

  useKey("s", () => {
    setPosition((position) => ({
      ...position,
      y: position.y + 5,
    }));
  });

  useKey("a", () => {
    if (!test()) {
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
