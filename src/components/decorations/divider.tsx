export function Divider({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`w-full bg-white/10 ${
        compact ? "h-px my-2" : "h-px my-6"
      }`}
    />
  );
}