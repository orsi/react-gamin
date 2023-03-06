import objectsImage from "../assets/objects.png";
import { Sprite, usePositionComponent } from "react-gamin";

interface BarrelProps {
  x?: number;
  y?: number;
  z?: number;
}
export default function Plant({ x, y, z }: BarrelProps) {
  const [position] = usePositionComponent({
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
