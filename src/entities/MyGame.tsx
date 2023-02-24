import Game from "../library/Game";
import { useRef } from "react";
import { InteractSystem, MovementSystem } from "../library/System";
import MyStage from "./MyStage";

export default function MyGame() {
  const ref = useRef(null);

  return (
    <Game
      ref={ref}
      systems={[MovementSystem, InteractSystem]}
      stages={[<MyStage />]}
    />
  );
}
