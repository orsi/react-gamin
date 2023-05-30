import {
  createSystem,
  createSystemHook,
  SetState,
  useAudio,
} from "react-gamin";

// pong game logic highly based off of:
// https://gist.github.com/straker/81b59eecf70da93af396f963596dfdc5

export const BALL_PIXELS_PER_SECOND = 100;

export const PADDLE_PIXELS_PER_SECOND = 100;

export const MAX_SCORE = 5;

export type Position = { x: number; y: number; z: number };

export type Velocity = { dx: number; dy: number; dz: number };

export type Body = { height: number; width: number };

export type BallMovementSystemComponent = {
  position: Position;
  setPosition: SetState<Position>;
  velocity: Velocity;
  setVelocity: SetState<Velocity>;
  body: Body;
};

export const BallMovementSystem = createSystem<BallMovementSystemComponent>(
  (system) => {
    const ballWallSfx = useAudio("/beep-03.wav");

    return (time, { height }) => {
      for (const component of system.components) {
        if (component.position.y + component.body.height >= height) {
          component.setVelocity({
            dx: component.velocity.dx,
            dy: -BALL_PIXELS_PER_SECOND,
            dz: 0,
          });
          ballWallSfx.play();
        } else if (component.position.y <= 0) {
          component.setVelocity({
            dx: component.velocity.dx,
            dy: BALL_PIXELS_PER_SECOND,
            dz: 0,
          });
          ballWallSfx.play();
        }

        const newY =
          component.position.y + component.velocity.dy / (1000 / time);
        const newX =
          component.position.x + component.velocity.dx / (1000 / time);
        component.setPosition({
          x: newX,
          y: newY,
          z: 0,
        });
      }
    };
  },
  "BallMovementSystem"
);

export const useBallMovementSystem = createSystemHook(BallMovementSystem);

export type OpponentAISystemComponents = {
  position: Position;
  setPosition: SetState<Position>;
  velocity: Velocity;
  setVelocity: SetState<Velocity>;
  body: Body;
};

export const OpponentAISystem = createSystem<OpponentAISystemComponents>(
  (system) => {
    return (time, { height }) => {
      for (const component of system.components) {
        // move opponent, and update if they hit walls
        const opponentY =
          component.position.y + component.velocity.dy / (1000 / time);
        component.setPosition({
          x: component.position.x,
          y: opponentY,
          z: 0,
        });

        if (component.position.y + component.body.height >= height) {
          component.setVelocity({
            dx: component.velocity.dx,
            dy: -PADDLE_PIXELS_PER_SECOND,
            dz: 0,
          });
        } else if (component.position.y <= 0) {
          component.setVelocity({
            dx: component.velocity.dx,
            dy: PADDLE_PIXELS_PER_SECOND,
            dz: 0,
          });
        }
      }
    };
  }
);

export const useOpponentAISystem = createSystemHook(OpponentAISystem);

export interface CollisionSystemComponent {
  id: string;
  position: Position;
  setPosition: SetState<Position>;
  velocity: Velocity;
  setVelocity: SetState<Velocity>;
  body: Body;
}

export const CollisionSystem = createSystem<CollisionSystemComponent>(
  (system) => {
    const paddleCollisionSfx = useAudio("/beep-03.wav");
    function collides(
      obj1: CollisionSystemComponent,
      obj2: CollisionSystemComponent
    ) {
      const obj1Body = obj1.body;
      const obj1Position = obj1.position;
      const obj2Body = obj2.body;
      const obj2Position = obj2.position;
      return (
        obj1Position.x < obj2Position.x + obj2Body.width &&
        obj1Position.x + obj1Body.width > obj2Position.x &&
        obj1Position.y < obj2Position.y + obj2Body.height &&
        obj1Position.y + obj1Body.height > obj2Position.y
      );
    }

    return () => {
      const ball = system.components.find((i) => i.id === "ball");
      const player = system.components.find((i) => i.id === "player");
      const opponent = system.components.find((i) => i.id === "opponent");

      if (ball == null || player == null || opponent == null) {
        return;
      }

      if (collides(ball, player)) {
        ball.setVelocity({
          dx: ball.velocity.dx * -1,
          dy: ball.velocity.dy,
          dz: 0,
        });
        ball.setPosition({
          x: player.position.x + player.body.width,
          y: ball.position.y,
          z: 0,
        });
        paddleCollisionSfx.play();
      } else if (collides(ball, opponent)) {
        ball.setVelocity({
          dx: ball.velocity.dx * -1,
          dy: ball.velocity.dy,
          dz: 0,
        });
        ball.setPosition({
          x: opponent.position.x - ball.body.width,
          y: ball.position.y,
          z: 0,
        });
        paddleCollisionSfx.play();
      }
    };
  }
);

export const useCollisionSystem = createSystemHook(CollisionSystem);

export interface ScoreSystemComponent {
  id: string;
  position?: Position;
  setPosition?: SetState<Position>;
  velocity?: Velocity;
  setVelocity?: SetState<Velocity>;
  body?: Body;
  score?: number;
  setScore?: SetState<number>;
}

export const ScoreSystem = createSystem<
  ScoreSystemComponent,
  { onGameOver: Function }
>((system) => {
  // TODO:
  // ^ can't destructure this here as { components }, as it unwraps
  // the ref too early and the below update function will not have
  // the updated references when it is called by the game loop
  return (time, { height, width, onGameOver }) => {
    const ball = system.components.find((i) => i.id === "ball");
    const playerScore = system.components.find((i) => i.id === "playerScore");
    const opponentScore = system.components.find(
      (i) => i.id === "opponentScore"
    );

    if (ball == null || playerScore == null || opponentScore == null) {
      return;
    }

    // scoring
    function resetBall() {
      const newX = width / 2 - ball.body.width;
      const newY = height / 2 - ball.body.height;
      ball.setPosition({
        x: newX,
        y: newY,
        z: 0,
      });
      const direction = Math.random() < 0.5 ? 1 : -1;
      ball.setVelocity({
        dx: BALL_PIXELS_PER_SECOND * direction,
        dy: ball.velocity.dy,
        dz: 0,
      });
    }

    if (ball.position.x + ball.body.width >= width) {
      // player scores if hitting right wall
      const newPlayerScore = playerScore.score + 1;
      if (newPlayerScore < MAX_SCORE) {
        playerScore.setScore(newPlayerScore);
        resetBall();
      } else {
        // player won!
        resetBall();
        onGameOver(true);
      }
    } else if (ball.position.x <= 0) {
      // opponent scores if hitting left wall
      const newOpponentScore = opponentScore.score + 1;
      if (newOpponentScore < 2) {
        opponentScore.setScore(newOpponentScore);
        resetBall();
      } else {
        // opponent won :()
        resetBall();
        onGameOver(false);
      }
    }
  };
});

export const useScoreSystem = createSystemHook(ScoreSystem);
