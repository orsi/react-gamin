import { Fragment, useRef, useState } from "react";
import overworldImage from "../assets/Overworld.png";
import {
  createEntity,
  useBody,
  usePosition,
  TEntity,
  useEntity,
  useBodyComponent,
  usePositionComponent,
} from "../library/Entity";
import { useSpriteSheet } from "../library/Render";
import {
  useInteract,
  useInteractSystem,
  useMovement,
  useMovementSystem,
  useStuff,
} from "../library/System";

type BoxProps = {
  x?: number;
  y?: number;
  z?: number;
  solid?: boolean;
};
export default createEntity(function Box({ x, y, z, solid }: BoxProps) {
  const ref = useRef(null);
  const entity = useEntity(ref);
  const mapSprites = useSpriteSheet({
    cellWidth: 16,
    cellHeight: 16,
    width: 640,
    height: 576,
    src: overworldImage,
  });
  const body = useBodyComponent(entity, {
    solid: solid ?? true,
    width: 16,
    height: 32,
  });
  const position = usePositionComponent(entity, {
    x: x ?? 240,
    y: y ?? 240,
    z: z ?? 0,
  });

  const [element, setElement] = useState(mapSprites[30]);

  useMovementSystem(entity);
  useInteractSystem(entity, (e: TEntity) => {
    console.log("who's interacting me?", e);
    setElement(mapSprites[Math.floor(Math.random() * mapSprites.length)]);
  });

  return (
    <div
      ref={ref}
      style={{
        display: "flex",
        flexDirection: "column",
        position: "absolute",
        top: "0",
        left: "0",
        transform: `translate(${position[0].x}px, ${position[0].y}px)`,
      }}
    >
      <Fragment>{element}</Fragment>
      <Fragment>{mapSprites[70]}</Fragment>
    </div>
  );
});
