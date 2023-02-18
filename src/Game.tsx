import { useState, useEffect, createContext, useCallback } from "react";
import Character1 from "./Character";
import Character2 from "./Character2";
import { GameInputProvider } from "./components/Input";
import { DefaultMap } from "./DefaultMap";
import { Entity } from "./ecs";

const SPEED = 5;

const entities = new Set<Entity>();
export function useMovement(entity: Entity) {
  if (!entity.position) {
    throw Error("Entity has no position.");
  }
  if (!entity.body) {
    throw Error("Entity has no body.");
  }

  // save entity to movement system map
  entities.add(entity);

  // function used to ask system to move
  const move = useCallback(
    (direction: "up" | "right" | "down" | "left") => {
      const currentPosition = entity.position[0];
      let nextPosition = { ...currentPosition };
      if (direction === "up") nextPosition.y = nextPosition.y - 1 * SPEED;
      if (direction === "right") nextPosition.x = nextPosition.x + 1 * SPEED;
      if (direction === "down") nextPosition.y = nextPosition.y + 1 * SPEED;
      if (direction === "left") nextPosition.x = nextPosition.x - 1 * SPEED;

      let entityInPosition;
      for (const e of entities) {
        if (e.id === entity.id) {
          continue;
        }

        const xMin = e.position[0].x - e.body[0].width / 2;
        const xMax = e.position[0].x + e.body[0].width / 2;
        const yMin = e.position[0].y - e.body[0].height / 2;
        const yMax = e.position[0].y + e.body[0].height / 2;
        const inRange =
          nextPosition.x >= xMin &&
          nextPosition.x <= xMax &&
          nextPosition.y >= yMin &&
          nextPosition.y <= yMax;
        entityInPosition = inRange ? e : undefined;
      }

      // nothing is there
      if (!entityInPosition) {
        entity.position[1](nextPosition);
        return true;
      }

      // entity there is not solid
      if (entityInPosition && !entityInPosition.body[0].solid) {
        entity.position[1](nextPosition);
        return true;
      }

      // nope
      return false;
    },
    [entity]
  );

  return move;
}

export default function Game() {
  const [width, setWidth] = useState(640);
  const [height, setHeight] = useState(480);

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
      <Character2 />
    </div>
  );
}
