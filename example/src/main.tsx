import React, { Profiler } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

function onRender(
  id: string,
  phase: string,
  actualDuration: number,
  baseDuration: number
) {
  if (phase === "mount") {
    console.dir({
      actualDuration,
      baseDuration,
    });
  }
}
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Profiler id="App" onRender={onRender}>
      <App />
    </Profiler>
  </React.StrictMode>
);
