import bg from "./assets/bg.png";
import cat from "./assets/cat_idle.png";
import { useRef } from "react";
import {
  Entity,
  Game,
  Sprite,
  useBodyComponent,
  useGame,
  useTransformComponent,
  useUpdate,
  useVelocityComponent,
  EntityContext,
  useSystem,
  TransformComponent,
  VelocityComponent,
} from "react-gamin";

export default function FloppyBert() {
  return (
    <Game width={360} height={640}>
      <div
        style={{
          color: "black",
          display: "grid",
          gridTemplate: "background",
          height: "100%",
          textAlign: "center",
          placeItems: "center",
          placeContent: "center",
        }}
      >
        <div style={{ gridArea: "background", zIndex: 1 }}>
          <Sprite src={bg} />
        </div>
        <div style={{ gridArea: "background", zIndex: 2 }}>
          {/* {currentScene} */}
          <PlayScene />
        </div>
      </div>
    </Game>
  );
}

const FLOOR_Y = 500;
const JUMP_MAX_Y = 50;
function PlayScene() {
  const player = useRef<EntityContext>();
  const acc = useRef(0);

  useSystem(
    (entities, delta) => {
      acc.current += delta;
      if (acc.current > 1000) {
        console.log(entities);
        acc.current = 0;
      }

      for (const entity of entities) {
        const [position, setPosition] = entity.getComponent(TransformComponent);
        const [velocity, setVelocity] = entity.getComponent(VelocityComponent);

        // update if entity has velocity
        if (velocity.dy !== 0) {
          let nextPositionY = position.y + -velocity.dy;
          if (nextPositionY > FLOOR_Y) {
            nextPositionY = FLOOR_Y;
          }
          setPosition({
            x: position.x,
            y: nextPositionY,
            z: position.z,
          });
        }
        // update velocity if entity is in air
        if (position.y < FLOOR_Y) {
          setVelocity({
            dx: velocity.dx,
            dy: velocity.dy - 10 * (JUMP_MAX_Y / position.y),
            dz: velocity.dz,
          });
        }
        // sanity check
        if (position.y > FLOOR_Y || position.y < 0) {
          setPosition({
            x: position.x,
            y: FLOOR_Y,
            z: position.z,
          });
          setVelocity({
            dx: 0,
            dy: 0,
            dz: 0,
          });
        }
      }
    },
    [TransformComponent, VelocityComponent]
  );

  return (
    <Entity ref={player}>
      <Player />
    </Entity>
  );
}

function Player() {
  const height = useGame((state) => state.height);
  const [body] = useBodyComponent({
    width: 15,
    height: 100,
  });
  const [position, setPosition] = useTransformComponent({
    x: 50,
    y: FLOOR_Y,
    z: 0,
  });
  const [velocity, setVelocity] = useVelocityComponent({
    dx: 0,
    dy: 0,
    dz: 0,
  });

  const isJumping = useRef(false);
  useUpdate(
    (input) => {
      if (
        (input.KEYBOARD_SPACE || input.GAMEPAD_BUTTON_12) &&
        position.y == FLOOR_Y &&
        !isJumping.current
      ) {
        setVelocity({
          dx: velocity.dx,
          dy: 25,
          dz: 0,
        });
        isJumping.current = true;
      }
      if (
        !input.KEYBOARD_SPACE &&
        !input.GAMEPAD_BUTTON_12 &&
        isJumping.current
      ) {
        isJumping.current = false;
      }
    },
    [position, velocity]
  );

  return (
    <Sprite
      src={cat}
      sheet={{
        height: 16,
        width: 16,
      }}
      selectedSprite={0}
      animations={[{ frameLength: 100, cells: [0, 1, 2, 3] }]}
      selectedAnimation={0}
      x={position.x}
      y={position.y}
      reversed
    />
  );
}
