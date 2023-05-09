// import boopAudioSfx from "./assets/GUI Sound Effects_031.mp3";
import {
  useGame,
  useAudio,
  createSystem,
  Position,
  useSystem,
  SetState,
} from "react-gamin";

export type Body = {
  width: number;
  height: number;
};
export type Velocity = {
  dx: number;
  dy: number;
  dz: number;
};

export const BALL_SPEED = 5;
export const PADDLE_SPEED = 6;
export const MAX_SCORE = 5;

// pong game logic highly based off of:
// https://gist.github.com/straker/81b59eecf70da93af396f963596dfdc5

export const BallSystem = createSystem<{
  position: Position;
  setPosition: SetState<Position>;
  velocity: Velocity;
  setVelocity: SetState<Velocity>;
  body: Body;
}>((time, components, { height, width }) => {
  // how do? this is a hook inside a raf callback
  // const ballWallSfx = useAudio('/beep-03.wav');

  for (const c of components) {
    if (c.position.y + c.body.height >= height) {
      c.setVelocity({
        dx: c.velocity.dx,
        dy: -BALL_SPEED,
        dz: 0,
      });
      // ballWallSfx.play();
    } else if (c.position.y <= 0) {
      c.setVelocity({
        dx: c.velocity.dx,
        dy: BALL_SPEED,
        dz: 0,
      });
      // ballWallSfx.play();
    } else if (c.position.x + c.body.width >= width) {
      c.setVelocity({
        dx: -BALL_SPEED,
        dy: c.velocity.dy,
        dz: 0,
      });
      // ballWallSfx.play();
    } else if (c.position.x <= 0) {
      c.setVelocity({
        dx: BALL_SPEED,
        dy: c.velocity.dy,
        dz: 0,
      });
      // ballWallSfx.play();
    }
    const newY = c.position.y + c.velocity.dy;
    const newX = c.position.x + c.velocity.dx;
    c.setPosition({
      x: newX,
      y: newY,
      z: 0,
    });
  }
});
export function useBallMovementSystem(
  position: Position,
  setPosition: SetState<Position>,
  velocity: Velocity,
  setVelocity: SetState<Velocity>,
  body: Body
) {
  useSystem(BallSystem, {
    position,
    setPosition,
    velocity,
    setVelocity,
    body,
  });
}

export const OpponentMovementSystem = createSystem((time, components) => {
  //   const opponent = opponentQuery.get()[0];
  //   // move opponent, and update if they hit walls
  //   const opponentY =
  //     opponent.components.transform.y + opponent.components.velocity.dy;
  //   opponent.update(TransformComponent, {
  //     x: opponent.components.transform.x,
  //     y: opponentY,
  //     z: 0,
  //   });
  //   if (
  //     opponent.components.transform.y + opponent.components.body.height >=
  //     height
  //   ) {
  //     opponent.update(VelocityComponent, {
  //       dx: opponent.components.velocity.dx,
  //       dy: -PADDLE_SPEED,
  //       dz: 0,
  //     });
  //   } else if (opponent.components.transform.y <= 0) {
  //     opponent.update(VelocityComponent, {
  //       dx: opponent.components.velocity.dx,
  //       dy: PADDLE_SPEED,
  //       dz: 0,
  //     });
  //   }
});
export function useOpponentMovementSystem() {
  //   const height = useGame((state) => state.height);
  //   const opponentQuery = useQuery(
  //     OpponentComponent,
  //     BodyComponent,
  //     TransformComponent,
  //     VelocityComponent
  //   );
  //   useUpdate();
  //   return <></>;
}

