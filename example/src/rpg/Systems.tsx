import {
  createContext,
  PropsWithChildren,
  useRef,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
} from "react";
import { Entity, useEntityContext, useGame } from "react-gamin";
import { Position } from "./Components";

const SPEED = 2;
type TDirection = "up" | "down" | "left" | "right";

interface MoveSystemContext {
  entities: Map<Entity, (actor?: Entity) => void | undefined>;
}
export const MoveSystemContext = createContext<null | MoveSystemContext>(null);
export function MoveSystem({ children }: PropsWithChildren) {
  const ref = useRef({ entities: new Map() });
  return (
    <MoveSystemContext.Provider value={ref.current}>
      {children}
    </MoveSystemContext.Provider>
  );
}
export function useMove(
  setter: Dispatch<SetStateAction<Position>>,
  body: Body
) {
  const entity = useEntityContext();
  const system = useContext(MoveSystemContext);
  const game = useGame();

  useEffect(() => {
    system.entities.set(entity, undefined);
    return () => {
      system.entities.delete(entity);
    };
  }, []);

  return function move(direction: TDirection) {
    const movementEntities = [...game.entities?.values()].filter(
      (gameEntity) => {
        const hasPosition = gameEntity.components?.get("position");
        const hasBody = gameEntity.components?.get("body");
        return hasPosition && hasBody && gameEntity !== entity;
      }
    );

    setter((currentPosition) => {
      let nextPosition = {
        x: 0,
        y: 0,
        z: 0,
        ...currentPosition,
      };

      if (direction === "up") nextPosition.y = nextPosition.y - 1 * SPEED;
      if (direction === "right") nextPosition.x = nextPosition.x + 1 * SPEED;
      if (direction === "down") nextPosition.y = nextPosition.y + 1 * SPEED;
      if (direction === "left") nextPosition.x = nextPosition.x - 1 * SPEED;

      const eXMin = nextPosition.x;
      const eXMax = nextPosition.x + body.width!;
      const eYMin = nextPosition.y;
      const eYMax = nextPosition.y + body.height!;

      const foundEntity = movementEntities.find((otherEntity) => {
        const otherEntityPosition = otherEntity.components.get("position");
        const otherEntityBody = otherEntity.components.get("body");
        if (
          otherEntity === entity ||
          !otherEntityPosition ||
          !otherEntityBody
        ) {
          return false;
        }

        const [ePosition] = otherEntityPosition;
        const [eBody] = otherEntityBody;

        const e2XMin = ePosition.x;
        const e2XMax = ePosition.x + eBody.width!;
        const e2YMin = ePosition.y;
        const e2YMax = ePosition.y + eBody.height!;
        const inRange =
          eXMax >= e2XMin &&
          eXMin <= e2XMax &&
          eYMax >= e2YMin &&
          eYMin <= e2YMax;
        return inRange;
      });

      // in the way
      if (foundEntity) {
        return currentPosition;
      }

      return nextPosition;
    });
  };
}

interface ActionSystemContext {
  entities: Map<Entity, (actor?: Entity) => void | undefined>;
}
export const ActionSystemContext = createContext<null | ActionSystemContext>(
  null
);
export function ActionSystem({ children }: PropsWithChildren) {
  const ref = useRef({ entities: new Map() });
  return (
    <ActionSystemContext.Provider value={ref.current}>
      {children}
    </ActionSystemContext.Provider>
  );
}

export function useAction(callback?: (actor?: Entity) => void) {
  const systemContext = useContext(ActionSystemContext);
  const entity = useEntityContext();

  useEffect(() => {
    systemContext.entities.set(entity, callback);
    return () => {
      systemContext.entities.delete(entity);
    };
  }, [callback]);

  return (at: Position) => {
    const e2 = Array.from(systemContext.entities.keys()).find((otherEntity) => {
      const otherEntityPosition = otherEntity.components.get("position");
      const otherEntityBody = otherEntity.components.get("body");
      if (otherEntity === entity || !otherEntityPosition || !otherEntityBody) {
        return false;
      }

      const [ePosition] = otherEntityPosition;
      const [eBody] = otherEntityBody;

      const e2XMin = ePosition.x;
      const e2XMax = ePosition.x + eBody.width!;
      const e2YMin = ePosition.y;
      const e2YMax = ePosition.y + eBody.height!;
      const inPosition =
        at.x >= e2XMin && at.x <= e2XMax && at.y >= e2YMin && at.y <= e2YMax;
      return inPosition;
    });

    if (!e2) {
      return;
    }

    const callback = systemContext.entities.get(e2);
    if (callback) {
      callback(entity);
    }
  };
}
