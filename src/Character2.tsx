import characterImage from "./assets/character.png";
import { useState, useEffect } from "react";
import { createSpriteSheet, SpriteSheet } from "./components/useSpriteSheet";

export default function Character2() {
  const [spriteSheet, setSpriteSheet] = useState<SpriteSheet>();

  useEffect(() => {
    createSpriteSheet(characterImage, 16, 32).then((spriteSheet) => {
      console.log(spriteSheet);
      setSpriteSheet(spriteSheet);
    });
  }, []);

  return (
    <>
      {spriteSheet?.debug}
      {spriteSheet?.get?.(27)}
    </>
  );
}
