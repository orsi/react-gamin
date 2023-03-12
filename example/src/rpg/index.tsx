import Barrel from "./Barrel";
import Box from "./Box";
import Fountain from "./Fountain";
import Ground from "./Ground";
import House from "./House";
import MiloChar from "./MiloChar";
import Chest from "./Chest";
import Plant from "./Plant";
import { ActionSystem, MoveSystem } from "./Systems";
import { Game, Entity } from "react-gamin";

export default function RPG() {
  return (
    <Game>
      <ActionSystem>
        <MoveSystem>
          <Entity>
            <Ground spriteIndex={0} />
          </Entity>
          <Entity>
            <Box x={350} y={150} />
          </Entity>
          <Entity>
            <Barrel x={400} y={150} />
          </Entity>
          <Entity>
            <House x={300} y={200} />
          </Entity>
          <Entity>
            <Fountain x={200} y={200} />
          </Entity>
          <Entity>
            <Chest x={260} y={160} />
          </Entity>
          <Entity>
            <Plant x={260} y={250} />
          </Entity>
          <Entity>
            <MiloChar />
          </Entity>
        </MoveSystem>
      </ActionSystem>
    </Game>
  );
}
