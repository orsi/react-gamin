import { useState, useEffect, useCallback, PropsWithChildren } from "react";
import { Entity } from "./ecs";
import { createGameInput, Inputs } from "./Input";

const SPEED = 5;

const entities = new Set<Entity>();
export function useMovement(entity: Entity) {
  if (!entity.position) {
    throw Error("Entity has no position.");
  }
  if (!entity.body) {
    throw Error("Entity has no body.");
  }

  // save entity to movement system map
  entities.add(entity);

  // function used to ask system to move
  const move = useCallback(
    (direction: "up" | "right" | "down" | "left") => {
      const currentPosition = entity.position[0];
      let nextPosition = { ...currentPosition };
      if (direction === "up") nextPosition.y = nextPosition.y - 1 * SPEED;
      if (direction === "right") nextPosition.x = nextPosition.x + 1 * SPEED;
      if (direction === "down") nextPosition.y = nextPosition.y + 1 * SPEED;
      if (direction === "left") nextPosition.x = nextPosition.x - 1 * SPEED;

      let entityInPosition;
      for (const e of entities) {
        if (e.id === entity.id) {
          continue;
        }

        const xMin = e.position[0].x - e.body[0].width / 2;
        const xMax = e.position[0].x + e.body[0].width / 2;
        const yMin = e.position[0].y - e.body[0].height / 2;
        const yMax = e.position[0].y + e.body[0].height / 2;
        const inRange =
          nextPosition.x >= xMin &&
          nextPosition.x <= xMax &&
          nextPosition.y >= yMin &&
          nextPosition.y <= yMax;
        entityInPosition = inRange ? e : undefined;
      }

      // nothing is there
      if (!entityInPosition) {
        entity.position[1](nextPosition);
        return true;
      }

      // entity there is not solid
      if (entityInPosition && !entityInPosition.body[0].solid) {
        entity.position[1](nextPosition);
        return true;
      }

      // nope
      return false;
    },
    [entity]
  );

  return move;
}

interface GameProps {
  input: ("gamepad" | "keyboard" | "mouse")[];
}
export default function Game({
  input,
  children,
}: PropsWithChildren<GameProps>) {
  const [width, setWidth] = useState(640);
  const [height, setHeight] = useState(480);

  function onWindowResize() {
    const bounds = document.body.getBoundingClientRect();
    setHeight(bounds.height);
    setWidth(bounds.width);
  }

  const gamepads: { [key: number]: Gamepad } = {};
  function onGamepadConnected(e: GamepadEvent) {
    console.log(
      "Gamepad connected at index %d: %s. %d buttons, %d axes.",
      e.gamepad.index,
      e.gamepad.id,
      e.gamepad.buttons.length,
      e.gamepad.axes.length
    );
    gamepads[e.gamepad.index] = e.gamepad;
  }

  function onGamepadDisconnected(e: GamepadEvent) {
    console.log(
      "Gamepad disconnected from index %d: %s",
      e.gamepad.index,
      e.gamepad.id
    );
    delete gamepads[e.gamepad.index];
  }

  useEffect(() => {
    window.addEventListener("resize", onWindowResize);
    onWindowResize();

    if (input.includes("gamepad")) {
      window.addEventListener("gamepadconnected", onGamepadConnected);
      window.addEventListener("gamepaddisconnected", onGamepadDisconnected);
    }
    return () => {
      window.removeEventListener("resize", onWindowResize);
      window.removeEventListener("gamepadconnected", onGamepadConnected);
      window.removeEventListener("gamepaddisconnected", onGamepadDisconnected);
    };
  }, []);

  const GameInputProvider = createGameInput({
    UP: Inputs.gamepad.BUTTON_12,
    RIGHT: Inputs.gamepad.BUTTON_15,
    DOWN: Inputs.gamepad.BUTTON_13,
    LEFT: Inputs.gamepad.BUTTON_14,
  });

  return (
    <GameInputProvider>
      <div
        style={{
          position: "relative",
          height,
          width,
        }}
      >
        {children}
      </div>
    </GameInputProvider>
  );
}

export function Stage({ children }: PropsWithChildren) {
  return <>{children}</>;
}
