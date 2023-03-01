import overworldImage from "../assets/Overworld.png";
import {
  IEntity,
  MultiSprite,
  useBody,
  useInteractSystem,
  useMovementSystem,
  usePosition,
} from "react-gamin";

interface BarrelProps {
  x?: number;
  y?: number;
  z?: number;
  solid?: boolean;
}
export default function Barrel({ x, y, z, solid }: BarrelProps) {
  const [body] = useBody({
    height: 32,
    width: 16,
    solid: solid ?? true,
  });
  const [position, setPosition] = usePosition({
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
      map={[[{ selectedSprite: 33 }], [{ selectedSprite: 73 }]]}
    />
  );
}
