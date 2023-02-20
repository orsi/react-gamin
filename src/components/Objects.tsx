import { Fragment, ReactNode } from "react";
import overworldImage from "../assets/Overworld.png";
import useSpriteSheet from "./Sprite";
import { useBody, useMovement, usePosition } from "../library/Game";

export function Objects() {
  const mapSprites = useSpriteSheet({
    cellWidth: 16,
    cellHeight: 16,
    width: 640,
    height: 576,
    src: overworldImage,
  });

  function Tile(sprites: ReactNode[]) {
    const body = useBody({ solid: true, width: 16, height: 32 });
    const position = usePosition({
      x: 240,
      y: 240,
      z: 0,
    });
    useMovement("tile", position, body);

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: "absolute",
          top: "0",
          left: "0",
          transform: `translate(${position[0].x}px, ${position[0].y}px)`,
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
