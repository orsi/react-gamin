import {
  Children,
  forwardRef,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { IPosition } from "./Entity";

interface RenderProps extends PropsWithChildren {
  position?: IPosition;
}
export const Render = forwardRef<HTMLDivElement, RenderProps>(
  ({ children, position }, ref) => {
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

export function useSpriteSheet({
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
    const x = Math.floor(i % tilesPerColumn);
    const y = Math.floor(i / tilesPerColumn);
    const objectPositionX = -(x * cellWidth);
    const objectPositionY = -(y * cellHeight);
    const objectPosition = `${objectPositionX}px ${objectPositionY}px`;

    sprites[i] = (
      <img
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
