import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useRef,
  useSyncExternalStore,
} from "react";

export type Store<T> = {
  get: () => T;
  set: (value: Partial<T>) => void;
  subscribe: (callback: () => void) => () => void;
};
export function createStore<T>(initialState: T) {
  const store = useRef<T>(initialState);
  const subscribers = useRef(new Set<() => void>());

  const get = useCallback(() => store.current, []);

  const set = useCallback((value: Partial<T>) => {
    store.current = Object.assign({}, store.current, value);
    subscribers.current.forEach((callback) => callback());
  }, []);

  const subscribe = useCallback((callback: () => void) => {
    subscribers.current.add(callback);
    return () => {
      subscribers.current.delete(callback);
    };
  }, []);

  return {
    get,
    set,
    subscribe,
  };
}

export function oldStore<T>(initialState: T) {
  function useStoreRef() {
    const store = useRef<T>(initialState);
    const subscribers = useRef(new Set<() => void>());

    const get = useCallback(() => store.current, []);

    const set = useCallback((value: Partial<T>) => {
      store.current = Object.assign({}, store.current, value);
      subscribers.current.forEach((callback) => callback());
    }, []);

    const subscribe = useCallback((callback: () => void) => {
      subscribers.current.add(callback);
      return () => {
        subscribers.current.delete(callback);
      };
    }, []);

    return {
      get,
      set,
      subscribe,
    };
  }

  const StoreContext = createContext<ReturnType<typeof useStoreRef> | null>(
    null
  );

  function Provider({ children }: PropsWithChildren) {
    return (
      <StoreContext.Provider value={useStoreRef()}>
        {children}
      </StoreContext.Provider>
    );
  }

  function useStore<O>(
    selector: (store: T) => O
  ): [O, (value: Partial<T>) => void];
  function useStore<O>(): [T, (value: Partial<T>) => void];
  function useStore<O>(selector?: (store: T) => O) {
    const store = useContext(StoreContext);
    if (!store) {
      throw new Error("No store.");
    }

    const state = useSyncExternalStore(store.subscribe, () =>
      selector ? selector(store.get()) : store.get()
    );

    return [state, store.set];
  }

  return {
    Provider,
    useStore,
  };
}
