import axios from "axios";
import * as cheerio from "cheerio";

export const SOURCE_BASE = "https://html5games.com";

export const ALLOWED_EMBED_HOSTS = new Set(["play.famobi.com"]);

export function normalizeUrl(url: string, base: string) {
  if (!url) return "";
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("/")) return `${base}${url}`;
  return url;
}

export function fetchHtml(url: string) {
  return axios.get(url, {
    headers: { "User-Agent": "PixelRush" },
    timeout: 15000,
  }).then(r => r.data);
}

export function uniqLower(list: string[]) {
  return Array.from(
    new Set(
      list
        .map(x => x.trim().toLowerCase())
        .filter(Boolean)
        .filter(x => x !== "fun")
    )
  );
}

export function guessTagsFromText(text: string) {
  const t = text.toLowerCase();
  const tags: string[] = [];

  if (/(puzzle|match|sudoku|mahjong)/.test(t)) tags.push("puzzle");
  if (/(race|drift|driving)/.test(t)) tags.push("racing");
  if (/(soccer|football|sport)/.test(t)) tags.push("sports");
  if (/(shoot|gun|war)/.test(t)) tags.push("shooter");

  return tags;
}

export function mapSourceCategoryToTags(categories: string[]) {
  const tags: string[] = [];

  for (const c of categories) {
    const x = c.toLowerCase();
    if (x.includes("puzzle")) tags.push("puzzle");
    if (x.includes("racing")) tags.push("racing");
    if (x.includes("sport")) tags.push("sports");
    if (x.includes("arcade")) tags.push("arcade");
  }

  return tags;
}

export function isAllowedEmbedUrl(url: URL) {
  return (
    url.protocol === "https:" &&
    ALLOWED_EMBED_HOSTS.has(url.host)
  );
}

export function rewriteEmbedHtml(html: string, baseUrl: string) {
  const $ = cheerio.load(html);

  $("meta[http-equiv]").remove();

  $("script").each((_, el) => {
    const src = $(el).attr("src");
    if (src) $(el).attr("src", normalizeUrl(src, baseUrl));
  });

  $("a, iframe, img").each((_, el) => {
    ["src", "href"].forEach(attr => {
      const v = $(el).attr(attr);
      if (v) $(el).attr(attr, normalizeUrl(v, baseUrl));
    });
  });

  return "<!doctype html>" + $.html();
}