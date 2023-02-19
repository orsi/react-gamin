import { useCallback } from "react";
import { Entity } from "./ecs";

const SPEED = 5;

const entities = new Map<string, Entity>();
export function useMovement(entity: Entity) {
  if (!entity.position) {
    throw Error("Entity has no position.");
  }
  if (!entity.body) {
    throw Error("Entity has no body.");
  }

  // save entity to movement system map
  const savedEntity = entities.get(entity.id);
  if (!savedEntity) {
    entities.set(entity.id, entity);
  }

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
      for (const [id, e] of entities.entries()) {
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
