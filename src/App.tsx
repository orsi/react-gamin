import Character1 from "./Character";
import Character2 from "./Character2";
import Game, { Stage } from "./components/Game";
import { DefaultMap } from "./DefaultMap";

function App() {
  return (
    <div className="App">
      <Game input={["gamepad"]}>
        <Stage>
          <DefaultMap />
          <Character1 />
          <Character2 />
        </Stage>
      </Game>
    </div>
  );
}

export default App;
