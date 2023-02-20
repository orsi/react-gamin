import {
  useState,
  useEffect,
  PropsWithChildren,
  useRef,
  createContext,
  useContext,
  CSSProperties,
  useCallback,
} from "react";
import { GameInput } from "./Input";
import { createStore } from "../components/createStore";

interface GameState {
  stages: any[];
  systems: any[];
  entites: any[];
}
const gameStore = createStore<GameState>({
  stages: [],
  systems: [],
  entites: [],
});
export const useGameStore = gameStore.useStore;

interface GameProps {
  actions?: [{ action?: string; input: any /*Input*/ }];
}
export default function Game({ children }: PropsWithChildren<GameProps>) {
  const gameDivRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [height, setHeight] = useState(480);

  function onWindowResize() {
    const bounds = document.body.getBoundingClientRect();
    setHeight(bounds.height);
    setWidth(bounds.width);
  }

  useEffect(() => {
    window.addEventListener("resize", onWindowResize);
    onWindowResize();

    return () => {
      window.removeEventListener("resize", onWindowResize);
    };
  }, []);

  return (
    <div
      ref={gameDivRef}
      style={{
        position: "relative",
        height,
        width,
      }}
    >
      <gameStore.Provider>
        <GameInput>{children}</GameInput>
      </gameStore.Provider>
    </div>
  );
}

interface IEntity {
  id: string;
  components?: TComponentState<TComponent<string, any>>[];
}
const EntityContext = createContext<null | IEntity>(null);

interface EntityProps {
  id: string;
  components?: any[];
}
export function Entity({ components, id }: EntityProps) {
  const EntityRenderer = () => {
    const style: CSSProperties = {
      position: "absolute",
      top: "0",
      left: "0",
    };
    const [sprite] = components?.find((c) => c[0].name === "Sprite");
    const [position] = components?.find((c) => c[0].name === "Position");
    if (position) {
      style.transform = `translate(${position.x}px, ${position.y}px)`;
    }
    return <img style={style} src={sprite.src} alt="" />;
  };
  return (
    <EntityContext.Provider value={{ id, components }}>
      <EntityRenderer />
    </EntityContext.Provider>
  );
}

type TComponentState<C> = [C, React.Dispatch<C>];
type TComponent<T, C> = {
  name: T;
} & C;
export interface IBody {
  solid?: boolean;
  height?: number;
  width?: number;
}
type TBodyComponent = TComponent<"Body", IBody>;
export function useBody(initialBody?: IBody): TComponentState<TBodyComponent> {
  const state = useState<TBodyComponent>({
    name: "Body",
    solid: true,
    width: 10,
    height: 10,
    ...initialBody,
  });
  return state;
}

export interface IPosition {
  x?: number;
  y?: number;
  z?: number;
}
type TPositionComponent = TComponent<"Position", IPosition>;
export function usePosition(
  initialPosition?: IPosition
): TComponentState<TPositionComponent> {
  const state = useState<TPositionComponent>({
    name: "Position",
    x: 0,
    y: 0,
    z: 0,
    ...initialPosition,
  });
  return state;
}

export interface ISprite {
  src?: string;
}
type TSpriteComponent = TComponent<"Sprite", ISprite>;
export function useSprite(
  intialValue?: ISprite
): TComponentState<TSpriteComponent> {
  const state = useState<TSpriteComponent>({
    name: "Sprite",
    src: "",
    ...intialValue,
  });
  return state;
}

// SYSTEM

const SPEED = 5;
const entities = new Map<
  string,
  {
    body: TComponentState<TBodyComponent>;
    position: TComponentState<TPositionComponent>;
  }
>();
export function useMovement(
  id: string,
  positionState: TComponentState<TPositionComponent>,
  bodyState: TComponentState<TBodyComponent>
) {
  // save entity to movement system map
  let state = entities.get(id);
  if (!state) {
    state = { body: bodyState, position: positionState };
    entities.set(id, state);
  }

  // function used to ask system to move
  const move = useCallback(
    (direction: "up" | "right" | "down" | "left") => {
      const [currentPosition] = positionState;
      let nextPosition = { x: 0, y: 0, z: 0, ...currentPosition };
      if (direction === "up") nextPosition.y = nextPosition.y - 1 * SPEED;
      if (direction === "right") nextPosition.x = nextPosition.x + 1 * SPEED;
      if (direction === "down") nextPosition.y = nextPosition.y + 1 * SPEED;
      if (direction === "left") nextPosition.x = nextPosition.x - 1 * SPEED;

      let entityInPosition;
      for (const [eId, e] of entities.entries()) {
        if (eId === id) {
          continue;
        }
        const [ePosition] = e.position;
        const [eBody] = e.body;
        if (!ePosition || !eBody) {
          continue;
        }
        const xMin = ePosition.x! - eBody.width! / 2;
        const xMax = ePosition.x! + eBody.width! / 2;
        const yMin = ePosition.y! - eBody.height! / 2;
        const yMax = ePosition.y! + eBody.height! / 2;
        const inRange =
          nextPosition.x >= xMin &&
          nextPosition.x <= xMax &&
          nextPosition.y >= yMin &&
          nextPosition.y <= yMax;
        entityInPosition = inRange ? e : undefined;
      }

      // nothing is there
      if (!entityInPosition) {
        positionState[1](nextPosition);
        return true;
      }

      // entity there is not solid
      if (entityInPosition && !entityInPosition.body[0].solid) {
        positionState[1](nextPosition);
        return true;
      }

      // nope
      return false;
    },
    [positionState, bodyState]
  );

  return move;
}
