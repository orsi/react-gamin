import {
  createContext,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
  useContext,
  useState,
  useCallback,
} from 'react';
import { KeyboardCode } from './keys';

export default function App() {
  const ref = useRef<Entity>();
  const [transform, setTransform] = useState({ x: 500, y: 200, z: 0 });

  // audio
  const sample = useAudio('/beep-03.wav');
  const satie = useAudio('/Gymnopedie_No._1.mp3');

  useKey(
    'ArrowUp',
    () => {
      satie.play();
      setTransform({
        ...transform,
        y: transform.y - 5,
      });
    },
    true
  );

  useKey(
    'ArrowDown',
    () => {
      satie.stop();
      setTransform({
        ...transform,
        y: transform.y + 5,
      });
    },
    true
  );

  useKey(
    'ArrowLeft',
    () => {
      sample.play();
      setTransform({
        ...transform,
        x: transform.x - 5,
      });
    },
    true
  );

  useKey(
    'ArrowRight',
    () => {
      setTransform({
        ...transform,
        x: transform.x + 5,
      });
    },
    true
  );

  // render
  return (
    <div
      style={{
        position: 'absolute',
        top: `${transform.y}px`,
        left: `${transform.x}px`,
        background: 'white',
        width: '50px',
        height: '50px',
      }}
    ></div>
  );
}

///

type Component<K extends string, T> = {
  name: K;
  defaultValue: T;
};

const createComponent = <K extends string, T>(
  name: K,
  defaultValue: T
): Component<K, T> => {
  return {
    name,
    defaultValue,
  };
};

const useComponent = <K extends string, T>(component: Component<K, T>): T => {
  const entity = useContext<Entity<any>>(EntityContext);
  if (entity == null) {
    return;
  }

  return entity[component['name']];
};

const IdComponent = createComponent('id', '');
const RenderComponent = createComponent('render', (entity: Entity) => <></>);
const TransformComponent = createComponent('transform', { x: 0, y: 0, z: 0 });
const TestComponent = createComponent('test', '');

type Entity<T extends Component<string, any>[] = []> = {
  [Property in `${number}` &
    keyof T as T[Property]['name']]: T[Property]['defaultValue'];
};

const EntityContext = createContext<Entity>(null);

interface EntityProps {
  render?: typeof RenderComponent['defaultValue'];
}
const Entity = forwardRef<Entity, EntityProps>((props, ref) => {
  const entity = useRef<Entity<[]>>({
    id: crypto.randomUUID(),
    ...props,
  });
  useImperativeHandle(ref, () => entity.current, [props]);

  useEffect(() => {}, [props]);

  return (
    <EntityContext.Provider value={entity.current}>
      {props?.render(entity.current)}
    </EntityContext.Provider>
  );
});

let audioContext: AudioContext;
const useAudio = (src?: string) => {
  const audioBufferRef = useRef<AudioBuffer>();
  const audioBufferSourceNodeRef = useRef<AudioBufferSourceNode>();
  const isPlaying = useRef(false);

  // check if audio context already exists
  if (!audioContext) {
    audioContext = new AudioContext();
  }

  if (!audioBufferRef.current) {
    fetch(src)
      .then((response) => {
        return response.arrayBuffer();
      })
      .then((arrayBuffer) => {
        return audioContext.decodeAudioData(arrayBuffer);
      })
      .then((audioBuffer) => (audioBufferRef.current = audioBuffer));
  }

  //  setup window 'click' event to resume a suspended AudioContext
  const onClick = () => {
    if (audioContext?.state === 'suspended') {
      audioContext.resume();
    }
  };

  useEffect(() => {
    window.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('click', onClick);
    };
  }, []);

  const play = () => {
    if (audioBufferRef.current == null) {
      return;
    }

    if (audioContext.state === 'suspended') {
      // we can't resume audio context in this function
      console.warn('AudioContext is suspended.');
      return;
    }

    if (audioBufferSourceNodeRef.current != null && isPlaying.current) {
      // we are already playing
      return;
    }

    // create new audio buffer source node and play!
    isPlaying.current = true;
    audioBufferSourceNodeRef.current = new AudioBufferSourceNode(audioContext, {
      buffer: audioBufferRef.current,
    });
    audioBufferSourceNodeRef.current.onended = () => {
      isPlaying.current = false;
    };
    audioBufferSourceNodeRef.current.connect(audioContext.destination);
    audioBufferSourceNodeRef.current.start(audioContext.currentTime);
  };

  const stop = () => {
    audioBufferSourceNodeRef.current?.stop();
    isPlaying.current = false;
  };

  return {
    play,
    stop,
  };
};

