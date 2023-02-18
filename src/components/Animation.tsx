import { useState, useEffect } from "react";

export default function Animation({
  sprites,
  durationMs,
  animate = true,
  reset = true,
  delay = 0,
}: {
  sprites: any[];
  durationMs: number;
  animate?: boolean;
  reset?: boolean;
  delay?: number;
}) {
  const frameDuration = durationMs / sprites.length;
  const [currentFrame, setCurrentFrame] = useState(0);

  useEffect(() => {
    if (!animate && reset) {
      setCurrentFrame(0);
    }

    let interval = setInterval(() => {
      setCurrentFrame((value) => {
        const nextFrame = (value + 1) % sprites.length;
        return animate ? nextFrame : value;
      });
    }, frameDuration);

    return () => {
      clearInterval(interval);
    };
  }, [animate, reset]);

  return <>{sprites[currentFrame]}</>;
}
