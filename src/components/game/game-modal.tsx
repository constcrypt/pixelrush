import { forwardRef } from "react";
import type { CatalogGame } from "../../constants";

interface GameModalProps {
  game: CatalogGame;
  theater: boolean;
  onClose: () => void;
  toggleTheater: () => void;
}

export const GameModal = forwardRef<HTMLDivElement, GameModalProps>(
  function GameModal({ game, theater, onClose, toggleTheater }, ref) {
    return (
      <div ref={ref} className="modal" onClick={onClose}>
        <div
          className={theater ? "modal-content theater" : "modal-content"}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-top">
            <div className="modal-name">{game.title}</div>

            <div className="modal-actions">
              <button onClick={toggleTheater}>
                {theater ? "Normal" : "Theater"}
              </button>

              <button onClick={onClose}>×</button>
            </div>
          </div>

          <div className="player">
            <iframe
              src={game.embedUrl}
              title={game.title}
              sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock"
            />
          </div>

          <div className="modal-desc">{game.description}</div>
        </div>
      </div>
    );
  }
);