import { useCallback, useEffect, useState } from "react";
import tile000Image from "./assets/npc/tile000.png";
import tile001Image from "./assets/npc/tile001.png";
import tile002Image from "./assets/npc/tile002.png";
import tile003Image from "./assets/npc/tile003.png";
import tile004Image from "./assets/npc/tile004.png";
import tile005Image from "./assets/npc/tile005.png";
import tile006Image from "./assets/npc/tile006.png";
import tile007Image from "./assets/npc/tile007.png";
import { useGameStore } from "./components/Game";
import { useGameInput } from "./components/Input";
import {
  Sprite,
  Animation,
  SpriteAnimationStateMachine,
  SpriteAnimationState,
} from "./components/Sprite";

export default function Character3() {
  const [state, setState] = useState<string>("idle");

  const [input] = useGameInput();
  useEffect(() => {
    setState((value) => {
      if (input.KEYBOARD_UP) {
        return "walk-right";
      }
      if (input.KEYBOARD_DOWN) {
        return "walk-down";
      }

      return "idle";
    });
  }, [input]);

  return (
    <SpriteAnimationStateMachine state={state}>
      <SpriteAnimationState id={`idle`}>
        <Sprite src={tile000Image} />
      </SpriteAnimationState>
      <SpriteAnimationState id={`walk-down`}>
        <Animation
          srcs={[tile000Image, tile001Image, tile002Image, tile003Image]}
        />
      </SpriteAnimationState>
      <SpriteAnimationState id={`walk-right`}>
        <Animation
          srcs={[tile004Image, tile005Image, tile006Image, tile007Image]}
        />
      </SpriteAnimationState>
    </SpriteAnimationStateMachine>
  );
}