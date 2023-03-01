import {
  Children,
  createContext,
  forwardRef,
  useContext,
  useImperativeHandle,
  useState,
} from "react";
import { Entity } from "./Entity";
import { GameContext } from "./Game";

export interface StageRef {
  [key: string]: any;
}
interface Stage {
  [key: string]: any;
}
export const StageContext = createContext<null | Stage>(null);
interface StageProps {
  name: string;
  children?: JSX.Element | JSX.Element[];
}
export const Stage = forwardRef<StageRef, StageProps>(function Stage(
  { children, name },
  ref
) {
  const game = useContext(GameContext);

  // rendering logic for dynamically adding and removing
  // entities from the stage. On initial render, we wrap all
  // children in an <Entity /> component so they can mount and
  // setup themselves to the stage. On all successive renders,
  // the stage will determine if entities should be rerendered, removed,
  // or new ones added
  const [entities, setEntities] = useState<any[]>(
    Children.map(children, (child, i) => {
      const id = `entity-${i}`;
      return {
        id,
        element: (
          <Entity key={id} id={id}>
            {child}
          </Entity>
        ),
      };
    })
  );

  const addEntity = (entity: JSX.Element) => {
    setEntities((entities) => {
      const id = `entity-${entities.length}`;
      return [
        ...entities,
        {
          id,
          element: (
            <Entity key={id} id={id}>
              {entity}
            </Entity>
          ),
        },
      ];
    });
  };

  const removeEntity = (id: string) => {
    setEntities(entities.filter((entity) => entity.id !== id));
  };

  useImperativeHandle(ref, () => ({
    addEntity,
    removeEntity,
  }));

  return (
    <StageContext.Provider
      value={{
        addEntity,
        removeEntity,
      }}
    >
      {entities.map((entity) => entity.element)}
    </StageContext.Provider>
  );
});

interface MissingStageProps {
  name?: string;
}
export function MissingStage({ name }: MissingStageProps) {
  return <h1 style={{ textAlign: "center" }}>Missing Stage "{name}"</h1>;
}

export function useStageContext() {
  return useContext(StageContext);
}
