import { useCallback, useEffect, useRef, useState } from "react";
import tile000Image from "./assets/npc/tile000.png";
import tile001Image from "./assets/npc/tile001.png";
import tile002Image from "./assets/npc/tile002.png";
import tile003Image from "./assets/npc/tile003.png";
import tile004Image from "./assets/npc/tile004.png";
import tile005Image from "./assets/npc/tile005.png";
import tile006Image from "./assets/npc/tile006.png";
import tile007Image from "./assets/npc/tile007.png";
import tile008Image from "./assets/npc/tile008.png";
import tile009Image from "./assets/npc/tile009.png";
import tile010Image from "./assets/npc/tile010.png";
import tile011Image from "./assets/npc/tile011.png";
import tile012Image from "./assets/npc/tile012.png";
import tile013Image from "./assets/npc/tile013.png";
import tile014Image from "./assets/npc/tile014.png";
import tile015Image from "./assets/npc/tile015.png";
import { useEntity, useBody, usePosition } from "./components/ecs";
import { useGameInput } from "./components/Input";
import {
  Sprite,
  Animation,
  SpriteAnimationStateMachine,
  SpriteAnimationState,
} from "./components/Sprite";
import { useMovement } from "./components/System";
import useFrame from "./components/useFrame";

export default function Character3() {
  const [state, setState] = useState<string>("idle");
  const entity = useEntity("character");
  const body = useBody(entity);
  const [position] = usePosition(entity, { x: 240, y: 200, z: 0 });
  const transform = `translate(${position.x}px, ${position.y}px)`;
  const move = useMovement(entity);

  const input = useGameInput();
  const frame = useRef(0);
  const lastUpdate = useRef(Date.now());
  const update = (callback: () => void) => {
    const now = Date.now();
    const delta = now - lastUpdate.current;
    if (delta > 1000 / 60) {
      callback();
      lastUpdate.current = now;
    }
    frame.current = requestAnimationFrame(() => update(callback));
  };
  useFrame(() => {
    if (input.KEYBOARD_UP) {
      setState("walk-up");
      move("up");
    }
  });
  useEffect(() => {
    if (input.KEYBOARD_DOWN) {
      update(() => {
        setState("walk-down");
        move("down");
      });
    } else if (input.KEYBOARD_LEFT) {
      update(() => {
        setState("walk-left");
        move("left");
      });
    } else if (input.KEYBOARD_RIGHT) {
      update(() => {
        setState("walk-right");
        move("right");
      });
    } else {
      setState("idle");
      cancelAnimationFrame(frame.current);
    }

    if (input.KEYBOARD_SPACE) {
      setState("interact");
    }

    return () => {
      cancelAnimationFrame(frame.current);
    };
  }, [input]);

  return (
    <div
      style={{
        position: "absolute",
        top: "0",
        left: "0",
        transform,
      }}
    >
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
    </div>
  );
}
