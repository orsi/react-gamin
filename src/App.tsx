import Character1 from "./Character";
import Character2 from "./Character2";
import Character3 from "./Character3";
import Game, { Stage } from "./components/Game";
import { DefaultMap } from "./DefaultMap";

function App() {
  return (
    <div className="App">
      <Game>
        <Stage>
          <DefaultMap />
          <Character2 />
          <Character3 />
        </Stage>
      </Game>
    </div>
  );
}

export default App;
