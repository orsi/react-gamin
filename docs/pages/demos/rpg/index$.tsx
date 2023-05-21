import React, { useContext, useState } from "react";
import {
  Game,
  SetState,
  Sprite,
  SpriteCanvas,
  createSystem,
  experimental_createSystem,
  useKey,
  useSystem,
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
      tiles[y][x] = "grass";
    }
  }
  return (
    <>
      <Man />
      <SpriteCanvas
        sprites={{
          grass: "/grass.png",
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
    position,
    body,
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
  position: { x: number; y: number };
  setPosition: SetState<{ x: number; y: number }>;
  body: { width: number; height: number };
}
const [MoveSystem, useMoveSystem] = experimental_createSystem(
  () => {
    return () => {};
  },
  (component: MoveSystemComponent, context) => {
    // const { components } = context;
    return (direction: "up" | "down" | "left" | "right") => {
      // for (const c of components) {
      //   console.log("c", c);
      // }
      switch (direction) {
        case "up": {
          component.setPosition({
            x: component.position.x,
            y: component.position.y - 16,
          });
          break;
        }
        case "down": {
          component.setPosition({
            x: component.position.x,
            y: component.position.y + 16,
          });
          break;
        }
        case "left": {
          component.setPosition({
            x: component.position.x - 16,
            y: component.position.y,
          });
          break;
        }
        case "right": {
          component.setPosition({
            x: component.position.x + 16,
            y: component.position.y,
          });
          break;
        }
      }
    };
  },
  "MoveSystem"
);
