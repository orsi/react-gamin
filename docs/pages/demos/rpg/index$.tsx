import React, { useContext, useRef, useState } from "react";
import {
  Game,
  SetState,
  Sprite,
  SpriteCanvas,
  createSystem,
  useKey,
} from "react-gamin";

export default function RPG() {
  return (
    <Game development fps={1000 / 60} systems={[MoveSystem]}>
      <Outdoors />
    </Game>
  );
}

function Outdoors() {
  const cols = 30;
  const rows = 30;
  let tiles = [];
  for (let y = 0; y < rows; y++) {
    tiles[y] = [];
    for (let x = 0; x < cols; x++) {
      tiles[y][x] = Math.random() > 0.5 ? "grass" : "dark-grass";
    }
  }
  return (
    <>
      <Man />
      <SpriteCanvas
        sprites={{
          grass: "/grass.png",
          "dark-grass": "/dark-grass.png",
        }}
        tiles={{
          width: 16,
          height: 16,
          map: tiles,
        }}
      />
    </>
  );
}

function Man() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [body, setBody] = useState({ width: 16, height: 16 });
  const move = useMoveSystem({
    body,
    position,
    setPosition,
  });

  useKey("w", () => {
    move("up");
  });

  useKey("s", () => {
    move("down");
  });

  useKey("a", () => {
    move("left");
  });

  useKey("d", () => {
    move("right");
  });

  return <Sprite position={{ ...position, z: 0 }} src="/man.png" />;
}

interface MoveSystemComponent {
  body: { width: number; height: number };
  position: { x: number; y: number };
  setPosition: SetState<{ x: number; y: number }>;
}
const [MoveSystem, useMoveSystem] = createSystem(
  () => {
    return () => {};
  },
  (component: MoveSystemComponent) => {
    const lastUpdateRef = useRef(Date.now());

    return (direction: "up" | "down" | "left" | "right") => {
      const now = Date.now();
      if (now - lastUpdateRef.current < 250) {
        return;
      }
      lastUpdateRef.current = now;

      switch (direction) {
        case "up": {
          component.setPosition((position) => {
            return {
              ...position,
              y: position.y - 16,
            };
          });
          break;
        }
        case "down": {
          component.setPosition((position) => {
            return {
              ...position,
              y: position.y + 16,
            };
          });
          break;
        }
        case "left": {
          component.setPosition((position) => {
            return {
              ...position,
              x: position.x - 16,
            };
          });
          break;
        }
        case "right": {
          component.setPosition((position) => {
            return {
              ...position,
              x: position.x + 16,
            };
          });
          break;
        }
      }
    };
  },
  "MoveSystem"
);
