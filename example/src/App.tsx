import { HTMLProps, useEffect, useRef, useState } from 'react';
import { Sheet, getSpriteStyles, useAudio, useKey } from 'react-gamin';

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
      <Sprite
        position={position}
        rotation={rotation}
        scale={scale}
        src="/monster-sprite.png"
      />
      <Sprite
        position={{
          x: Math.random() * 500,
          y: Math.random() * 500,
          z: Math.random() * 500,
        }}
        rotation={{
          x: Math.random() * 500,
          y: Math.random() * 500,
          z: Math.random() * 500,
          deg: Math.random() * 360,
        }}
        scale={{
          x: Math.random() * 5,
          y: Math.random() * 5,
          z: Math.random() * 5,
        }}
        perspective={Math.random() * 100}
        skew={{
          x: Math.random() * 360,
          y: Math.random() * 360
        }}
        src="/monster-sprite.png"
      />
      <Sprite
        position={{
          x: Math.random() * 500,
          y: Math.random() * 500,
          z: Math.random() * 500,
        }}
        rotation={{
          x: Math.random() * 500,
          y: Math.random() * 500,
          z: Math.random() * 500,
          deg: Math.random() * 360,
        }}
        scale={{
          x: Math.random() * 5,
          y: Math.random() * 5,
          z: Math.random() * 5,
        }}
        perspective={Math.random() * 100}
        skew={{
          x: Math.random() * 360,
          y: Math.random() * 360
        }}
        src="/monster-sprite.png"
      />
      <Sprite
        position={{
          x: Math.random() * 500,
          y: Math.random() * 500,
          z: Math.random() * 500,
        }}
        rotation={{
          x: Math.random() * 500,
          y: Math.random() * 500,
          z: Math.random() * 500,
          deg: Math.random() * 360,
        }}
        scale={{
          x: Math.random() * 5,
          y: Math.random() * 5,
          z: Math.random() * 5,
        }}
        perspective={Math.random() * 100}
        skew={{
          x: Math.random() * 360,
          y: Math.random() * 360
        }}
        src="/monster-sprite.png"
      />
    </>
  );
}

export interface SpriteProps extends HTMLProps<HTMLImageElement> {
  src: string;
  // optional
  perspective?: number;
  position?: {
    x: number;
    y: number;
    z: number;
  };
  rotation?: {
    x: number;
    y: number;
    z: number;
    deg: number;
  };
  scale?: {
    x: number;
    y: number;
    z: number;
  };
  skew?: {
    x: number;
    y: number;
  };
}
export function Sprite({
  perspective,
  position,
  rotation,
  scale,
  skew,
  src,
  ...props
}: SpriteProps) {
  const style: React.CSSProperties = {
    position: 'absolute',
  };

  const transforms = [];
  if (perspective != null) {
    transforms.push(`perspective(${perspective})`);
  }

  if (position != null) {
    transforms.push(`translate(${position.x}px, ${position.y}px)`);
    style.zIndex = `${position.z}`;
  }

  if (rotation != null) {
    transforms.push(
      `rotate3d(${rotation.x}, ${rotation.y}, ${rotation.z}, ${rotation.deg}deg)`
    );
  }

  if (scale != null) {
    transforms.push(`scale3d(${scale.x}, ${scale.y}, ${scale.z})`);
  }

  if (skew != null) {
    transforms.push(`skew(${skew.x}deg, ${skew.y}deg)`);
  }

  style.transform = transforms.join(' ');

  return <img src={src} style={style} {...props} />;
}
