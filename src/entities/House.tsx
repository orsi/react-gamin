import overworldImage from "../assets/Overworld.png";
import {
  EntityId,
  useBodyComponent,
  usePositionComponent,
} from "../library/Entity";
import { MultiSprite } from "../library/Render";
import { useInteractSystem, useMovementSystem } from "../library/System";

type HouseProps = {
  x?: number;
  y?: number;
  z?: number;
  solid?: boolean;
};
export default function House({ x, y, z, solid }: HouseProps) {
  const body = useBodyComponent({
    height: 80,
    width: 80,
    solid: solid ?? true,
  });
  const [position] = usePositionComponent({
    x: x ?? 240,
    y: y ?? 240,
    z: z ?? 0,
  });

  useMovementSystem();
  useInteractSystem((e: EntityId) => {
    console.log("who's interacting me?", e);
  });

  return (
    <MultiSprite
      src={overworldImage}
      sheet={{
        width: 16,
        height: 16,
      }}
      map={[
        [6, 7, 8, 9, 10],
        [46, 47, 48, 49, 50],
        [86, 87, 88, 89, 90],
        [126, 127, 128, 129, 130],
        [166, 167, 168, 169, 170],
      ]}
      x={position.x}
      y={position.y}
      z={position.z}
    />
  );
}
