export type CatalogGame = {
    id: string;
    title: string;
    thumbnail: string;
    pageUrl: string;
    description: string;
    embedUrl: string;
};


export function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export const SOURCE_URL = "https://html5games.com/"
export const MAX_RECENTLY_PLAYED = 10;
export const VISIBLE_GAMES = 12