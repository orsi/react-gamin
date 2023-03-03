import {
  Game,
  Stage,
  ActionSystem,
  MoveSystem,
  GameContext,
  GameDebugger,
} from "react-gamin";
import { useRef } from "react";
import Barrel from "./components/Barrel";
import Box from "./components/Box";
import Fountain from "./components/Fountain";
import Ground from "./components/Ground";
import House from "./components/House";
import MiloChar from "./components/MiloChar";
import Chest from "./components/Chest";
import Plant from "./components/Plant";

export default function App() {
  const ref = useRef<GameContext>();

  return (
    <div id="app">
      <Game ref={ref}>
        <GameDebugger />
        <ActionSystem>
          <MoveSystem>
            <Stage name={`1`}>
              <Ground spriteIndex={0} />
              <Box x={350} y={150} />
              <Barrel x={400} y={150} />
              <House x={300} y={200} />
              <Fountain x={200} y={200} />
              <Chest x={260} y={160} />
              <Plant x={260} y={250} />
              <MiloChar />
            </Stage>
            {/* <Stage name={`2`}>
            <Ground spriteIndex={240} />
            <Box x={120} y={320} />
            <Barrel x={230} y={75} />
            <House x={75} y={400} />
            <Fountain x={450} y={100} />
            <MiloChar x={120} y={500} />
          </Stage> */}
          </MoveSystem>
        </ActionSystem>
      </Game>
    </div>
  );
}
