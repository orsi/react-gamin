import Game from "./library/Game";
import Character from "./components/Character";
import Objects from "./components/Box";

function App() {
  return (
    <div className="App">
      <Game>
        <Objects />
        <Character />
      </Game>
    </div>
  );
}

export default App;
