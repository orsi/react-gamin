import { createContext, useContext } from 'react';

export const ReactGaminContext = createContext(null);

/**
 * The core <Game /> component used to cnetralize and sync all game
 * processes, updates, inputs, etc.
 */
export function ReactGamin({ children }) {
  return (
    <ReactGaminContext.Provider value={{}}>
      {children}
    </ReactGaminContext.Provider>
  );
}

export function useGame() {
  const context = useContext(ReactGaminContext);
  return context;
}
