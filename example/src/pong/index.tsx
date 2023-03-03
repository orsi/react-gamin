import { PropsWithChildren, useEffect, useRef, useState } from "react";
import {
  Game,
  GameContext,
  System,
  experimental_useEntity as useEntity,
  experimental_Entity as Entity,
  useGame,
  useLoop,
} from "react-gamin";

export default function Pong() {
  const [rendered, setRendered] = useState(false);
  const ref = useRef<GameContext>();

  useEffect(() => {
    setRendered(true);
  }, []);

  return (
    <Game
      style={{
        border: "1px solid #eee",
      }}
      ref={ref}
    >
      {rendered && (
        <PongSystem>
          <Score id="player-score" x={100} y={24} />
          <Score id="opponent-score" x={ref?.current?.width - 100} y={24} />
          <PlayerPaddle />
          <Divider x={ref?.current?.width / 2} height={ref?.current?.height} />
          <OpponentPaddle />
          <Ball />
        </PongSystem>
      )}
    </Game>
  );
}

function Score({ id, x, y }: { id: string; x: number; y: number }) {
  const scoreState = useState(0);
  const entity = useEntity(id, [{ type: "score", state: scoreState }]);
  return (
    <div
      style={{
        position: "absolute",
        top: "0px",
        left: "0px",
        transform: `translate(${x}px, ${y}px)`,
      }}
    >
      {scoreState[0]}
    </div>
  );
}
function Divider({ height, x }: { height: number; x: number }) {
  return (
    <div
      style={{
        border: `5px dashed #fff`,
        height,
        width: `0px`,
        position: "absolute",
        top: "0px",
        left: "0px",
        transform: `translate(${x - 3}px, 0px)`,
      }}
    ></div>
  );
}
function PongSystem({ children }: PropsWithChildren) {
  useLoop((game) => {
    const { height, width, entities } = game;
    const playerScore = [...entities].find(
      (entity) => entity.type === "player-score"
    ) as unknown as Entity;
    const opponentScore = [...entities].find(
      (entity) => entity.type === "opponent-score"
    ) as unknown as Entity;
    const ball = [...entities].find(
      (entity) => entity.type === "ball"
    ) as unknown as Entity;
    const player = [...entities].find(
      (entity) => entity.type === "player"
    ) as unknown as Entity;
    const opponent = [...entities].find(
      (entity) => entity.type === "opponent"
    ) as unknown as Entity;
    if (ball && player && opponent) {
      // bounce off top walls
      if (
        ball.components["y"][0] + ball.components["body"][0].height >=
        height
      ) {
        ball.components["dy"][1](-BALL_SPEED);
      } else if (ball.components["y"][0] <= 0) {
        ball.components["dy"][1](BALL_SPEED);
      }
      const newY = ball.components["y"][0] + ball.components["dy"][0];
      ball.components["y"][1](newY);

      // player scores if hitting right wall
      if (ball.components["x"][0] + ball.components["body"][0].width >= width) {
        playerScore.components["score"][1](
          playerScore.components["score"][0] + 1
        );
        // reset ball and pick random direction
        const newX = width / 2 - ball.components["body"][0].width;
        const newY = height / 2 - ball.components["body"][0].height;
        ball.components["x"][1](newX);
        ball.components["y"][1](newY);
        const direction = Math.random() < 0.5 ? 1 : -1;
        ball.components["dx"][1](BALL_SPEED * direction);
      } else if (ball.components["x"][0] <= 0) {
        // opponent scores if hitting left wall
        opponentScore.components["score"][1](
          opponentScore.components["score"][0] + 1
        );
        // reset ball and pick random direction
        const newX = width / 2 - ball.components["body"][0].width;
        const newY = height / 2 - ball.components["body"][0].height;
        ball.components["x"][1](newX);
        ball.components["y"][1](newY);
        const direction = Math.random() < 0.5 ? 1 : -1;
        ball.components["dx"][1](BALL_SPEED * direction);
      } else {
        const newX = ball.components["x"][0] + ball.components["dx"][0];
        ball.components["x"][1](newX);
      }

      // move opponent, and update if they hit walls
      const opponentY =
        opponent.components["y"][0] + opponent.components["dy"][0];
      opponent.components["y"][1](opponentY);
      if (
        opponent.components["y"][0] + opponent.components["body"][0].height >=
        height
      ) {
        opponent.components["dy"][1](-PADDLE_SPEED);
      } else if (opponent.components["y"][0] <= 0) {
        opponent.components["dy"][1](PADDLE_SPEED);
      }

      function collides(obj1: Entity, obj2: Entity) {
        return (
          obj1.components["x"][0] <
            obj2.components["x"][0] + obj2.components["body"][0].width &&
          obj1.components["x"][0] + obj1.components["body"][0].width >
            obj2.components["x"][0] &&
          obj1.components["y"][0] <
            obj2.components["y"][0] + obj2.components["body"][0].height &&
          obj1.components["y"][0] + obj1.components["body"][0].height >
            obj2.components["y"][0]
        );
      }

      if (collides(ball, player)) {
        ball.components["dx"][1](ball.components["dx"][0] * -1);
        ball.components["x"][1](
          player.components["x"][0] + player.components["body"][0].width
        );
      } else if (collides(ball, opponent)) {
        ball.components["dx"][1](ball.components["dx"][0] * -1);
        ball.components["x"][1](
          opponent.components["x"][0] - ball.components["body"][0].width
        );
      }
    }
  });
  return <System name="pong">{children}</System>;
}

