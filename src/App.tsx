import {
  useCallback,
  useDeferredValue,
  useMemo,
  useState,
} from "react";
import gamesData from "../data/games.json";
import "./App.css";
import { Hero } from "./components/game/hero";
import { SearchBar } from "./components/layout/search-bar";
import { ContinueSection } from "./components/sections/continue-section";
import { FavoriteSection } from "./components/sections/favorite-section";
import { type CatalogGame, randomInt, VISIBLE_GAMES_COUNT } from "./constants";
import { useFavorites } from "./hooks/use-favorites";
import { useRecent } from "./hooks/use-recent";
import { Page } from "./components/layout/page";
import { GameModal } from "./components/game/game-modal";
import { GameGrid } from "./components/game/game-grid";
import { Divider } from "./components/decorations/divider";

function App() {
  const games = gamesData as CatalogGame[];

  const [visibleCount, setVisibleCount] = useState(12);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [theaterMode, setTheaterMode] = useState(false);

  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

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
    const q = deferredSearch.trim().toLowerCase();
    if (!q) return games;

    return games.filter((g) =>
      g.title.toLowerCase().includes(q)
    );
  }, [games, deferredSearch]);

  const visibleGames = useMemo(() => {
    return filteredGames.slice(0, visibleCount);
  }, [filteredGames, visibleCount]);

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

        {randomGame && <Hero game={randomGame} onPlay={openGame} />}

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

        <Divider />

        <section className="grid" id="games">
          <div className="gridHeader">
            <h2>Games</h2>

            <div className="gridMeta">
              {filteredGames.length === 0 && (
                <span className="muted">No results</span>
              )}
            </div>
          </div>

          <GameGrid
            games={visibleGames}
            favorites={favSet}
            onOpen={openGame}
            onFav={toggleFavorite}
          />

          {visibleCount < filteredGames.length && (
            <div className="flex justify-center py-6">
              <button
                onClick={() => setVisibleCount((v) => v + VISIBLE_GAMES_COUNT)}
                className="
                  px-6 py-2 rounded-full
                  border border-white/10
                  bg-white/5 text-white/80
                  hover:bg-white/10 hover:border-white/20
                  transition
                  active:scale-95
                "
              >
                Load more
              </button>
            </div>
          )}
        </section>

        <Divider compact/>

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
  );
}

export default App;