import {
  Children,
  forwardRef,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { EntityContext, Position } from "./Entity";

type RenderProps = {
  children?: ReactNode;
};
export const Render = forwardRef<HTMLDivElement, RenderProps>(
  ({ children }, ref) => {
    const { current: entity } = useContext(EntityContext);
    const [position] = entity.position;
    return (
      <div
        ref={ref}
        style={{
          position: "absolute",
          top: "0",
          left: "0",
          transform: `translate(${position?.x}px, ${position?.y}px)`,
        }}
      >
        {children}
      </div>
    );
  }
);

type Sprite = {
  height: number;
  id: string;
  offsetX: number;
  offsetY: number;
  width: number;
};
type SpriteSheet = {
  src: string;
  height: number;
  width: number;
  spriteHeight: number;
  spriteWidth: number;
  sprites: Record<string, Sprite>;
};
export function createSpriteSheet({
  id,
  src,
  width,
  height,
  spriteWidth,
  spriteHeight,
}: {
  id?: string;
  src: string;
  width: number;
  height: number;
  spriteWidth: number;
  spriteHeight: number;
}) {
  const columns = width / spriteWidth;
  const rows = height / spriteHeight;

  const sprites: Sprite[] = [];
  for (let i = 0; i < columns * rows; i++) {
    const x = Math.floor(i % columns);
    const y = Math.floor(i / columns);
    const offsetX = -(x * spriteWidth);
    const offsetY = -(y * spriteHeight);

    sprites[i] = {
      id: `${id ?? "sprite"}-${i}`,
      height: spriteHeight,
      width: spriteWidth,
      offsetX,
      offsetY,
    };
  }
  return { src, height, width, spriteHeight, spriteWidth, sprites };
}

interface MultiSpriteSheetProps {
  src: string;
  sprites: Sprite[];
  tilesPerRow?: number;
}
export function MultiSpriteSheet({
  tilesPerRow,
  src,
  sprites,
}: MultiSpriteSheetProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) {
      return;
    }

    const canvasWidth =
      sprites[0].width * (tilesPerRow ? tilesPerRow : sprites.length);
    const canvasHeight =
      sprites[0].height *
      (tilesPerRow ? Math.floor(sprites.length / tilesPerRow) + 1 : 1);
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const image = new Image();
    image.src = src;
    image.addEventListener("load", (e) => {
      for (let i = 0; i < sprites.length; i++) {
        const column = tilesPerRow ? i % tilesPerRow : i;
        const row = tilesPerRow ? Math.floor(i / tilesPerRow) : 0;
        const sprite = sprites[i];
        ctx.drawImage(
          image,
          -sprite.offsetX,
          -sprite.offsetY,
          sprite.width,
          sprite.height,
          column * sprite.width,
          row * sprite.height,
          sprite.width,
          sprite.height
        );
      }
    });
  }, []);

  return <canvas ref={ref} />;
}

interface SpriteSheetProps {
  src: string;
  sprite: Sprite;
}
export function SpriteSheet({ src, sprite }: SpriteSheetProps) {
  return (
    <img
      style={{
        objectFit: "none",
        objectPosition: `${sprite.offsetX}px ${sprite.offsetY}px`,
        height: `${sprite.height}px`,
        width: `${sprite.width}px`,
      }}
      src={src}
      alt=""
    />
  );
}

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
