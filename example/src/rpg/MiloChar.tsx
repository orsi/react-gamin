import { useRef, useState } from "react";
import { Sprite, useLoop } from "react-gamin";
import npcImage from "../assets/npc.png";
import { usePosition, useBody } from "./Components";
import { useAction, useMove } from "./Systems";
interface MiloCharProps {
  x?: number;
  y?: number;
}
export default function MiloChar({ x, y }: MiloCharProps) {
  const lastStateRef = useRef("idle");
  const [state, setState] = useState("idle");
  const [position, setPosition] = usePosition({
    x: x ?? 260,
    y: y ?? 200,
  });
  const [body] = useBody({
    width: 16,
    height: 32,
  });
  const move = useMove(setPosition, body);
  const action = useAction();

  useLoop(
    (game) => {
      const input = game.input.current;
      if (input.KEYBOARD_UP || input.GAMEPAD_BUTTON_12) {
        setState("walk-up");
        move("up");
      } else if (input.KEYBOARD_DOWN || input.GAMEPAD_BUTTON_13) {
        setState("walk-down");
        move("down");
      } else if (input.KEYBOARD_LEFT || input.GAMEPAD_BUTTON_14) {
        setState("walk-left");
        move("left");
      } else if (input.KEYBOARD_RIGHT || input.GAMEPAD_BUTTON_15) {
        setState("walk-right");
        move("right");
      } else {
        setState("idle");
      }

      if (
        input.currentEvent?.type === "keydown" &&
        input.currentEvent?.data === "Space"
      ) {
        action({
          x: position.x,
          y: position.y - 10,
          z: position.z,
        });
      }
    },
    [position]
  );

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
