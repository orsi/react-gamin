import React, { useRef, useState } from "react";
import {
  Game,
  SetState,
  Sprite,
  createSystem,
  createSystemHook,
  useKey,
} from "react-gamin";

export default function Sokoban() {
  return (
    <Game
      development
      style={{
        backgroundColor: "black",
        height: "480px",
        width: "640px",
      }}
      systems={[MoveSystem2]}
    >
      <SokobanGame />
    </Game>
  );
}

// Create initial map elements
const ASCII_MAP =
  "xxxxxxx\n" +
  "x   h x\n" +
  "x     x\n" +
  "x  o  x\n" +
  "x     x\n" +
  "xxxxxxx";
const GRID_WIDTH = ASCII_MAP.indexOf("\n");
const GRID_HEIGHT = ASCII_MAP.replaceAll("\n", "").length / GRID_WIDTH;
let mapElements = [];
let i = 0;
let row = 0;
while (i < ASCII_MAP.length) {
  const char = ASCII_MAP[i];
  if (mapElements[row] == null) {
    mapElements[row] = [];
  }

  switch (char) {
    case "\n": {
      row++;
      i++;
      continue;
    }
    case "x": {
      mapElements[row].push(
        <Sprite
          src={"/kenney_sokoban-pack/PNG/Default size/Blocks/block_05.png"}
          style={{ maxWidth: "100%" }}
        />
      );
      i++;
      continue;
    }
    case "o": {
      mapElements[row].push(
        <Sprite
          src={"/kenney_sokoban-pack/PNG/Default size/Crates/crate_02.png"}
          style={{ maxWidth: "100%" }}
        />
      );
      i++;
      continue;
    }
    case "h": {
      mapElements[row].push(<Player />);
      i++;
      continue;
    }
    default: {
      mapElements[row].push(<span />);
      i++;
      continue;
    }
  }
}

function SokobanGame() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${GRID_WIDTH}, ${CELL_SIZE}px)`,
        gridTemplateRows: `repeat(${GRID_HEIGHT}, ${CELL_SIZE}px)`,
      }}
    >
      {mapElements?.map((row, i) => {
        return (
          <React.Fragment key={i}>
            {row?.map((col, i) => {
              return <React.Fragment key={i}>{col}</React.Fragment>;
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function Player() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [body, setBody] = useState({ width: CELL_SIZE, height: CELL_SIZE });
  const move = useMoveSystem2({
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

  return (
    <Sprite
      position={{ ...position, z: 0 }}
      src="/kenney_sokoban-pack/PNG/Default size/Player/player_01.png"
      style={{
        maxWidth: "100%",
      }}
    />
  );
}

const CELL_SIZE = 64;

interface MoveSystemComponent {
  body: { width: number; height: number };
  position: { x: number; y: number };
  setPosition: SetState<{ x: number; y: number }>;
}

const MoveSystem2 = createSystem<MoveSystemComponent>();
const useMoveSystem2 = createSystemHook(MoveSystem2, (component, system) => {
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
            y: position.y - CELL_SIZE,
          };
        });
        break;
      }
      case "down": {
        component.setPosition((position) => {
          return {
            ...position,
            y: position.y + CELL_SIZE,
          };
        });
        break;
      }
      case "left": {
        component.setPosition((position) => {
          return {
            ...position,
            x: position.x - CELL_SIZE,
          };
        });
        break;
      }
      case "right": {
        component.setPosition((position) => {
          return {
            ...position,
            x: position.x + CELL_SIZE,
          };
        });
        break;
      }
    }
  };
});
