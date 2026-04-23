import { useCallback } from "react";
import { MAX_RECENTLY_PLAYED } from "../constants";
import { useStorage } from "./use-storage";

export function useRecent() {
  const [recent, setRecent, refresh] = useStorage<string[]>(
    "recentlyPlayedGames",
    []
  );

  const addRecent = useCallback(
    (id: string) => {
      setRecent((prev) => {
        const updated = prev.filter((r) => r !== id);
        updated.unshift(id);

        return updated.slice(0, MAX_RECENTLY_PLAYED);
      });
    },
    [setRecent]
  );

  const removeRecent = useCallback(
    (id: string) => {
      setRecent((prev) => prev.filter((r) => r !== id));
    },
    [setRecent]
  );

  const clearRecent = useCallback(() => {
    setRecent([]);
  }, [setRecent]);

  return {
    recent,
    addRecent,
    removeRecent,
    clearRecent,
    refresh,
  };
}