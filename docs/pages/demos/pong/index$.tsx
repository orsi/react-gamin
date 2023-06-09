import React, { useState } from "react";
import { Game, useGame } from "react-gamin";
import {
  PlayerScore,
  OpponentScore,
  PlayerPaddle,
  OpponentPaddle,
  Divider,
  Ball,
} from "./entities";
import {
  BallMovementSystem,
  CollisionSystem,
  OpponentAISystem,
  ScoreSystem,
} from "./systems";

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

  return (
    <Game
      development
      style={{
        background: "black",
        color: "white",
        height: "480px",
        width: "640px",
      }}
      initialState={{
        onGameOver: showEndScene,
      }}
      systems={[
        BallMovementSystem,
        OpponentAISystem,
        CollisionSystem,
        ScoreSystem,
      ]}
    >
      {currentScene}
    </Game>
  );
}

function PlayScene({ onGameOver }: { onGameOver?: (win: boolean) => void }) {
  const { width } = useGame().state;

  const [entities, setEntities] = useState([
    <PlayerScore x={24} />,
    <OpponentScore x={width - 24} />,
    <PlayerPaddle />,
    <OpponentPaddle />,
    <Divider />,
    <Ball />,
  ]);

  const onClick = () => {
    entities.splice(5, 1);
    setEntities([...entities]);
  };

  return (
    <div onClick={onClick}>
      {entities.map((el, index) => (
        <React.Fragment key={index}>{el}</React.Fragment>
      ))}
    </div>
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
