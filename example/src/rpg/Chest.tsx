import objectsImage from "./assets/objects.png";
import { useState } from "react";
import {
  Sprite,
  useBodyComponent,
  useTransformComponent,
  TransformComponent,
  Transform,
} from "react-gamin";
import { useActionable } from "./Systems";

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
  const [position] = useTransformComponent({
    x: x ?? 240,
    y: y ?? 240,
    z: z ?? 0,
  });

  useActionable((entity) => {
    if (currentSprite === 0) {
      setCurrentSprite(1);
      if (entity.has(TransformComponent)) {
        // blast back!
        entity.update(TransformComponent, {
          // TODO: figure out how we can type this better
          x: (entity.components.transform as Transform).x,
          y: (entity.components.transform as Transform).y + 10,
          z: 0,
        });
      }
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
