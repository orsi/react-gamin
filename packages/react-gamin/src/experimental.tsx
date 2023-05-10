import {
  createContext,
  PropsWithChildren,
  useRef,
  useContext,
  useEffect,
} from "react";
import { useGame } from "./core";

export type PropsWithComponents<T, Props = unknown> = Props & {
  components: T[];
};
export function experimental_createSystem<T, Props>(
  systemFunction: ({
    components,
    ...props
  }: PropsWithComponents<T, Props>) => (time: number) => void,
  systemHook?: (component: T) => void
) {
  const Context = createContext<PropsWithComponents<T, Props>>(null);

  const SystemProvider = ({ children, ...props }: PropsWithChildren<Props>) => {
    const components = useRef<T[]>([]);
    const { addSystem } = useGame();
    addSystem(
      systemFunction({ components: components.current, ...(props as Props) })
    );
    return (
      <Context.Provider
        value={{ components: components.current, ...(props as Props) }}
      >
        {children}
      </Context.Provider>
    );
  };

  const useSystemHook = (component: T) => {
    // register component with system context
    const { components } = useContext(Context);
    useEffect(() => {
      components.push(component);
      return () => {
        const index = components.findIndex((i) => i === component);
        components.splice(index, 1);
      };
    }, [component, components]);

    // pass through system hook and return
    return systemHook?.(component);
  };

  return [SystemProvider, useSystemHook] as const;
}
