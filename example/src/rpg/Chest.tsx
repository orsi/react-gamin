import objectsImage from "./assets/objects.png";
import { useState } from "react";
import {
  Sprite,
  IEntity,
  useBodyComponent,
  usePositionComponent,
} from "react-gamin";
import { useAction } from "./Systems";

interface BarrelProps {
  x?: number;
  y?: number;
  z?: number;
}
export default function Chest({ x, y, z }: BarrelProps) {
  const [currentSprite, setCurrentSprite] = useState(0);
  useBodyComponent({
    height: 16,
    width: 16,
  });
  const [position] = usePositionComponent({
    x: x ?? 240,
    y: y ?? 240,
    z: z ?? 0,
  });

  useAction((actor: IEntity) => {
    if (currentSprite === 0) {
      setCurrentSprite(1);
      const position = actor.get("position");
      // blast back!
      actor.set("position", {
        x: position.x,
        y: position.y + 10,
      });
    }
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
      selectedSprite={currentSprite}
    />
  );
}
