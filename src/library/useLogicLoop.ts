import { useEffect, useRef } from "react";

const FPS = 60;
const FRAME_MS = 1000 / FPS;

/**
 * This hook will run the callback given to it continously
 * via a requestAnimationFrame loop.
 *
 * @param callback Code to run in a continuous loop
 * @param deps State dependencies
 */
export default function useLoop(
  callback: () => void,
  deps?: React.DependencyList,
) {
  const lastUpdate = useRef(Date.now());

  useEffect(() => {
    let frameId = 0;
    const frame = (time: number) => {
      const now = Date.now();
      const delta = now - lastUpdate.current;
      if (delta > FRAME_MS) {
        callback();
        lastUpdate.current = now;
      }
      frameId = requestAnimationFrame(frame);
    };

    frameId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(frameId);
  }, [deps]);
}
