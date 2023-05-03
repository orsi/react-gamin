import { useState } from 'react';
import { AnimatedSprite, Sprite, useAudio, useKey } from 'react-gamin';

export default function App() {
  const [position, setPosition] = useState({ x: 500, y: 200, z: 0 });
  const [rotation, setRotation] = useState({ x: 0.5, y: 0.5, z: 0, deg: 45 });
  const [scale, setScale] = useState({ x: 1, y: 2, z: 0.5 });

  // audio
  const sample = useAudio('/beep-03.wav');
  const satie = useAudio('/Gymnopedie_No._1.mp3');

  useKey(
    'w',
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
    's',
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
    'a',
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
    'd',
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
      <AnimatedSprite
        position={position}
        sprites={[
          {
            src: '/monster-sprite.png',
          },
          {
            height: 64,
            src: '/monster-sprite-1.png',
          },
          {
            height: 72,
            src: '/monster-sprite-2.png',
          },
          {
            height: 96,
            src: '/monster-sprite-3.png',
          },
        ]}
      />
      <Sprite
        position={{
          x: Math.random() * 500,
          y: Math.random() * 500,
          z: Math.random() * 500,
        }}
        src="/monster-sprite.png"
      />
    </>
  );
}
