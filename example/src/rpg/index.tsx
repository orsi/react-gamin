import Barrel from "./Barrel";
import Box from "./Box";
import Fountain from "./Fountain";
import Ground from "./Ground";
import House from "./House";
import MiloChar from "./MiloChar";
import Chest from "./Chest";
import Plant from "./Plant";
import { Game, Entities } from "react-gamin";

export default function RPG() {
  return (
    <Game>
      <Entities
        entities={[
          <Ground spriteIndex={0} />,
          <Box x={350} y={150} />,
          <Barrel x={400} y={150} />,
          <House x={300} y={200} />,
          <Fountain x={200} y={200} />,
          <Chest x={260} y={160} />,
          <Plant x={260} y={250} />,
          <MiloChar />,
        ]}
      />
    </Game>
  );
}
