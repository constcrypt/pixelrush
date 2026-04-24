export function PixelRushIcon() {
    return (
      <div
        className="
          relative w-11 h-11 rounded-[14px]
          grid place-items-center overflow-hidden
          bg-linear-to-br from-cyan-900 to-violet-600
          shadow-[0_18px_60px_rgba(124,58,237,0.25),0_12px_40px_rgba(34,211,238,0.16)]
        "
      >
        <div
          className="
            absolute inset-0
            rotate-12
            bg-linear-to-r from-transparent via-white/50 to-transparent
            opacity-40
          "
        />
        <img
            className="w-9 opacity-70"
            src="https://cdn-eu.icons8.com/_D94B3d6oU60HPskAsJf4w/2ukOlzAqqka3C7_iBxd4pA/group_20_objects.svg"
        />
      </div>
    );
  }