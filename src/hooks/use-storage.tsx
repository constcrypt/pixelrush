import { useCallback, useState } from "react";

type Updater<T> = T | ((prev: T) => T);

export function useStorage<T>(key: string, initialValue: T) {
  const read = (): T => {
    if (typeof window === "undefined") return initialValue;

    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  };

  const [state, setState] = useState<T>(() => read());

  const setValue = useCallback(
    (value: Updater<T>) => {
      setState((prev) => {
        const next =
          typeof value === "function"
            ? (value as (p: T) => T)(prev)
            : value;

        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {
          // ignore
        }

        return next;
      });
    },
    [key]
  );

  const refresh = useCallback(() => {
    setState(read());
  }, [key]);

  return [state, setValue, refresh] as const;
}