import overworldImage from "../assets/Overworld.png";
import { usePositionComponent } from "../library/Entity";
import { createSpriteSheet, MultiSpriteSheet, Render } from "../library/Render";

export default function Ground() {
  const spriteSheet = createSpriteSheet({
    spriteWidth: 16,
    spriteHeight: 16,
    width: 640,
    height: 576,
    src: overworldImage,
  });
  const position = usePositionComponent({
    x: 0,
    y: 0,
    z: 0,
  });

  const grassTiles = [];
  for (let i = 0; i < 5000; i++) {
    grassTiles.push(spriteSheet.sprites[0]);
  }
  return (
    <Render>
      <MultiSpriteSheet
        tilesPerRow={50}
        src={spriteSheet.src}
        sprites={grassTiles}
      />
    </Render>
  );
}
