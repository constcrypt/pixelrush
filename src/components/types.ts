export interface GameActionHandlers {
  onOpen: (id: string) => void;
  onFav: (id: string) => void;
}

export interface FavoritesState {
  favorites: Set<string>;
}