import { useRef } from "react";
import {
  Game,
  Stage,
  ActionSystem,
  MoveSystem,
  GameContext,
  GameDebugger,
} from "react-gamin";

export default function Puzzle() {
  const ref = useRef<GameContext>();

  return (
    <h1>hi</h1>
    // <Game ref={ref}>
    //   <GameDebugger />
    // </Game>
  );
}
