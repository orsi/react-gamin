import {
  useBodyComponent,
  usePositionComponent,
  useMovementSystem,
  useInteractSystem,
  IEntity,
  MultiSprite,
} from "react-gamin";
import overworldImage from "../assets/Overworld.png";

interface BoxProps {
  x?: number;
  y?: number;
  z?: number;
  solid?: boolean;
}
export default function Box({ x, y, z, solid }: BoxProps) {
  const [body] = useBodyComponent({
    height: 32,
    width: 16,
    solid: solid ?? true,
  });
  const [position, setPosition] = usePositionComponent({
    x: x ?? 240,
    y: y ?? 240,
    z: z ?? 0,
  });

  useMovementSystem(position, setPosition, body);
  // useInteractSystem((e: IEntity) => {
  //   console.log("who's interacting me?", e);
  // });

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
