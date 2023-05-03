import { HTMLProps } from 'react';

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
  style.imageRendering = 'crisp-edges'; // necessary?

  return <img src={src} style={style} {...props} />;
}
