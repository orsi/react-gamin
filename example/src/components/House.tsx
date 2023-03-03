import { useBody, usePosition, MultiSprite, useAction } from "react-gamin";
import overworldImage from "../assets/Overworld.png";
interface HouseProps {
  x?: number;
  y?: number;
  z?: number;
}
export default function House({ x, y, z }: HouseProps) {
  useBody({
    height: 80,
    width: 80,
  });
  const [position] = usePosition({
    x: x ?? 240,
    y: y ?? 240,
    z: z ?? 0,
  });

  useAction(() => {
    console.log("mah house!");
  });

  return (
    <MultiSprite
      src={overworldImage}
      sheet={{
        width: 16,
        height: 16,
      }}
      map={[
        [
          { selectedSprite: 6 },
          { selectedSprite: 7 },
          { selectedSprite: 8 },
          { selectedSprite: 9 },
          { selectedSprite: 10 },
        ],
        [
          { selectedSprite: 46 },
          { selectedSprite: 47 },
          { selectedSprite: 48 },
          { selectedSprite: 49 },
          { selectedSprite: 50 },
        ],
        [
          { selectedSprite: 86 },
          { selectedSprite: 87 },
          { selectedSprite: 88 },
          { selectedSprite: 89 },
          { selectedSprite: 90 },
        ],
        [
          { selectedSprite: 126 },
          { selectedSprite: 127 },
          { selectedSprite: 128 },
          { selectedSprite: 129 },
          { selectedSprite: 130 },
        ],
        [
          { selectedSprite: 166 },
          { selectedSprite: 167 },
          { selectedSprite: 168 },
          { selectedSprite: 169 },
          { selectedSprite: 170 },
        ],
      ]}
      x={position.x}
      y={position.y}
      z={position.z}
    />
  );
}
