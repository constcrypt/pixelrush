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
      <footer ref={ref} className="footer">
        <div className="footer-left">
            <PixelRushIcon />
          <span className="footer-name">{brandName}</span>
        </div>

        <div className="footer-center">
          <span>{poweredByText}</span>
          <a href={poweredByUrl} target="_blank" rel="noopener noreferrer">
            html5games.com
          </a>
        </div>

        <div className="footer-right">
          <span>{contactLabel} </span>
          <span className="discord">{contactName}</span>
          <span> {contactSuffix}</span>
        </div>
      </footer>
    );
  }
);