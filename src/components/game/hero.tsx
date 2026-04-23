import { forwardRef } from "react";
import type { CatalogGame } from "../../constants";

interface HeroProps {
  game: CatalogGame;
  onPlay: (id: string) => void;
}

export const Hero = forwardRef<HTMLElement, HeroProps>(
  function Hero({ game, onPlay }, ref) {
    return (
      <section ref={ref} className="max-w-[1180px] mx-auto my-5">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 grid md:grid-cols-2 gap-5 min-h-[320px]">
          <div
            className="absolute inset-0 opacity-30 blur-sm"
            style={{
              backgroundImage: `url(${game.thumbnail})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          <div className="relative z-10 flex flex-col h-full">
            <div className="flex flex-col gap-3">
              <span className="text-xs uppercase tracking-widest text-white/50">
                Random game
              </span>

              <h2 className="text-3xl font-bold text-white">
                {game.title}
              </h2>

              <p className="text-white/60 text-sm leading-relaxed line-clamp-6">
                {game.description}
              </p>
            </div>

            <div className="flex-1" />

            <button
              onClick={() => onPlay(game.id)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-linear-to-r from-violet-500 to-cyan-400 text-white font-medium shadow-lg shadow-violet-500/20 hover:brightness-110 active:scale-[0.98] transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>

              Play now
            </button>
          </div>

          <div className="relative z-10 flex items-center justify-center">
            <img
              src={game.thumbnail}
              alt={game.title}
              className="rounded-xl border border-white/10 shadow-2xl shadow-black/50 max-h-[260px] object-cover"
            />
          </div>
        </div>
      </section>
    );
  }
);