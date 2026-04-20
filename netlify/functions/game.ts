import type { Handler } from "@netlify/functions";
import * as cheerio from "cheerio";
import {
  SOURCE_BASE,
  fetchHtml,
  normalizeUrl,
  mapSourceCategoryToTags,
  uniqLower,
} from "./_shared";

export const handler: Handler = async (event) => {
  try {
    const id = event.queryStringParameters?.id;
    if (!id) return fail("missing id");

    const url = `${SOURCE_BASE}/game/${id}`;

    let html = "";
    try {
      html = await fetchHtml(url);
    } catch {
      return fail("fetch_failed");
    }

    const $ = cheerio.load(html);

    const title = $("h1").first().text().trim() || "Unknown";
    const thumbnail =
      $("meta[property='og:image']").attr("content") ||
      $("img").first().attr("src") ||
      "";

    const description =
      $("meta[property='og:description']").attr("content") ||
      $("p[itemprop='description']").text().trim() ||
      "";

    const categories = $("div.game-categories li a")
      .toArray()
      .map((el) => $(el).text());

    let embedRaw =
      $("a.play-btn").attr("href") ||
      $("iframe").attr("src") ||
      $("meta[property='og:url']").attr("content") ||
      "";

    const scriptText = $("script").html() || "";
    const match = scriptText.match(
      /https:\/\/play\.famobi\.com\/wrapper\/[a-z0-9-]+\/A1000-10/i
    );

    if (match) embedRaw = match[0];

    const embedUrl = normalizeUrl(embedRaw, SOURCE_BASE);

    return json({
      id,
      title,
      thumbnail,
      pageUrl: url,
      embedUrl,
      description,
      tags: uniqLower(mapSourceCategoryToTags(categories)),
      sourceCategories: categories,
    });
  } catch (err) {
    console.error("GAME_FN_ERROR:", err);
    return fail("error");
  }
};

function json(data: any, status = 200) {
  return {
    statusCode: status,
    body: JSON.stringify(data),
  };
}

function fail(msg: string) {
  return json({ error: msg }, 500);
}