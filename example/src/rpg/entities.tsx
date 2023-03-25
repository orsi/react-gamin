import objectsImage from "./assets/objects.png";
import overworldImage from "./assets/Overworld.png";
import npcImage from "./assets/npc.png";
import { useRef, useState } from "react";
import {
  MultiSprite,
  Sprite,
  TransformComponent,
  Transform,
  useBodyComponent,
  useTransformComponent,
  useUpdate,
} from "react-gamin";
import { useActionable, useAction, useMove } from "./systems";

interface BarrelProps {
  x?: number;
  y?: number;
  z?: number;
}
export function Barrel({ x, y, z }: BarrelProps) {
  useBodyComponent({
    height: 32,
    width: 16,
  });
  const [position] = useTransformComponent({
    x: x ?? 240,
    y: y ?? 240,
    z: z ?? 0,
  });

  return (
    <MultiSprite
      src={overworldImage}
      x={position.x}
      y={position.y}
      sheet={{
        height: 16,
        width: 16,
      }}
      map={[[{ selectedSprite: 33 }], [{ selectedSprite: 73 }]]}
    />
  );
}

interface BoxProps {
  x?: number;
  y?: number;
  z?: number;
}
export function Box({ x, y, z }: BoxProps) {
  useBodyComponent({
    height: 32,
    width: 16,
  });
  const [position] = useTransformComponent({
    x: x ?? 240,
    y: y ?? 240,
    z: z ?? 0,
  });

  return (
    <MultiSprite
      src={overworldImage}
      x={position.x}
      y={position.y}
      sheet={{
        height: 16,
        width: 16,
      }}
      map={[[{ selectedSprite: 30 }], [{ selectedSprite: 70 }]]}
    />
  );
}

interface BarrelProps {
  x?: number;
  y?: number;
  z?: number;
}
export function Chest({ x, y, z }: BarrelProps) {
  const [currentSprite, setCurrentSprite] = useState(0);
  useBodyComponent({
    height: 16,
    width: 16,
  });
  const [position] = useTransformComponent({
    x: x ?? 240,
    y: y ?? 240,
    z: z ?? 0,
  });

  useActionable((entity) => {
    if (currentSprite === 0) {
      setCurrentSprite(1);
      if (entity.has(TransformComponent)) {
        // blast back!
        entity.update(TransformComponent, {
          // TODO: figure out how we can type this better
          x: (entity.components.transform as Transform).x,
          y: (entity.components.transform as Transform).y + 10,
          z: 0,
        });
      }
    }
  });

  return (
    <Sprite
      src={objectsImage}
      x={position.x}
      y={position.y}
      sheet={{
        height: 16,
        width: 16,
      }}
      selectedSprite={currentSprite}
    />
  );
}

interface FountainProps {
  x?: number;
  y?: number;
  z?: number;
}
export function Fountain({ x, y, z }: FountainProps) {
  useBodyComponent({
    height: 48,
    width: 48,
  });
  const [position] = useTransformComponent({
    x: x ?? 240,
    y: y ?? 240,
    z: z ?? 0,
  });

  return (
    <MultiSprite
      src={overworldImage}
      sheet={{
        width: 16,
        height: 16,
      }}
      map={[
        [
          {
            selectedSprite: 382,
            animations: [{ frameLength: 100, cells: [382, 385, 388] }],
            selectedAnimation: 0,
          },
          {
            selectedSprite: 383,
            animations: [{ frameLength: 100, cells: [383, 386, 389] }],
            selectedAnimation: 0,
          },
          {
            selectedSprite: 384,
            animations: [{ frameLength: 100, cells: [384, 387, 390] }],
            selectedAnimation: 0,
          },
        ],
        [
          {
            selectedSprite: 422,
            animations: [{ frameLength: 100, cells: [422, 425, 428] }],
            selectedAnimation: 0,
          },
          {
            selectedSprite: 423,
            animations: [{ frameLength: 100, cells: [423, 426, 429] }],
            selectedAnimation: 0,
          },
          {
            selectedSprite: 424,
            animations: [{ frameLength: 100, cells: [424, 427, 430] }],
            selectedAnimation: 0,
          },
        ],
        [
          {
            selectedSprite: 462,
            animations: [{ frameLength: 100, cells: [462, 465, 468] }],
            selectedAnimation: 0,
          },
          {
            selectedSprite: 463,
            animations: [{ frameLength: 100, cells: [463, 466, 469] }],
            selectedAnimation: 0,
          },
          {
            selectedSprite: 464,
            animations: [{ frameLength: 100, cells: [464, 467, 470] }],
            selectedAnimation: 0,
          },
        ],
      ]}
      x={position.x}
      y={position.y}
      z={position.z}
    />
  );
}

