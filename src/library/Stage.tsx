import { createContext, ReactNode, useId, useRef } from "react";

interface Stage {}
export const StageContext = createContext<Stage>({
  id: "default",
});
interface StageProps {
  key?: React.Key;
  children?: ReactNode;
}
export default function Stage({ children }: StageProps) {
  const stage = useRef({
    id: useId(),
  });
  return (
    <StageContext.Provider value={stage}>{children}</StageContext.Provider>
  );
}
