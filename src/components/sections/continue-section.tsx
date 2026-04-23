import type { CatalogGame } from "../../constants";
import { GameCard } from "../game/game-card";

interface ContinueSectionProps {
  games: CatalogGame[];
  favorites: Set<string>;
  onOpen: (id: string) => void;
  onFav: (id: string) => void;
}

export function ContinueSection({
  games,
  favorites,
  onOpen,
  onFav,
}: ContinueSectionProps) {
  if (!games.length) return null;

  return (
    <section className="max-w-[1180px] mx-auto mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold text-lg">Continue</h3>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory">
        {games.map((game) => (
          <div key={game.id} className="shrink-0 w-[190px] snap-start">
            <GameCard
              game={game}
              isFav={favorites.has(game.id)}
              onOpen={onOpen}
              onFav={onFav}
            />
          </div>
        ))}
      </div>
    </section>
  );
}