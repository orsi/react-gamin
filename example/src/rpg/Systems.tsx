import { useCallback } from "react";
import {
  Body,
  BodyComponent,
  createComponent,
  IEntity,
  Transform,
  TransformComponent,
  useComponent,
  useEntity,
  useQuery,
} from "react-gamin";

const SPEED = 2;
type TDirection = "up" | "down" | "left" | "right";

export function useMove(body: Body, transform: Transform) {
  const entity = useEntity();
  const query = useQuery(TransformComponent, BodyComponent);

  return useCallback(
    (direction: TDirection) => {
      const moveableEntities = query.get();

      let nextPosition = {
        x: 0,
        y: 0,
        z: 0,
        ...transform,
      };

      if (direction === "up") nextPosition.y = nextPosition.y - 1 * SPEED;
      if (direction === "right") nextPosition.x = nextPosition.x + 1 * SPEED;
      if (direction === "down") nextPosition.y = nextPosition.y + 1 * SPEED;
      if (direction === "left") nextPosition.x = nextPosition.x - 1 * SPEED;

      const eXMin = nextPosition.x;
      const eXMax = nextPosition.x + body.width!;
      const eYMin = nextPosition.y;
      const eYMax = nextPosition.y + body.height!;

      const foundEntity = moveableEntities.find((otherEntity) => {
        if (otherEntity._id === entity._id) {
          return false;
        }

        const e2XMin = otherEntity.components.transform.x;
        const e2XMax =
          otherEntity.components.transform.x +
          otherEntity.components.body.width!;
        const e2YMin = otherEntity.components.transform.y;
        const e2YMax =
          otherEntity.components.transform.y +
          otherEntity.components.body.height!;
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

      entity.update(TransformComponent, nextPosition);
    },
    [body, entity, transform]
  );
}

const ActionableComponent = createComponent(
  "actionable",
  (actor: IEntity) => {}
);
export function useActionable(callback: (actor: IEntity) => void) {
  return useComponent("actionable", callback);
}
export function useAction() {
  const entity = useEntity();
  const query = useQuery(
    TransformComponent,
    BodyComponent,
    ActionableComponent
  );

  return useCallback(
    (at: Transform) => {
      const e2 = query.get().find((e) => {
        const e2XMin = e.components.transform.x;
        const e2XMax =
          e.components.transform.x + (e.components.body?.width ?? 0);
        const e2YMin = e.components.transform.y;
        const e2YMax =
          e.components.transform.y + (e.components.body?.height ?? 0);
        const inPosition =
          at.x >= e2XMin && at.x <= e2XMax && at.y >= e2YMin && at.y <= e2YMax;
        return inPosition;
      });

      if (!e2) {
        return;
      }

      if (e2.components.actionable) {
        e2.components.actionable(entity);
      }
    },
    [entity]
  );
}
