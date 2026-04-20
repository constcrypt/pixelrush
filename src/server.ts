import axios from "axios";
import * as cheerio from "cheerio";
import cors from "cors";
import express from "express";

const app = express();
app.disable("x-powered-by");
app.use(cors());

const SOURCE_BASE = "https://html5games.com";
const CATALOG_TTL_MS = 15 * 60 * 1000;
const DETAILS_TTL_MS = 24 * 60 * 60 * 1000;


const ALLOWED_EMBED_HOSTS = new Set(["play.famobi.com"]);

const VOLUME_SHIM_JS = `(() => {
  let volume = 0;
  const clamp = (v) => Math.max(0, Math.min(1, Number(v) || 0));
  const masterGains = new Set();
  const masterGainByContext = new WeakMap();
  const MASTER_FLAG = "__prMasterGain";

  const origConnect = AudioNode.prototype.connect;

  function ensureMasterGain(ctx) {
    let gain = masterGainByContext.get(ctx);
    if (gain) return gain;

    gain = ctx.createGain();
    try {
      gain[MASTER_FLAG] = true;
    } catch {
      // ignore
    }
    gain.gain.value = volume;
    origConnect.call(gain, ctx.destination, 0, 0);

    masterGainByContext.set(ctx, gain);
    masterGains.add(gain);
    return gain;
  }

  AudioNode.prototype.connect = function (...args) {
    try {
      const destination = args[0];
      if (destination && destination instanceof AudioNode) {
        const ctx = this.context;
        if (this && this[MASTER_FLAG] && destination === ctx.destination) {
          return origConnect.apply(this, args);
        }
        if (destination === ctx.destination) {
          const output = Number(args[1] ?? 0);
          const mg = ensureMasterGain(ctx);
          return origConnect.call(this, mg, output, 0);
        }
      }
    } catch {
      // fall through
    }

    return origConnect.apply(this, args);
  };

  function applyMediaVolume() {
    const media = document.querySelectorAll("audio,video");
    for (const el of media) {
      try {
        el.muted = volume === 0;
        el.volume = volume;
      } catch {
        // ignore
      }
    }
  }

  function setVolume(next) {
    volume = clamp(next);
    for (const g of masterGains) {
      try {
        g.gain.value = volume;
      } catch {
        // ignore
      }
    }
    applyMediaVolume();
  }

  window.addEventListener("message", (event) => {
    const data = event && event.data;
    if (!data || data.type !== "PR_SET_VOLUME") return;
    setVolume(data.volume);
  });

  try {
    const mo = new MutationObserver(() => applyMediaVolume());
    mo.observe(document.documentElement, { subtree: true, childList: true });
  } catch {
    // ignore
  }

  setVolume(0);
})();`;

function isAllowedEmbedUrl(url: URL) {
  if (url.protocol !== "https:") return false;
  return ALLOWED_EMBED_HOSTS.has(url.host);
}

function rewriteEmbedHtml(html: string, baseUrl: string) {
  const $ = cheerio.load(html, {  });

  $("meta[http-equiv]").each((_, el) => {
    const v = String($(el).attr("http-equiv") ?? "").toLowerCase();
    if (v === "content-security-policy") $(el).remove();
  });

  const attrs = ["src", "href", "data-src", "data-href"] as const;
  for (const attr of attrs) {
    $("[" + attr + "]").each((_, el) => {
      const raw = String($(el).attr(attr) ?? "").trim();
      if (!raw) return;
      if (
        raw.startsWith("data:") ||
        raw.startsWith("mailto:") ||
        raw.startsWith("javascript:") ||
        raw.startsWith("#")
      )
        return;

      try {
        const abs = new URL(raw, baseUrl).toString();
        $(el).attr(attr, abs);
      } catch {
        // ignore
      }
    });
  }

  const head = $("head");
  if (head.length) {
    head.prepend(`<script>${VOLUME_SHIM_JS}</script>`);
  } else {
    $("html").prepend(`<head><script>${VOLUME_SHIM_JS}</script></head>`);
  }

  return "<!doctype html>" + $.html()
}

type CatalogGame = {
  id: string;
  title: string;
  thumbnail: string;
  pageUrl: string;
  tags: string[];
};

type GameDetails = CatalogGame & {
  description: string;
  embedUrl: string;
  sourceCategories: string[];
};

type CacheEntry<T> = { value: T; expiresAt: number };

let catalogCache:
  | CacheEntry<{ games: CatalogGame[]; fetchedAt: number; bestIds: string[] }>
  | null =
  null;
let catalogInFlight:
  | Promise<{ games: CatalogGame[]; fetchedAt: number; bestIds: string[] }>
  | null =
  null;

const detailsCache = new Map<string, CacheEntry<GameDetails>>();
const detailsInFlight = new Map<string, Promise<GameDetails>>();

function nowMs() {
  return Date.now();
}

function normalizeUrl(url: string, baseUrl: string) {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (trimmed.startsWith("/")) return `${baseUrl}${trimmed}`;
  return trimmed;
}

