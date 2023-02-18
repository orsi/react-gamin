import { ReactNode } from "react";

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
