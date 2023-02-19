import { useCallback, useEffect, useRef } from "react";

const FPS = 60;
const FRAME_MS = 1000 / FPS;

export default function useFrame(callback: () => void) {
  const frame = useRef(0);
  const lastUpdate = useRef(Date.now());

  const update = useCallback((callback: () => void) => {
    const now = Date.now();
    const delta = now - lastUpdate.current;
    if (delta > FRAME_MS) {
      callback();
      lastUpdate.current = now;
    }
    frame.current = requestAnimationFrame(() => update(callback));
  }, []);

  useEffect(() => {
    callback();
    return () => {
      cancelAnimationFrame(frame.current);
    };
  }, []);
}
