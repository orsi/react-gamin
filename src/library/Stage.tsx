import {
  createContext,
  ReactNode,
  useId,
  useRef,
} from "react";

type Stage = {};
export const StageContext = createContext<Stage>({
  id: "default",
});
type StageProps = {
  key?: React.Key;
  children?: ReactNode;
};
export default function Stage({ children }: StageProps) {
  const stage = useRef({
    id: useId(),
  });
  return (
    <StageContext.Provider value={stage}>{children}</StageContext.Provider>
  );
}
