import { NavLink, Route, Routes } from "react-router-dom";
import FloppyBert from "./floppy-bert";
import Pong from "./pong";

import RPG from "./rpg";

const routes = [
  {
    name: "Pong",
    path: "/",
    element: <Pong />,
  },
  {
    name: "Floppy Bert",
    path: "/floppy-bert",
    element: <FloppyBert />,
  },
  {
    name: "RPG",
    path: "/rpg",
    element: <RPG />,
  },
];

export default function App() {
  return (
    <div
      style={{
        display: "flex",
        height: "100%",
      }}
    >
      <div
        style={{
          backgroundColor: "#191919",
          color: "black",
          height: "100%",
          width: "180px",
          padding: "24px",
        }}
      >
        <ul style={{ listStyle: "none", margin: "0", padding: "0" }}>
          {routes.map((route) => (
            <li key={`${route.path}`}>
              <NavLink to={route.path}>{route.name}</NavLink>
            </li>
          ))}
        </ul>
      </div>
      <div
        style={{
          display: "flex",
          flex: "1 0 auto",
          height: "100%",
          padding: "24px",
          placeItems: "center",
          placeContent: "center",
        }}
      >
        <div>
          <Routes>
            {routes.map((route) => (
              <Route
                key={route.name}
                path={route.path}
                element={route.element}
              />
            ))}
          </Routes>
        </div>
      </div>
    </div>
  );
}
