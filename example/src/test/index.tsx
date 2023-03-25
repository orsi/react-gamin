import { useRef } from "react";
import {
  Game,
  useEntityManager,
  useSceneManager,
  useSystem,
} from "react-gamin";

export default function Test() {
  return (
    <Game>
      {/* <Scene1 /> */}
      <RedBorder />
      <BlueBorder />
      <RedBorder />
      <BlueBorder />
      <RedBorder />
    </Game>
  );
}

function Scene1() {
  const sceneManager = useSceneManager();
  const entityManager = useEntityManager();

  const handleOnClick = () => {
    sceneManager.change(<Scene2 />);
  };
  const handleOnClickRemoveEntity = () => {
    entityManager.remove(<RedBorder />);
  };

  const accumulator = useRef(0);
  useSystem((e, d) => {
    accumulator.current += d;

    if (accumulator.current > 1000) {
      console.log("aloha", e);
      accumulator.current = 0;
    }
  });

  return (
    <>
      <button onClick={handleOnClick}>change scene</button>
      <button onClick={handleOnClickRemoveEntity}>remove entity</button>
      <RedBorder />
      <RedBorder />
      <RedBorder />
      <RedBorder />
      <RedBorder />
      <RedBorder />
      <RedBorder />
    </>
  );
}

function Scene2() {
  const sceneManager = useSceneManager();
  const handleOnClick = () => {
    console.log("click!");
    sceneManager.change(<Scene1 />);
  };

  return (
    <>
      <button onClick={handleOnClick}>click</button>
      <BlueBorder />
      <BlueBorder />
      <BlueBorder />
      <BlueBorder />
      <BlueBorder />
      <BlueBorder />
    </>
  );
}

function RedBorder() {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid red",
        width: "10px",
        height: "10px",
      }}
    ></div>
  );
}

function BlueBorder() {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid blue",
        width: "10px",
        height: "10px",
      }}
    ></div>
  );
}
