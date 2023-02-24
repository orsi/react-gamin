import { useRef } from "react";
import overworldImage from "../assets/Overworld.png";
import {
  TEntity,
  useBodyComponent,
  usePositionComponent,
} from "../library/Entity";
import { createSpriteSheet, MultiSpriteSheet, Render } from "../library/Render";
import { useInteractSystem, useMovementSystem } from "../library/System";

type HouseProps = {
  x?: number;
  y?: number;
  z?: number;
  solid?: boolean;
};
export default function House({ x, y, z, solid }: HouseProps) {
  const spriteSheet = createSpriteSheet({
    spriteWidth: 16,
    spriteHeight: 16,
    width: 640,
    height: 576,
    src: overworldImage,
  });
  const body = useBodyComponent({
    height: 80,
    width: 80,
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
        tilesPerRow={5}
        src={spriteSheet.src}
        sprites={[
          spriteSheet.sprites[6],
          spriteSheet.sprites[7],
          spriteSheet.sprites[8],
          spriteSheet.sprites[9],
          spriteSheet.sprites[10],
          spriteSheet.sprites[46],
          spriteSheet.sprites[47],
          spriteSheet.sprites[48],
          spriteSheet.sprites[49],
          spriteSheet.sprites[50],
          spriteSheet.sprites[86],
          spriteSheet.sprites[87],
          spriteSheet.sprites[88],
          spriteSheet.sprites[89],
          spriteSheet.sprites[90],
          spriteSheet.sprites[126],
          spriteSheet.sprites[127],
          spriteSheet.sprites[128],
          spriteSheet.sprites[129],
          spriteSheet.sprites[130],
          spriteSheet.sprites[166],
          spriteSheet.sprites[167],
          spriteSheet.sprites[168],
          spriteSheet.sprites[169],
          spriteSheet.sprites[170],
        ]}
      />
    </Render>
  );
}
