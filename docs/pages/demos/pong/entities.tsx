import React, { useState } from "react";
import { useGame, useKey } from "react-gamin";
import {
  PADDLE_SPEED,
  BALL_SPEED,
  useBallMovementSystem,
  useOpponentAISystem,
  useCollisionSystem,
  useScoreSystem,
} from "./systems";

export function Divider() {
  const { width } = useGame().state;
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
  const [score, setScore] = useState(0);

  useScoreSystem({
    id: "playerScore",
    components: {
      score,
      setScore,
    },
  });

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
  const [score, setScore] = useState(0);

  useScoreSystem({
    id: "opponentScore",
    components: {
      score,
      setScore,
    },
  });

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
  const { height } = useGame().state;
  const [body] = useState({
    width: 15,
    height: 100,
  });
  const [position, setPosition] = useState({
    x: 30,
    y: height / 2 - 50,
    z: 0,
  });
  const [velocity, setVelocity] = useState({
    dx: PADDLE_SPEED,
    dy: PADDLE_SPEED,
    dz: 0,
  });

  useCollisionSystem({
    id: "player",
    components: {
      position,
      setPosition,
      velocity,
      setVelocity,
      body,
    },
  });

  useKey("w", () => {
    setPosition({
      x: position.x,
      y: position.y - velocity.dy,
      z: 0,
    });
  });

  useKey("s", () => {
    setPosition({
      x: position.x,
      y: position.y + velocity.dy,
      z: 0,
    });
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

export function OpponentPaddle() {
  const { height, width } = useGame().state;

  const [position, setPosition] = useState({
    x: width - 30,
    y: height / 2 - 50,
    z: 0,
  });
  const [body] = useState({
    width: 15,
    height: 100,
  });
  const [velocity, setVelocity] = useState({
    dx: PADDLE_SPEED,
    dy: PADDLE_SPEED,
    dz: 0,
  });

  useOpponentAISystem({
    position,
    setPosition,
    velocity,
    setVelocity,
    body,
  });

  useCollisionSystem({
    id: "opponent",
    components: {
      position,
      setPosition,
      velocity,
      setVelocity,
      body,
    },
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
  const { height, width } = useGame().state;
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

  useBallMovementSystem({
    position,
    setPosition,
    velocity,
    setVelocity,
    body,
  });

  useCollisionSystem({
    id: "ball",
    components: {
      position,
      setPosition,
      velocity,
      setVelocity,
      body,
    },
  });

  useScoreSystem({
    id: "ball",
    components: {
      position,
      setPosition,
      velocity,
      setVelocity,
      body,
    },
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
