import { PropsWithChildren } from "react";
import MyGame from "./entities/MyGame";

export default function App({ children }: PropsWithChildren) {
  return (
    <div id="app">
      <MyGame />
    </div>
  );
}
