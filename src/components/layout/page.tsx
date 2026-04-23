import { forwardRef, type ReactNode } from "react";
import { Footer } from "./footer";
import { Header } from "./header";

interface PageProps {
  children: ReactNode;
  showFooter?: boolean;
}

export const Page = forwardRef<HTMLDivElement, PageProps>(
  function Page(
    {
      children,
      showFooter = true,
    },
    ref
  ) {
    return (
      <div ref={ref} className="app">
        <Header />

        <main>{children}</main>

        {showFooter && <Footer />}
      </div>
    );
  }
);