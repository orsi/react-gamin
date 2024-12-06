import { useEffect, useRef, useState } from 'react';
import characterSpriteSheet from './assets/roguelike_archer_48px.png';

import { ReactGamin } from 'react-gamin';

type Animations = {
  src: string;
  height: number;
  width: number;
  frames: {
    [key: string]: Frame[];
  };
};
type Frame = { left: number; top: number; transform?: string };
const animations: Animations = {
  src: characterSpriteSheet,
  height: 16,
  width: 16,
  frames: {
    walkRight: [
      {
        left: 16,
        top: 32,
      },
      {
        left: 64,
        top: 32,
      },
      {
        left: 112,
        top: 32,
      },
      {
        left: 160,
        top: 32,
      },
    ],
    walkLeft: [
      {
        left: 16,
        top: 32,
        transform: 'scale(-1,1)',
      },
      {
        left: 64,
        top: 32,
        transform: 'scale(-1,1)',
      },
      {
        left: 112,
        top: 32,
        transform: 'scale(-1,1)',
      },
      {
        left: 160,
        top: 32,
        transform: 'scale(-1,1)',
      },
    ],
  },
};
function Warrior() {
  const [currentAnimation, setCurrentAnimation] = useState(
    animations.frames.walkLeft
  );
  const [currentAnimationFrame, setCurrentAnimationFrame] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const lastTime = useRef(0);
  useEffect(() => {
    let frame = 0;

    const update = (time) => {
      const delta = time - lastTime.current;

      if (delta > 125) {
        let nextFrame = currentAnimationFrame + 1;
        if (nextFrame > currentAnimation.length - 1) {
          nextFrame = 0;
        }
        setCurrentAnimationFrame(nextFrame);
        lastTime.current = time;
      }
      frame = requestAnimationFrame(update);
    };

    frame = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [currentAnimationFrame]);

  useEffect(() => {
    const onKeyPress = (ev) => {
      console.log(ev.code);
      if (ev.code === 'KeyA') {
        setCurrentAnimation(animations.frames.walkLeft);
        setPosition((position) => ({
          ...position,
          x: position.x - 1,
        }));
      } else if (ev.code === 'KeyD') {
        setCurrentAnimation(animations.frames.walkRight);
        setPosition((position) => ({
          ...position,
          x: position.x + 1,
        }));
      } else if (ev.code === 'KeyW') {
        setPosition((position) => ({
          ...position,
          y: position.y - 1,
        }));
      } else if (ev.code === 'KeyS') {
        setPosition((position) => ({
          ...position,
          y: position.y + 1,
        }));
      }
    };
    document.addEventListener('keypress', onKeyPress);
    return () => {
      document.removeEventListener('keypress', onKeyPress);
    };
  }, []);

  return (
    <div
      style={{
        position: 'relative',
      }}
    >
      <div
        style={{
          border:
            '1px solid color-mix(in srgb, rebeccapurple, transparent 60%)',
          height: animations.height + 1,
          left: -1,
          position: 'absolute',
          top: -1,
          width: animations.width + 1,
        }}
      ></div>
      <img
        style={{
          width: animations.width,
          height: animations.height,
          objectFit: 'none',
          objectPosition: `-${currentAnimation[currentAnimationFrame].left}px -${currentAnimation[currentAnimationFrame].top}px`,
          transform: currentAnimation[currentAnimationFrame].transform ?? '',
          left: position.x,
          position: 'absolute',
          top: position.y,
        }}
        src={animations.src}
      />
    </div>
  );
}
function App() {
  return (
    <>
      <ReactGamin>
        <Warrior />
      </ReactGamin>
      <footer>
        <h6>Credits</h6>
        <ul>
          <li>
            <div>
              <div>roguelike tileset</div>
              <div>ibirothe</div>
              <div>https://ibirothe.itch.io/</div>
            </div>
          </li>
        </ul>
      </footer>
    </>
  );
}

export default App;
