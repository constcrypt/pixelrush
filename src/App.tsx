import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

type CatalogGame = {
  id: string;
  title: string;
  thumbnail: string;
  pageUrl: string;
  tags: string[];
};

type GameDetails = CatalogGame & {
  description: string;
  embedUrl: string;
  sourceCategories: string[];
};

function PixelRushIcon() {
  return (
    <svg
      className="pixelIcon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      shapeRendering="crispEdges"
    >
      <rect x="3" y="8" width="18" height="11" rx="3" fill="rgba(255,255,255,0.10)" />
      <rect x="6" y="11" width="2" height="6" fill="rgba(255,255,255,0.85)" />
      <rect x="4" y="13" width="6" height="2" fill="rgba(255,255,255,0.85)" />
      <rect x="15" y="12" width="2" height="2" fill="rgba(255,255,255,0.85)" />
      <rect x="18" y="13" width="2" height="2" fill="rgba(255,255,255,0.75)" />
      <rect x="13" y="14" width="2" height="2" fill="rgba(255,255,255,0.75)" />
      <rect x="10" y="6" width="4" height="2" fill="rgba(255,255,255,0.35)" />
    </svg>
  );
}

const API_BASE = "/.netlify/functions";

function App() {
  const [games, setGames] = useState<CatalogGame[]>([]);
  const [bestIds, setBestIds] = useState<string[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<GameDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theaterMode, setTheaterMode] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const [search, setSearch] = useState(() => {
    try {
      return localStorage.getItem("pr_search") ?? "";
    } catch {
      return "";
    }
  });
  const deferredSearch = useDeferredValue(search);
  const [tag, setTag] = useState(() => {
    try {
      const saved = localStorage.getItem("pr_tag") ?? "all";
      return saved === "fun" ? "all" : saved;
    } catch {
      return "all";
    }
  });

  useEffect(() => {
    async function loadGames() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_BASE}/games?limit=800`, {
          cache: "no-store",
        });
        const data: { games: CatalogGame[]; bestIds?: string[] } =
          await res.json();
        setGames(data.games ?? []);
        setBestIds(Array.isArray(data.bestIds) ? data.bestIds : []);
      } catch (err) {
        console.error("Failed to load games:", err);
        setError("Could not load games. Is the server running?");
      } finally {
        setLoading(false);
      }
    }

    loadGames();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("pr_search", search);
    } catch {
      // ignore
    }
  }, [search]);

  useEffect(() => {
    try {
      localStorage.setItem("pr_tag", tag);
    } catch {
      // ignore
    }
  }, [tag]);

  useEffect(() => {
    async function loadDetails(id: string) {
      setLoadingDetails(true);
      try {
        const res = await fetch(`${API_BASE}/game/${encodeURIComponent(id)}`, {
          cache: "no-store",
        });
        const data: GameDetails = await res.json();
        setSelectedGame(data);
      } catch (err) {
        console.error("Failed to load game details:", err);
        setSelectedGame(null);
      } finally {
        setLoadingDetails(false);
      }
    }

    if (!selectedGameId) {
      setSelectedGame(null);
      setTheaterMode(false);
      return;
    }

    loadDetails(selectedGameId);
  }, [selectedGameId]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const isModalOpen = Boolean(selectedGameId);

      if (e.key === "Escape" && isModalOpen) {
        e.preventDefault();
        setSelectedGameId(null);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      if (e.key === "/" && !isModalOpen) {
        const target = e.target as HTMLElement | null;
        const isTypingContext =
          target?.tagName === "INPUT" ||
          target?.tagName === "TEXTAREA" ||
          target?.getAttribute("contenteditable") === "true";
        if (!isTypingContext) {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
        return;
      }

      if ((e.key === "f" || e.key === "F") && isModalOpen) {
        e.preventDefault();
        setTheaterMode((v) => !v);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedGameId]);

  const filteredGames = useMemo(() => {
    return games.filter((g) => {
      const matchesSearch = g.title
        .toLowerCase()
        .includes(deferredSearch.trim().toLowerCase());
      const matchesTag = tag === "all" || g.tags.includes(tag);
      return matchesSearch && matchesTag;
    });
  }, [games, deferredSearch, tag]);

  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]")
    );

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          el.classList.add("is-visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: "40px 0px -10% 0px" }
    );

    for (const el of elements) observer.observe(el);

    return () => observer.disconnect();
  }, [loading, filteredGames.length]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const g of games) for (const t of g.tags) if (t !== "fun") set.add(t);
    return ["all", ...Array.from(set).sort()];
  }, [games]);

  const featured = filteredGames[0] ?? null;
  const activeSearch = deferredSearch.trim();

  function clearFilters() {
    setSearch("");
    setTag("all");
    searchInputRef.current?.focus();
  }

  const bestTag = useMemo(() => {
    if (tag !== "all" && tag !== "fun") return tag;
    const counts = new Map<string, number>();
    const ranked = bestIds.length > 0 ? bestIds : games.map((g) => g.id);

    for (const id of ranked.slice(0, 40)) {
      const game = games.find((g) => g.id === id);
      if (!game) continue;
      for (const t of game.tags) {
        if (t === "fun") continue;
        counts.set(t, (counts.get(t) ?? 0) + 1);
      }
    }

    let topTag = "puzzle";
    let topCount = -1;
    for (const [t, c] of counts) {
      if (c > topCount) {
        topTag = t;
        topCount = c;
      }
    }

    return topTag;
  }, [bestIds, games, tag]);

  const bestGame = useMemo(() => {
    const ranked = bestIds.length > 0 ? bestIds : games.map((g) => g.id);
    for (const id of ranked) {
      const g = games.find((x) => x.id === id);
      if (g && g.tags.includes(bestTag)) return g;
    }
    return featured;
  }, [bestIds, games, bestTag, featured]);

  const bestTagLabel = useMemo(() => {
    const t = bestTag.trim();
    if (!t) return "games";
    return t.charAt(0).toUpperCase() + t.slice(1);
  }, [bestTag]);

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
            <p>Instant-play arcade, reimagined.</p>
          </div>
        </div>
        <div className="header-actions">
          <a className="pill" href="#games">
            Browse
          </a>
          <span className="pill hint" title="Shortcuts: / search • Ctrl/⌘K search • Esc close • F theater mode">
            / Ctrl K Esc F
          </span>
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
          <div className="stats pill" title="Games loaded">
            {games.length} games
          </div>
          <button
            type="button"
            className="ghost"
            onClick={clearFilters}
            disabled={tag === "all" && search.length === 0}
            title="Clear filters"
          >
            Clear
          </button>
        </div>

        <div className="chips" role="tablist" aria-label="Tags">
          {allTags.map((t) => (
            <button
              key={t}
              type="button"
              className={tag === t ? "chip active" : "chip"}
              onClick={() => setTag(t)}
              role="tab"
              aria-selected={tag === t}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {bestGame && !loading && (
        <section className="hero">
          <div
            className="hero-card reveal"
            data-reveal
            style={
              {
                ["--hero-bg" as never]: `url(${bestGame.thumbnail})`,
              } as React.CSSProperties
            }
          >
            <div className="hero-copy">
              <div className="kicker">Best game in {bestTagLabel}</div>
              <div className="heroHead">
                <img
                  className="heroCover"
                  src={bestGame.thumbnail}
                  alt=""
                  loading="eager"
                  decoding="async"
                />
                <h2 className="hero-title">{bestGame.title}</h2>
              </div>
              <div className="tagRow">
                {bestGame.tags
                  .filter((t) => t !== "fun")
                  .slice(0, 4)
                  .map((t) => (
                  <span key={t} className="tag">
                    {t}
                  </span>
                ))}
              </div>
              <button
                type="button"
                className="cta"
                onClick={() => setSelectedGameId(bestGame.id)}
              >
                Play now
              </button>
            </div>
            <div className="hero-media" aria-hidden="true">
              <div className="heroPoster">
                <img src={bestGame.thumbnail} alt="" loading="eager" decoding="async" />
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="grid" id="games">
        <div className="gridHeader reveal" data-reveal>
          <h2>Games</h2>
          <div className="gridMeta">
            {!loading && !error && filteredGames.length === 0 ? (
              <span className="muted">No results. Try clearing filters.</span>
            ) : null}
            {error ? <span className="error">{error}</span> : null}
            {!error && activeSearch && filteredGames.length > 0 ? (
              <span className="muted">Search: “{activeSearch}”</span>
            ) : null}
          </div>
        </div>

        <div className="game-grid">
          {loading
            ? Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="game-card skeleton"
                  aria-hidden="true"
                />
              ))
            : filteredGames.map((game) => (
                <button
                  key={game.id}
                  type="button"
                  className="game-card reveal"
                  data-reveal
                  onClick={() => setSelectedGameId(game.id)}
                >
                  <div className="thumb">
                    <img
                      src={game.thumbnail}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="cardText">
                    <div className="title">{game.title}</div>
                    <div className="miniTags">
                      {game.tags
                        .filter((t) => t !== "fun")
                        .slice(0, 2)
                        .map((t) => (
                        <span key={t}>{t}</span>
                      ))}
                    </div>
                  </div>
                </button>
              ))}
        </div>
      </section>

      {selectedGameId && (
        <div className="modal" onClick={() => setSelectedGameId(null)}>
          <div
            className={theaterMode ? "modal-content theater" : "modal-content"}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-top">
              <div className="modal-title">
                <div className="modal-name">
                  {selectedGame?.title ?? "Loading…"}
                </div>
                <div className="modal-tags">
                  {(selectedGame?.tags ?? [])
                    .slice(0, 6)
                    .map((t) => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="pillBtn"
                  onClick={() => setTheaterMode((v) => !v)}
                  title="Theater mode (F)"
                >
                  {theaterMode ? "Normal" : "Theater"}
                </button>
                <button
                  type="button"
                  className="iconBtn"
                  onClick={() => setSelectedGameId(null)}
                  aria-label="Close (Esc)"
                  title="Close (Esc)"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="player">
              {loadingDetails ? (
                <div className="playerLoading">
                  <div className="spinner" aria-hidden="true" />
                  <div>Preparing the game…</div>
                </div>
              ) : !selectedGame?.embedUrl ? (
                <div className="playerLoading">
                  <div>Game unavailable right now.</div>
                </div>
              ) : (
                <iframe
                  title={selectedGame.title}
                  src={selectedGame.embedUrl}
                  allow="autoplay; fullscreen; gamepad"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-fullscreen"
                />
              )}
            </div>

            {selectedGame?.description ? (
              <div className="modal-desc">{selectedGame.description}</div>
            ) : null}
          </div>
        </div>
      )}
      <div className="credits reveal" data-reveal>
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
          <span>Contact:</span>
          <span className="discord">constcrypt</span>
          <span> on Discord</span>
        </div>
      </div>
    </div>
  )
}
export default App;