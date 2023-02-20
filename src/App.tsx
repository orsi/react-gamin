import Game from "./library/Game";
import Character2 from "./components/Character2";
import Character4 from "./components/Character4";
import { Objects } from "./components/Objects";

function App() {
  return (
    <div className="App">
      <Game>
        <Objects />
        <Character2 />
        <Character4 />
      </Game>
    </div>
  );
}

export default App;
