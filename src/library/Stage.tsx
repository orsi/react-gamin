import {
  Children,
  createContext,
  ReactPortal,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import MiloChar from "../entities/MiloChar";
import { Entity } from "./Entity";
import { GameContext } from "./Game";
import { useGameInput } from "./Input";

interface Stage {
  [key: string]: any;
}
export const StageContext = createContext<null | Stage>(null);
interface StageProps {
  name: string;
  children?: JSX.Element | JSX.Element[];
}
export default function Stage({ children, name: id }: StageProps) {
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

  useGameInput((input) => {
    if (input.KEYBOARD_SPACE) {
      addEntity(<MiloChar x={Math.random() * 400} y={Math.random() * 400} />);
    }
  });

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
}

interface MissingStageProps {
  name?: string;
}
export function MissingStage({ name }: MissingStageProps) {
  return <h1 style={{ textAlign: "center" }}>Missing Stage "{name}"</h1>;
}
