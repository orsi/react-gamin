import characterImage from "./assets/character.png";
import { useState, useEffect, useRef, useCallback } from "react";
import { useMovement } from "./MovementSystem";
import Animation from "./Animation";
import useSpriteSheet from "./Sprite";
import { useGameInput } from "../library/Input";
import { useOldEntity, useOldBody, useOldPosition } from "./Components";

export default function Character1() {
  const characterSpriteSheet = useSpriteSheet({
    width: 272,
    height: 256,
    cellHeight: 32,
    cellWidth: 16,
    src: characterImage,
  });
  const [sprite, setSprite] = useState(characterSpriteSheet[0]);
  const entity = useOldEntity("character");
  const body = useOldBody(entity);
  const [position] = useOldPosition(entity, { x: 240, y: 200, z: 0 });
  const transform = `translate(${position.x}px, ${position.y}px)`;

  const move = useMovement(entity);

  const upAnimation = (
    <Animation
      sprites={[
        characterSpriteSheet[34],
        characterSpriteSheet[35],
        characterSpriteSheet[36],
        characterSpriteSheet[37],
      ]}
      durationMs={500}
    />
  );
  const rightAnimation = (
    <Animation
      sprites={[
        characterSpriteSheet[17],
        characterSpriteSheet[18],
        characterSpriteSheet[19],
        characterSpriteSheet[20],
      ]}
      durationMs={500}
    />
  );
  const downAnimation = (
    <Animation
      sprites={[
        characterSpriteSheet[0],
        characterSpriteSheet[1],
        characterSpriteSheet[2],
        characterSpriteSheet[3],
      ]}
      durationMs={500}
    />
  );
  const leftAnimation = (
    <Animation
      sprites={[
        characterSpriteSheet[51],
        characterSpriteSheet[52],
        characterSpriteSheet[53],
        characterSpriteSheet[54],
      ]}
      durationMs={500}
    />
  );

  const input = useGameInput();
  const frame = useRef(0);
  const update = useCallback((callback: () => void) => {
    callback();
    frame.current = requestAnimationFrame(() => update(callback));
  }, []);
  useEffect(() => {
    console.log("input", input);
    if (input.KEYBOARD_UP) {
      update(() => {
        setSprite(upAnimation);
        move("up");
      });
    }
    if (input.KEYBOARD_RIGHT) {
      update(() => {
        setSprite(rightAnimation);
        move("right");
      });
    }
    if (input.KEYBOARD_DOWN) {
      update(() => {
        setSprite(downAnimation);
        move("down");
      });
    }
    if (input.KEYBOARD_LEFT) {
      update(() => {
        setSprite(leftAnimation);
        move("left");
      });
    }

    () => {
      cancelAnimationFrame(frame.current);
    };
  }, [input]);

  console.log("hi", transform);
  return (
    <div
      style={{
        display: "inline-block",
        position: "absolute",
        transform,
      }}
    >
      {sprite}
    </div>
  );
}
