import { forwardRef } from "react";
import type { CatalogGame } from "../../constants";

interface HeroProps {
  game: CatalogGame;
  onPlay: (id: string) => void;
}

export const Hero = forwardRef<HTMLElement, HeroProps>(
  function Hero({ game, onPlay }, ref) {
    return (
      <section ref={ref} className="hero">
        <div
          className="hero-card"
          style={{ ["--hero-bg" as never]: `url(${game.thumbnail})` }}
        >
          <div className="hero-copy">
            <div className="kicker">Randomly selected game</div>

            <div className="heroHead">
              <img className="heroCover" src={game.thumbnail} alt={game.title} />
              <h2 className="hero-title">{game.title}</h2>
            </div>

            <div className="hero-description">{game.description}</div>

            <button className="cta" onClick={() => onPlay(game.id)}>
              Play now
            </button>
          </div>
        </div>
      </section>
    );
  }
);