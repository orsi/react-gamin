import overworldImage from "../assets/Overworld.png";
import { MultiSprite, useBody, usePosition } from "react-gamin";

interface BarrelProps {
  x?: number;
  y?: number;
  z?: number;
}
export default function Barrel({ x, y, z }: BarrelProps) {
  useBody({
    height: 32,
    width: 16,
  });
  const [position] = usePosition({
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
