import { forwardRef } from "react";
import type { CatalogGame } from "../../constants";
import { GameCard } from "./game-card";

interface GameGridProps {
  games: CatalogGame[];
  favorites: Set<string>;
  onOpen: (id: string) => void;
  onFav: (id: string) => void;
}

export const GameGrid = forwardRef<HTMLDivElement, GameGridProps>(
  function GameGrid({ games, favorites, onOpen, onFav }, ref) {
    return (
      <div
        ref={ref}
        className="
          max-w-[1180px] mx-auto
          grid gap-1.5
          grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6
        "
      >
        {games.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            isFav={favorites.has(game.id)}
            onOpen={onOpen}
            onFav={onFav}
          />
        ))}
      </div>
    );
  }
);