import { useCallback } from "react";
import { useEntityState, useGameState } from "./Game";

const SPEED = 5;

type TDirection = "up" | "down" | "left" | "right";
export function useMovement() {
  const entity = useEntityState();
  const entities = useGameState((game) => game.entities);

  const move = useCallback(
    (direction: TDirection) => {
      if (!entity?.components?.position) {
        return false;
      }

      const [position, setPosition] = entity?.components?.position;

      let nextPosition = { x: 0, y: 0, z: 0, ...position };
      if (direction === "up") nextPosition.y = nextPosition.y - 1 * SPEED;
      if (direction === "right") nextPosition.x = nextPosition.x + 1 * SPEED;
      if (direction === "down") nextPosition.y = nextPosition.y + 1 * SPEED;
      if (direction === "left") nextPosition.x = nextPosition.x - 1 * SPEED;

      const e2 = Array.from(entities).find((e) => {
        if (e === entity) {
          return false;
        }
        if (!e?.components?.position || !e?.components?.body) {
          return false;
        }
        const [ePosition] = e?.components?.position;
        const [eBody] = e?.components?.body;
        const xMin = ePosition.x! - eBody.width! / 2;
        const xMax = ePosition.x! + eBody.width! / 2;
        const yMin = ePosition.y! - eBody.height! / 2;
        const yMax = ePosition.y! + eBody.height! / 2;
        const inRange =
          nextPosition.x >= xMin &&
          nextPosition.x <= xMax &&
          nextPosition.y >= yMin &&
          nextPosition.y <= yMax;
        return inRange;
      });

      // nothing is there
      if (!e2) {
        setPosition(nextPosition);
        return true;
      }

      // entity there is not solid
      if (e2 && !e2?.components?.body?.[0]?.solid) {
        setPosition(nextPosition);
        return true;
      }

      // nope
      return false;
    },
    [entity, entities]
  );

  return move;
}
