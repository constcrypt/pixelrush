import { forwardRef } from "react";

interface Props {
  search: string;
  setSearch: (v: string) => void;
  clear: () => void;
  total: number;
}

export const SearchBar = forwardRef<HTMLDivElement, Props>(
  function SearchBar({ search, setSearch, clear, total }, ref) {
    return (
      <div ref={ref} className="controls">
        <div className="searchRow">
          <div className="search">
            <span className="searchIcon">⌕</span>

            <input
              placeholder="Search games…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="stats pill">{total} games</div>

          <button className="ghost" onClick={clear} disabled={!search}>
            Clear
          </button>
        </div>
      </div>
    );
  }
);