import overworldImage from "../assets/Overworld.png";
import {
  EntityId,
  useBodyComponent,
  usePositionComponent,
} from "../library/Entity";
import { MultiSprite } from "../library/Render";
import { useInteractSystem, useMovementSystem } from "../library/System";

type FountainProps = {
  x?: number;
  y?: number;
  z?: number;
  solid?: boolean;
};
export default function Fountain({ x, y, z, solid }: FountainProps) {
  const body = useBodyComponent({
    height: 48,
    width: 48,
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
        [382, 383, 384],
        [422, 423, 424],
        [462, 463, 464],
      ]}
      x={position.x}
      y={position.y}
      z={position.z}
    />
  );
}
