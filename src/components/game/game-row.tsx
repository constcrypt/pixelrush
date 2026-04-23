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
  function GameRow({ title, games, favorites, onOpen, onFav, children }, ref) {
    if (!games.length) return null;

    return (
      <section ref={ref} className="max-w-[1180px] mx-auto my-5">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-white font-semibold">{title}</h3>
          {children}
        </div>

        <div
          className="
            flex gap-3 overflow-x-auto
            scroll-smooth snap-x snap-mandatory
            pb-2
          "
        >
          {games.map((game) => (
            <div
              key={game.id}
              onClick={() => onOpen(game.id)}
              className="
                relative min-w-[160px] h-[110px]
                rounded-xl overflow-hidden
                cursor-pointer
                snap-start
                border border-white/10
                hover:scale-105 transition
              "
            >
              <img
                src={game.thumbnail}
                className="w-full h-full object-cover"
              />

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFav(game.id);
                }}
                className="
                  absolute top-2 left-2
                  text-yellow-400 text-lg
                "
              >
                {favorites.has(game.id) ? "★" : "☆"}
              </button>

              <div className="absolute bottom-1 left-1 right-1 text-xs text-white bg-black/50 rounded px-2 py-1">
                {game.title}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }
);