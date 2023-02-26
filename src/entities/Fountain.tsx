import overworldImage from "../assets/Overworld.png";
import {
  EntityId,
  useBodyComponent,
  usePositionComponent,
} from "../library/Entity";
import { MultiSprite, Sprite } from "../library/Render";
import { useInteractSystem, useMovementSystem } from "../library/System";

interface FountainProps {
  x?: number;
  y?: number;
  z?: number;
  solid?: boolean;
}
export default function Fountain({ x, y, z, solid }: FountainProps) {
  const body = useBodyComponent({
    height: 48,
    width: 48,
    solid: solid ?? true,
  });
  const [position] = usePositionComponent({
    x: x ?? 240,
    y: y ?? 240,
    z: z ?? 0,
  });

  useMovementSystem();
  useInteractSystem((e: EntityId) => {
    console.log("who's interacting me?", e);
  });

  return (
    <MultiSprite
      src={overworldImage}
      sheet={{
        width: 16,
        height: 16,
      }}
      map={[
        [
          {
            selectedSprite: 382,
            animations: [{ frameLength: 100, cells: [382, 385, 388] }],
            selectedAnimation: 0,
          },
          {
            selectedSprite: 383,
            animations: [{ frameLength: 100, cells: [383, 386, 389] }],
            selectedAnimation: 0,
          },
          {
            selectedSprite: 384,
            animations: [{ frameLength: 100, cells: [384, 387, 390] }],
            selectedAnimation: 0,
          },
        ],
        [
          {
            selectedSprite: 422,
            animations: [{ frameLength: 100, cells: [422, 425, 428] }],
            selectedAnimation: 0,
          },
          {
            selectedSprite: 423,
            animations: [{ frameLength: 100, cells: [423, 426, 429] }],
            selectedAnimation: 0,
          },
          {
            selectedSprite: 424,
            animations: [{ frameLength: 100, cells: [424, 427, 430] }],
            selectedAnimation: 0,
          },
        ],
        [
          {
            selectedSprite: 462,
            animations: [{ frameLength: 100, cells: [462, 465, 468] }],
            selectedAnimation: 0,
          },
          {
            selectedSprite: 463,
            animations: [{ frameLength: 100, cells: [463, 466, 469] }],
            selectedAnimation: 0,
          },
          {
            selectedSprite: 464,
            animations: [{ frameLength: 100, cells: [464, 467, 470] }],
            selectedAnimation: 0,
          },
        ],
      ]}
      x={position.x}
      y={position.y}
      z={position.z}
    />
  );
}
