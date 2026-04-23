import { forwardRef, type ReactNode } from "react";
import type { CatalogGame } from "../../constants";

interface RowProps {
  title: string;
  games: CatalogGame[];
  favorites: Set<string>;
  onOpen: (id: string) => void;
  onFav: (id: string) => void;
  children?: ReactNode;
}

export const GameRow = forwardRef<HTMLElement, RowProps>(
  function GameRow(
    { title, games, favorites, onOpen, onFav, children },
    ref
  ) {
    if (!games.length) return null;

    return (
      <section ref={ref} className="continueSection">
        <div className="sectionHeader">
          <h3>{title}</h3>

          {children}
        </div>

        <div className="horizontalScroll">
          {games.map((game) => (
            <div
              key={game.id}
              className="miniCard"
              onClick={() => onOpen(game.id)}
            >
              <img src={game.thumbnail} loading="lazy" />

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
);