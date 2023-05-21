import { useState } from "react";
import {
  createSystem,
  PropsWithComponents,
  SetState,
  useAudio,
  useGame,
} from "react-gamin";

export const BALL_SPEED = 5;
export const PADDLE_SPEED = 6;
export const MAX_SCORE = 5;

// pong game logic highly based off of:
// https://gist.github.com/straker/81b59eecf70da93af396f963596dfdc5

export type Position = { x: number; y: number; z: number };
export type Velocity = { dx: number; dy: number; dz: number };
export type Body = { height: number; width: number };

type BallMovementSystemComponent = {
  position: Position;
  setPosition: SetState<Position>;
  velocity: Velocity;
  setVelocity: SetState<Velocity>;
  body: Body;
};
export const [BallMovementSystem, useBallMovementSystem] = createSystem<
  BallMovementSystemComponent,
  {}
>(
  function Test2SystemFunction({ components }) {
    const { height, width } = useGame().state;
    const ballWallSfx = useAudio("/beep-03.wav");

    return (time: number) => {
      for (const component of components) {
        if (component.position.y + component.body.height >= height) {
          component.setVelocity({
            dx: component.velocity.dx,
            dy: -BALL_SPEED,
            dz: 0,
          });
          ballWallSfx.play();
        } else if (component.position.y <= 0) {
          component.setVelocity({
            dx: component.velocity.dx,
            dy: BALL_SPEED,
            dz: 0,
          });
          ballWallSfx.play();
        }

        const newY = component.position.y + component.velocity.dy;
        const newX = component.position.x + component.velocity.dx;
        component.setPosition({
          x: newX,
          y: newY,
          z: 0,
        });
      }
    };
  },
  function useTest2SystemHook(component: BallMovementSystemComponent) {
    const [blep, setBlep] = useState(0);
    return blep;
  },
  "BallMovementSystem"
);

type OpponentAISystemComponents = {
  position: Position;
  setPosition: SetState<Position>;
  velocity: Velocity;
  setVelocity: SetState<Velocity>;
  body: Body;
};
export const [OpponentAISystem, useOpponentAISystem] = createSystem<
  OpponentAISystemComponents,
  {}
>(function System({ components }) {
  const { height } = useGame().state;
  return () => {
    for (const component of components) {
      // move opponent, and update if they hit walls
      const opponentY = component.position.y + component.velocity.dy;
      component.setPosition({
        x: component.position.x,
        y: opponentY,
        z: 0,
      });
      if (component.position.y + component.body.height >= height) {
        component.setVelocity({
          dx: component.velocity.dx,
          dy: -PADDLE_SPEED,
          dz: 0,
        });
      } else if (component.position.y <= 0) {
        component.setVelocity({
          dx: component.velocity.dx,
          dy: PADDLE_SPEED,
          dz: 0,
        });
      }
    }
  };
});

interface CollisionSystemComponent {
  id: string;
  components: {
    position: Position;
    setPosition: SetState<Position>;
    velocity: Velocity;
    setVelocity: SetState<Velocity>;
    body: Body;
  };
}
export const [CollisionSystem, useCollisionSystem] = createSystem<
  CollisionSystemComponent,
  {}
>(({ components }) => {
  const paddleCollisionSfx = useAudio("/beep-03.wav");
  function collides(
    obj1: CollisionSystemComponent["components"],
    obj2: CollisionSystemComponent["components"]
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
    const ball = components.find((i) => i.id === "ball")?.components;
    const player = components.find((i) => i.id === "player")?.components;
    const opponent = components.find((i) => i.id === "opponent")?.components;

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
});

interface ScoreSystemComponent {
  onGameOver?: (win: boolean) => void;
  id: string;
  components: {
    position?: Position;
    setPosition?: SetState<Position>;
    velocity?: Velocity;
    setVelocity?: SetState<Velocity>;
    body?: Body;
    score?: number;
    setScore?: SetState<number>;
  };
}
interface ScoreSystemProps extends PropsWithComponents<ScoreSystemComponent> {
  onGameOver: (win: boolean) => void;
}
export const [ScoreSystem, useScoreSystem] = createSystem(
  ({ onGameOver, components }: ScoreSystemProps) => {
    const { height, width } = useGame().state;

    return () => {
      const ball = components.find((i) => i.id === "ball")?.components;
      const playerScore = components.find(
        (i) => i.id === "playerScore"
      )?.components;
      const opponentScore = components.find(
        (i) => i.id === "opponentScore"
      )?.components;

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
          dx: BALL_SPEED * direction,
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
  }
);
