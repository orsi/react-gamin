import React, {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
} from "react";
import { IEntity, EntityRef, Position, Body, EntityContext } from "./Entity";
import { ReactState } from "./Game";

const MovementSystemContext = createContext<any>(null);
export function MovementSystem({ children }: PropsWithChildren) {
  const entities = useRef(new Set<EntityRef<any>>());

  const get = () => [...entities.current];
  const add = (entity: EntityRef<any>) => entities.current.add(entity);
  const remove = (entity: EntityRef<any>) => entities.current.delete(entity);

  return (
    <MovementSystemContext.Provider
      value={{
        get,
        add,
        remove,
      }}
    >
      {children}
    </MovementSystemContext.Provider>
  );
}
const SPEED = 2;
type TDirection = "up" | "down" | "left" | "right";
export function useMovementSystem(
  position: Position,
  setPosition: Dispatch<SetStateAction<Position>>,
  body: Body
) {
  const entityRef = useContext(EntityContext);

  const context = useContext(MovementSystemContext);
  const { get, add, remove } = context;
  const entities = get() as EntityRef<any>[];
  useEffect(() => {
    add(entityRef);
    () => {
      remove(entityRef);
    };
  }, []);

  const move = (direction: TDirection) => {
    let nextPosition = {
      x: 0,
      y: 0,
      z: 0,
      ...position,
    };
    if (direction === "up") nextPosition.y = nextPosition.y - 1 * SPEED;
    if (direction === "right") nextPosition.x = nextPosition.x + 1 * SPEED;
    if (direction === "down") nextPosition.y = nextPosition.y + 1 * SPEED;
    if (direction === "left") nextPosition.x = nextPosition.x - 1 * SPEED;

    const eXMin = nextPosition.x;
    const eXMax = nextPosition.x + body.width!;
    const eYMin = nextPosition.y;
    const eYMax = nextPosition.y + body.height!;

    const foundEntity = Array.from(entities).find((otherEntity) => {
      if (
        otherEntity === entityRef ||
        !otherEntity.current.position ||
        !otherEntity.current.body
      ) {
        return false;
      }

      const [ePosition] = otherEntity.current.position;
      const [eBody] = otherEntity.current.body;

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

    // nothing is there
    if (!foundEntity) {
      setPosition(nextPosition);
      return true;
    }

    // entity there is not solid
    if (foundEntity && !foundEntity.current.body?.[0]?.solid) {
      setPosition(nextPosition);
      return true;
    }

    // nope
    return false;
  };

  return move;
}

const InteractSystemContext = createContext<any>(null);
export function InteractSystem({ children }: PropsWithChildren) {
  const entities = useRef(new Set());

  return (
    <InteractSystemContext.Provider
      value={{
        get: () => [...entities.current],
        add: (entity: IEntity) => entities.current.add(entity),
        remove: (entity: IEntity) => entities.current.delete(entity),
      }}
    >
      {children}
    </InteractSystemContext.Provider>
  );
}

export function useInteractSystem(callback?: () => void) {
  const entityRef = useContext(EntityContext);
  const context = useContext(InteractSystemContext);
  if (!context) {
    throw Error("System context not found. Did you create the system?");
  }
  const { get, add, remove } = context;
  const entities = get() as EntityRef<any>[];

  useEffect(() => {
    entityRef.current.onInteracted = callback ?? function () {};
    add(entityRef);
    () => {
      delete entityRef.current.onInteracted;
      remove(entityRef);
    };
  }, []);

  return () => {
    const [position] = entityRef.current.position;
    const foundEntity = Object.values(entities).find((otherEntity) => {
      if (
        otherEntity === entityRef ||
        !otherEntity.current?.position ||
        !otherEntity.current?.body
      ) {
        return;
      }

      const [ePosition] = otherEntity.current?.position;
      const [eBody] = otherEntity.current?.body;
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
    if (!foundEntity) {
      return;
    }

    foundEntity.onInteracted(entityRef);
  };
}
