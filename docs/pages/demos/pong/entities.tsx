import React, { useState } from "react";
import { useGame, useGameState } from "react-gamin";
import { PADDLE_SPEED, BALL_SPEED, useBallMovementSystem } from "./systems";

export function Divider() {
  const { width } = useGameState();
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

export function PlayerScore({ x }: { x: number }) {
  const [score] = useState(0);
  //   const player = useComponent("player");
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

export function OpponentScore({ x }: { x: number }) {
  const [score] = useState(0);
  //   const opponent = useComponent("opponent");
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

export function PlayerPaddle() {
  const { height } = useGameState();
  //   const player = useComponent("player");
  const [body] = useState({
    width: 15,
    height: 100,
  });
  const [position, setPosition] = useState({
    x: 30,
    y: height / 2 - 50,
    z: 0,
  });
  const [velocity] = useState({
    dx: PADDLE_SPEED,
    dy: PADDLE_SPEED,
    dz: 0,
  });

  //   useUpdate(
  //     (input) => {
  //       if ((input.KEYBOARD_UP || input.GAMEPAD_BUTTON_12) && position.y >= 0) {
  //         setPosition({
  //           x: position.x,
  //           y: position.y - velocity.dy,
  //           z: 0,
  //         });
  //       } else if (
  //         (input.KEYBOARD_DOWN || input.GAMEPAD_BUTTON_13) &&
  //         position.y + body.height <= height
  //       ) {
  //         setPosition({
  //           x: position.x,
  //           y: position.y + velocity.dy,
  //           z: 0,
  //         });
  //       }
  //     },
  //     [position, body, velocity]
  //   );

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

export function OpponentPaddle() {
  const { height, width } = useGameState();
  //   const opponent = useComponent("opponent");

  const [body] = useState({
    width: 15,
    height: 100,
  });
  const [position] = useState({
    x: width - 30,
    y: height / 2 - 50,
    z: 0,
  });
  const [velocity] = useState({
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

export function Ball() {
  const { height, width } = useGameState();
  const [position, setPosition] = useState({
    x: width / 2 - 25,
    y: height / 2 - 25,
    z: 0,
  });
  const [velocity, setVelocity] = useState({
    dx: BALL_SPEED,
    dy: BALL_SPEED,
    dz: 0,
  });
  const [body] = useState({
    width: 25,
    height: 25,
  });

  useBallMovementSystem(position, setPosition, velocity, setVelocity, body);

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
