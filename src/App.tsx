import Game from "./library/Game";
import Character from "./components/Character";
import Box from "./components/Box";

function App() {
  const boxes = [];
  for (let i = 0; i < 50; i++) {
    const x = Math.floor(Math.random() * 640);
    const y = Math.floor(Math.random() * 640);
    const z = Math.floor(Math.random() * 640);
    boxes.push(<Box key={i} x={x} y={y} z={z} solid={false} />);
  }
  return (
    <div className="App">
      <Game>
        {boxes}
        <Character />
      </Game>
    </div>
  );
}

export default App;
