import {
  createContext,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
} from "react";
import { TEntity, IPosition, EntityContext } from "./Entity";

type System = {};
export const SystemContext = createContext<System>({
  id: "default",
});
type SystemProps = {
  key: React.Key;
  children?: ReactNode;
};
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
        add: (entity: TEntity) => entities.current.add(entity),
        remove: (entity: TEntity) => entities.current.delete(entity),
      }}
    >
      {children}
    </MovementSystemContext.Provider>
  );
}
const SPEED = 5;
type TDirection = "up" | "down" | "left" | "right";
export function useMovementSystem() {
  const { current: entity } = useContext(EntityContext);
  const context = useContext(MovementSystemContext);
  if (!context) {
    throw Error("System context not found. Did you create the system?");
  }
  const { get, add, remove } = context;
  const entities = get();

  useEffect(() => {
    add(entity);
    console.log("move entities", get());
    () => {
      remove(entity);
    };
  }, []);

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

        const xMin = ePosition.x;
        const xMax = ePosition.x + eBody.width!;
        const yMin = ePosition.y;
        const yMax = ePosition.y + eBody.height!;
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

const InteractSystemContext = createContext<any>(null);
export function InteractSystem({ children }: PropsWithChildren) {
  const entities = useRef(new Set());

  return (
    <InteractSystemContext.Provider
      value={{
        get: () => [...entities.current],
        add: (entity: TEntity) => entities.current.add(entity),
        remove: (entity: TEntity) => entities.current.delete(entity),
      }}
    >
      {children}
    </InteractSystemContext.Provider>
  );
}

export function useInteractSystem(callback?: (e: TEntity) => void) {
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
    console.log("interact entities", get());
    () => {
      delete entity.onInteracted;
      remove(entity);
    };
  }, []);

  return (position: Required<IPosition>) => {
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
