import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

const SOURCE_BASE = "https://html5games.com";

const PROXY_LIST = [
  "https://corsproxy.io/?",
  "https://api.allorigins.win/raw?url=",
  "https://cors.isomorphic-git.org/",
];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

async function fetchHtml(url: string) {
  for (const proxy of PROXY_LIST) {
    try {
      const res = await fetch(proxy + encodeURIComponent(url));
      const text = await res.text();

      if (
        text &&
        text.length > 1500 &&
        !text.includes("Access denied") &&
        !text.includes("<html><head></head><body></body></html>")
      ) {
        return text;
      }
    } catch {
      continue;
    }
  }

  throw new Error("All proxies failed");
}

function normalizeUrl(url: string, base: string) {
  if (!url) return "";
  if (url.startsWith("//")) return "https:" + url;
  if (url.startsWith("/")) return base + url;
  return url;
}

function extractGamesFromHtml(html: string, baseUrl: string) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const nodes = Array.from(doc.querySelectorAll("ul.games li a"));

  return nodes.map((el) => {
    const href = el.getAttribute("href") ?? "";
    const pageUrl = normalizeUrl(href, baseUrl);
    const img = el.querySelector("img");
    const nameEl = el.querySelector(".name");
    const title =
      nameEl?.textContent?.trim() || img?.getAttribute("alt") || "Unknown";
    const thumbnail = normalizeUrl(img?.getAttribute("src") ?? "", baseUrl);
    const id = href.split("/").filter(Boolean).pop() ?? pageUrl;
    const description =
    doc.querySelector("p[itemprop='description']")?.textContent?.trim() ||
    doc
      .querySelector("meta[property='og:description']")
      ?.getAttribute("content") ||
    "";
    //const tags = guessTags(title, href);

    return {
      id,
      title,
      thumbnail,
      pageUrl,
      description
      //tags,
    };
  });
}

/*function guessTags(title: string, href: string) {
  const t = (title + " " + href).toLowerCase();
  const tags: string[] = [];

  if (/puzzle|match|sudoku|mahjong|2048|logic/.test(t)) tags.push("puzzle");
  if (/racing|drift|car|bike|motor/.test(t)) tags.push("racing");
  if (/football|soccer|basket|nba|sports/.test(t)) tags.push("sports");
  if (/shoot|gun|sniper|zombie|war/.test(t)) tags.push("shooter");
  if (/platform|jump|runner|run/.test(t)) tags.push("platformer");
  if (/arcade|classic/.test(t)) tags.push("arcade");
  if (/strategy|tower|defense|td/.test(t)) tags.push("strategy");
  if (/io|multiplayer|online/.test(t)) tags.push("multiplayer");

  if (tags.length === 0) tags.push("arcade");

  return [...tags];
}
  */

type CatalogGame = {
  id: string;
  title: string;
  thumbnail: string;
  pageUrl: string;
  description: string
  //tags: string[];
};

