import { SpriteCanvas } from "react-gamin";
import overworldImage from "../assets/Overworld.png";

interface GroundProps {
  spriteIndex?: number;
}
export default function Ground({ spriteIndex }: GroundProps) {
  const tiles: number[][] = [];
  for (let y = 0; y < 100; y++) {
    if (!tiles[y]) {
      tiles[y] = [];
    }
    for (let x = 0; x < 100; x++) {
      tiles[y].push(spriteIndex ?? 0);
    }
  }
  return (
    <SpriteCanvas
      src={overworldImage}
      sheet={{
        width: 16,
        height: 16,
      }}
      sprites={tiles}
    />
  );
}
