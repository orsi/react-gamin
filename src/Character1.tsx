import { useState, useEffect, useContext, useCallback } from "react";
import {
  GameContext,
  useBody,
  useEntity,
  useMovement,
  usePosition,
} from "./Game";
import characterImage from "./assets/character.png";
import useSpriteSheet from "./components/useSpriteSheet";
import { useGameInput } from "./components/Input";

function Animation({
  sprites,
  durationMs,
  animate = true,
  reset = true,
  delay = 0,
}: {
  sprites: any[];
  durationMs: number;
  animate?: boolean;
  reset?: boolean;
  delay?: number;
}) {
  const frameDuration = durationMs / sprites.length;
  const [currentFrame, setCurrentFrame] = useState(0);

  useEffect(() => {
    if (!animate && reset) {
      setCurrentFrame(0);
    }

    let interval = setInterval(() => {
      setCurrentFrame((value) => {
        const nextFrame = (value + 1) % sprites.length;
        return animate ? nextFrame : value;
      });
    }, frameDuration);

    return () => {
      clearInterval(interval);
    };
  }, [animate, reset]);

  return <>{sprites[currentFrame]}</>;
}

export default function Character1() {
  const characterSpriteSheet = useSpriteSheet({
    width: 272,
    height: 256,
    cellHeight: 32,
    cellWidth: 16,
    src: characterImage,
  });
  const game = useContext(GameContext);
  const entity = useEntity("character");
  const [body] = useBody(entity);
  const [position] = usePosition(entity, { x: 240, y: 220, z: 0 });
  const [sprite, setSprite] = useState(characterSpriteSheet[0]);
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

  useGameInput((input) => {
    if (input.UP) {
      setSprite(upAnimation);
      move("up");
    }
    if (input.RIGHT) {
      setSprite(rightAnimation);
      move("right");
    }
    if (input.DOWN) {
      setSprite(downAnimation);
      move("down");
    }
    if (input.LEFT) {
      setSprite(leftAnimation);
      move("left");
    }
  });

  // const onKeyDown = useCallback(
  //   (e: KeyboardEvent) => {
  //     if (e.key === "ArrowUp") {
  //       setSprite(upAnimation);
  //       move("up");
  //     }
  //     if (e.key === "ArrowRight") {
  //       setSprite(rightAnimation);
  //       move("right");
  //     }
  //     if (e.key === "ArrowDown") {
  //       setSprite(downAnimation);
  //       move("down");
  //     }
  //     if (e.key === "ArrowLeft") {
  //       setSprite(leftAnimation);
  //       move("left");
  //     }
  //   },
  //   [move, setSprite]
  // );

  // useEffect(() => {
  //   window.addEventListener("keydown", onKeyDown);
  //   return () => {
  //     window.removeEventListener("keydown", onKeyDown);
  //   };
  // }, []);

  const transform = `translate(${position.x}px, ${position.y}px)`;

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
