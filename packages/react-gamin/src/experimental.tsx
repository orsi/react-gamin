import { createSystem, useSystem } from "./core";

export type Position = { x: number; y: number; z: number };

export const TestSystem = createSystem((time, components: Position[]) => {
  // console.log("boink!", time, components);
});
export const useTestSystem = (position: Position) => {
  const components = useSystem(TestSystem, position);
  return () => {
    const otherComponents = components.filter((c) => c !== position);
    return otherComponents.some((c) => c.x > position.x);
  };
};

export const OtherSystem = createSystem((time, components: string[]) => {
  // console.log("other", time, components);
});
export const useOtherSystem = (id: string) => {
  const components = useSystem(OtherSystem, id);
};
