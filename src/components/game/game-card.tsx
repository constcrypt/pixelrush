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
        className="game-card"
        onClick={() => onOpen(game.id)}
      >
        <div className="thumb">
          <img src={game.thumbnail} loading="lazy" />
        </div>

        <div
          className="favStar"
          onClick={(e) => {
            e.stopPropagation();
            onFav(game.id);
          }}
        >
          {isFav ? "★" : "☆"}
        </div>

        <div className="cardText">
          <div className="title">{game.title}</div>
        </div>
      </button>
    );
  })
);