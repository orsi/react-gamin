import { Fragment, ReactNode } from "react";
import overworldImage from "./assets/Overworld.png";
import useSpriteSheet from "./components/Sprite";
import { useEntity, useBody, usePosition } from "./components/Entity";
import { useMovement } from "./components/System";

export function DefaultMap() {
  const mapSprites = useSpriteSheet({
    cellWidth: 16,
    cellHeight: 16,
    width: 640,
    height: 576,
    src: overworldImage,
  });

  function Tile(sprites: ReactNode[]) {
    const entity = useEntity("tile");
    const body = useBody(entity, { solid: true, width: 16, height: 32 });
    const [position, setPosition] = usePosition(entity, {
      x: 240,
      y: 240,
      z: 0,
    });
    useMovement(entity);

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: "absolute",
          top: "0",
          left: "0",
          transform: `translate(${position.x}px, ${position.y}px)`,
        }}
      >
        {sprites.map((sprite, i) => (
          <Fragment key={i}>{sprite}</Fragment>
        ))}
      </div>
    );
  }

  const boxTitle = Tile([mapSprites[30], mapSprites[70]]);
  return <>{boxTitle}</>;
}
