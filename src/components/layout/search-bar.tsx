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
      <div ref={ref} className="w-full max-w-[1180px] mx-auto">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex items-center gap-2 flex-1 px-4 py-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl">
            <span className="text-white/60">⌕</span>

            <input
              className="
                w-full bg-transparent outline-none text-white placeholder:text-white/40
                focus:outline-none focus:ring-0 focus:border-transparent
              "
              placeholder="Search games…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-white/70 text-sm whitespace-nowrap">
            {total} games
          </div>

          <button
            onClick={clear}
            disabled={!search}
            className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Clear
          </button>
        </div>
      </div>
    );
  }
);