# react-gamin

### A *rockin'* React functional component library for makin' games!  

![react-gamin](./react-gamin.gif?raw=true "react-gamin")

Build your game declaratively with React functional components and state.

### How does it work?

```tsx
import { useRef, useState } from "react";
import {
  usePositionComponent,
  useBodyComponent,
  useMovementSystem,
  useGameInput,
  useLoop,
  Sprite,
} from "react-gamin";
import myCharacterSpriteSheet from "./assets/character.png";

export default function MiloChar() {
  const [state, setState] = useState("idle");
  const [position, setPosition] = usePositionComponent({
    x: 260,
    y: 200,
  });
  const [body] = useBodyComponent({
    width: 16,
    height: 32,
  });
  const move = useMovementSystem(position, setPosition, body);

  useGameInput((input) => {
    if (input.KEYBOARD_UP || input.GAMEPAD_BUTTON_12) {
      setState("walk-up");
    } else if (input.KEYBOARD_DOWN || input.GAMEPAD_BUTTON_13) {
      setState("walk-down");
    } else if (input.KEYBOARD_LEFT || input.GAMEPAD_BUTTON_14) {
      setState("walk-left");
    } else if (input.KEYBOARD_RIGHT || input.GAMEPAD_BUTTON_15) {
      setState("walk-right");
    } else {
      setState("idle");
    }
  });

  useLoop(() => {
    if (state === "walk-up") {
      move("up");
    } else if (state === "walk-down") {
      move("down");
    } else if (state === "walk-left") {
      move("left");
    } else if (state === "walk-right") {
      move("right");
    } else {
      // noop
    }
  }, [state]);

  const animations = useRef([
    { frameLength: 250, cells: [0, 1, 2, 3] },
    { frameLength: 250, cells: [4, 5, 6, 7] },
    { frameLength: 250, cells: [8, 9, 10, 11] },
    { frameLength: 250, cells: [12, 13, 14, 15] },
  ]);
  let playAnimation = undefined;
  if (state === "walk-up") {
    playAnimation = 2;
  } else if (state === "walk-down") {
    playAnimation = 0;
  } else if (state === "walk-left") {
    playAnimation = 3;
  } else if (state === "walk-right") {
    playAnimation = 1;
  }

  return (
    <Sprite
      src={myCharacterSpriteSheet}
      x={position.x}
      y={position.y}
      sheet={{
        height: 32,
        width: 16,
      }}
      selectedSprite={0}
      animations={animations.current}
      selectedAnimation={playAnimation}
    />
  );
}
```

# Contributing

If you enjoy React and gaming, feel free to create an issue or pull request! All contributions are welcome.

### Development

First clone and install the project:

```sh
git clone git@github.com:orsi/react-gamin.git
cd react-gamin
npm i
npm run dev

VITE v4.1.4  ready in 215 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

The `npm run dev` script will start the vite server for the `/example` project on your localhost. This project can be used to experiment and create game features that utilize the main *react-gamin* library, which you can modify at `/packages/react-gamin/src`.

