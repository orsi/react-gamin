import {
  createContext,
  PropsWithChildren,
  ReactNode,
  useContext,
  useEffect,
  useId,
  useRef,
} from "react";
import {
  EntityId,
  EntityContext,
  EntityWithComponent,
  Position,
  Body,
} from "./Entity";

interface System {}
export const SystemContext = createContext<System>({
  id: "default",
});
interface SystemProps {
  key: React.Key;
  children?: ReactNode;
}
export default function System({ children }: SystemProps) {
  const System = useRef({
    id: useId(),
  });
  return (
    <SystemContext.Provider value={System}>{children}</SystemContext.Provider>
  );
}

const MovementSystemContext = createContext<any>(null);
export function MovementSystem({ children }: PropsWithChildren) {
  const entities = useRef(new Set());
  return (
    <MovementSystemContext.Provider
      value={{
        get: () => [...entities.current],
        add: (entity: EntityId) => entities.current.add(entity),
        remove: (entity: EntityId) => entities.current.delete(entity),
      }}
    >
      {children}
    </MovementSystemContext.Provider>
  );
}
const SPEED = 2;
type TDirection = "up" | "down" | "left" | "right";
export function useMovementSystem() {
  const { current } = useContext(EntityContext);
  const entity = current as EntityWithComponent<Position> &
    EntityWithComponent<Body>;
  if (!entity || !entity.position || !entity.body) {
    throw Error("No entity found.");
  }
  if (!entity.position) {
    throw Error("Entity does not have a position.");
  }
  if (!entity.body) {
    throw Error("Entity does not have a body.");
  }
  const [position, setPosition] = entity.position;
  const [body, setBody] = entity?.body;
  const context = useContext(MovementSystemContext);
  if (!context) {
    throw Error("System context not found. Did you create the system?");
  }
  const { get, add, remove } = context;
  const entities = get();

  useEffect(() => {
    add(entity);
    () => {
      remove(entity);
    };
  }, []);

  const move = (direction: TDirection) => {
    let nextPosition = { x: 0, y: 0, z: 0, ...position };
    if (direction === "up") nextPosition.y = nextPosition.y - 1 * SPEED;
    if (direction === "right") nextPosition.x = nextPosition.x + 1 * SPEED;
    if (direction === "down") nextPosition.y = nextPosition.y + 1 * SPEED;
    if (direction === "left") nextPosition.x = nextPosition.x - 1 * SPEED;

    const eXMin = nextPosition.x;
    const eXMax = nextPosition.x + body.width!;
    const eYMin = nextPosition.y;
    const eYMax = nextPosition.y + body.height!;

    const e2 = Array.from(entities).find((e) => {
      if (e === entity) {
        return false;
      }
      if (!e?.position || !e?.body) {
        return false;
      }
      const [ePosition] = e?.position;
      const [eBody] = e?.body;

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
        add: (entity: EntityId) => entities.current.add(entity),
        remove: (entity: EntityId) => entities.current.delete(entity),
      }}
    >
      {children}
    </InteractSystemContext.Provider>
  );
}

export function useInteractSystem(callback?: (e: EntityId) => void) {
  const { current: entity } = useContext(EntityContext);
  const context = useContext(InteractSystemContext);
  if (!context) {
    throw Error("System context not found. Did you create the system?");
  }
  const { get, add, remove } = context;
  const entities = get();

  useEffect(() => {
    entity.onInteracted = callback ?? function () {};
    add(entity);
    () => {
      delete entity.onInteracted;
      remove(entity);
    };
  }, []);

  return () => {
    const [position] = entity.position;
    const iEntity = Object.values(entities).find((e) => {
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
