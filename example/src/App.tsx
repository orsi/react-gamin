import { Game, InteractSystem, MovementSystem, Stage } from "react-gamin";
import { useEffect, useRef, useState } from "react";
import Barrel from "./components/Barrel";
import Box from "./components/Box";
import Fountain from "./components/Fountain";
import Ground from "./components/Ground";
import House from "./components/House";
import MiloChar from "./components/MiloChar";

export default function App() {
  const ref = useRef();
  const [currentStage, setCurrentStage] = useState("1");

  const changeStage = () => {
    setCurrentStage(currentStage === "1" ? "2" : "1");
  };

  useEffect(() => {
    console.log("game state", ref.current);
  }, []);

  return (
    <div id="app" onClick={undefined}>
      <Game
        currentStage={currentStage}
        ref={ref}
        systems={[MovementSystem, InteractSystem]}
      >
        <Stage name={`1`}>
          <Ground spriteIndex={0} />
          <Box x={350} y={150} solid={true} />
          <Barrel x={400} y={150} solid={true} />
          <House x={300} y={200} solid={true} />
          <Fountain x={200} y={200} solid={true} />
          <MiloChar />
        </Stage>
        <Stage name={`2`}>
          <Ground spriteIndex={4} />
          <Box x={120} y={320} solid={true} />
          <Barrel x={230} y={75} solid={true} />
          <House x={75} y={400} solid={true} />
          <Fountain x={450} y={100} solid={true} />
          <MiloChar x={120} y={500} />
        </Stage>
      </Game>
    </div>
  );
}
