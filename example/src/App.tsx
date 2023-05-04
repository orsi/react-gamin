import { useState } from "react";
import {
  AnimatedSpriteSheet,
  useAudio,
  useKey,
} from "react-gamin";

export default function App() {
  const [position, setPosition] = useState({ x: 500, y: 200, z: 0 });
  const [rotation, setRotation] = useState({ x: 0.5, y: 0.5, z: 0, deg: 45 });
  const [scale, setScale] = useState({ x: 1, y: 2, z: 0.5 });

  // audio
  const sample = useAudio("/beep-03.wav");
  const satie = useAudio("/Gymnopedie_No._1.mp3");

  useKey(
    "w",
    () => {
      satie.play();
      setPosition({
        ...position,
        y: position.y - 5,
      });
    },
    true
  );

  useKey(
    "s",
    () => {
      satie.stop();
      setPosition({
        ...position,
        y: position.y + 5,
      });
    },
    true
  );

  useKey(
    "a",
    () => {
      sample.play();
      setPosition({
        ...position,
        x: position.x - 5,
      });
      setRotation({
        ...rotation,
        x: rotation.x - 0.1,
        y: rotation.y - 0.1,
        deg: rotation.deg - 1,
      });
      setScale({
        ...scale,
        x: scale.x - 0.1,
        y: scale.y - 0.1,
      });
    },
    true
  );

  useKey(
    "d",
    () => {
      setPosition({
        ...position,
        x: position.x + 5,
      });
      setRotation({
        ...rotation,
        x: rotation.x + 0.1,
        y: rotation.y + 0.1,
        deg: rotation.deg + 1,
      });
      setScale({
        ...scale,
        x: scale.x + 0.1,
        y: scale.y + 0.1,
      });
    },
    true
  );

  return (
    <>
      <AnimatedSpriteSheet
        position={position}
        src="/monster-sprite-sheet.png"
        animation="walk"
        animations={{
          walk: [
            {
              sprite: "sprite1",
            },
            {
              sprite: "sprite2",
            },
            {
              sprite: "sprite3",
            },
          ],
        }}
        sprites={{
          sprite1: {
            x: 0,
            y: 0,
            width: 24,
            height: 32,
          },
          sprite2: {
            x: 24,
            y: 0,
            width: 24,
            height: 32,
          },
          sprite3: {
            x: 48,
            y: 0,
            width: 24,
            height: 32,
          },
        }}
      />
    </>
  );
}