const PADDLE_SPEED = 6;
function PlayerPaddle() {
  const { height, width } = useGame();
  const bodyState = useState({
    width: 15,
    height: 100,
  });
  const xState = useState(30);
  const yState = useState(height / 2 - 50);
  const dyState = useState(PADDLE_SPEED);
  const entity = useEntity("player", [
    {
      type: "body",
      state: bodyState,
    },
    {
      type: "x",
      state: xState,
    },
    {
      type: "y",
      state: yState,
    },
    {
      type: "dy",
      state: dyState,
    },
  ]);

  useLoop(
    (game) => {
      const input = game.input.current;
      if (input.KEYBOARD_UP || input.GAMEPAD_BUTTON_12) {
        if (yState[0] <= 0) {
          return;
        }
        yState[1](yState[0] - dyState[0]);
      } else if (input.KEYBOARD_DOWN || input.GAMEPAD_BUTTON_13) {
        if (yState[0] + bodyState[0].height >= height) {
          return;
        }
        yState[1](yState[0] + dyState[0]);
      }
    },
    [yState[0], dyState[0], bodyState[0]]
  );

  return (
    <div
      style={{
        backgroundColor: "white",
        height: `${bodyState[0].height}px`,
        left: "0px",
        position: "absolute",
        top: "0px",
        transform: `translate(${xState[0]}px, ${yState[0]}px)`,
        width: `${bodyState[0].width}px`,
      }}
    ></div>
  );
}

function OpponentPaddle() {
  const { height, width } = useGame();
  const bodyState = useState({
    width: 15,
    height: 100,
  });
  const xState = useState(width - 30);
  const yState = useState(height / 2 - 50);
  const dyState = useState(PADDLE_SPEED);
  const entity = useEntity("opponent", [
    {
      type: "body",
      state: bodyState,
    },
    {
      type: "x",
      state: xState,
    },
    {
      type: "y",
      state: yState,
    },
    {
      type: "dy",
      state: dyState,
    },
  ]);
  return (
    <div
      style={{
        backgroundColor: "white",
        height: `${bodyState[0].height}px`,
        left: "0px",
        position: "absolute",
        top: "0px",
        transform: `translate(${xState[0]}px, ${yState[0]}px)`,
        width: `${bodyState[0].width}px`,
      }}
    ></div>
  );
}

const BALL_SPEED = 5;
function Ball() {
  const { height, width } = useGame();
  const xState = useState(width / 2 - 25);
  const yState = useState(height / 2 - 25);
  const dxState = useState(BALL_SPEED);
  const dyState = useState(-BALL_SPEED);
  const bodyState = useState({
    width: 25,
    height: 25,
  });

  const entity = useEntity("ball", [
    { type: "x", state: xState },
    { type: "y", state: yState },
    { type: "dx", state: dxState },
    { type: "dy", state: dyState },
    { type: "body", state: bodyState },
  ]);

  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "100%",
        left: "0px",
        height: `${bodyState[0].height}px`,
        position: "absolute",
        top: "0px",
        transform: `translate(${xState[0]}px, ${yState[0]}px)`,
        width: `${bodyState[0].width}px`,
      }}
    ></div>
  );
}