function uniqLower(list: string[]) {
  const set = new Set<string>();
  for (const item of list) {
    const t = item.trim().toLowerCase();
    if (t) set.add(t);
  }
  set.delete("fun");
  return Array.from(set);
}

function guessTagsFromText(text: string) {
  const t = text.toLowerCase();
  const tags = new Set<string>();

  if (/\b(puzzle|sort|match|2048|mahjong|sudoku|jigsaw|onet)\b/.test(t))
    tags.add("puzzle");
  if (/\b(race|racing|drift|driver|parking)\b/.test(t)) tags.add("racing");
  if (/\b(soccer|football|basket|golf|tennis|penalty|ski)\b/.test(t))
    tags.add("sports");
  if (/\b(shoot|sniper|gun|attack|war)\b/.test(t)) tags.add("shooter");
  if (/\b(fight|fighting|boxing|karate|battle|duel)\b/.test(t))
    tags.add("fighting");
  if (/\b(multiplayer|vs)\b/.test(t)) tags.add("multiplayer");
  if (/\b(card|solitaire|klondike)\b/.test(t)) tags.add("cards");
  if (/\b(quiz|trivia)\b/.test(t)) tags.add("quiz");

  return Array.from(tags);
}

function mapSourceCategoryToTags(sourceCategories: string[]) {
  const tags = new Set<string>();

  for (const raw of sourceCategories) {
    const c = raw.trim().toLowerCase();
    if (!c) continue;

    if (c === "puzzle" || c === "match 3" || c === "bubble shooter")
      tags.add("puzzle");
    else if (c === "arcade") tags.add("arcade");
    else if (c === "racing") tags.add("racing");
    else if (c === "sport") tags.add("sports");
    else if (c === "multiplayer") tags.add("multiplayer");
    else if (c === "cards") tags.add("cards");
    else if (c === "quiz") tags.add("quiz");
    else if (c === "girls") tags.add("casual");
    else if (c === "jump & run") tags.add("platformer");
  }

  return Array.from(tags);
}

async function fetchHtml(url: string) {
  const res = await axios.get(url, {
    headers: {
      "User-Agent": "PixelRush/1.0 (+https://localhost)",
      "Accept-Language": "en-US,en;q=0.8",
    },
    timeout: 15_000,
  });
  return String(res.data);
}

async function getCatalog() {
  const cached = catalogCache;
  if (cached && cached.expiresAt > nowMs()) return cached.value;

  if (catalogInFlight) return catalogInFlight;

  catalogInFlight = (async () => {
    const html = await fetchHtml(`${SOURCE_BASE}/All-Games`);
    const $ = cheerio.load(html);

    const baseGames: CatalogGame[] = $("ul.games li a")
      .toArray()
      .map((el) => {
        const href = $(el).attr("href") ?? "";
        const pageUrl = normalizeUrl(href, SOURCE_BASE);
        const title =
          $(el).find(".name").text().trim() ||
          $(el).find("img").attr("alt")?.trim() ||
          "Unknown";
        const thumbnail = $(el).find("img").attr("src") ?? "";

        const parts = href.split("/").filter(Boolean);
        const id = parts[parts.length - 1] || pageUrl;

        return {
          id,
          title,
          thumbnail,
          pageUrl,
          tags: guessTagsFromText(title),
        };
      })
      .filter((g) => Boolean(g.pageUrl) && Boolean(g.id));

    const categoryLinksRaw = $("nav.main a")
      .toArray()
      .map((el) => ({
        name: $(el).text().replace(/\s+/g, " ").trim(),
        href: $(el).attr("href") ?? "",
      }))
      .filter(
        (x) =>
          Boolean(x.name) &&
          /^\/(Match-3|Bubble-Shooter|Puzzle|Quiz|Cards|Girls|Jump-Run|Arcade|Racing|Sport|Multiplayer)\b/.test(
            x.href
          )
      );

    const categoryLinks = Array.from(
      new Map(categoryLinksRaw.map((x) => [x.href, x])).values()
    );

    const categoryTagByGameId = new Map<string, string[]>();

    await Promise.all(
      categoryLinks.map(async ({ name, href }) => {
        const categoryUrl = normalizeUrl(href, SOURCE_BASE);
        if (!categoryUrl) return;

        try {
          const catHtml = await fetchHtml(categoryUrl);
          const $$ = cheerio.load(catHtml);
          const catTags = mapSourceCategoryToTags([name]);

          $$("ul.games li a")
            .toArray()
            .forEach((a) => {
              const gameHref = $$(a).attr("href") ?? "";
              const parts = gameHref.split("/").filter(Boolean);
              const id = parts[parts.length - 1];
              if (!id) return;
              const existing = categoryTagByGameId.get(id) ?? [];
              categoryTagByGameId.set(id, uniqLower([...existing, ...catTags]));
            });
        } catch {
          // ignore
        }
      })
    );

    const games: CatalogGame[] = baseGames.map((g) => {
      const categoryTags = categoryTagByGameId.get(g.id) ?? [];
      return {
        ...g,
        tags: uniqLower([...g.tags, ...categoryTags]),
      };
    });

    let bestIds: string[] = [];
    try {
      const bestHtml = await fetchHtml(
        `${SOURCE_BASE}/Best/702b9531-c136-437a-ab97-0b209d893b55`
      );
      const $$ = cheerio.load(bestHtml);
      bestIds = $$("ul.games li a")
        .toArray()
        .map((a) => {
          const href = $$(a).attr("href") ?? "";
          const parts = href.split("/").filter(Boolean);
          return parts[parts.length - 1] ?? "";
        })
        .filter(Boolean);
    } catch {
      bestIds = [];
    }

    const fetchedAt = nowMs();
    const value = { games, fetchedAt, bestIds };
    catalogCache = { value, expiresAt: fetchedAt + CATALOG_TTL_MS };
    return value;
  })().finally(() => {
    catalogInFlight = null;
  });

  return catalogInFlight;
}