export const ScoreSystem = createSystem((time, components) => {
  //   const ball = ballQuery.get()[0];
  //   const playerScore = scorePlayerQuery.get()[0];
  //   const opponentScore = scoreOpponentQuery.get()[0];
  //   // scoring
  //   function resetBall() {
  //     const newX = width / 2 - ball.components.body.width;
  //     const newY = height / 2 - ball.components.body.height;
  //     ball.update(TransformComponent, {
  //       x: newX,
  //       y: newY,
  //       z: 0,
  //     });
  //     const direction = Math.random() < 0.5 ? 1 : -1;
  //     ball.update(VelocityComponent, {
  //       dx: BALL_SPEED * direction,
  //       dy: ball.components.velocity.dy,
  //       dz: 0,
  //     });
  //   }
  //   if (ball.components.transform.x + ball.components.body.width >= width) {
  //     // player scores if hitting right wall
  //     const newPlayerScore = playerScore.components.score + 1;
  //     if (newPlayerScore < MAX_SCORE) {
  //       playerScore.update(ScoreComponent, newPlayerScore);
  //       resetBall();
  //     } else {
  //       // player won!
  //       onGameOver(true);
  //     }
  //   } else if (ball.components.transform.x <= 0) {
  //     // opponent scores if hitting left wall
  //     const newOpponentScore = opponentScore.components.score + 1;
  //     if (newOpponentScore < 2) {
  //       opponentScore.update(ScoreComponent, newOpponentScore);
  //       resetBall();
  //     } else {
  //       // opponent won :()
  //       onGameOver(false);
  //     }
  //   }
});
export function useScoreSystem(onGameOver?: (win: boolean) => void) {
  //   const height = useGame((state) => state.height);
  //   const width = useGame((state) => state.width);
  //   const ballQuery = useQuery(
  //     BallComponent,
  //     BodyComponent,
  //     TransformComponent,
  //     VelocityComponent
  //   );
  //   const scorePlayerQuery = useQuery(ScoreComponent, PlayerComponent);
  //   const scoreOpponentQuery = useQuery(ScoreComponent, OpponentComponent);
  //   return <></>;
}

export const CollisionSystem = createSystem(() => {
  //   const ball = ballQuery.get()[0];
  //   const player = playerQuery.get()[0];
  //   const opponent = opponentQuery.get()[0];
  //   // collision
  //   function collides(obj1: IEntity, obj2: IEntity) {
  //     const obj1Body = obj1.components.body;
  //     const obj1Position = obj1.components.transform;
  //     const obj2Body = obj2.components.body;
  //     const obj2Position = obj2.components.transform;
  //     return (
  //       obj1Position.x < obj2Position.x + obj2Body.width &&
  //       obj1Position.x + obj1Body.width > obj2Position.x &&
  //       obj1Position.y < obj2Position.y + obj2Body.height &&
  //       obj1Position.y + obj1Body.height > obj2Position.y
  //     );
  //   }
  //   if (collides(ball, player)) {
  //     ball.update(VelocityComponent, {
  //       dx: ball.components.velocity.dx * -1,
  //       dy: ball.components.velocity.dy,
  //       dz: 0,
  //     });
  //     ball.update(TransformComponent, {
  //       x: player.components.transform.x + player.components.body.width,
  //       y: ball.components.transform.y,
  //       z: 0,
  //     });
  //     paddleCollisionSfx.play();
  //   } else if (collides(ball, opponent)) {
  //     ball.update(VelocityComponent, {
  //       dx: ball.components.velocity.dx * -1,
  //       dy: ball.components.velocity.dy,
  //       dz: 0,
  //     });
  //     ball.update(TransformComponent, {
  //       x: opponent.components.transform.x - ball.components.body.width,
  //       y: ball.components.transform.y,
  //       z: 0,
  //     });
  //     paddleCollisionSfx.play();
  //   }
});
export function useCollisionSystem() {
  //   const paddleCollisionSfx = useAudio(boopAudioSfx);
  //   const ballQuery = useQuery(
  //     BallComponent,
  //     BodyComponent,
  //     TransformComponent,
  //     VelocityComponent
  //   );
  //   const playerQuery = useQuery(
  //     PlayerComponent,
  //     BodyComponent,
  //     TransformComponent,
  //     VelocityComponent
  //   );
  //   const opponentQuery = useQuery(
  //     OpponentComponent,
  //     BodyComponent,
  //     TransformComponent,
  //     VelocityComponent
  //   );
  //   return <></>;
}
