import { useRef } from "react";
import {
  Entity,
  Game,
  IEntity,
  useBodyComponent,
  useGame,
  useTransformComponent,
  useSystem,
  useUpdate,
  useVelocityComponent,
  useComponent,
  useSceneManager,
  TransformComponent,
  VelocityComponent,
  createComponent,
} from "react-gamin";

const ScoreComponent = createComponent("score", 0);

export default function Pong() {
  return (
    <Game style={{ border: `1px solid white` }}>
      <PongGame />
    </Game>
  );
}

function PongGame() {
  const sceneManager = useSceneManager();
  const startGame = () => {
    sceneManager.change(<PlayScene onGameOver={showEndScene} />);
  };

  const showEndScene = (win: boolean) => {
    sceneManager.change(
      <EndScene text={win ? `YOU WIN` : `GAME OVER`} onPlayAgain={startGame} />
    );
  };

  return <TitleScene onStart={startGame} />;
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

  // TODO: These types of Refs are unhelpful if they have no
  // context of what components are on the entity, leading to the
  // massive amount of type errors we have in the system below
  const playerScoreRef = useRef<IEntity>();
  const opponentScoreRef = useRef<IEntity>();
  const playerPaddleRef = useRef<IEntity>();
  const opponentPaddleRef = useRef<IEntity>();
  const dividerRef = useRef<IEntity>();
  const ballRef = useRef<IEntity>();

  useSystem(() => {
    // pong game logic highly based off of:
    // https://gist.github.com/straker/81b59eecf70da93af396f963596dfdc5
    const ballBody = ballRef.current.components.body;
    const ballTransform = ballRef.current.components.transform;
    const ballVelocity = ballRef.current.components.velocity;
    const playerPaddlePosition = playerPaddleRef.current.components.transform;
    const playerPaddleBody = playerPaddleRef.current.components.body;
    const opponentPaddleTransform =
      opponentPaddleRef.current.components.transform;
    const opponentPaddleBody = opponentPaddleRef.current.components.body;
    const opponentPaddleVelocity =
      opponentPaddleRef.current.components.velocity;
    const playerScore = playerScoreRef.current.components.score;
    const opponentScore = opponentScoreRef.current.components.score;

    // BALL BOUNCING
    if (ballTransform.y + ballBody.height >= height) {
      ballRef.current.update(VelocityComponent, {
        dx: ballVelocity.dx,
        dy: -BALL_SPEED,
        dz: 0,
      });
    } else if (ballTransform.y <= 0) {
      ballRef.current.update(VelocityComponent, {
        dx: ballVelocity.dx,
        dy: BALL_SPEED,
        dz: 0,
      });
    }
    const newY = ballTransform.y + ballVelocity.dy;

    if (ballTransform.x + ballBody.width >= width) {
      ballRef.current.update(VelocityComponent, {
        dx: -BALL_SPEED,
        dy: ballVelocity.dy,
        dz: 0,
      });
    } else if (ballTransform.x <= 0) {
      ballRef.current.update(VelocityComponent, {
        dx: BALL_SPEED,
        dy: ballVelocity.dy,
        dz: 0,
      });
    }
    const newX = ballTransform.x + ballVelocity.dx;
    ballRef.current.update(TransformComponent, {
      x: newX,
      y: newY,
      z: 0,
    });

    // SCORE
    function resetBall() {
      const newX = width / 2 - ballBody.width;
      const newY = height / 2 - ballBody.height;
      ballRef.current.update(TransformComponent, {
        x: newX,
        y: newY,
        z: 0,
      });
      const direction = Math.random() < 0.5 ? 1 : -1;
      ballRef.current.update(VelocityComponent, {
        dx: BALL_SPEED * direction,
        dy: ballVelocity.dy,
        dz: 0,
      });
    }

    if (ballTransform.x + ballBody.width >= width) {
      // player scores if hitting right wall
      const newPlayerScore = playerScore + 1;
      if (newPlayerScore < MAX_SCORE) {
        playerScoreRef.current.update(ScoreComponent, newPlayerScore);
        resetBall();
      } else {
        // player won!
        onGameOver(true);
      }
    } else if (ballTransform.x <= 0) {
      // opponent scores if hitting left wall
      const newOpponentScore = opponentScore + 1;
      if (newOpponentScore < 2) {
        opponentScoreRef.current.update(ScoreComponent, newOpponentScore);
        resetBall();
      } else {
        // opponent won :()
        onGameOver(false);
      }
    }

    // move opponent, and update if they hit walls
    const opponentY = opponentPaddleTransform.y + opponentPaddleVelocity.dy;
    opponentPaddleRef.current.update(TransformComponent, {
      x: opponentPaddleTransform.x,
      y: opponentY,
      z: 0,
    });
    if (opponentPaddleTransform.y + opponentPaddleBody.height >= height) {
      opponentPaddleRef.current.update(VelocityComponent, {
        dx: opponentPaddleVelocity.dx,
        dy: -PADDLE_SPEED,
        dz: 0,
      });
    } else if (opponentPaddleTransform.y <= 0) {
      opponentPaddleRef.current.update(VelocityComponent, {
        dx: opponentPaddleVelocity.dx,
        dy: PADDLE_SPEED,
        dz: 0,
      });
    }

    function collides(obj1: IEntity, obj2: IEntity) {
      const obj1Body = obj1.components.body;
      const obj1Position = obj1.components.transform;
      const obj2Body = obj2.components.body;
      const obj2Position = obj2.components.transform;
      return (
        obj1Position.x < obj2Position.x + obj2Body.width &&
        obj1Position.x + obj1Body.width > obj2Position.x &&
        obj1Position.y < obj2Position.y + obj2Body.height &&
        obj1Position.y + obj1Body.height > obj2Position.y
      );
    }

    if (collides(ballRef.current, playerPaddleRef.current)) {
      ballRef.current.update(VelocityComponent, {
        dx: ballVelocity.dx * -1,
        dy: ballVelocity.dy,
        dz: 0,
      });
      ballRef.current.update(TransformComponent, {
        x: playerPaddlePosition.x + playerPaddleBody.width,
        y: ballTransform.y,
        z: 0,
      });
    } else if (collides(ballRef.current, opponentPaddleRef.current)) {
      ballRef.current.update(VelocityComponent, {
        dx: ballVelocity.dx * -1,
        dy: ballVelocity.dy,
        dz: 0,
      });
      ballRef.current.update(TransformComponent, {
        x: opponentPaddleTransform.x - ballBody.width,
        y: ballTransform.y,
        z: 0,
      });
    }
  });

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
