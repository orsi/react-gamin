import {
  Children,
  createContext,
  forwardRef,
  MutableRefObject,
  ReactNode,
  useContext,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
} from "react";
import { Entity, EntityContextProvider } from "./Entity";
import { useEntityInGame, useGame } from "./Game";

export type StageRef = MutableRefObject<Stage>;
export interface Stage {
  id: string;
  name?: string;
  entities: Set<Entity>;
}
export const StageContext = createContext<null | StageRef>(null);
interface StageProps {
  name: string;
  children?: ReactNode;
}
export const Stage = forwardRef<Stage, StageProps>(function Stage(
  { children, name },
  ref
) {
  const id = useId();
  const stageRef = useRef({
    id,
    name,
    entities: new Set<Entity>(),
  });
  useImperativeHandle(ref, () => stageRef.current);

  // regsiter stage to game
  const game = useGame();
  useEffect(() => {
    game.stages.add(stageRef.current);
    return () => {
      game.stages.delete(stageRef.current);
    };
  }, []);

  return (
    <StageContext.Provider value={stageRef}>
      {Children.map(children, (child) => (
        <EntityContextProvider>{child}</EntityContextProvider>
      ))}
    </StageContext.Provider>
  );
});

export function useStage() {
  return useContext(StageContext).current;
}

export function useEntityInStage(entity: Entity) {
  useEntityInGame(entity);

  const stage = useStage();
  useEffect(() => {
    stage.entities.add(entity);
    return () => {
      stage.entities.delete(entity);
    };
  }, []);
}

interface MissingStageProps {
  name?: string;
}
export function MissingStage({ name }: MissingStageProps) {
  return <h1 style={{ textAlign: "center" }}>Missing Stage "{name}"</h1>;
}
