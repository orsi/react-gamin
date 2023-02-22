import { useEffect, useState } from "react";
import tile000Image from "../assets/npc/tile000.png";
import tile001Image from "../assets/npc/tile001.png";
import tile002Image from "../assets/npc/tile002.png";
import tile003Image from "../assets/npc/tile003.png";
import tile004Image from "../assets/npc/tile004.png";
import tile005Image from "../assets/npc/tile005.png";
import tile006Image from "../assets/npc/tile006.png";
import tile007Image from "../assets/npc/tile007.png";
import tile008Image from "../assets/npc/tile008.png";
import tile009Image from "../assets/npc/tile009.png";
import tile010Image from "../assets/npc/tile010.png";
import tile011Image from "../assets/npc/tile011.png";
import tile012Image from "../assets/npc/tile012.png";
import tile013Image from "../assets/npc/tile013.png";
import tile014Image from "../assets/npc/tile014.png";
import tile015Image from "../assets/npc/tile015.png";
import { useGameInput } from "../library/Input";
import useLoop from "../library/useLogicLoop";
import {
  Animation,
  Sprite,
  SpriteAnimationStateMachine,
  SpriteAnimationState,
  Render,
} from "../library/Render";
import { useInteract, useMovement, useStuff } from "../library/System";
import { createEntity, usePosition, useBody } from "../library/Entity";

export default createEntity(function Character() {
  const [state, setState] = useState("idle");
  const position = usePosition({ x: 200, y: 200 });
  const body = useBody({ solid: true });
  const move = useMovement();
  const interact = useInteract();
  const stuff = useStuff();

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

    if (input.KEYBOARD_SPACE) {
      interact(position[0]);
      stuff();
    }
  }, [input]);

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

  return (
    <Render position={position[0]}>
      <SpriteAnimationStateMachine state={state}>
        <SpriteAnimationState id={`idle`}>
          <Sprite src={tile000Image} />
        </SpriteAnimationState>
        <SpriteAnimationState id={`walk-up`}>
          <Animation
            srcs={[tile008Image, tile009Image, tile010Image, tile011Image]}
          />
        </SpriteAnimationState>
        <SpriteAnimationState id={`walk-down`}>
          <Animation
            srcs={[tile000Image, tile001Image, tile002Image, tile003Image]}
          />
        </SpriteAnimationState>
        <SpriteAnimationState id={`walk-left`}>
          <Animation
            srcs={[tile012Image, tile013Image, tile014Image, tile015Image]}
          />
        </SpriteAnimationState>
        <SpriteAnimationState id={`walk-right`}>
          <Animation
            srcs={[tile004Image, tile005Image, tile006Image, tile007Image]}
          />
        </SpriteAnimationState>
      </SpriteAnimationStateMachine>
    </Render>
  );
});