//
type InputEvent = {
  keyboard: KeyboardEvent;
  mouse: MouseEvent;
  gamepads: Gamepad[];
};
const useInput = (
  listener: (inputEvent: InputEvent) => void,
  el?: HTMLElement
) => {
  const input = useRef<InputEvent>({
    keyboard: null,
    mouse: null,
    gamepads: null,
  });
  const inputFrame = useRef(0);

  const update = () => {
    getGamepadInput();
    listener(input.current);
    inputFrame.current = requestAnimationFrame(update);
  };

  const onKeyDown = (event: Event) => {
    input.current.keyboard = event as KeyboardEvent;
  };
  const onKeyUp = (event: Event) => {
    input.current.keyboard = event as KeyboardEvent;
  };
  const onMouseMove = (event: Event) => {
    input.current.mouse = event as MouseEvent;
  };
  const onMouseDown = (event: Event) => {
    input.current.mouse = event as MouseEvent;
  };
  const onMouseUp = (event: Event) => {
    input.current.mouse = event as MouseEvent;
  };

  const getGamepadInput = () => {
    // 8bitDo controller buttons
    // 0 1 2 3 4 5 6  7  8      9     10 11 12 13   14   15    16
    // B A Y X L R L2 R2 Select Start L3 R3 Up Down Left Right Home
    const gamepads = navigator.getGamepads();
    input.current.gamepads = gamepads;
  };

  useEffect(() => {
    const element = el ?? document;
    element.addEventListener('keydown', onKeyDown);
    element.addEventListener('keyup', onKeyUp);
    element.addEventListener('mousemove', onMouseMove);
    element.addEventListener('mousedown', onMouseDown);
    element.addEventListener('mouseup', onMouseUp);

    inputFrame.current = requestAnimationFrame(update);

    () => {
      element.removeEventListener('keydown', onKeyDown);
      element.removeEventListener('keyup', onKeyUp);
      element.removeEventListener('mousemove', onMouseMove);
      element.removeEventListener('mousedown', onMouseDown);
      element.removeEventListener('mouseup', onMouseUp);

      cancelAnimationFrame(inputFrame.current);
    };
  }, []);
};

const FPS_60_MS = 1000 / 60;
const useKey = (
  target: KeyboardCode,
  listener: () => void,
  continuous = false
) => {
  const keyInputRef = useRef(false);
  const requestAnimationFrameRef = useRef(0);
  const lastUpdateRef = useRef<number>(0);

  const update = () => {
    const now = Date.now();
    const delta = now - lastUpdateRef.current;
    if (keyInputRef.current && delta > FPS_60_MS) {
      listener();
      lastUpdateRef.current = now;
    }
    requestAnimationFrameRef.current = requestAnimationFrame(update);
  };

  const onKeydown = ({ code, key }: KeyboardEvent) => {
    if (key === target && keyInputRef.current === false) {
      keyInputRef.current = true;
      if (!continuous) {
        listener();
      }
    }
  };

  const onKeyup = ({ code, key }: KeyboardEvent) => {
    if (key === target) {
      keyInputRef.current = false;
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', onKeydown);
    window.addEventListener('keyup', onKeyup);
    return () => {
      window.removeEventListener('keydown', onKeydown);
      window.removeEventListener('keyup', onKeyup);
    };
  }, [listener]);

  useEffect(() => {
    if (continuous === true) {
      lastUpdateRef.current = Date.now();
      requestAnimationFrameRef.current = requestAnimationFrame(update);
    }
    return () => {
      cancelAnimationFrame(requestAnimationFrameRef.current);
    };
  }, [continuous, listener]);
};

// cf. https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button#value
// 0: Main button pressed, usually the left button or the un-initialized state
// 1: Auxiliary button pressed, usually the wheel button or the middle button (if present)
// 2: Secondary button pressed, usually the right button
// 3: Fourth button, typically the Browser Back button
// 4: Fifth button, typically the Browser Forward button
const MouseButtonMap = {
  0: 'left',
  1: 'wheel',
  2: 'right',
  3: 'back',
  4: 'forward',
} as const;
type MouseButtonMapKey = keyof typeof MouseButtonMap;
type MouseButton = typeof MouseButtonMap[MouseButtonMapKey];

