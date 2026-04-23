export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
      extend: {
        colors: {
          pr: {
            text: "rgba(255,255,255,0.82)",
            muted: "rgba(255,255,255,0.55)",
            strong: "rgba(255,255,255,0.92)",
          },
        },
      },
    },
    plugins: [],
};