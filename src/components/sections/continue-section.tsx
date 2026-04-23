import type { CatalogGame } from "../../constants";

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
  if (games.length === 0) return null;

  return (
    <section className="continueSection">
      <div className="sectionHeader">
        <h3>Continue</h3>
      </div>

      <div className="horizontalScroll">
        {games.map((game) => (
          <div
            key={game.id}
            className="miniCard"
            onClick={() => onOpen(game.id)}
          >
            <img src={game.thumbnail} alt={game.title} />

            <div
              className="favStar"
              onClick={(e) => {
                e.stopPropagation();
                onFav(game.id);
              }}
            >
              {favorites.has(game.id) ? "★" : "☆"}
            </div>

            <div className="miniTitle">{game.title}</div>
          </div>
        ))}
      </div>
    </section>
  );
}