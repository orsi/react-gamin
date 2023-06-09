import React, { useRef, useState } from "react";
import {
  Game,
  SetState,
  Sprite,
  SpriteCanvas,
  createSystem,
  createSystemHook,
  useKey,
} from "react-gamin";

export default function Sokoban() {
  return (
    <Game development systems={[MoveSystem2]}>
      <Outdoors />
    </Game>
  );
}

const ASCII_MAP =
  "xxxxxxxxxx\n" +
  "x      h x\n" +
  "x        x\n" +
  "x  o     x\n" +
  "x        x\n" +
  "xxxxxxxxxx";

function Outdoors() {
  return (
    <TileMap
      map={ASCII_MAP}
      tiles={{
        x: (
          <Sprite
            src={"/kenney_sokoban-pack/PNG/Default size/Blocks/block_05.png"}
            style={{ maxWidth: "100%" }}
          />
        ),
        h: (
          <Sprite
            src={"/kenney_sokoban-pack/PNG/Default size/Player/player_01.png"}
            style={{ maxWidth: "100%" }}
          />
        ),
        o: (
          <Sprite
            src={"/kenney_sokoban-pack/PNG/Default size/Crates/crate_02.png"}
            style={{ maxWidth: "100%" }}
          />
        ),
        " ": <span />,
      }}
      cell={{
        height: 32,
        width: 32,
      }}
    />
  );
}

function TileMap({ cell, map, tiles }: any) {
  const gridWidth = map.indexOf("\n");
  const gridHeight = map.replaceAll("\n", "").length / gridWidth;
  let elements = [];
  let i = 0;
  let row = 0;
  while (i < map.length) {
    const char = map[i];
    if (elements[row] == null) {
      elements[row] = [];
    }

    if (char === "\n") {
      row++;
      i++;
      continue;
    }

    const tile = tiles[char];
    if (tile) {
      elements[row].push(tile);
    } else {
      console.warn(
        `%cNo tile specificed for ${char} in map\n${map}`,
        "font-family: monospace"
      );
      elements[row].push(<span />);
    }
    i++;
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${gridWidth}, ${cell.width}px)`,
        gridTemplateRows: `repeat(${gridHeight}, ${cell.height}px)`,
      }}
    >
      {elements?.map((row, i) => {
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

function Man() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [body, setBody] = useState({ width: 16, height: 16 });
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

  return <Sprite position={{ ...position, z: 0 }} src="/man.png" />;
}

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
});
