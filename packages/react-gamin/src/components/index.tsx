import { useState } from "react";
import { GameStore, useGame, useUpdate } from "../core/ecs";

export function GameDebugger() {
  const [isMinimized, setIsMinimized] = useState(false);
  const store = useGame();
  const [game, setGame] = useState<GameStore>();

  const onToggle = () => {
    setIsMinimized(!isMinimized);
  };

  useUpdate(() => {
    setGame(store);
  });

  return (
    <div
      style={{
        borderTopLeftRadius: "8px",
        borderTopRightRadius: "8px",
        display: "flex",
        flexDirection: "column",
        fontSize: "10px",
        margin: "4px",
        overflow: "hidden",
        position: "absolute",
        right: "0px",
        top: "0px",
        zIndex: "9999",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(0,0,0,.4)",
          width: "200px",
          height: "16px",
        }}
        onClick={onToggle}
      ></div>
      <div
        style={{
          backgroundColor: "rgba(0,0,0,.2)",
          display: isMinimized ? "none" : "flex",
          flexDirection: "column",
          padding: "8px",
        }}
      >
        {/* {game?.systems && (
          <>
            <h2>Systems</h2>
            <ul>
              {[...game?.systems]?.map((system, i) => (
                <li key={i}>{system.name}</li>
              ))}
            </ul>
          </>
        )}
        {game?.stages && (
          <>
            <h2>Stages:</h2>
            <ul>
              {[...game?.stages]?.map((stage, i) => (
                <li key={i}>{stage.id}</li>
              ))}
            </ul>
          </>
        )} */}
        <h2>Entities</h2>
        {game?.entities && (
          <ul>
            {[...game?.entities]?.map((entity, i) => (
              <li key={i}>{entity.id}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
