import { HTMLProps, useEffect, useRef, useState } from "react";

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
  style,
  ...props
}: SpriteProps) {
  const spriteStyle: React.CSSProperties = {
    position: "absolute",
  };

  const transforms = [];
  if (perspective != null) {
    transforms.push(`perspective(${perspective})`);
  }

  if (position != null) {
    transforms.push(`translate(${position.x}px, ${position.y}px)`);
    spriteStyle.zIndex = `${position.z}`;
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

  spriteStyle.transform = transforms.join(" ");
  spriteStyle.imageRendering = "crisp-edges"; // necessary?

  return (
    <img
      src={src}
      style={{
        ...spriteStyle,
        ...style,
      }}
      {...props}
    />
  );
}

const DEFAULT_FRAME_INTERVAL = 1000 / 10; // 10fps
export interface AnimatedSpriteProps extends SpriteProps {
  sprites: SpriteProps[];
  // optional
  frameLengthMs?: number;
  loop?: boolean;
  play?: boolean;
}
export function AnimatedSprite({
  sprites,
  // optional
  frameLengthMs = DEFAULT_FRAME_INTERVAL,
  loop = true,
  play = true,
  ...props
}: AnimatedSpriteProps) {
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const lastUpdateRef = useRef(0);
  const requestAnimationFrameRef = useRef(0);

  useEffect(() => {
    const update = (time: number) => {
      const delta = time - lastUpdateRef.current;

      if (delta > frameLengthMs) {
        const isPlaying =
          play && (loop || currentFrameIndex + 1 < sprites.length);
        if (!isPlaying) {
          return;
        }
        const nextFrame = (currentFrameIndex + 1) % sprites.length;

        setCurrentFrameIndex(nextFrame);
        lastUpdateRef.current = time;
      }

      requestAnimationFrameRef.current = requestAnimationFrame(update);
    };

    requestAnimationFrameRef.current = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(requestAnimationFrameRef.current);
    };
  }, [currentFrameIndex, loop, play]);

  return <Sprite {...sprites[currentFrameIndex]} {...props} />;
}

export interface SpriteSheet {
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface SpriteSheetProps<T extends Record<string, SpriteSheet>>
  extends SpriteProps,
    HTMLProps<HTMLImageElement> {
  src: string;
  sprite: keyof T;
  sprites: T;
}
export function SpriteSheet<T extends Record<string, SpriteSheet>>({
  sprite,
  sprites,
  style,
  ...props
}: SpriteSheetProps<T>) {
  const spriteSheetStyle: React.CSSProperties = {
    height: `${sprites[sprite].height}px`,
    objectFit: "none",
    objectPosition: `${-sprites[sprite].x}px ${-sprites[sprite].y}px`,
    width: `${sprites[sprite].width}px`,
  };

  return (
    <Sprite
      style={{
        ...spriteSheetStyle,
        ...style,
      }}
      {...props}
    />
  );
}

export interface Animation {
  sprite: string;
}
export interface AnimatedSpriteSheetProps<
  T extends Record<string, Animation[]>,
  U extends Record<string, SpriteSheet>
> extends Omit<SpriteSheetProps<U>, "sprite"> {
  animation: keyof T;
  animations: T;
  // optional
  frameLengthMs?: number;
  loop?: boolean;
  play?: boolean;
}
export function AnimatedSpriteSheet<
  T extends Record<string, Animation[]>,
  U extends Record<string, SpriteSheet>
>({
  animation,
  animations,
  sprites,
  // optional
  frameLengthMs = DEFAULT_FRAME_INTERVAL,
  loop = true,
  play = true,
  ...props
}: AnimatedSpriteSheetProps<T, U>) {
  const [currentAnimationFrameIndex, setCurrentAnimationFrameIndex] =
    useState(0);
  const lastUpdateRef = useRef(0);
  const requestAnimationFrameRef = useRef(0);

  useEffect(() => {
    const update = (time: number) => {
      const delta = time - lastUpdateRef.current;

      if (delta > frameLengthMs) {
        const isPlaying =
          play &&
          (loop ||
            currentAnimationFrameIndex + 1 < animations[animation].length);
        if (!isPlaying) {
          return;
        }

        const nextFrame =
          (currentAnimationFrameIndex + 1) % animations[animation].length;

        setCurrentAnimationFrameIndex(nextFrame);
        lastUpdateRef.current = time;
      }

      requestAnimationFrameRef.current = requestAnimationFrame(update);
    };

    requestAnimationFrameRef.current = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(requestAnimationFrameRef.current);
    };
  }, [
    animations,
    animation,
    currentAnimationFrameIndex,
    frameLengthMs,
    loop,
    play,
  ]);

  return (
    <SpriteSheet
      sprite={animations?.[animation]?.[currentAnimationFrameIndex]?.sprite}
      sprites={sprites}
      {...props}
    />
  );
}

interface DevelopmentProps {
  frameDeltasRef: React.MutableRefObject<number[]>;
}
export function Development({ frameDeltasRef }: DevelopmentProps) {
  const [output, setOutput] = useState("-");

  useEffect(() => {
    const interval = setInterval(() => {
      setOutput(
        `~${Math.round(
          1000 /
            (frameDeltasRef.current.reduce((acc, time) => acc + time, 0) /
              frameDeltasRef.current.length)
        )} fps`
      );
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      style={{
        bottom: `0px`,
        padding: `12px`,
        position: "absolute",
        right: `0px`,
      }}
    >
      <div>Diagnostics</div>
      <div>
        <small>{output}</small>
      </div>
    </div>
  );
}
