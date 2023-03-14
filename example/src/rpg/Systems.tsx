import {
  createContext,
  PropsWithChildren,
  useRef,
  useContext,
  useEffect,
  useCallback,
} from "react";
import {
  BodyComponent,
  EntityContext,
  Transform,
  TransformComponent,
  useEntity,
  useGame,
} from "react-gamin";

const SPEED = 2;
type TDirection = "up" | "down" | "left" | "right";

interface MoveSystemContext {
  entities: Map<string, (actor?: EntityContext) => void | undefined>;
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
export function useMove() {
  const game = useGame();
  const system = useContext(MoveSystemContext);
  const entity = useEntity();

  useEffect(() => {
    system.entities.set(entity._id, undefined);
    return () => {
      system.entities.delete(entity._id);
    };
  }, []);

  return useCallback(
    (direction: TDirection) => {
      const [currentPosition, setPosition] =
        entity.getComponent(TransformComponent);
      const [currentBody] = entity.getComponent(BodyComponent);

      const movementEntities = game
        .getEntities([TransformComponent, BodyComponent])
        .filter((e) => {
          const hasPosition = e.getComponent(TransformComponent);
          const hasBody = e.getComponent(BodyComponent);
          return hasPosition && hasBody && e !== entity;
        });

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
      const eXMax = nextPosition.x + currentBody.width!;
      const eYMin = nextPosition.y;
      const eYMax = nextPosition.y + currentBody.height!;

      const foundEntity = movementEntities.find((otherEntity) => {
        const [ePosition] = otherEntity.getComponent(TransformComponent);
        const [eBody] = otherEntity.getComponent(BodyComponent);
        if (otherEntity === entity || !ePosition) {
          return false;
        }

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
        return;
      }

      setPosition(nextPosition);
    },
    [game, system, entity]
  );
}

interface ActionSystemContext {
  entities: Map<string, (actor?: EntityContext) => void | undefined>;
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

export function useAction(callback?: (actor?: EntityContext) => void) {
  const game = useGame();
  const system = useContext(ActionSystemContext);
  const entity = useEntity();

  useEffect(() => {
    system.entities.set(entity._id, callback);
    return () => {
      system.entities.delete(entity._id);
    };
  }, [callback, entity, system]);

  return useCallback(
    (at: Transform) => {
      const e2 = game
        .getEntities([TransformComponent, BodyComponent])
        .find((e) => {
          const [ePosition] = e.getComponent(TransformComponent);
          const [eBody] = e.getComponent(BodyComponent);
          if (e === entity || !ePosition) {
            return false;
          }

          const e2XMin = ePosition.x;
          const e2XMax = ePosition.x + (eBody?.width ?? 0);
          const e2YMin = ePosition.y;
          const e2YMax = ePosition.y + (eBody?.height ?? 0);
          const inPosition =
            at.x >= e2XMin &&
            at.x <= e2XMax &&
            at.y >= e2YMin &&
            at.y <= e2YMax;
          return inPosition;
        });

      if (!e2) {
        return;
      }

      const callback = system.entities.get(e2._id);
      if (callback) {
        callback(entity);
      }
    },
    [game, system, entity]
  );
}
