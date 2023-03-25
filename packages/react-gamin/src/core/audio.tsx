import { useEffect, useRef } from "react";
import { useGame } from "./game";

export function useAudio(src: string) {
  const game = useGame();
  const audioRef = useRef(new Audio(src));

  useEffect(() => {
    //
  }, [src]);

  return {
    play: () => {
      if (audioRef.current.play) {
        audioRef.current.play();
      }
    },
  };
}
