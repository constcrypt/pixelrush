import { forwardRef, memo } from "react";
import type { CatalogGame } from "../../constants";

interface GameCardProps {
  game: CatalogGame;
  isFav: boolean;
  onOpen: (id: string) => void;
  onFav: (id: string) => void;
}

export const GameCard = memo(
  forwardRef<HTMLButtonElement, GameCardProps>(function GameCard(
    { game, isFav, onOpen, onFav },
    ref
  ) {
    return (
      <button
        ref={ref}
        onClick={() => onOpen(game.id)}
        className="
          group relative text-left
          rounded-md border border-white/10
          bg-white/5 text-white
          overflow-hidden
          transition
          hover:-translate-y-px
          hover:bg-white/10 hover:border-cyan-400/40
          active:translate-y-0
          shadow-sm shadow-black/30
        "
      >
        <div
          onClick={(e) => {
            e.stopPropagation();
            onFav(game.id);
          }}
          className="
            absolute top-1 right-36.5 z-10
            opacity-0
            w-10 h-10
            flex items-center justify-center
            rounded-md
            bg-black/40 backdrop-blur-md
            border border-white/10
            text-yellow-300
            text-2xl
            cursor-pointer
            transition
            hover:bg-black/60 hover:border-yellow-400/40
            group-hover:opacity-100
          "
        >
          {isFav ? "★" : "☆"}
        </div>

        <div className="aspect-16/10 w-full overflow-hidden bg-black/20">
          <img
            src={game.thumbnail}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-[1.04] transition"
          />
        </div>

        <div className="px-2 py-1">
          <div className="text-[12px] font-medium text-white/90 leading-snug line-clamp-1">
            {game.title}
          </div>
        </div>
      </button>
    );
  })
);