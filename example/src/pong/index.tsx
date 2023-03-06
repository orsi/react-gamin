import { useRef, useState } from "react";
import {
  Entity,
  Game,
  IEntity,
  useBodyComponent,
  useComponent,
  useGame,
  usePositionComponent,
  useUpdate,
  useVelocityComponent,
} from "react-gamin";

export default function Pong() {
  const startGame = () => {
    setCurrentScene(<PlayScene onGameOver={showEndScene} />);
  };

  const showEndScene = (win: boolean) => {
    setCurrentScene(
      <EndScene text={win ? `YOU WIN` : `GAME OVER`} onPlayAgain={startGame} />
    );
  };

  const [currentScene, setCurrentScene] = useState(
    <TitleScene onStart={startGame} />
  );

  return <Game style={{ border: `1px solid white` }}>{currentScene}</Game>;
}

const BALL_SPEED = 5;
const PADDLE_SPEED = 6;
const MAX_SCORE = 5;

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
  const height = useGame((state) => state.height);
  const width = useGame((state) => state.width);
  const playerScoreRef = useRef<IEntity>();
  const opponentScoreRef = useRef<IEntity>();
  const playerPaddleRef = useRef<IEntity>();
  const opponentPaddleRef = useRef<IEntity>();
  const dividerRef = useRef<IEntity>();
  const ballRef = useRef<IEntity>();

  useUpdate((input, delta) => {
    // pong game logic highly based off of:
    // https://gist.github.com/straker/81b59eecf70da93af396f963596dfdc5

    // BALL BOUNCING
    if (
      ballRef.current.get("position").y + ballRef.current.get("body").height >=
      height
    ) {
      ballRef.current.set("velocity", {
        x: ballRef.current.get("velocity").x,
        y: -BALL_SPEED,
      });
    } else if (ballRef.current.get("position").y <= 0) {
      ballRef.current.set("velocity", {
        x: ballRef.current.get("velocity").x,
        y: BALL_SPEED,
      });
    }
    const newY =
      ballRef.current.get("position").y + ballRef.current.get("velocity").y;

    if (
      ballRef.current.get("position").x + ballRef.current.get("body").width >=
      width
    ) {
      ballRef.current.set("velocity", {
        x: -BALL_SPEED,
        y: ballRef.current.get("velocity").y,
      });
    } else if (ballRef.current.get("position").x <= 0) {
      ballRef.current.set("velocity", {
        x: BALL_SPEED,
        y: ballRef.current.get("velocity").y,
      });
    }
    const newX =
      ballRef.current.get("position").x + ballRef.current.get("velocity").x;
    ballRef.current.set("position", { x: newX, y: newY });

    // SCORE
    function resetBall(ball: IEntity) {
      const newX = width / 2 - ball.get("body").width;
      const newY = height / 2 - ball.get("body").height;
      ball.set("position", { x: newX, y: newY });
      const direction = Math.random() < 0.5 ? 1 : -1;
      ball.set("velocity", {
        x: BALL_SPEED * direction,
        y: ball.get("velocity").y,
      });
    }

    const currentPlayerScore = playerScoreRef.current.get("score");
    const currentOpponentScore = opponentScoreRef.current.get("score");
    if (
      ballRef.current.get("position").x + ballRef.current.get("body").width >=
      width
    ) {
      // player scores if hitting right wall
      const newPlayerScore = currentPlayerScore + 1;
      if (newPlayerScore < MAX_SCORE) {
        playerScoreRef.current.set("score", newPlayerScore);
        resetBall(ballRef.current);
      } else {
        // player won!
        onGameOver(true);
      }
    } else if (ballRef.current.get("position").x <= 0) {
      // opponent scores if hitting left wall
      const newOpponentScore = currentOpponentScore + 1;
      if (newOpponentScore < 2) {
        opponentScoreRef.current.set("score", newOpponentScore);
        resetBall(ballRef.current);
      } else {
        // opponent won :()
        onGameOver(false);
      }
    }

    // move opponent, and update if they hit walls
    const opponentY =
      opponentPaddleRef.current.get("position").y +
      opponentPaddleRef.current.get("velocity").y;
    opponentPaddleRef.current.set("position", {
      x: opponentPaddleRef.current.get("position").x,
      y: opponentY,
    });
    if (
      opponentPaddleRef.current.get("position").y +
        opponentPaddleRef.current.get("body").height >=
      height
    ) {
      opponentPaddleRef.current.set("velocity", {
        x: opponentPaddleRef.current.get("velocity").x,
        y: -PADDLE_SPEED,
      });
    } else if (opponentPaddleRef.current.get("position").y <= 0) {
      opponentPaddleRef.current.set("velocity", {
        x: opponentPaddleRef.current.get("velocity").x,
        y: PADDLE_SPEED,
      });
    }

    function collides(obj1: IEntity, obj2: IEntity) {
      const obj1Body = obj1.get("body");
      const obj1Position = obj1.get("position");
      const obj2Body = obj2.get("body");
      const obj2Position = obj2.get("position");
      return (
        obj1Position.x < obj2Position.x + obj2Body.width &&
        obj1Position.x + obj1Body.width > obj2Position.x &&
        obj1Position.y < obj2Position.y + obj2Body.height &&
        obj1Position.y + obj1Body.height > obj2Position.y
      );
    }

    const ballVelocity = ballRef.current.get("velocity");
    const ballPosition = ballRef.current.get("position");
    const ballBody = ballRef.current.get("body");
    const playerPosition = playerPaddleRef.current.get("position");
    const playerBody = playerPaddleRef.current.get("body");
    const opponentPosition = opponentPaddleRef.current.get("position");
    if (collides(ballRef.current, playerPaddleRef.current)) {
      ballRef.current.set("velocity", {
        x: ballVelocity.x * -1,
        y: ballVelocity.y,
      });
      ballRef.current.set("position", {
        x: playerPosition.x + playerBody.width,
        y: ballPosition.y,
      });
    } else if (collides(ballRef.current, opponentPaddleRef.current)) {
      ballRef.current.set("velocity", {
        x: ballVelocity.x * -1,
        y: ballVelocity.y,
      });

      ballRef.current.set("position", {
        x: opponentPosition.x - ballBody.width,
        y: ballPosition.y,
      });
    }
  });

  return (
    <>
      <Entity id="player-score" ref={playerScoreRef}>
        <Score x={24} />
      </Entity>
      <Entity id="opponent-score" ref={opponentScoreRef}>
        <Score x={width - 24} />
      </Entity>
      <Entity id="player" ref={playerPaddleRef}>
        <PlayerPaddle />
      </Entity>
      <Entity id="opponent" ref={opponentPaddleRef}>
        <OpponentPaddle />
      </Entity>
      <Entity id="divider" ref={dividerRef}>
        <Divider />
      </Entity>
      <Entity id="ball" ref={ballRef}>
        <Ball />
      </Entity>
    </>
  );
}

function Score({ x }: { x: number }) {
  const [score] = useComponent("score", 0);
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
  const [body] = useBodyComponent({
    width: 15,
    height: 100,
  });
  const [position, setPosition] = usePositionComponent({
    x: 30,
    y: height / 2 - 50,
  });
  const [velocity] = useVelocityComponent({
    dx: PADDLE_SPEED,
    dy: PADDLE_SPEED,
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
  const [body] = useBodyComponent({
    width: 15,
    height: 100,
  });
  const [position] = usePositionComponent({
    x: width - 30,
    y: height / 2 - 50,
  });
  const [velocity] = useVelocityComponent({
    dx: PADDLE_SPEED,
    dy: PADDLE_SPEED,
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
  const [position] = useComponent("position", {
    x: width / 2 - 25,
    y: height / 2 - 25,
  });
  const velocity = useComponent("velocity", {
    x: BALL_SPEED,
    y: BALL_SPEED,
  });
  const [body] = useComponent("body", {
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
