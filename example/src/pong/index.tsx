import { useRef, useState } from "react";
import {
  Entity,
  Game,
  EntityContext,
  useBodyComponent,
  useGame,
  useTransformComponent,
  useSystem,
  useUpdate,
  useVelocityComponent,
  useComponent,
  BodyComponent,
  TransformComponent,
  VelocityComponent,
  createComponent,
} from "react-gamin";

const ScoreComponent = createComponent<number>(0);

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
  const playerScoreRef = useRef<EntityContext>();
  const opponentScoreRef = useRef<EntityContext>();
  const playerPaddleRef = useRef<EntityContext>();
  const opponentPaddleRef = useRef<EntityContext>();
  const dividerRef = useRef<EntityContext>();
  const ballRef = useRef<EntityContext>();

  useSystem(
    (entities, delta) => {
      // pong game logic highly based off of:
      // https://gist.github.com/straker/81b59eecf70da93af396f963596dfdc5
      const [ballBody, setBallBody] =
        ballRef.current.getComponent(BodyComponent);
      const [ballTransform, setBallTransform] =
        ballRef.current.getComponent(TransformComponent);
      const [ballVelocity, setBallVelocity] =
        ballRef.current.getComponent(VelocityComponent);

      const [playerPaddlePosition, setPlayerPaddleTransform] =
        playerPaddleRef.current.getComponent(TransformComponent);
      const [playerPaddleBody] =
        playerPaddleRef.current.getComponent(BodyComponent);

      const [opponentPaddleTransform, setOpponentPaddleTransform] =
        opponentPaddleRef.current.getComponent(TransformComponent);
      const [opponentPaddleBody, setOpponentPaddleBody] =
        opponentPaddleRef.current.getComponent(BodyComponent);
      const [opponentPaddleVelocity, setOpponentPaddleVelocity] =
        opponentPaddleRef.current.getComponent(VelocityComponent);

      const [playerScore, setPlayerScore] =
        playerScoreRef.current.getComponent(ScoreComponent);
      const [opponentScore, setOpponentScore] =
        opponentScoreRef.current.getComponent(ScoreComponent);

      // BALL BOUNCING
      if (ballTransform.y + ballBody.height >= height) {
        setBallVelocity({
          dx: ballVelocity.dx,
          dy: -BALL_SPEED,
          dz: 0,
        });
      } else if (ballTransform.y <= 0) {
        setBallVelocity({
          dx: ballVelocity.dx,
          dy: BALL_SPEED,
          dz: 0,
        });
      }
      const newY = ballTransform.y + ballVelocity.dy;

      if (ballTransform.x + ballBody.width >= width) {
        setBallVelocity({
          dx: -BALL_SPEED,
          dy: ballVelocity.dy,
          dz: 0,
        });
      } else if (ballTransform.x <= 0) {
        setBallVelocity({
          dx: BALL_SPEED,
          dy: ballVelocity.dy,
          dz: 0,
        });
      }
      const newX = ballTransform.x + ballVelocity.dx;
      setBallTransform({ x: newX, y: newY, z: 0 });

      // SCORE
      function resetBall() {
        const newX = width / 2 - ballBody.width;
        const newY = height / 2 - ballBody.height;
        setBallTransform({ x: newX, y: newY, z: 0 });
        const direction = Math.random() < 0.5 ? 1 : -1;
        setBallVelocity({
          dx: BALL_SPEED * direction,
          dy: ballVelocity.dy,
          dz: 0,
        });
      }

      if (ballTransform.x + ballBody.width >= width) {
        // player scores if hitting right wall
        const newPlayerScore = playerScore + 1;
        if (newPlayerScore < MAX_SCORE) {
          setPlayerScore(newPlayerScore);
          resetBall();
        } else {
          // player won!
          onGameOver(true);
        }
      } else if (ballTransform.x <= 0) {
        // opponent scores if hitting left wall
        const newOpponentScore = opponentScore + 1;
        if (newOpponentScore < 2) {
          setOpponentScore(newOpponentScore);
          resetBall();
        } else {
          // opponent won :()
          onGameOver(false);
        }
      }

      // move opponent, and update if they hit walls
      const opponentY = opponentPaddleTransform.y + opponentPaddleVelocity.dy;
      setOpponentPaddleTransform({
        x: opponentPaddleTransform.x,
        y: opponentY,
        z: 0,
      });
      if (opponentPaddleTransform.y + opponentPaddleBody.height >= height) {
        setOpponentPaddleVelocity({
          dx: opponentPaddleVelocity.dx,
          dy: -PADDLE_SPEED,
          dz: 0,
        });
      } else if (opponentPaddleTransform.y <= 0) {
        setOpponentPaddleVelocity({
          dx: opponentPaddleVelocity.dx,
          dy: PADDLE_SPEED,
          dz: 0,
        });
      }

      function collides(obj1: EntityContext, obj2: EntityContext) {
        const [obj1Body] = obj1.getComponent(BodyComponent);
        const [obj1Position] = obj1.getComponent(TransformComponent);
        const [obj2Body] = obj2.getComponent(BodyComponent);
        const [obj2Position] = obj2.getComponent(TransformComponent);
        return (
          obj1Position.x < obj2Position.x + obj2Body.width &&
          obj1Position.x + obj1Body.width > obj2Position.x &&
          obj1Position.y < obj2Position.y + obj2Body.height &&
          obj1Position.y + obj1Body.height > obj2Position.y
        );
      }

      if (collides(ballRef.current, playerPaddleRef.current)) {
        setBallVelocity({
          dx: ballVelocity.dx * -1,
          dy: ballVelocity.dy,
          dz: 0,
        });
        setBallTransform({
          x: playerPaddlePosition.x + playerPaddleBody.width,
          y: ballTransform.y,
          z: 0,
        });
      } else if (collides(ballRef.current, opponentPaddleRef.current)) {
        setBallVelocity({
          dx: ballVelocity.dx * -1,
          dy: ballVelocity.dy,
          dz: 0,
        });
        setBallTransform({
          x: opponentPaddleTransform.x - ballBody.width,
          y: ballTransform.y,
          z: 0,
        });
      }
    },
    [BodyComponent, TransformComponent, VelocityComponent]
  );

  return (
    <>
      <Entity ref={playerScoreRef}>
        <Score x={24} />
      </Entity>
      <Entity ref={opponentScoreRef}>
        <Score x={width - 24} />
      </Entity>
      <Entity ref={playerPaddleRef}>
        <PlayerPaddle />
      </Entity>
      <Entity ref={opponentPaddleRef}>
        <OpponentPaddle />
      </Entity>
      <Entity ref={dividerRef}>
        <Divider />
      </Entity>
      <Entity ref={ballRef}>
        <Ball />
      </Entity>
    </>
  );
}

function Score({ x }: { x: number }) {
  const [score] = useComponent(ScoreComponent, 0);
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
