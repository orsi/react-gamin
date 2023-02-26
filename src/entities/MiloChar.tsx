import { useEffect, useRef, useState } from "react";
import npcImage from "../assets/npc.png";
import { useGameInput } from "../library/Input";
import useLoop from "../library/useLogicLoop";
import {
  Animation,
  Sprite,
  SpriteAnimationStateMachine,
  SpriteAnimationState,
  Render,
} from "../library/Render";
import { useInteractSystem, useMovementSystem } from "../library/System";
import { usePositionComponent, useBodyComponent } from "../library/Entity";

export default function MiloChar() {
  const [state, setState] = useState("idle");
  const [position, setPosition] = usePositionComponent({ x: 30, y: 50 });
  useBodyComponent({ width: 16, height: 32, solid: true });
  const move = useMovementSystem();
  const interact = useInteractSystem();

  useGameInput((input) => {
    if (input.KEYBOARD_UP || input.GAMEPAD_BUTTON_12) {
      setState("walk-up");
    } else if (input.KEYBOARD_DOWN || input.GAMEPAD_BUTTON_13) {
      setState("walk-down");
    } else if (input.KEYBOARD_LEFT || input.GAMEPAD_BUTTON_14) {
      setState("walk-left");
    } else if (input.KEYBOARD_RIGHT || input.GAMEPAD_BUTTON_15) {
      setState("walk-right");
    } else {
      setState("idle");
    }

    if (input.KEYBOARD_SPACE) {
      interact();
    }
  });

  useLoop(() => {
    if (state === "walk-up") {
      move("up");
    } else if (state === "walk-down") {
      move("down");
    } else if (state === "walk-left") {
      move("left");
    } else if (state === "walk-right") {
      move("right");
    } else {
      // noop
    }
  }, [state]);

  const animations = useRef([
    { frameLength: 250, cells: [0, 1, 2, 3] },
    { frameLength: 250, cells: [4, 5, 6, 7] },
    { frameLength: 250, cells: [8, 9, 10, 11] },
    { frameLength: 250, cells: [12, 13, 14, 15] },
  ]);
  let playAnimation = undefined;
  if (state === "walk-up") {
    playAnimation = 2;
  } else if (state === "walk-down") {
    playAnimation = 0;
  } else if (state === "walk-left") {
    playAnimation = 3;
  } else if (state === "walk-right") {
    playAnimation = 1;
  }
  return (
    <Sprite
      src={npcImage}
      x={position.x}
      y={position.y}
      sheet={{
        height: 32,
        width: 16,
      }}
      selectedSprite={0}
      animations={animations.current}
      selectedAnimation={playAnimation}
    />
  );
}
