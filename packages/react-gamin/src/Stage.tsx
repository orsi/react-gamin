import {
  Children,
  createContext,
  forwardRef,
  memo,
  ReactNode,
  useContext,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { Entity } from "./Entity";

export interface StageRef {
  [key: string]: any;
}
interface Stage {
  [key: string]: any;
}
export const StageContext = createContext<null | Stage>(null);
interface StageProps {
  name: string;
  children?: ReactNode;
}
export const Stage = forwardRef<StageRef, StageProps>(function Stage(
  { children, name },
  ref
) {
  // rendering logic for dynamically adding and removing
  // entities from the stage. On initial render, we wrap all
  // children in an <Entity /> component so they can mount and
  // setup themselves to the stage. On all successive renders,
  // the stage will determine if entities should be rerendered, removed,
  // or new ones added

  const initialEntities = useMemo(() => {
    return Children.map(children, (child, i) => {
      return (
        <Entity key={`${i}`} id={`${i}`}>
          {child}
        </Entity>
      );
    });
  }, []);
  const [entities, setEntities] = useState(initialEntities);

  const addEntity = (entity: JSX.Element) => {
    setEntities([
      ...entities,
      <Entity key={entities.length} id={`${entities.length}`}>
        {entity}
      </Entity>,
    ]);
  };

  const removeEntity = (id: string) => {
    setEntities([...entities.filter((entity) => entity.props.id !== id)]);
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
      {entities}
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
