import axios from "axios";
import * as cheerio from "cheerio";

const SOURCE_BASE = "https://html5games.com";

export type CatalogGame = {
  id: string;
  title: string;
  thumbnail: string;
  pageUrl: string;
  tags: string[];
};

export type GameDetails = CatalogGame & {
  description: string;
  embedUrl: string;
  sourceCategories: string[];
};

const CATALOG_TTL_MS = 15 * 60 * 1000;
const DETAILS_TTL_MS = 24 * 60 * 60 * 1000;

let catalogCache: { value: any; expiresAt: number } | null = null;
let catalogInFlight: Promise<any> | null = null;

const detailsCache = new Map<string, { value: GameDetails; expiresAt: number }>();
const detailsInFlight = new Map<string, Promise<GameDetails>>();

const now = () => Date.now();

function normalizeUrl(url: string, base = SOURCE_BASE) {
  if (!url) return "";
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("/")) return `${base}${url}`;
  return url;
}

function guessTags(text: string) {
  const t = text.toLowerCase();
  const tags: string[] = [];

  if (/puzzle|match|sudoku|mahjong/.test(t)) tags.push("puzzle");
  if (/racing|drift|car/.test(t)) tags.push("racing");
  if (/football|soccer|basket/.test(t)) tags.push("sports");
  if (/shoot|gun|sniper/.test(t)) tags.push("shooter");

  return tags;
}

async function fetchHtml(url: string) {
  const res = await axios.get(url, {
    headers: { "User-Agent": "NetlifyFunctionBot" },
    timeout: 15000,
  });
  return res.data;
}

export async function getCatalog() {
  if (catalogCache && catalogCache.expiresAt > now()) {
    return catalogCache.value;
  }

  if (catalogInFlight) return catalogInFlight;

  catalogInFlight = (async () => {
    const html = await fetchHtml(`${SOURCE_BASE}/All-Games`);
    const $ = cheerio.load(html);

    const games: CatalogGame[] = $("ul.games li a")
      .toArray()
      .map((el) => {
        const href = $(el).attr("href") || "";
        const title = $(el).find(".name").text().trim();
        const img = $(el).find("img").attr("src") || "";

        const id = href.split("/").filter(Boolean).pop() || href;

        return {
          id,
          title,
          thumbnail: img,
          pageUrl: normalizeUrl(href),
          tags: guessTags(title),
        };
      });

    const value = { games, fetchedAt: now() };

    catalogCache = {
      value,
      expiresAt: now() + CATALOG_TTL_MS,
    };

    return value;
  })();

  return catalogInFlight;
}

export async function getGameDetails(id: string): Promise<GameDetails> {
  const cached = detailsCache.get(id);
  if (cached && cached.expiresAt > now()) return cached.value;

  if (detailsInFlight.has(id)) return detailsInFlight.get(id)!;

  const p = (async () => {
    const catalog = await getCatalog();
    const base = catalog.games.find((g: any) => g.id === id);
    if (!base) throw new Error("not found");

    const html = await fetchHtml(base.pageUrl);
    const $ = cheerio.load(html);

    const embedUrl = normalizeUrl($("a.play-btn").attr("href") || "");
    const description =
        $(".game-description p[itemprop='description']").text().trim() ||
        $(".game-description p").first().text().trim() ||
        "";

    const details: GameDetails = {
      ...base,
      description,
      embedUrl,
      sourceCategories: [],
    };

    detailsCache.set(id, {
      value: details,
      expiresAt: now() + DETAILS_TTL_MS,
    });

    return details;
  })();

  detailsInFlight.set(id, p);
  return p;
}