import React, { useState } from "react";
import { Game, Sprite, useKey } from "react-gamin";

export default function Shooter() {
  return (
    <Game
      development
      style={{
        backgroundColor: "black",
        height: "480px",
        width: "640px",
      }}
    >
      <ShooterGame />
    </Game>
  );
}

function ShooterGame() {
  return (
    <>
      <Player />
      <Enemy1 />
      <Enemy2 />
    </>
  );
}

function Player() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [body, setBody] = useState({ width: 99, height: 75 });

  return (
    <Sprite
      position={{ ...position, z: 0 }}
      src="/kenney_space-shooter-redux/PNG/playerShip1_blue.png"
      style={{
        maxWidth: "100%",
      }}
    />
  );
}

function Enemy1() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [body, setBody] = useState({ width: 93, height: 84 });

  return (
    <Sprite
      position={{ ...position, z: 0 }}
      src="/kenney_space-shooter-redux/PNG/Enemies/enemyBlack1.png"
      style={{
        maxWidth: "100%",
      }}
    />
  );
}

function Enemy2() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [body, setBody] = useState({ width: 93, height: 84 });

  return (
    <Sprite
      position={{ ...position, z: 0 }}
      src="/kenney_space-shooter-redux/PNG/Enemies/enemyBlue1.png"
      style={{
        maxWidth: "100%",
      }}
    />
  );
}
