import overworldImage from "../assets/Overworld.png";
import { useRef } from "react";
import {
  EntityId,
  useBodyComponent,
  usePositionComponent,
} from "../library/Entity";
import { createSpriteSheet, MultiSpriteSheet, Render } from "../library/Render";
import { useInteractSystem, useMovementSystem } from "../library/System";

type BoxProps = {
  x?: number;
  y?: number;
  z?: number;
  solid?: boolean;
};
export default function Box({ x, y, z, solid }: BoxProps) {
  const spriteSheet = createSpriteSheet({
    spriteWidth: 16,
    spriteHeight: 16,
    width: 640,
    height: 576,
    src: overworldImage,
  });
  const body = useBodyComponent({
    height: 32,
    width: 16,
    solid: solid ?? true,
  });
  const position = usePositionComponent({
    x: x ?? 240,
    y: y ?? 240,
    z: z ?? 0,
  });

  useMovementSystem();
  useInteractSystem((e: EntityId) => {
    console.log("who's interacting me?", e);
  });

  return (
    <Render position={position[0]}>
      <MultiSpriteSheet
        tilesPerRow={1}
        src={spriteSheet.src}
        sprites={[spriteSheet.sprites[30], spriteSheet.sprites[70]]}
      />
    </Render>
  );
}
