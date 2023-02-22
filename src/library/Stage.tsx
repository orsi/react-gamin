import { createContext, PropsWithChildren, ReactNode, useState } from "react";
import { TEntity } from "./Entity";

type StageStore = {
  entities: TEntity[];
};
type StageContext = {
  add: (entity: TEntity) => void;
  remove: () => void;
};
export const StageContext = createContext<null | StageContext>(null);
export default function Stage({ children }: PropsWithChildren) {
  const [state, setState] = useState({
    entities: [],
  });
  const add = (entity: TEntity) => {
    // setState(...state);
  };
  const remove = () => {};
  return (
    <StageContext.Provider
      value={{
        add,
        remove,
      }}
    >
      {children}
    </StageContext.Provider>
  );
}
