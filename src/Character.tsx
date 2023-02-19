import characterImage from "./assets/character.png";
import { useState, useEffect, useRef, useCallback } from "react";
import { useMovement } from "./components/System";
import Animation from "./components/Animation";
import useSpriteSheet from "./components/Sprite";
import { useGameInput } from "./components/Input";
import { useEntity, useBody, usePosition } from "./components/Entity";

export default function Character1() {
  const characterSpriteSheet = useSpriteSheet({
    width: 272,
    height: 256,
    cellHeight: 32,
    cellWidth: 16,
    src: characterImage,
  });
  const [sprite, setSprite] = useState(characterSpriteSheet[0]);
  const entity = useEntity("character");
  const body = useBody(entity);
  const [position] = usePosition(entity, { x: 240, y: 200, z: 0 });
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

  const [input] = useGameInput();
  const frame = useRef(0);
  const update = useCallback((callback: () => void) => {
    callback();
    frame.current = requestAnimationFrame(() => update(callback));
  }, []);
  useEffect(() => {
    console.log("input", input);
    if (input.UP) {
      update(() => {
        setSprite(upAnimation);
        move("up");
      });
    }
    if (input.RIGHT) {
      update(() => {
        setSprite(rightAnimation);
        move("right");
      });
    }
    if (input.DOWN) {
      update(() => {
        setSprite(downAnimation);
        move("down");
      });
    }
    if (input.LEFT) {
      update(() => {
        setSprite(leftAnimation);
        move("left");
      });
    }

    () => {
      cancelAnimationFrame(frame.current);
    };
  }, [input]);

  console.log('hi', transform);
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
