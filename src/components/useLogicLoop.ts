import { useEffect, useRef } from "react";

const FPS = 60;
const FRAME_MS = 1000 / FPS;

export default function useLogicLoop(
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
