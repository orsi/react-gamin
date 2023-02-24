import { useRef } from "react";
import overworldImage from "../assets/Overworld.png";
import {
  TEntity,
  useBodyComponent,
  usePositionComponent,
} from "../library/Entity";
import { createSpriteSheet, MultiSpriteSheet, Render } from "../library/Render";
import { useInteractSystem, useMovementSystem } from "../library/System";

type FountainProps = {
  x?: number;
  y?: number;
  z?: number;
  solid?: boolean;
};
export default function Fountain({ x, y, z, solid }: FountainProps) {
  const spriteSheet = createSpriteSheet({
    spriteWidth: 16,
    spriteHeight: 16,
    width: 640,
    height: 576,
    src: overworldImage,
  });
  const body = useBodyComponent({
    height: 48,
    width: 48,
    solid: solid ?? true,
  });
  const position = usePositionComponent({
    x: x ?? 240,
    y: y ?? 240,
    z: z ?? 0,
  });

  useMovementSystem();
  useInteractSystem((e: TEntity) => {
    console.log("who's interacting me?", e);
  });

  return (
    <Render position={position[0]}>
      <MultiSpriteSheet
        tilesPerRow={3}
        src={spriteSheet.src}
        sprites={[
          spriteSheet.sprites[382],
          spriteSheet.sprites[383],
          spriteSheet.sprites[384],
          spriteSheet.sprites[422],
          spriteSheet.sprites[423],
          spriteSheet.sprites[424],
          spriteSheet.sprites[462],
          spriteSheet.sprites[463],
          spriteSheet.sprites[464],
        ]}
      />
    </Render>
  );
}