type MiniMouseEvent = {
  button: MouseButton | undefined | null;
  x: number;
  y: number;
};

const useMouse = (
  target: MouseButton | 'move',
  listener: (ev: MiniMouseEvent) => void,
  continuous = false
) => {
  const mouseEventRef = useRef<MiniMouseEvent>({
    button: null,
    x: null,
    y: null,
  });
  const requestAnimationFrameRef = useRef(0);
  const lastUpdateRef = useRef<number>(0);

  const update = () => {
    const now = Date.now();
    const delta = now - lastUpdateRef.current;
    if (mouseEventRef.current?.button === target && delta > FPS_60_MS) {
      listener(mouseEventRef.current);
      lastUpdateRef.current = now;
    }
    requestAnimationFrameRef.current = requestAnimationFrame(update);
  };

  const onMousedown = ({ button, clientX, clientY }: MouseEvent) => {
    mouseEventRef.current = {
      button: MouseButtonMap[button as MouseButtonMapKey],
      x: clientX,
      y: clientY,
    };
    if (mouseEventRef.current?.button === target) {
      listener(mouseEventRef.current);
    }
  };

  const onMouseup = ({ button, clientX, clientY }: MouseEvent) => {
    mouseEventRef.current = {
      button: null,
      x: clientX,
      y: clientY,
    };
  };

  const onMousemove = ({ button, clientX, clientY }: MouseEvent) => {
    mouseEventRef.current = {
      ...mouseEventRef.current,
      x: clientX,
      y: clientY,
    };
    if (target === 'move') {
      listener(mouseEventRef.current);
    }
  };

  useEffect(() => {
    window.addEventListener('mousedown', onMousedown);
    window.addEventListener('mouseup', onMouseup);
    window.addEventListener('mousemove', onMousemove);
    return () => {
      window.removeEventListener('mousedown', onMousedown);
      window.removeEventListener('mouseup', onMouseup);
      window.addEventListener('mousemove', onMousemove);
    };
  }, [listener]);

  useEffect(() => {
    if (continuous === true) {
      lastUpdateRef.current = Date.now();
      requestAnimationFrameRef.current = requestAnimationFrame(update);
    }
    return () => {
      cancelAnimationFrame(requestAnimationFrameRef.current);
    };
  }, [continuous, listener]);
};

// 8bitDo controller buttons
// 0 1 2 3 4 5 6  7  8      9     10 11 12 13   14   15    16
// B A Y X L R L2 R2 Select Start L3 R3 Up Down Left Right Home
const GamepadButtonMap = {
  0: 'B',
  1: 'A',
  2: 'Y',
  3: 'X',
  4: 'L',
  5: 'R',
  6: 'L2',
  7: 'R2',
  8: 'Select',
  9: 'Start',
  10: 'L3',
  11: 'R3',
  12: 'Up',
  13: 'Down',
  14: 'Left',
  15: 'Right',
  16: 'Home', // unnecessary?
} as const;
type GamepadButtonMapKey = keyof typeof GamepadButtonMap;
type GamepadButton = typeof GamepadButtonMap[GamepadButtonMapKey];

const useGamepad = (
  target: GamepadButton,
  listener: () => void,
  continuous = false
) => {
  const buttonIndex = Object.keys(GamepadButtonMap).find(
    (key) => GamepadButtonMap[key as `${GamepadButtonMapKey}`] === target
  );
  const gamepadPressedRef = useRef(false);
  const requestAnimationFrameRef = useRef(0);
  const lastUpdateRef = useRef<number>(0);

  const update = () => {
    const gamepads = navigator.getGamepads();
    const lastPressed = gamepadPressedRef.current;
    gamepadPressedRef.current = gamepads?.[0]?.buttons?.[+buttonIndex]?.pressed;

    const now = Date.now();
    const delta = now - lastUpdateRef.current;
    if (
      delta > FPS_60_MS &&
      ((continuous && gamepadPressedRef.current === true) ||
        (lastPressed === false && gamepadPressedRef.current === true))
    ) {
      console.log('update');
      listener();
      lastUpdateRef.current = now;
    }
    requestAnimationFrameRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    lastUpdateRef.current = Date.now();
    requestAnimationFrameRef.current = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(requestAnimationFrameRef.current);
    };
  }, [listener]);
};
