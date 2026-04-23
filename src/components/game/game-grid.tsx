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
      <div ref={ref} className="game-grid">
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