import { MultiSprite } from "react-gamin";
import overworldImage from "../assets/Overworld.png";
import { useBody, usePosition } from "./Components";

interface BoxProps {
  x?: number;
  y?: number;
  z?: number;
}
export default function Box({ x, y, z }: BoxProps) {
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
      map={[[{ selectedSprite: 30 }], [{ selectedSprite: 70 }]]}
    />
  );
}
