import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import gamesData from "./data/games.json";
import {
  getFavorites,
  toggleFavorite,
  getRecentlyPlayed,
  saveRecentlyPlayed,
} from "./data/storage";

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

type CatalogGame = {
  id: string;
  title: string;
  thumbnail: string;
  pageUrl: string;
  description: string;
  embedUrl: string;
};

function PixelRushIcon() {
  return (
    <svg
      className="pixelIcon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      shapeRendering="crispEdges"
    >
      <rect
        x="3"
        y="8"
        width="18"
        height="11"
        rx="3"
        fill="rgba(255,255,255,0.10)"
      />
      <rect x="6" y="11" width="2" height="6" fill="rgba(255,255,255,0.85)" />
      <rect x="4" y="13" width="6" height="2" fill="rgba(255,255,255,0.85)" />
      <rect x="15" y="12" width="2" height="2" fill="rgba(255,255,255,0.85)" />
      <rect x="18" y="13" width="2" height="2" fill="rgba(255,255,255,0.75)" />
      <rect x="13" y="14" width="2" height="2" fill="rgba(255,255,255,0.75)" />
      <rect x="10" y="6" width="4" height="2" fill="rgba(255,255,255,0.35)" />
    </svg>
  );
}

function App() {
  const games = gamesData as CatalogGame[];
  const loading = false;

  const [visibleCount, setVisibleCount] = useState(24);

  const [favorites, setFavorites] = useState<string[]>([]);
  const [recent, setRecent] = useState<CatalogGame[]>([]);

  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  const [theaterMode, setTheaterMode] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const activeSearch = deferredSearch.trim();

  const [featuredGame, setFeaturedGame] = useState<CatalogGame | null>(null);

  const error = null;
  const loadingDetails = false;

  const selectedGame = useMemo(() => {
    return games.find((g) => g.id === selectedGameId) || null;
  }, [selectedGameId, games]);

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  const recentGames = useMemo(() => {
    return getRecentlyPlayed()
      .map((id) => games.find((g) => g.id === id))
      .filter(Boolean) as CatalogGame[];
  }, [games, recent]);

  useEffect(() => {
    if (!games.length) return;
    const random = games[randomInt(0, games.length - 1)];
    setFeaturedGame(random);
  }, [games]);

  const openGame = (id: string) => {
    const game = games.find((g) => g.id === id);
    if (!game) return;

    setSelectedGameId(id);

    saveRecentlyPlayed(id);
    setRecent(recentGames);
  };

  const filteredGames = useMemo(() => {
    return games.filter((g) =>
      g.title.toLowerCase().includes(deferredSearch.toLowerCase()),
    );
  }, [games, deferredSearch]);

  function clearFilters() {
    setSearch("");
  }

  return (
    <div className="app">
      <div className="bg" aria-hidden="true" />

      <header className="header">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <PixelRushIcon />
          </div>
          <div className="brand-text">
            <h1>PixelRush</h1>
            <p>Instant-play arcade, reimagined and most importantly NO ads.</p>
          </div>

          <div className="pill disclaimer-text">
            <p>
              Disclaimer: games may include ads but they do not come from this
              website. Use an adblocker
            </p>
          </div>
        </div>

        <div className="header-actions">
          <a className="pill" href="#games">
            Browse
          </a>
        </div>
      </header>

      <div className="controls">
        <div className="searchRow">
          <div className="search">
            <span className="searchIcon" aria-hidden="true">
              ⌕
            </span>
            <input
              ref={searchInputRef}
              placeholder="Search games…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              spellCheck={false}
              autoComplete="off"
            />
          </div>

          <div className="stats pill">{games.length} games</div>

          <button
            type="button"
            className="ghost"
            onClick={clearFilters}
            disabled={search.length === 0}
          >
            Clear
          </button>
        </div>
      </div>

      {featuredGame && !loading && (
        <section className="hero">
          <div
            className="hero-card"
            style={
              {
                ["--hero-bg" as never]: `url(${featuredGame.thumbnail})`,
              } as React.CSSProperties
            }
          >
            <div className="hero-copy">
              <div className="kicker">Randomly selected game</div>

              <div className="heroHead">
                <img
                  className="heroCover"
                  src={featuredGame.thumbnail}
                  alt=""
                />
                <h2 className="hero-title">{featuredGame.title}</h2>
              </div>

              <div className="hero-description">{featuredGame.description}</div>

              <button
                type="button"
                className="cta"
                onClick={() => openGame(featuredGame.id)}
              >
                Play now
              </button>
            </div>
          </div>
        </section>
      )}

      <div className="sectionDivider" />

      {getRecentlyPlayed().length >= 1 && (
        <section className="continueSection">
          <div className="sectionHeader">
            <h3>Continue</h3>
          </div>

          <div className="horizontalScroll">
            {getRecentlyPlayed()
              .map((id) => games.find((g) => g.id === id))
              .filter(Boolean)
              .map((game) => (
                <div
                  key={game!.id}
                  className="miniCard"
                  onClick={() => openGame(game!.id)}
                >
                  <img src={game!.thumbnail} />

                  <div
                    className="favStar"
                    onClick={(e) => {
                      e.stopPropagation();
                      const updated = toggleFavorite(game!.id);
                      setFavorites(updated);
                    }}
                  >
                    {favorites.includes(game!.id) ? "★" : "☆"}
                  </div>

                  <div className="miniTitle">{game!.title}</div>
                </div>
              ))}
          </div>
        </section>
      )}

      {getFavorites().length >= 1 && (
        <section className="favoriteSection">
          <div className="sectionHeader">
            <h3>Favorites</h3>
          </div>

          <div className="horizontalScroll">
            {games
              .filter((g) => favorites.includes(g.id))
              .map((game) => (
                <div
                  key={game!.id}
                  className="miniCard"
                  onClick={() => openGame(game!.id)}
                >
                  <img src={game!.thumbnail} />

                  <div
                    className="favStar"
                    onClick={(e) => {
                      e.stopPropagation();
                      const updated = toggleFavorite(game!.id);
                      setFavorites(updated);
                    }}
                  >
                    {favorites.includes(game!.id) ? "★" : "☆"}
                  </div>

                  <div className="miniTitle">{game!.title}</div>
                </div>
              ))}
          </div>
        </section>
      )}

      {(getRecentlyPlayed() || getFavorites()).length >= 1 && (<div className="sectionDivider" />)}

      <section className="grid" id="games">
        <div className="gridHeader">
          <h2>Games</h2>

          <div className="gridMeta">
            {!loading && filteredGames.length === 0 && (
              <span className="muted">No results. Try clearing filters.</span>
            )}

            {!error && activeSearch && filteredGames.length > 0 && (
              <span className="muted">Search: “{activeSearch}”</span>
            )}
          </div>
        </div>

        <div className="game-grid">
          {filteredGames.slice(0, visibleCount).map((game) => (
            <button
              key={game.id}
              type="button"
              className="game-card"
              onClick={() => openGame(game.id)}
            >
              <div className="thumb">
                <img src={game.thumbnail} />
              </div>

              <div
                className="favStar"
                onClick={(e) => {
                  e.stopPropagation();
                  const updated = toggleFavorite(game.id);
                  setFavorites(updated);
                }}
              >
                {favorites.includes(game.id) ? "★" : "☆"}
              </div>

              <div className="cardText">
                <div className="title">{game.title}</div>
              </div>
            </button>
          ))}
        </div>
        {visibleCount < filteredGames.length && (
          <div className="loadMoreWrap">
            <button
              className="loadMoreBtn"
              onClick={() => setVisibleCount((v) => v + 24)}
            >
              Load more
            </button>
          </div>
        )}
      </section>

      <div className="sectionDivider" />

      {selectedGame && (
        <div className="modal" onClick={() => setSelectedGameId(null)}>
          <div
            className={theaterMode ? "modal-content theater" : "modal-content"}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-top">
              <div className="modal-title">
                <div className="modal-name">{selectedGame.title}</div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="pillBtn"
                  onClick={() => setTheaterMode((v) => !v)}
                >
                  {theaterMode ? "Normal" : "Theater"}
                </button>

                <button
                  type="button"
                  className="iconBtn"
                  onClick={() => setSelectedGameId(null)}
                >
                  ×
                </button>
              </div>
            </div>

            <div className="player">
              {loadingDetails ? (
                <div className="playerLoading">
                  <div className="spinner" />
                  <div>Preparing the game…</div>
                </div>
              ) : (
                <iframe
                  src={selectedGame.embedUrl}
                  title={selectedGame.title}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-fullscreen"
                />
              )}
            </div>

            <div className="modal-desc">{selectedGame.description}</div>
          </div>
        </div>
      )}

      <div className="credits">
        <div className="credits-left">
          <div className="brand-mark" aria-hidden="true">
            <PixelRushIcon />
          </div>
          <span className="credits-name">PixelRush</span>
        </div>

        <div className="credits-center">
          <span>Games powered by</span>
          <a
            href="https://html5games.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            html5games.com
          </a>
        </div>

        <div className="credits-right">
          <span>Contact: </span>
          <span className="discord">constcrypt</span>
          <span> on Discord</span>
        </div>
      </div>
    </div>
  );
}

export default App;
