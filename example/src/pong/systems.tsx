import boopAudioSfx from "./assets/GUI Sound Effects_031.mp3";
import {
  useGame,
  useQuery,
  BodyComponent,
  TransformComponent,
  VelocityComponent,
  useSystem,
  IEntity,
  useAudio,
} from "react-gamin";
import {
  BallComponent,
  OpponentComponent,
  ScoreComponent,
  PlayerComponent,
  BALL_SPEED,
  MAX_SCORE,
  PADDLE_SPEED,
} from ".";

export function BallMovementSystem() {
  const ballWallSfx = useAudio(boopAudioSfx);
  const height = useGame((state) => state.height);
  const width = useGame((state) => state.width);
  const ballQuery = useQuery(
    BallComponent,
    BodyComponent,
    TransformComponent,
    VelocityComponent
  );

  useSystem(() => {
    const ball = ballQuery.get()[0];
    // ball
    if (ball.components.transform.y + ball.components.body.height >= height) {
      ball.update(VelocityComponent, {
        dx: ball.components.velocity.dx,
        dy: -BALL_SPEED,
        dz: 0,
      });
      ballWallSfx.play();
    } else if (ball.components.transform.y <= 0) {
      ball.update(VelocityComponent, {
        dx: ball.components.velocity.dx,
        dy: BALL_SPEED,
        dz: 0,
      });
      ballWallSfx.play();
    }
    const newY = ball.components.transform.y + ball.components.velocity.dy;

    if (ball.components.transform.x + ball.components.body.width >= width) {
      ball.update(VelocityComponent, {
        dx: -BALL_SPEED,
        dy: ball.components.velocity.dy,
        dz: 0,
      });
    } else if (ball.components.transform.x <= 0) {
      ball.update(VelocityComponent, {
        dx: BALL_SPEED,
        dy: ball.components.velocity.dy,
        dz: 0,
      });
    }
    const newX = ball.components.transform.x + ball.components.velocity.dx;
    ball.update(TransformComponent, {
      x: newX,
      y: newY,
      z: 0,
    });
  });

  return <></>;
}
export function OpponentMovementSystem() {
  const height = useGame((state) => state.height);
  const opponentQuery = useQuery(
    OpponentComponent,
    BodyComponent,
    TransformComponent,
    VelocityComponent
  );

  useSystem(() => {
    const opponent = opponentQuery.get()[0];

    // move opponent, and update if they hit walls
    const opponentY =
      opponent.components.transform.y + opponent.components.velocity.dy;
    opponent.update(TransformComponent, {
      x: opponent.components.transform.x,
      y: opponentY,
      z: 0,
    });
    if (
      opponent.components.transform.y + opponent.components.body.height >=
      height
    ) {
      opponent.update(VelocityComponent, {
        dx: opponent.components.velocity.dx,
        dy: -PADDLE_SPEED,
        dz: 0,
      });
    } else if (opponent.components.transform.y <= 0) {
      opponent.update(VelocityComponent, {
        dx: opponent.components.velocity.dx,
        dy: PADDLE_SPEED,
        dz: 0,
      });
    }
  });
  return <></>;
}

export function ScoreSystem({
  onGameOver,
}: {
  onGameOver?: (win: boolean) => void;
}) {
  const height = useGame((state) => state.height);
  const width = useGame((state) => state.width);
  const ballQuery = useQuery(
    BallComponent,
    BodyComponent,
    TransformComponent,
    VelocityComponent
  );
  const scorePlayerQuery = useQuery(ScoreComponent, PlayerComponent);
  const scoreOpponentQuery = useQuery(ScoreComponent, OpponentComponent);

  useSystem(() => {
    const ball = ballQuery.get()[0];
    const playerScore = scorePlayerQuery.get()[0];
    const opponentScore = scoreOpponentQuery.get()[0];

    // scoring
    function resetBall() {
      const newX = width / 2 - ball.components.body.width;
      const newY = height / 2 - ball.components.body.height;
      ball.update(TransformComponent, {
        x: newX,
        y: newY,
        z: 0,
      });
      const direction = Math.random() < 0.5 ? 1 : -1;
      ball.update(VelocityComponent, {
        dx: BALL_SPEED * direction,
        dy: ball.components.velocity.dy,
        dz: 0,
      });
    }

    if (ball.components.transform.x + ball.components.body.width >= width) {
      // player scores if hitting right wall
      const newPlayerScore = playerScore.components.score + 1;
      if (newPlayerScore < MAX_SCORE) {
        playerScore.update(ScoreComponent, newPlayerScore);
        resetBall();
      } else {
        // player won!
        onGameOver(true);
      }
    } else if (ball.components.transform.x <= 0) {
      // opponent scores if hitting left wall
      const newOpponentScore = opponentScore.components.score + 1;
      if (newOpponentScore < 2) {
        opponentScore.update(ScoreComponent, newOpponentScore);
        resetBall();
      } else {
        // opponent won :()
        onGameOver(false);
      }
    }
  });

  return <></>;
}

export function CollisionSystem() {
  const paddleCollisionSfx = useAudio(boopAudioSfx);

  const ballQuery = useQuery(
    BallComponent,
    BodyComponent,
    TransformComponent,
    VelocityComponent
  );
  const playerQuery = useQuery(
    PlayerComponent,
    BodyComponent,
    TransformComponent,
    VelocityComponent
  );
  const opponentQuery = useQuery(
    OpponentComponent,
    BodyComponent,
    TransformComponent,
    VelocityComponent
  );

  useSystem(() => {
    const ball = ballQuery.get()[0];
    const player = playerQuery.get()[0];
    const opponent = opponentQuery.get()[0];

    // collision
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

    if (collides(ball, player)) {
      ball.update(VelocityComponent, {
        dx: ball.components.velocity.dx * -1,
        dy: ball.components.velocity.dy,
        dz: 0,
      });
      ball.update(TransformComponent, {
        x: player.components.transform.x + player.components.body.width,
        y: ball.components.transform.y,
        z: 0,
      });
      paddleCollisionSfx.play();
    } else if (collides(ball, opponent)) {
      ball.update(VelocityComponent, {
        dx: ball.components.velocity.dx * -1,
        dy: ball.components.velocity.dy,
        dz: 0,
      });
      ball.update(TransformComponent, {
        x: opponent.components.transform.x - ball.components.body.width,
        y: ball.components.transform.y,
        z: 0,
      });
      paddleCollisionSfx.play();
    }
  });

  return <></>;
}
