import {
  useCallback,
  useDeferredValue,
  useMemo,
  useState,
} from "react";
import gamesData from "../data/games.json";
import "./App.css";
import { GameCard } from "./components/game/game-card";
import { Hero } from "./components/game/hero";
import { SearchBar } from "./components/layout/search-bar";
import { ContinueSection } from "./components/sections/continue-section";
import { FavoriteSection } from "./components/sections/favorite-section";
import { type CatalogGame, randomInt } from "./constants";
import { useFavorites } from "./hooks/use-favorites";
import { useRecent } from "./hooks/use-recent";
import { Page } from "./components/layout/page";
import { GameModal } from "./components/game/game-modal";

function App() {
  const games = gamesData as CatalogGame[];

  const [visibleCount, setVisibleCount] = useState(12);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [theaterMode, setTheaterMode] = useState(false);

  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const activeSearch = deferredSearch.trim();

  const { favorites, toggleFavorite } = useFavorites();
  const { recent, addRecent } = useRecent();

  const favSet = useMemo(() => new Set(favorites), [favorites]);

  const randomGame = useMemo(
    () => games[randomInt(0, games.length - 1)],
    [games]
  );

  const openGame = useCallback(
    (id: string) => {
      const game = games.find((g) => g.id === id);
      if (!game) return;

      setSelectedGameId(id);
      addRecent(id);
    },
    [games, addRecent]
  );

  const selectedGame = useMemo(() => {
    return games.find((g) => g.id === selectedGameId) || null;
  }, [selectedGameId, games]);

  const filteredGames = useMemo(() => {
    return games.filter((g) =>
      g.title.toLowerCase().includes(deferredSearch.toLowerCase())
    );
  }, [games, deferredSearch]);

  const clearFilters = () => setSearch("");

  const continueGames = useMemo(() => {
    return recent
      .map((id) => games.find((g) => g.id === id))
      .filter(Boolean) as CatalogGame[];
  }, [recent, games]);

  const favoriteGames = useMemo(() => {
    return games.filter((g) => favSet.has(g.id));
  }, [games, favSet]);

  return (
    <div className="app">
      <div className="bg" aria-hidden="true" />
        <Page showFooter>

          <SearchBar
            search={search}
            setSearch={setSearch}
            clear={clearFilters}
            total={games.length}
          />

          {randomGame && (
            <Hero game={randomGame} onPlay={openGame} />
          )}

          <div className="sectionDivider" />

          <ContinueSection
            games={continueGames}
            favorites={favSet}
            onOpen={openGame}
            onFav={toggleFavorite}
          />

          <FavoriteSection
            games={favoriteGames}
            favorites={favSet}
            onOpen={openGame}
            onFav={toggleFavorite}
          />

          <div className="sectionDivider" />

          <section className="grid" id="games">
            <div className="gridHeader">
              <h2>Games</h2>

              <div className="gridMeta">
                {filteredGames.length === 0 && (
                  <span className="muted">No results. Try clearing filters.</span>
                )}

                {activeSearch && filteredGames.length > 0 && (
                  <span className="muted">Search: “{activeSearch}”</span>
                )}
              </div>
            </div>

            <div className="game-grid">
              {filteredGames.slice(0, visibleCount).map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  isFav={favSet.has(game.id)}
                  onOpen={openGame}
                  onFav={toggleFavorite}
                />
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

          {selectedGame && (
            <GameModal
              game={selectedGame}
              theater={theaterMode}
              onClose={() => setSelectedGameId(null)}
              toggleTheater={() => setTheaterMode((v) => !v)}
            />
          )}
        </Page>
      </div>
  )
}

export default App;