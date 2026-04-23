import { useCallback } from "react";
import { useStorage } from "./use-storage";

export function useFavorites() {
  const [favorites, setFavorites, refresh] = useStorage<string[]>(
    "favoriteGames",
    []
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      setFavorites((prev) => {
        const updated = prev.includes(id)
          ? prev.filter((f) => f !== id)
          : [...prev, id];

        return updated;
      });
    },
    [setFavorites]
  );

  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, [setFavorites]);

  return {
    favorites,
    toggleFavorite,
    clearFavorites,
    refresh,
  };
}