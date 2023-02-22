import {
  createContext,
  PropsWithChildren,
  useCallback,
  useEffect,
} from "react";
import { TEntity, IPosition } from "./Entity";
import { useGameState } from "./Game";

export default function System({ children }: PropsWithChildren) {
  const SystemContext = createContext(null);
  return (
    <SystemContext.Provider value={null}>{children}</SystemContext.Provider>
  );
}

const SPEED = 5;

type TDirection = "up" | "down" | "left" | "right";
export function useMovementSystem(entity: any) {
  const entities = useGameState((game) => game.entities);

  const move = useCallback(
    (direction: TDirection) => {
      if (!entity?.position) {
        return false;
      }

      const [position, setPosition] = entity?.position;

      let nextPosition = { x: 0, y: 0, z: 0, ...position };
      if (direction === "up") nextPosition.y = nextPosition.y - 1 * SPEED;
      if (direction === "right") nextPosition.x = nextPosition.x + 1 * SPEED;
      if (direction === "down") nextPosition.y = nextPosition.y + 1 * SPEED;
      if (direction === "left") nextPosition.x = nextPosition.x - 1 * SPEED;

      const e2 = Array.from(entities).find((e) => {
        if (e === entity) {
          return false;
        }
        if (!e?.position || !e?.body) {
          return false;
        }
        const [ePosition] = e?.position;
        const [eBody] = e?.body;
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
      if (e2 && !e2?.body?.[0]?.solid) {
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

const interactEntities: Record<string, any> = {};
export function useInteractSystem(
  entity: any,
  callback?: (e: TEntity) => void
) {
  useEffect(() => {
    entity.onInteracted = callback ?? function () {};
    interactEntities[entity.id] = entity;
    return () => {
      delete entity.onInteracted;
      delete interactEntities[entity.id];
    };
  }, []);

  return (position: Required<IPosition>) => {
    const iEntity = Object.values(interactEntities).find((e) => {
      if (e === entity) {
        return;
      }

      if (!e?.position || !e?.body) {
        return false;
      }

      const [ePosition] = e?.position;
      const [eBody] = e?.body;
      const xMin = ePosition.x! - eBody.width! / 2;
      const xMax = ePosition.x! + eBody.width! / 2;
      const yMin = ePosition.y! - eBody.height! / 2;
      const yMax = ePosition.y! + eBody.height! / 2;
      const inRange =
        position.x >= xMin &&
        position.x <= xMax &&
        position.y >= yMin &&
        position.y <= yMax;
      return inRange;
    });

    // nothing is there
    if (!iEntity) {
      return;
    }

    iEntity.onInteracted(entity);
  };
}
