import overworldImage from "../assets/Overworld.png";
import {
  EntityId,
  useBodyComponent,
  usePositionComponent,
} from "../library/Entity";
import { MultiSprite } from "../library/Render";
import { useInteractSystem, useMovementSystem } from "../library/System";

interface BarrelProps {
  x?: number;
  y?: number;
  z?: number;
  solid?: boolean;
}
export default function Barrel({ x, y, z, solid }: BarrelProps) {
  const body = useBodyComponent({
    height: 32,
    width: 16,
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
      x={position.x}
      y={position.y}
      sheet={{
        height: 16,
        width: 16,
      }}
      map={[[33], [73]]}
    />
  );
}
