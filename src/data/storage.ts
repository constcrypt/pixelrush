const FAV_KEY = "favorites";
const RECENT_KEY = "recentlyPlayed";
const MAX_RECENTLY_PLAYED = 10;

export function getFavorites(): string[] {
  return JSON.parse(localStorage.getItem(FAV_KEY) || "[]");
}

export function toggleFavorite(id: string): string[] {
  const favs = getFavorites();
  const exists = favs.includes(id);

  const updated = exists
    ? favs.filter((f) => f !== id)
    : [...favs, id];

  localStorage.setItem(FAV_KEY, JSON.stringify(updated));
  return updated;
}

export function getRecentlyPlayed(): string[] {
  return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
}

export function saveRecentlyPlayed(id: string) {
  let recent = getRecentlyPlayed();

  recent = recent.filter((r) => r !== id);
  recent.unshift(id);

  if (recent.length > MAX_RECENTLY_PLAYED) {
    recent = recent.slice(0, MAX_RECENTLY_PLAYED);
  }

  localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
  return recent;
}