async function getGameDetailsById(id: string) {
  const cached = detailsCache.get(id);
  if (cached && cached.expiresAt > nowMs()) return cached.value;

  const inflight = detailsInFlight.get(id);
  if (inflight) return inflight;

  const promise = (async () => {
    const catalog = await getCatalog();
    const base = catalog.games.find((g) => g.id === id);
    if (!base) {
      const err = new Error("Game not found in catalog");
      (err as Error & { status?: number }).status = 404;
      throw err;
    }

    const html = await fetchHtml(base.pageUrl);
    const $ = cheerio.load(html);

    const rawEmbedHref = $("a.play-btn").attr("href") ?? "";
    const embedUrl = normalizeUrl(rawEmbedHref, SOURCE_BASE);

    const description =
      $("p[itemprop='description']").text().trim() ||
      $("meta[property='og:description']").attr("content")?.trim() ||
      "";

    const sourceCategories = $("div.game-categories li a")
      .toArray()
      .map((el) => $(el).text().replace(/\s+/g, " ").trim())
      .filter(Boolean);

    const tags = uniqLower([
      ...mapSourceCategoryToTags(sourceCategories),
      ...guessTagsFromText(base.title),
    ]);

    const details: GameDetails = {
      ...base,
      tags,
      description,
      embedUrl,
      sourceCategories,
    };

    detailsCache.set(id, { value: details, expiresAt: nowMs() + DETAILS_TTL_MS });
    return details;
  })().finally(() => {
    detailsInFlight.delete(id);
  });

  detailsInFlight.set(id, promise);
  return promise;
}

app.get("/health", (_req, res) => res.json({ ok: true }));

async function handleGamesRequest(
  req: express.Request,
  res: express.Response
) {
  try {
    const { games, fetchedAt, bestIds } = await getCatalog();

    const q = String(req.query.q ?? "").trim().toLowerCase();
    const tag = String(req.query.tag ?? "").trim().toLowerCase();
    const limit = Math.max(1, Math.min(800, Number(req.query.limit ?? 600)));
    const offset = Math.max(0, Number(req.query.offset ?? 0));

    let list = games;
    if (q) list = list.filter((g) => g.title.toLowerCase().includes(q));
    if (tag) list = list.filter((g) => g.tags.includes(tag));

    const items = list.slice(offset, offset + limit);

    res.setHeader("Cache-Control", "public, max-age=60");
    res.json({
      fetchedAt,
      bestIds,
      total: list.length,
      limit,
      offset,
      games: items,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "catalog_failed" });
  }
}

app.get("/games", handleGamesRequest);

app.get("/game/:id", async (req, res) => {
  try {
    const id = String(req.params.id ?? "").trim();
    const details = await getGameDetailsById(id);
    res.setHeader("Cache-Control", "public, max-age=300");
    res.json(details);
  } catch (err) {
    const status =
      typeof err === "object" && err && "status" in err
        ? Number((err as { status?: number }).status ?? 500)
        : 500;
    res.status(Number.isFinite(status) ? status : 500).json({
      error: "details_failed",
    });
  }
});


app.get("/embed", async (req, res) => {
  try {
    const raw = String(req.query.url ?? "").trim();
    if (!raw) {
      res.status(400).send("missing_url");
      return;
    }

    const normalized = normalizeUrl(raw, SOURCE_BASE);
    let url: URL;
    try {
      url = new URL(normalized);
    } catch {
      res.status(400).send("invalid_url");
      return;
    }

    if (!isAllowedEmbedUrl(url)) {
      res.status(400).send("blocked_url");
      return;
    }

    const html = await fetchHtml(url.toString());
    const rewritten = rewriteEmbedHtml(html, url.toString());

    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(rewritten);
  } catch (err) {
    console.error(err);
    res.status(500).send("embed_failed");
  }
});

app.get("/search", handleGamesRequest);

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