import { SpriteCanvas } from "react-gamin";

interface GroundProps {
  spriteIndex?: number;
}
export function Ground({ spriteIndex }: GroundProps) {
  const tiles: number[][] = [];
  for (let y = 0; y < 100; y++) {
    if (!tiles[y]) {
      tiles[y] = [];
    }
    for (let x = 0; x < 100; x++) {
      tiles[y].push(spriteIndex ?? 0);
    }
  }
  return (
    <SpriteCanvas
      src={overworldImage}
      sheet={{
        width: 16,
        height: 16,
      }}
      sprites={tiles}
    />
  );
}
interface HouseProps {
  x?: number;
  y?: number;
  z?: number;
}
export function House({ x, y, z }: HouseProps) {
  useBodyComponent({
    height: 80,
    width: 80,
  });
  const [position] = useTransformComponent({
    x: x ?? 240,
    y: y ?? 240,
    z: z ?? 0,
  });

  const actionable = useActionable(() => {
    console.log("mah house!");
  });

  return (
    <MultiSprite
      src={overworldImage}
      sheet={{
        width: 16,
        height: 16,
      }}
      map={[
        [
          { selectedSprite: 6 },
          { selectedSprite: 7 },
          { selectedSprite: 8 },
          { selectedSprite: 9 },
          { selectedSprite: 10 },
        ],
        [
          { selectedSprite: 46 },
          { selectedSprite: 47 },
          { selectedSprite: 48 },
          { selectedSprite: 49 },
          { selectedSprite: 50 },
        ],
        [
          { selectedSprite: 86 },
          { selectedSprite: 87 },
          { selectedSprite: 88 },
          { selectedSprite: 89 },
          { selectedSprite: 90 },
        ],
        [
          { selectedSprite: 126 },
          { selectedSprite: 127 },
          { selectedSprite: 128 },
          { selectedSprite: 129 },
          { selectedSprite: 130 },
        ],
        [
          { selectedSprite: 166 },
          { selectedSprite: 167 },
          { selectedSprite: 168 },
          { selectedSprite: 169 },
          { selectedSprite: 170 },
        ],
      ]}
      x={position.x}
      y={position.y}
      z={position.z}
    />
  );
}

interface MiloCharProps {
  x?: number;
  y?: number;
}
export function MiloChar({ x, y }: MiloCharProps) {
  const [state, setState] = useState("idle");
  const [position] = useTransformComponent({
    x: x ?? 260,
    y: y ?? 200,
    z: 0,
  });
  const [body] = useBodyComponent({
    width: 16,
    height: 32,
  });
  const move = useMove(body, position);
  const action = useAction();

  const isTriggered = useRef(false);
  useUpdate(
    (input) => {
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
        const lastDirection = state.split("-")[1];
        setState(`idle${lastDirection ? `-${lastDirection}` : ``}`);
      }

      if (input.KEYBOARD_SPACE && !isTriggered.current) {
        isTriggered.current = true;
        let actPosition = { ...position };
        if (state.indexOf("up") > 0) {
          actPosition.y -= 5;
        } else if (state.indexOf("down") > 0) {
          actPosition.y += 5 + body.height;
        } else if (state.indexOf("left") > 0) {
          actPosition.x -= 5;
        } else if (state.indexOf("right") > 0) {
          actPosition.x += 5 + body.width;
        }
        action(actPosition);
      } else if (!input.KEYBOARD_SPACE && isTriggered.current) {
        isTriggered.current = false;
      }
    },
    [body, position, state]
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
interface PlantProps {
  x?: number;
  y?: number;
  z?: number;
}

export function Plant({ x, y, z }: PlantProps) {
  const [position] = useTransformComponent({
    x: x ?? 240,
    y: y ?? 240,
    z: z ?? 0,
  });

  return (
    <Sprite
      src={objectsImage}
      x={position.x}
      y={position.y}
      sheet={{
        height: 16,
        width: 16,
      }}
      selectedSprite={2}
    />
  );
}
