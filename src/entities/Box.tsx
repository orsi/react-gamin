import overworldImage from "../assets/Overworld.png";
import {
  IEntity,
  useBodyComponent,
  usePositionComponent,
} from "../library/Entity";
import { MultiSprite } from "../library/Render";
import { useInteractSystem, useMovementSystem } from "../library/System";

interface BoxProps {
  x?: number;
  y?: number;
  z?: number;
  solid?: boolean;
}
export default function Box({ x, y, z, solid }: BoxProps) {
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
  useInteractSystem((e: IEntity) => {
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
      map={[[{ selectedSprite: 30 }], [{ selectedSprite: 70 }]]}
    />
  );
}
