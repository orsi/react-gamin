import { useEffect, useId, useState } from "react";
import {
  Entity,
  useBody,
  useMovement,
  usePosition,
  useSprite,
} from "../library/Game";
import tile000Image from "../assets/npc/tile000.png";
import { useGameInput } from "../library/Input";
import useLogicLoop from "./useLogicLoop";

export default function Character4() {
  const id = "test";
  const [state, setState] = useState("idle");
  const sprite = useSprite({ src: tile000Image });
  const body = useBody();
  const position = usePosition({ x: 240, y: 200, z: 0 });
  const move = useMovement(id, position, body);

  const input = useGameInput();
  useEffect(() => {
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
  }, [input]);

  useLogicLoop(() => {
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

  return <Entity id={id} components={[sprite, body, position]} />;
}
