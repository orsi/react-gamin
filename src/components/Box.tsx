import { Fragment, ReactNode } from "react";
import overworldImage from "../assets/Overworld.png";
import useSpriteSheet from "../library/Sprite";
import {
  createEntity,
  useBody,
  useMovementSystem,
  usePosition,
} from "../library/Game";

type BoxProps = {
  x?: number;
  y?: number;
  z?: number;
  solid?: boolean;
};
export default createEntity(function Box({ x, y, z, solid }: BoxProps) {
  const mapSprites = useSpriteSheet({
    cellWidth: 16,
    cellHeight: 16,
    width: 640,
    height: 576,
    src: overworldImage,
  });

  const body = useBody({ solid: solid ?? true, width: 16, height: 32 });
  const position = usePosition({
    x: x ?? 240,
    y: y ?? 240,
    z: z ?? 0,
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