type GameDetails = CatalogGame & {
  embedUrl: string;
  //sourceCategories: string[];
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
  const [games, setGames] = useState<CatalogGame[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<GameDetails | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [theaterMode, setTheaterMode] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const activeSearch = deferredSearch.trim();

  const [featuredGame, setFeaturedGame] = useState<GameDetails | null>(null);

  //const [tag, setTag] = useState("all");

  useEffect(() => {
    async function loadGames() {
      setLoading(true);
      setError(null);

      try {
        const html = await fetchHtml(`${SOURCE_BASE}/All-Games`);

        const parsed = extractGamesFromHtml(html, SOURCE_BASE);

        const dedup = new Map<string, CatalogGame>();
        for (const g of parsed) dedup.set(g.id, g);

        setGames(Array.from(dedup.values()));
      } catch (err) {
        console.error(err);
        setError("Failed to load games (proxy/CORS issue)");
        setGames([]);
      } finally {
        setLoading(false);
      }
    }

    loadGames();
  }, []);

  useEffect(() => {
    async function loadDetails(id: string) {
      setLoadingDetails(true);

      try {
        const game = games.find((g) => g.id === id);
        if (!game) return;

        const html = await fetchHtml(game.pageUrl);

        const doc = new DOMParser().parseFromString(html, "text/html");

        const embedHref =
          doc.querySelector("a.play-btn")?.getAttribute("href") ?? "";

        const embedUrl = normalizeUrl(embedHref, SOURCE_BASE);

        //const embedDoc = new DOMParser().parseFromString(html, "text/html");

        const description =
          doc.querySelector("p[itemprop='description']")?.textContent?.trim() ||
          doc
            .querySelector("meta[property='og:description']")
            ?.getAttribute("content") ||
          "";

          //const privacyNote = embedDoc.querySelector("privacy-info");
          //privacyNote?.remove();

        /*const sourceCategories = Array.from(
          doc.querySelectorAll("div.game-categories li a"),
        ).map((el) => el.textContent?.trim() || "");*/

        setSelectedGame({
          ...game,
          embedUrl,
          description,
          //sourceCategories,
          //tags: game.tags,
        });
      } catch (err) {
        console.error(err);
        setSelectedGame(null);
      } finally {
        setLoadingDetails(false);
      }
    }

    if (!selectedGameId) {
      setSelectedGame(null);
      return;
    }

    loadDetails(selectedGameId);
  }, [selectedGameId, games]);

  useEffect(() => {
    if (!games.length) return;
  
    const random = games[randomInt(0, games.length - 1)];
  
    async function loadFeatured() {
      try {
        const html = await fetchHtml(random.pageUrl);
        const doc = new DOMParser().parseFromString(html, "text/html");
  
        const embedHref =
          doc.querySelector("a.play-btn")?.getAttribute("href") ?? "";
  
        const embedUrl = normalizeUrl(embedHref, SOURCE_BASE);
  
        const description =
          doc.querySelector("p[itemprop='description']")?.textContent?.trim() ||
          doc
            .querySelector("meta[property='og:description']")
            ?.getAttribute("content") ||
          "";
  
        setFeaturedGame({
          ...random,
          embedUrl,
          description,
        });
      } catch (err) {
        console.error(err);
        setFeaturedGame(null);
      }
    }
  
    loadFeatured();
  }, [games]);

  const filteredGames = useMemo(() => {
    return games.filter((g) => {
      const matchesSearch = g.title
        .toLowerCase()
        .includes(deferredSearch.toLowerCase());

      //const matchesTag = tag === "all" || g.tags.includes(tag);

      return matchesSearch //&& matchesTag;
    });
  }, [games, deferredSearch, /*tag*/]);

  /*const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const g of games) for (const t of g.tags) set.add(t);
    return ["all", ...Array.from(set).sort()];
  }, [games]);*/

  //const bestTagLabel = tag.charAt(0).toUpperCase() + tag.slice(1);

  function clearFilters() {
    setSearch("");
    //setTag("all");
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
        </div>
        <div className="header-actions">
          <a className="pill" href="#games">
            Browse
          </a>
          <span
            className="pill hint"
            title="Shortcuts: / search • Ctrl/⌘K search • Esc close • F theater mode"
          >
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
            disabled={/*tag === "all" &&*/ search.length === 0}
            title="Clear filters"
          >
            Clear
          </button>
        </div>

        <div className="chips" role="tablist" aria-label="Tags">
          {/*allTags.map((t) => (
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
          ))*/}
        </div>
      </div>

      {featuredGame && !loading && (
        <section className="hero">
          <div
            className="hero-card reveal"
            data-reveal
            style={
              {
                ["--hero-bg" as never]: `url(${featuredGame.thumbnail})`,
              } as React.CSSProperties
            }
          >
            <div className="hero-copy">
              <div className="kicker">Randomly selected game {/*in {bestTagLabel}*/}</div>
              <div className="heroHead">
                <img
                  className="heroCover"
                  src={featuredGame.thumbnail}
                  alt=""
                  loading="eager"
                  decoding="async"
                />
                <h2 className="hero-title">{featuredGame.title}</h2>
              </div>
              <div className="tagRow">
                {/*bestGame.tags
                  .filter((t) => t !== "fun")
                  .slice(0, 4)
                  .map((t) => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))*/}
              </div>
              <div className="hero-description">
                  {featuredGame.description}
              </div>
              <button
                type="button"
                className="cta"
                onClick={() => setSelectedGameId(featuredGame.id)}
              >
                Play now
              </button>
            </div>
            <div className="hero-media" aria-hidden="true">
              <div className="heroPoster">
                <img
                  src={featuredGame.thumbnail}
                  alt=""
                  loading="eager"
                  decoding="async"
                />
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
                      {/*game.tags
                        .filter((t) => t !== "fun")
                        .slice(0, 2)
                        .map((t) => (
                          <span key={t}>{t}</span>
                        ))*/}
                    </div>
                  </div>
                </button>
              ))}
        </div>
      </section>

      {selectedGameId && selectedGame && (
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
                  {/*(selectedGame?.tags ?? []).slice(0, 6).map((t) => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))*/}
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
                  src={selectedGame.embedUrl}
                  title={selectedGame.title}
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
  );
}
export default App;
