import Box from "./Box";
import Game from "../library/Game";
import { useEffect, useRef } from "react";
import System from "../library/System";
import Stage from "../library/Stage";
import MiloChar from "./MiloChar";

export default function MyGame() {
  const boxes = [];
  for (let i = 0; i < 20; i++) {
    const exitBox = Math.random() > 0.9;
    const x = Math.floor(Math.random() * 640);
    const y = Math.floor(Math.random() * 640);
    const z = Math.floor(Math.random() * 640);
    boxes.push(<Box exit={exitBox} key={i} x={x} y={y} z={z} solid={false} />);
  }
  const boxes2 = [];
  for (let i = 0; i < 20; i++) {
    const exitBox = Math.random() > 0.9;
    const x = Math.floor(Math.random() * 640);
    const y = Math.floor(Math.random() * 640);
    const z = Math.floor(Math.random() * 640);
    boxes2.push(<Box exit={exitBox} key={i} x={x} y={y} z={z} solid={true} />);
  }

  const ref = useRef(null);
  useEffect(() => {
    console.log("ref", ref);
  }, []);

  return (
    <Game ref={ref}>
      <System>
        <Stage>
          {boxes}
          <MiloChar />
        </Stage>
        {/* <SecondStage>
        {boxes2}
      </SecondStage> */}
      </System>
    </Game>
  );
}
