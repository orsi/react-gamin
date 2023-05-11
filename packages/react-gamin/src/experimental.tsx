import {
  createContext,
  PropsWithChildren,
  useRef,
  useContext,
  useEffect,
} from "react";
import { useGame } from "./core";

export type PropsWithComponents<C, P = unknown> = P & {
  components: C[];
};

export function experimental_createSystem<C, P>(
  systemFunction: ({
    components,
    ...props
  }: PropsWithComponents<C, P>) => (time: number) => void,
  systemHook?: (component: C) => void,
  displayName?: string
) {
  const Context = createContext<PropsWithComponents<C, P>>(null);
  Context.displayName = displayName ?? "SystemContext";

  const SystemProvider = ({
    children,
    ...props
  }: PropsWithChildren<Omit<P, "components">>) => {
    //                  ^ this doesn't seem right
    const components = useRef<C[]>([]);
    const { addSystem } = useGame();
    addSystem(
      systemFunction({ components: components.current, ...(props as P) })
    );
    return (
      <Context.Provider
        value={{ components: components.current, ...(props as P) }}
      >
        {children}
      </Context.Provider>
    );
  };

  const useSystemHook = (component: C) => {
    const context = useContext(Context);
    if (context == null) {
      console.warn(
        `${Context.displayName} is undefined. Did you pass it to <Game />?`
      );
    }

    // register component with system context
    useEffect(() => {
      context?.components?.push(component);
      return () => {
        const index = context?.components?.findIndex((i) => i === component);
        context?.components?.splice(index, 1);
      };
    }, [component, context]);

    // pass through system hook and return
    return systemHook?.(component);
  };

  return [SystemProvider, useSystemHook] as const;
}
