import { useState, useEffect, PropsWithChildren, useRef } from "react";
import { GameInput } from "./Input";
import { createStore } from "./createStore";

const GameStore = createStore({
  test: 4,
});
export const useGameStore = GameStore.useStore;

interface GameProps {
  actions?: [{ action?: string; input: any /*Input*/ }];
}
export default function Game({ children }: PropsWithChildren<GameProps>) {
  const gameDivRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [height, setHeight] = useState(480);

  function onWindowResize() {
    const bounds = document.body.getBoundingClientRect();
    setHeight(bounds.height);
    setWidth(bounds.width);
  }

  useEffect(() => {
    window.addEventListener("resize", onWindowResize);
    onWindowResize();

    return () => {
      window.removeEventListener("resize", onWindowResize);
    };
  }, []);

  return (
    <div
      ref={gameDivRef}
      style={{
        position: "relative",
        height,
        width,
      }}
    >
      <GameStore.Provider>
        <GameInput>{children}</GameInput>
      </GameStore.Provider>
    </div>
  );
}

export function Stage({ children }: PropsWithChildren) {
  return <>{children}</>;
}
