import {
  Children,
  createElement,
  CSSProperties,
  Fragment,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export default function useSpriteSheet({
  src,
  width,
  height,
  cellWidth,
  cellHeight,
}: {
  src: string;
  width: number;
  height: number;
  cellWidth: number;
  cellHeight: number;
}) {
  const tilesPerColumn = width / cellWidth;
  const tilesPerRow = height / cellHeight;

  const sprites: ReactNode[] = [];
  for (let i = 0; i < tilesPerColumn * tilesPerRow; i++) {
    const key = `sprite-${i}`;
    const x = Math.floor(i % tilesPerColumn);
    const y = Math.floor(i / tilesPerColumn);
    const objectPositionX = -(x * cellWidth);
    const objectPositionY = -(y * cellHeight);
    const objectPosition = `${objectPositionX}px ${objectPositionY}px`;

    sprites[i] = (
      <img
        id={`sprite-${key}`}
        style={{
          objectFit: "none",
          objectPosition,
          width: `${cellWidth}px`,
          height: `${cellHeight}px`,
        }}
        src={src}
        alt=""
      />
    );
  }
  return sprites;
}

export interface SpriteSheet {
  src: string;
  sprites: Sprite[];
  debug: JSX.Element;
}
export interface Sprite {
  x: number;
  y: number;
  style: CSSProperties;
}
const spriteSheets = new Map<string, SpriteSheet>();
export function createSpriteSheet(
  src: string,
  cellWidth: number,
  cellHeight: number
) {
  const [image, setImage] = useState<HTMLImageElement>();
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [sprites, setSprites] = useState([]);

  let spriteSheet = spriteSheets.get(src);
  if (spriteSheet === undefined) {
    spriteSheet = {
      src,
      sprites: [],
      debug: <></>,
    };
    spriteSheets.set(src, spriteSheet!);
  }

  const _image = new Image();
  _image.src = src;
  _image.addEventListener("load", () => {
    setImage(_image);
  });

  useEffect(() => {
    if (!image) {
      return;
    }

    const tilesPerColumn = image.width / cellWidth;
    const tilesPerRow = image.height / cellHeight;

    for (let i = 0; i < tilesPerColumn * tilesPerRow; i++) {
      const x = Math.floor(i % tilesPerColumn);
      const y = Math.floor(i / tilesPerColumn);
      const objectPositionX = x * cellWidth;
      const objectPositionY = y * cellHeight;
      const objectPosition = `${-objectPositionX}px ${-objectPositionY}px`;
      const sprite = {
        x: objectPositionX,
        y: objectPositionY,
        width: cellWidth,
        height: cellHeight,
        style: {
          objectFit: "none",
          objectPosition,
          width: `${cellWidth}px`,
          height: `${cellHeight}px`,
        } as CSSProperties,
      };
      spriteSheet.sprites.push(sprite);
    }
  }, [image]);

  spriteSheet.debug = (
    <div style={{ position: "relative" }}>
      <img src={src} alt="" />
      {sprites.map((style, i) => {
        return (
          <span
            id={`sprite-marker-${i}`}
            style={{
              boxSizing: "border-box",
              fontSize: "6px",
              left: `${style.x}px`,
              position: "absolute",
              top: `${style.y}px`,
              boxShadow: `1px 1px 0 0 rgba(255,255,255,.2)`,
              padding: `2px`,
              width: cellWidth,
              height: cellHeight,
            }}
          >
            {i}
          </span>
        );
      })}
    </div>
  );
  return spriteSheet;
}

export function createAnimation(
  id: string,
  sprites: Sprite[],
  keyFrames: number[],
  duration: number
) {
  return {
    id,
    sprites,
    keyFrames,
    duration,
  };
}

export function useAnimation(animation: any) {
  const [currentKeyFrame, setCurrentKeyFrame] = useState<number>(0);

  const frame = useRef(0);
  const lastUpdate = useRef(Date.now());
  const frameDuration = animation.duration / animation.keyFrames.length;

  const animate = useCallback(
    (time: number) => {
      const now = Date.now();
      const delta = now - lastUpdate.current;
      if (delta > frameDuration) {
        setCurrentKeyFrame((value) => (value + 1) % animation.keyFrames.length);
        lastUpdate.current = now;
      }
      frame.current = requestAnimationFrame(animate);
    },
    [setCurrentKeyFrame]
  );

  useEffect(() => {
    frame.current = requestAnimationFrame(animate);
    return () => {
      if (frame.current) {
        cancelAnimationFrame(frame.current);
      }
    };
  }, []);

  return {
    currentFrame: currentKeyFrame,
    currentSprite: animation.sprites[animation.keyFrames[currentKeyFrame]],
  };
}

export function useAnimationState() {
  return [];
}

//////////////////////

interface SpriteProps {
  src?: string;
}
export function Sprite({ src }: SpriteProps) {
  return <img src={src} alt="" />;
}

export interface AnimationProps {
  srcs: string[];
  duration?: number;
}
export function Animation({ srcs, duration = 1000 }: AnimationProps) {
  const [currentSrc, setCurrentSrc] = useState<string>(srcs[0]);

  const currentKeyFrame = useRef(0);
  const lastUpdate = useRef(Date.now());
  const frameDuration = duration / srcs.length;

  const currentRequestAnimationFrame = useRef(0);
  const animate = useCallback(
    (time: number) => {
      const now = Date.now();
      const delta = now - lastUpdate.current;
      if (delta > frameDuration) {
        currentKeyFrame.current = (currentKeyFrame.current + 1) % srcs.length;
        setCurrentSrc(srcs[currentKeyFrame.current]);
        lastUpdate.current = now;
      }
      currentRequestAnimationFrame.current = requestAnimationFrame(animate);
    },
    [srcs, setCurrentSrc]
  );

  useEffect(() => {
    currentRequestAnimationFrame.current = requestAnimationFrame(animate);
    return () => {
      if (currentRequestAnimationFrame.current) {
        cancelAnimationFrame(currentRequestAnimationFrame.current);
      }
    };
  }, []);

  return <img src={currentSrc} alt="" />;
}

export interface SpriteAnimationStateProps {
  id: string;
  children?: ReactElement<AnimationProps> | Array<ReactElement<AnimationProps>>;
}
export function SpriteAnimationState({ children }: SpriteAnimationStateProps) {
  return <>{children}</>;
}
export interface SpriteAnimationStateMachineProps {
  state: string;
  children?:
    | ReactElement<SpriteAnimationStateProps>
    | Array<ReactElement<SpriteAnimationStateProps>>;
}
export function SpriteAnimationStateMachine({
  state,
  children,
}: SpriteAnimationStateMachineProps) {
  const currentChild = Children.toArray(children).find(
    (child) =>
      (child as ReactElement<SpriteAnimationStateProps>).props?.id === state
  );
  return <>{currentChild}</>;
}
