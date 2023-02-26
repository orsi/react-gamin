import overworldImage from "../assets/Overworld.png";
import { usePositionComponent } from "../library/Entity";
import { SpriteCanvas } from "../library/Render";

export default function Ground() {
  const [position] = usePositionComponent({
    x: 0,
    y: 0,
    z: 0,
  });

  const grassTiles: number[][] = [];
  for (let y = 0; y < 100; y++) {
    if (!grassTiles[y]) {
      grassTiles[y] = [];
    }
    for (let x = 0; x < 100; x++) {
      grassTiles[y].push(0);
    }
  }
  return (
    <SpriteCanvas
      src={overworldImage}
      sheet={{
        width: 16,
        height: 16,
      }}
      sprites={grassTiles}
    />
  );
}
