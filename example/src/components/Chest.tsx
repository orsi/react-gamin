import objectsImage from "../assets/objects.png";
import {
  Sprite,
  useBody,
  usePosition,
  useAction,
  Entity,
} from "react-gamin";
import { useState } from "react";

interface BarrelProps {
  x?: number;
  y?: number;
  z?: number;
}
export default function Chest({ x, y, z }: BarrelProps) {
  const [currentSprite, setCurrentSprite] = useState(0);
  useBody({
    height: 16,
    width: 16,
  });
  const [position] = usePosition({
    x: x ?? 240,
    y: y ?? 240,
    z: z ?? 0,
  });

  useAction((actor: Entity) => {
    if (currentSprite === 0) {
      setCurrentSprite(1);
      const [position, setPosition] = actor.components.get("position");
      // blast back!
      setPosition({
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
