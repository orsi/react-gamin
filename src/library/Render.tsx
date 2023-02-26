import { CSSProperties, useEffect, useRef, useState } from "react";

export type Sheet = {
  width: number;
  height: number;
};

export type Animation = {
  frameLength: number;
  cells: number[];
};

export function getSpriteStyles(
  x?: number,
  y?: number,
  z?: number,
  imageWidth?: number,
  spriteWidth?: number,
  spriteHeight?: number,
  spriteIndex?: number
) {
  const style: CSSProperties = {
    left: "0",
    position: "relative",
    top: "0",
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

  return style;
}

export type SpriteProps = {
  alt?: string;
  src: string;
  x?: number;
  y?: number;
  z?: number;
  sheet?: Sheet;
  selectedSprite?: number;
  animations?: Animation[];
  selectedAnimation?: number;
};
export function Sprite({
  alt,
  animations,
  selectedAnimation,
  selectedSprite,
  sheet,
  src,
  x,
  y,
  z,
}: SpriteProps) {
  const [img, setImg] = useState<HTMLImageElement>();
  const [currentSprite, setCurrentSprite] = useState(selectedSprite ?? 0);

  useEffect(() => {
    const image = new Image();
    image.src = src;
    image.addEventListener("load", (e) => {
      setImg(image);
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
    img?.width,
    sheet?.width,
    sheet?.height,
    currentSprite
  );

  return (
    <>
      {img && (
        <img
          style={style}
          src={src}
          width={sheet?.width ?? img.width}
          height={sheet?.height ?? img.height}
          alt={alt ?? `Sprite`}
        />
      )}
    </>
  );
}

type MultiSpriteProps = {
  alt?: string;
  map: number[][];
  sheet: Sheet;
  src: string;
  x?: number;
  y?: number;
  z?: number;
};
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
          key={key}
          src={src}
          sheet={sheet}
          selectedSprite={row[x]}
          alt={alt ? `${alt}-${x}-${y}` : `${x}-${y}`}
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
            spriteIndex * sheet.width,
            spriteIndex * sheet.height,
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
  }, []);

  return <canvas ref={ref} />;
}
