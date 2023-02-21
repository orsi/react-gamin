import Game from "./library/Game";
import Character from "./entities/Character";
import Box from "./entities/Box";

function App() {
  const boxes = [];
  for (let i = 0; i < 500; i++) {
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
