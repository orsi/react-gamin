import { useState } from "react";
import { Game, useGame, createComponent, Entities } from "react-gamin";
import {
  PlayerScore,
  OpponentScore,
  PlayerPaddle,
  OpponentPaddle,
  Divider,
  Ball,
} from "./entities";
import {
  useBallMovementSystem,
  useCollisionSystem,
  useOpponentMovementSystem,
  useScoreSystem,
} from "./systems";

export const BALL_SPEED = 5;
export const PADDLE_SPEED = 6;
export const MAX_SCORE = 5;
export const BallComponent = createComponent("ball", undefined);
export const PlayerComponent = createComponent("player", undefined);
export const OpponentComponent = createComponent("opponent", undefined);
export const ScoreComponent = createComponent("score", 0);

export default function Pong() {
  const startGame = () => {
    setScene(<PlayScene onGameOver={showEndScene} />);
  };

  const showEndScene = (win: boolean) => {
    setScene(
      <EndScene text={win ? `YOU WIN` : `GAME OVER`} onPlayAgain={startGame} />
    );
  };

  const [currentScene, setScene] = useState(<TitleScene onStart={startGame} />);

  return <Game style={{ border: `1px solid white` }}>{currentScene}</Game>;
}

function PlayScene({ onGameOver }: { onGameOver?: (win: boolean) => void }) {
  const width = useGame((state) => state.width);

  // use systems
  useBallMovementSystem();
  useOpponentMovementSystem();
  useScoreSystem(onGameOver);
  useCollisionSystem();

  return (
    <Entities
      entities={[
        <PlayerScore x={24} />,
        <OpponentScore x={width - 24} />,
        <PlayerPaddle />,
        <OpponentPaddle />,
        <Divider />,
        <Ball />,
      ]}
    />
  );
}

function TitleScene({ onStart }: { onStart: () => void }) {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        placeItems: "center",
        placeContent: "center",
      }}
    >
      <h1>PONG</h1>
      <button onClick={onStart}>START</button>
    </div>
  );
}

function EndScene({
  text,
  onPlayAgain,
}: {
  text: string;
  onPlayAgain: () => void;
}) {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        placeItems: "center",
        placeContent: "center",
      }}
    >
      <h1>{text}</h1>
      <button onClick={onPlayAgain}>PLAY AGAIN</button>
    </div>
  );
}
