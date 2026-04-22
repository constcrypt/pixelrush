import fs from "fs/promises";
import * as cheerio from "cheerio";

const SOURCE_BASE = "https://html5games.com";

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }

  return await res.text();
}

function normalizeUrl(url, base) {
  if (!url) return "";
  if (url.startsWith("//")) return "https:" + url;
  if (url.startsWith("/")) return base + url;
  return url;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function retry(fn, retries = 4, delay = 500) {
  let err;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (e) {
      err = e;
      await sleep(delay);
      delay *= 1.5;
    }
  }

  throw err;
}

function extractGamesFromHtml(html, baseUrl) {
  const $ = cheerio.load(html);

  const games = [];

  $("ul.games li a").each((_, el) => {
    const href = $(el).attr("href") ?? "";
    const img = $(el).find("img");
    const nameEl = $(el).find(".name");

    games.push({
      id: href.split("/").filter(Boolean).pop() ?? href,
      title: nameEl.text().trim() || img.attr("alt") || "Unknown",
      thumbnail: normalizeUrl(img.attr("src") ?? "", baseUrl),
      pageUrl: normalizeUrl(href, baseUrl),
    });
  });

  return games;
}

async function scrapeGameDetails(game) {
  try {
    return await retry(async () => {
      const html = await fetchHtml(game.pageUrl);
      const $ = cheerio.load(html);

      const description =
        $("p[itemprop='description']").text().trim() ||
        $("meta[property='og:description']").attr("content") ||
        "";

      const embedHref = $("a.play-btn").attr("href") ?? "";
      const embedUrl = normalizeUrl(embedHref, SOURCE_BASE);

      if (!embedUrl) throw new Error("Missing embed URL");

      return {
        ...game,
        description,
        embedUrl,
      };
    }, 4, 600);
  } catch {
    return {
      ...game,
      description: "",
      embedUrl: "",
    };
  }
}

const html = await fetchHtml(`${SOURCE_BASE}/All-Games`);
const games = extractGamesFromHtml(html, SOURCE_BASE);

const CONCURRENCY = 30;

const results = [];
let index = 0;

async function worker() {
  while (index < games.length) {
    const i = index++;
    const game = games[i];

    console.log(`[${i + 1}/${games.length}] ${game.title}`);

    const result = await scrapeGameDetails(game);
    results.push(result);
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));

await fs.writeFile(
  "./src/data/games.json",
  JSON.stringify(results, null, 2)
);

console.log("Games saved");