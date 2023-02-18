import { createElement, Fragment, ReactNode } from "react";

export interface SpriteSheet {
  element: JSX.Element;
  debug: JSX.Element;
  get: (index: number) => JSX.Element;
}
export interface Sprite {
  x: number;
  y: number;
  style: {
    objectFit: string;
    objectPosition: string;
    width: string;
    height: string;
  };
}
const spriteSheets = new Map<string, SpriteSheet>();
export async function createSpriteSheet(
  src: string,
  cellWidth: number,
  cellHeight: number
) {
  const previousSpriteSheet = spriteSheets.get(src);
  if (previousSpriteSheet) {
    return previousSpriteSheet;
  }

  const image = await new Promise<HTMLImageElement>((resolve) => {
    const _image = new Image();
    _image.src = src;
    _image.addEventListener("load", () => {
      resolve(_image);
    });
  });

  const tilesPerColumn = image.width / cellWidth;
  const tilesPerRow = image.height / cellHeight;

  const sprites: Sprite[] = [];
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
      },
    };
    sprites.push(sprite);
  }

  const spriteMarkers = sprites.map((style, i) => {
    return (
      <span
        key={`sprite-marker-${i}`}
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
  });

  const SpriteSheetElement = ({ style }: { style?: any }) => (
    <>
      {createElement("img", {
        src: image.src,
        alt: "",
        style,
      })}
    </>
  );

  const spriteSheet = {
    element: <SpriteSheetElement />,
    debug: (
      <div style={{ position: "relative" }}>
        <SpriteSheetElement />
        {spriteMarkers}
      </div>
    ),
    get(i: number) {
      if (i < 0 || i > sprites.length - 1) {
        return <>none</>;
      }
      return <SpriteSheetElement style={sprites[i].style} />;
    },
  };
  spriteSheets.set(src, spriteSheet);
  return spriteSheet;
}

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
        key={key}
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
