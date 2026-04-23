import { forwardRef, type ReactNode } from "react";
import { PixelRushIcon } from "./icon";

interface HeaderProps {
  children?: ReactNode;
}

export const Header = forwardRef<HTMLElement, HeaderProps>(
  function Header({ children }, ref) {
    return (
      <header
        ref={ref}
        className="
          max-w-[1180px] mx-auto
          flex flex-col md:flex-row
          md:items-center justify-between
          gap-4 py-4
        "
      >
        <div className="flex items-center gap-3">
          <PixelRushIcon />

          <div>
            <h1 className="text-xl font-bold text-white">PixelRush</h1>
            <p className="text-sm text-white/60">
              Instant-play arcade, no ads.
            </p>
          </div>
        </div>

        <div
          className="
            flex items-center gap-2
            flex-wrap md:flex-nowrap
            w-full md:w-auto
            justify-start md:justify-end
          "
        >
          <div
            className="
              px-3 py-2
              rounded-full
              border border-white/10
              bg-white/5
              text-xs text-white/60
              whitespace-nowrap
              shrink-0
            "
          >
            Disclaimer: games may include ads not from this site.
          </div>

          <a
            href="#games"
            className="
              px-4 py-2
              rounded-full
              border border-white/10
              bg-white/5
              text-white/80
              hover:bg-white/10
              transition
              whitespace-nowrap
              shrink-0
            "
          >
            Browse
          </a>
        </div>

        {children}
      </header>
    );
  }
);