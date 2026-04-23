export function PixelRushIcon() {
    return (
      <div
        className="
          relative w-11 h-11 rounded-[14px]
          grid place-items-center overflow-hidden
          bg-linear-to-br from-cyan-400 to-violet-600
          shadow-[0_18px_60px_rgba(124,58,237,0.25),0_12px_40px_rgba(34,211,238,0.16)]
        "
      >
        <div
          className="
            absolute inset-[-40%]
            rotate-25
            animate-[shine_5.5s_linear_infinite]
            bg-linear-to-r from-transparent via-white/10 to-transparent
          "
        />
  
        <svg
          className="w-10 h-10 drop-shadow-[0_12px_22px_rgba(0,0,0,0.35)]"
          viewBox="0 0 24 24"
          shapeRendering="crispEdges"
          aria-hidden="true"
        >
          <rect
            x="3"
            y="8"
            width="18"
            height="11"
            rx="3"
            fill="rgba(255,255,255,0.10)"
          />
          <rect x="6" y="11" width="2" height="6" fill="rgba(255,255,255,0.85)" />
          <rect x="4" y="13" width="6" height="2" fill="rgba(255,255,255,0.85)" />
          <rect x="15" y="12" width="2" height="2" fill="rgba(255,255,255,0.85)" />
          <rect x="18" y="13" width="2" height="2" fill="rgba(255,255,255,0.75)" />
          <rect x="13" y="14" width="2" height="2" fill="rgba(255,255,255,0.75)" />
          <rect x="10" y="6" width="4" height="2" fill="rgba(255,255,255,0.35)" />
        </svg>
      </div>
    );
  }