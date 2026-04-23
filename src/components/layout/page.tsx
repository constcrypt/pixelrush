import { forwardRef, type ReactNode } from "react";
import { Footer } from "./footer";
import { Header } from "./header";

interface PageProps {
  children: ReactNode;
  showFooter?: boolean;
}

export const Page = forwardRef<HTMLDivElement, PageProps>(
  function Page({ children, showFooter = true }, ref) {
    return (
      <div
        ref={ref}
        className="min-h-screen text-white bg-[#070910] px-4 pb-10"
      >
        <Header />

        <main className="max-w-[1180px] mx-auto">{children}</main>

        {showFooter && <Footer />}
      </div>
    );
  }
);