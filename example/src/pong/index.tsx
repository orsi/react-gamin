import { useState } from "react";
import {
  Game,
  useBodyComponent,
  useGame,
  useTransformComponent,
  useUpdate,
  useVelocityComponent,
  useComponent,
  createComponent,
  Entities,
} from "react-gamin";
import {
  BallMovementSystem,
  OpponentMovementSystem,
  ScoreSystem,
  CollisionSystem,
} from "./systems";

// pong game logic highly based off of:
// https://gist.github.com/straker/81b59eecf70da93af396f963596dfdc5

export const BALL_SPEED = 5;
export const PADDLE_SPEED = 6;
export const MAX_SCORE = 5;
export const BallComponent = createComponent("ball", undefined);
export const PlayerComponent = createComponent("player", undefined);
export const OpponentComponent = createComponent("opponent", undefined);
export const ScoreComponent = createComponent("score", 0);

export default function Pong() {
  return (
    <Game style={{ border: `1px solid white` }}>
      <PongGame />
    </Game>
  );
}

function PongGame() {
  const startGame = () => {
    setScene(<PlayScene onGameOver={showEndScene} />);
  };

  const showEndScene = (win: boolean) => {
    setScene(
      <EndScene text={win ? `YOU WIN` : `GAME OVER`} onPlayAgain={startGame} />
    );
  };

  const [currentScene, setScene] = useState(<TitleScene onStart={startGame} />);

  return <>{currentScene}</>;
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

function PlayScene({ onGameOver }: { onGameOver?: (win: boolean) => void }) {
  const width = useGame((state) => state.width);

  return (
    <>
      <BallMovementSystem />
      <OpponentMovementSystem />
      <ScoreSystem onGameOver={onGameOver} />
      <CollisionSystem />
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
    </>
  );
}

function PlayerScore({ x }: { x: number }) {
  const [score] = useComponent("score", 0);
  const player = useComponent("player");
  return (
    <div
      style={{
        position: "absolute",
        top: "0px",
        left: "0px",
        transform: `translate(${x}px, 25px)`,
      }}
    >
      {score}
    </div>
  );
}

function OpponentScore({ x }: { x: number }) {
  const [score] = useComponent("score", 0);
  const opponent = useComponent("opponent");
  return (
    <div
      style={{
        position: "absolute",
        top: "0px",
        left: "0px",
        transform: `translate(${x}px, 25px)`,
      }}
    >
      {score}
    </div>
  );
}

function Divider() {
  const width = useGame((state) => state.width);
  return (
    <div
      style={{
        border: `5px dashed #fff`,
        height: "100%",
        width: `0px`,
        position: "absolute",
        top: "0px",
        left: "0px",
        transform: `translate(${width / 2 - 3}px, 0px)`,
      }}
    ></div>
  );
}

function PlayerPaddle() {
  const height = useGame((state) => state.height);
  const player = useComponent("player");
  const [body] = useBodyComponent({
    width: 15,
    height: 100,
  });
  const [position, setPosition] = useTransformComponent({
    x: 30,
    y: height / 2 - 50,
    z: 0,
  });
  const [velocity] = useVelocityComponent({
    dx: PADDLE_SPEED,
    dy: PADDLE_SPEED,
    dz: 0,
  });

  useUpdate(
    (input) => {
      if ((input.KEYBOARD_UP || input.GAMEPAD_BUTTON_12) && position.y >= 0) {
        setPosition({
          x: position.x,
          y: position.y - velocity.dy,
          z: 0,
        });
      } else if (
        (input.KEYBOARD_DOWN || input.GAMEPAD_BUTTON_13) &&
        position.y + body.height <= height
      ) {
        setPosition({
          x: position.x,
          y: position.y + velocity.dy,
          z: 0,
        });
      }
    },
    [position, body, velocity]
  );

  return (
    <div
      style={{
        backgroundColor: "white",
        height: `${body.height}px`,
        left: "0px",
        position: "absolute",
        top: "0px",
        transform: `translate(${position.x}px, ${position.y}px)`,
        width: `${body.width}px`,
      }}
    ></div>
  );
}

function OpponentPaddle() {
  const height = useGame((state) => state.height);
  const width = useGame((state) => state.width);
  const opponent = useComponent("opponent");

  const [body] = useBodyComponent({
    width: 15,
    height: 100,
  });
  const [position] = useTransformComponent({
    x: width - 30,
    y: height / 2 - 50,
    z: 0,
  });
  const [velocity] = useVelocityComponent({
    dx: PADDLE_SPEED,
    dy: PADDLE_SPEED,
    dz: 0,
  });

  return (
    <div
      style={{
        backgroundColor: "white",
        height: `${body.height}px`,
        left: "0px",
        position: "absolute",
        top: "0px",
        transform: `translate(${position.x}px, ${position.y}px)`,
        width: `${body.width}px`,
      }}
    ></div>
  );
}

function Ball() {
  const height = useGame((state) => state.height);
  const width = useGame((state) => state.width);
  const ball = useComponent("ball");
  const [position] = useTransformComponent({
    x: width / 2 - 25,
    y: height / 2 - 25,
    z: 0,
  });
  const velocity = useVelocityComponent({
    dx: BALL_SPEED,
    dy: BALL_SPEED,
    dz: 0,
  });
  const [body] = useBodyComponent({
    width: 25,
    height: 25,
  });

  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "100%",
        left: "0px",
        height: `${body.height}px`,
        position: "absolute",
        top: "0px",
        transform: `translate(${position.x}px, ${position.y}px)`,
        width: `${body.width}px`,
      }}
    ></div>
  );
}
