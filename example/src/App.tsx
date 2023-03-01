import {
  Game,
  InputSystem,
  GameState,
  MovementSystemProvider,
  Stage,
  StageRef,
} from "react-gamin";
import { ChangeEvent, useRef, useState } from "react";
import Barrel from "./components/Barrel";
import Box from "./components/Box";
import Fountain from "./components/Fountain";
import Ground from "./components/Ground";
import House from "./components/House";
import MiloChar from "./components/MiloChar";

const DEVELOPMENT_MODE = import.meta.env.MODE === "development";

export default function App() {
  const ref = useRef<GameState>();
  const stageRef = useRef<StageRef>();
  const [currentStage, setCurrentStage] = useState("2");

  const onSelectChangeStage = (e: ChangeEvent<HTMLSelectElement>) => {
    setCurrentStage(e.target.value);
  };

  const onClickAddRandomEntity = () => {
    stageRef.current.addEntity(
      <Box x={Math.random() * 400} y={Math.random() * 400} />
    );
  };

  const stages = [
    <Stage key={1} ref={stageRef} name={`1`}>
      <Ground spriteIndex={0} />
      <Box x={350} y={150} solid={true} />
      <Barrel x={400} y={150} solid={true} />
      <House x={300} y={200} solid={true} />
      <Fountain x={200} y={200} solid={true} />
      <MiloChar />
    </Stage>,
    <Stage key={2} ref={stageRef} name={`2`}>
      <Ground spriteIndex={240} />
      <Box x={120} y={320} solid={true} />
      <Barrel x={230} y={75} solid={true} />
      <House x={75} y={400} solid={true} />
      <Fountain x={450} y={100} solid={true} />
      <MiloChar x={120} y={500} />
    </Stage>,
  ];
  const systems = [InputSystem, MovementSystemProvider];

  return (
    <div id="app">
      <div
        style={{
          bottom: "0",
          fontSize: "10px",
          display: DEVELOPMENT_MODE ? "flex" : "none",
          flexDirection: "column",
          position: "fixed",
          margin: "16px",
          right: "0",
          zIndex: "9999",
        }}
      >
        <select value={currentStage} onChange={onSelectChangeStage}>
          {stages.map((stage, i) => (
            <option key={i} value={i + 1}>
              Stage {i + 1}
            </option>
          ))}
        </select>
        <button onClick={onClickAddRandomEntity}>Add Random Entity</button>
        <div>
          Game Systems Added:
          <ul>
            {systems.map((system, i) => (
              <li key={i}>{system.name}</li>
            ))}
          </ul>
        </div>
      </div>
      <Game ref={ref} currentStage={currentStage} systems={systems}>
        {stages}
      </Game>
    </div>
  );
}
