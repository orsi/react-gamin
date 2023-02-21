import { Fragment, ReactNode } from "react";
import overworldImage from "../assets/Overworld.png";
import useSpriteSheet from "../library/Sprite";
import {
  createEntity,
  useBody,
  useMovementSystem,
  usePosition,
} from "../library/Game";

export default createEntity(function Box() {
  const mapSprites = useSpriteSheet({
    cellWidth: 16,
    cellHeight: 16,
    width: 640,
    height: 576,
    src: overworldImage,
  });

  const body = useBody({ solid: true, width: 16, height: 32 });
  const position = usePosition({
    x: 240,
    y: 240,
    z: 0,
  });

  useMovementSystem();

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
      <Fragment>{mapSprites[30]}</Fragment>
      <Fragment>{mapSprites[70]}</Fragment>
    </div>
  );
});
