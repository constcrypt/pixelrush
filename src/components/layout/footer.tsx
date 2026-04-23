import { forwardRef } from "react";
import { PixelRushIcon } from "./icon";
import { SOURCE_URL } from "../../constants";

interface FooterProps {
  poweredByText?: string;
  poweredByUrl?: string;
  contactLabel?: string;
  contactName?: string;
  contactSuffix?: string;
  brandName?: string;
}

export const Footer = forwardRef<HTMLElement, FooterProps>(
  function Footer(
    {
      poweredByText = "Games powered by",
      poweredByUrl = SOURCE_URL,
      contactLabel = "Contact:",
      contactName = "constcrypt",
      contactSuffix = "on Discord",
      brandName = "PixelRush",
    },
    ref
  ) {
    return (
      <footer
        ref={ref}
        className="max-w-[1180px] mx-auto mt-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/60"
      >
        <div className="flex items-center gap-2 text-white/80">
          <PixelRushIcon />
          <span className="font-medium">{brandName}</span>
        </div>

        <div className="flex items-center gap-2">
          <span>{poweredByText}</span>
          <a
            href={poweredByUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-300 hover:underline"
          >
            html5games.com
          </a>
        </div>

        <div className="flex items-center gap-2">
          <span>{contactLabel}</span>
          <span className="text-violet-300">{contactName}</span>
          <span>{contactSuffix}</span>
        </div>
      </footer>
    );
  }
);