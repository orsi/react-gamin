import { useState } from "react";
import { Entity } from "../library/Entity";
import Barrel from "./Barrel";
import Box from "./Box";
import Fountain from "./Fountain";
import Ground from "./Ground";
import House from "./House";
import MiloChar from "./MiloChar";

export default function MyStage() {
  const [entities, setEntities] = useState([
    <Ground />,
    <Box x={50} y={50} solid={true} />,
    <Barrel x={100} y={50} solid={true} />,
    <House x={300} y={200} solid={true} />,
    <Fountain x={50} y={200} solid={true} />,
    <MiloChar />,
  ]);

  return (
    <>
      {entities.map((entity, i) => (
        <Entity key={`entity-${i}`}>{entity}</Entity>
      ))}
      {/* {entities.map((entity, i) => (
        <Fragment key={`entity-${i}`}>{entity}</Fragment>
      ))} */}
    </>
  );
}
