import { forwardRef } from "react";

interface ControlsProps {
  search: string;
  setSearch: (value: string) => void;
  clear: () => void;
  total: number;
}

export const Controls = forwardRef<HTMLDivElement, ControlsProps>(
  function Controls({ search, setSearch, clear, total }, ref) {
    return (
      <div ref={ref} className="controls">
        <div className="searchRow">
          <div className="search">
            <span className="searchIcon">⌕</span>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search games…"
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