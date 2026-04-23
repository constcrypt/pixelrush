import { forwardRef, type ReactNode } from "react";
import { PixelRushIcon } from "./icon";

interface HeaderProps {
  children?: ReactNode;
}

export const Header = forwardRef<HTMLElement, HeaderProps>(
  function Header({ children }, ref) {
    return (
      <header ref={ref} className="header">
        <div className="brand">
          <PixelRushIcon />

          <div className="brand-text">
            <h1>PixelRush</h1>
            <p>Instant-play arcade, no ads.</p>
          </div>

          <div className="pill disclaimer-text">
            <p>Disclaimer: games may include ads not from this site.</p>
          </div>
        </div>

        <div className="header-actions">
          <a className="pill" href="#games">
            Browse
          </a>
        </div>

        {children}
      </header>
    );
  }
);