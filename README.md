# react-gamin

### A *rockin'* React functional component library for makin' games  

![react-gamin](./react-gamin-preview.gif?raw=true "react-gamin")

Build your game using simple React functional components and state, enhanced with `react-gamin` custom components and hooks.

### How does it work?
```tsx
export function PlayerPaddle() {
  // get global game state
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

  // custom hooks for using input to control component state
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

  // user defined system hook 'registers' this component
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

  // render with either simple React JSX, or the provided react-gamin
  // components
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

The `npm run dev` script will start the vite server for the `/docs` project on your localhost. This project can be used to experiment and create game features that utilize the main *react-gamin* library, which you can modify at `/packages/react-gamin`.

