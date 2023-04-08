import { CSSProperties, HTMLProps, useEffect, useRef, useState } from "react";

export interface Sheet {
  width: number;
  height: number;
}

export interface Animation {
  frameLength: number;
  cells: number[];
}

export function getSpriteStyles(
  x?: number,
  y?: number,
  z?: number,
  imageWidth?: number,
  spriteWidth?: number,
  spriteHeight?: number,
  spriteIndex?: number,
  reversed = false,
  flipped = false,
  scale = 1
) {
  const style: CSSProperties = {
    left: "0",
    position: "relative",
    top: "0",
    transform: ``,
  };

  if (x != null && y != null) {
    style.left = "0";
    style.position = "absolute";
    style.top = "0";
    style.transform = `translate(${x}px, ${y}px)`;
  }

  if (z != null) {
    style.zIndex = `${z}`;
  }

  if (
    imageWidth != null &&
    spriteWidth != null &&
    spriteHeight != null &&
    spriteIndex != null
  ) {
    const tilesPerRow = imageWidth / spriteWidth;
    const offsetX = -(spriteIndex % tilesPerRow) * spriteWidth;
    const offsetY = -Math.floor(spriteIndex / tilesPerRow) * spriteHeight;
    style.height = `${spriteHeight}px`;
    style.objectFit = `none`;
    style.objectPosition = `${offsetX}px ${offsetY}px`;
    style.width = `${spriteWidth}px`;
  }

  if (reversed) {
    style.transform = `${style.transform} rotateY(180deg)`;
  }

  if (flipped) {
    style.transform = `${style.transform} rotateX(180deg)`;
  }

  if (scale) {
    style.transform = `${style.transform} scale(${scale})`;
    style.imageRendering = `crisp-edges`;
  }

  return style;
}

export interface SpriteProps extends HTMLProps<HTMLImageElement> {
  alt?: string;
  scale?: number;
  src: string;
  x?: number;
  y?: number;
  z?: number;
  reversed?: boolean;
  flipped?: boolean;
  sheet?: Sheet;
  selectedSprite?: number;
  animations?: Animation[];
  selectedAnimation?: number;
}
export function Sprite({
  alt,
  animations,
  reversed,
  flipped,
  scale,
  selectedAnimation,
  selectedSprite,
  sheet,
  src,
  x,
  y,
  z,
  ...props
}: SpriteProps) {
  const [image, setImage] = useState<HTMLImageElement>();
  const [currentSprite, setCurrentSprite] = useState(selectedSprite ?? 0);

  useEffect(() => {
    setCurrentSprite(selectedSprite);
  }, [selectedSprite]);

  useEffect(() => {
    const image = new Image();
    image.src = src;
    image.addEventListener("load", (e) => {
      setImage(image);
    });
  }, []);

  // animation setup
  const lastUpdateRef = useRef(0);
  const requestFrameRef = useRef(0);
  const lastAnimationFrameRef = useRef({
    animation: animations?.[selectedAnimation],
    frame: 0,
  });

  useEffect(() => {
    const updateAnimation = (time: number) => {
      requestFrameRef.current = requestAnimationFrame(updateAnimation);

      const delta = time - lastUpdateRef.current;
      const animation = animations[selectedAnimation];
      if (animation && delta > animation.frameLength) {
        // save previous animation frame as it will be used
        // to determine the fallback animation frame if selectedAnimation
        // becomes undefined
        lastAnimationFrameRef.current = {
          animation,
          frame:
            (lastAnimationFrameRef.current.frame + 1) % animation.cells.length,
        };
        setCurrentSprite(animation.cells[lastAnimationFrameRef.current.frame]);
        lastUpdateRef.current = time;
      }
    };

    if (!animations) {
      return;
    }

    if (selectedAnimation == null) {
      setCurrentSprite(
        lastAnimationFrameRef.current?.animation?.cells?.[0] ?? 0
      );
    }

    requestFrameRef.current = requestAnimationFrame(updateAnimation);
    return () => {
      cancelAnimationFrame(requestFrameRef.current);
    };
  }, [animations, selectedAnimation]);

  const style = getSpriteStyles(
    x,
    y,
    z,
    image?.width,
    sheet?.width,
    sheet?.height,
    currentSprite,
    reversed,
    flipped,
    scale
  );

  return (
    <>
      {image && (
        <img
          style={style}
          src={src}
          width={sheet?.width ?? image.width}
          height={sheet?.height ?? image.height}
          alt={alt ?? `Sprite`}
          {...props}
        />
      )}
    </>
  );
}

interface MappedSprite {
  animations?: Animation[];
  selectedSprite?: number;
  selectedAnimation?: number;
}
interface MultiSpriteProps {
  alt?: string;
  map: MappedSprite[][];
  sheet: Sheet;
  src: string;
  x?: number;
  y?: number;
  z?: number;
}
export function MultiSprite({
  alt,
  map,
  sheet,
  src,
  x,
  y,
  z,
}: MultiSpriteProps) {
  let multiSpriteElements = [];
  for (let y = 0; y < map?.length; y++) {
    if (!multiSpriteElements[y]) {
      multiSpriteElements[y] = [];
    }
    const row = map[y];
    for (let x = 0; x < row?.length; x++) {
      const key = `multi-sprite-row-${x}`;
      multiSpriteElements[y][x] = (
        <Sprite
          alt={alt ? `${alt}-${x}-${y}` : `${x}-${y}`}
          key={key}
          src={src}
          sheet={sheet}
          animations={row[x].animations}
          selectedSprite={row[x].selectedSprite}
          selectedAnimation={row[x].selectedAnimation}
        />
      );
    }
  }

  const style = getSpriteStyles(x, y, z);
  return (
    <div
      style={{
        ...style,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {multiSpriteElements.map((row, i) => {
        const key = `multi-sprite-column-${i}`;
        return (
          <div key={key} style={{ display: "flex" }}>
            {row}
          </div>
        );
      })}
    </div>
  );
}

interface SpriteCanvasProps {
  src: string;
  sprites: number[][];
  sheet: Sheet;
}
export function SpriteCanvas({ src, sheet, sprites }: SpriteCanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) {
      return;
    }

    const canvasWidth = sprites[0].length * sheet.width;
    const canvasHeight = sprites.length * sheet.height;
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
        for (let j = 0; j < sprites[i].length; j++) {
          const offsetX = j * sheet.width;
          const offsetY = i * sheet.height;
          const spriteIndex = sprites[i][j];
          ctx.drawImage(
            image,
            (spriteIndex % (image.width / sheet.width)) * sheet.width,
            (spriteIndex / (image.width / sheet.width)) * sheet.height,
            sheet.width,
            sheet.height,
            offsetX,
            offsetY,
            sheet.width,
            sheet.height
          );
        }
      }
    });
  });

  return <canvas ref={ref} />;
}
