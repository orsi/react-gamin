import { HTMLProps, useState, useRef, useEffect } from 'react';
import { SpriteProps, Sprite } from './Sprite';

const DEFAULT_FRAME_INTERVAL = 1000 / 10; // 10fps
export interface AnimatedSpriteProps
  extends HTMLProps<HTMLImageElement>,
    Omit<SpriteProps, 'src'> {
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
