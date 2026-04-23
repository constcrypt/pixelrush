import { forwardRef } from "react";
import type { CatalogGame } from "../../constants";
import { Divider } from "../decorations/divider";

interface GameModalProps {
  game: CatalogGame;
  theater: boolean;
  onClose: () => void;
  toggleTheater: () => void;
}

export const GameModal = forwardRef<HTMLDivElement, GameModalProps>(
  function GameModal({ game, theater, onClose, toggleTheater }, ref) {
    return (
      <div
        ref={ref}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`
            bg-white/5 backdrop-blur-xl
            border border-white/10
            rounded-2xl overflow-hidden
            flex flex-col
            ${theater ? "w-[90vw] h-[90vh]" : "w-full max-w-[1100px] h-[85vh]"}
          `}
        >
          <div className="flex justify-between items-center px-4 py-2 shrink-0">
            <h2 className="text-white font-semibold">{game.title}</h2>

            <div className="flex gap-2">
              <button
                onClick={toggleTheater}
                className="px-3 py-1 rounded-lg bg-white/10 text-white"
              >
                {theater ? "Normal" : "Theater"}
              </button>

              <button
                onClick={onClose}
                className="w-9 h-9 rounded-lg bg-white/10 text-white"
              >
                ×
              </button>
            </div>
          </div>

          <Divider compact />

          <div className="flex-1 p-2">
            <iframe
              src={game.embedUrl}
              title={game.title}
              className="w-full h-full rounded-xl border border-white/10"
              sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock"
            />
          </div>

          {!theater && (
            <>
              <Divider compact />
              <div className="px-4 py-2 text-white/60 text-sm shrink-0">
                {game.description}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
);