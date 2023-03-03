import objectsImage from "../assets/objects.png";
import { Sprite } from "react-gamin";
import { usePosition } from "./Components";

interface BarrelProps {
  x?: number;
  y?: number;
  z?: number;
}
export default function Plant({ x, y, z }: BarrelProps) {
  const [position] = usePosition({
    x: x ?? 240,
    y: y ?? 240,
    z: z ?? 0,
  });

  return (
    <Sprite
      src={objectsImage}
      x={position.x}
      y={position.y}
      sheet={{
        height: 16,
        width: 16,
      }}
      selectedSprite={2}
    />
  );
}
