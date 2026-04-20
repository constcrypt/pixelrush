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
    const html = await fetchHtml(url);
    const $ = cheerio.load(html);

    const playBtn = $("a.play-btn").attr("href");

    const iframe = $("iframe").attr("src");

    const metaUrl =
      $("meta[property='og:url']").attr("content") ||
      $("meta[name='twitter:url']").attr("content");

    let scriptMatch = "";
    $("script").each((_, el) => {
      const html = $(el).html();
      if (!html) return;
      const match = html.match(
        /https:\/\/play\.famobi\.com\/wrapper\/[a-z0-9-]+\/A1000-10/i
      );
      if (match) scriptMatch = match[0];
    });

    const embedRaw = playBtn || iframe || metaUrl || scriptMatch || "";
    const embedUrl = normalizeUrl(embedRaw, SOURCE_BASE);

    const description =
      $("meta[property='og:description']").attr("content") || "";

    const categories = $("div.game-categories li a")
      .toArray()
      .map((el) => $(el).text());

    return json({
      id,
      title: $("h1").text().trim(),
      thumbnail: $("img").first().attr("src") || "",
      pageUrl: url,
      embedUrl,
      description,
      tags: uniqLower(mapSourceCategoryToTags(categories)),
      sourceCategories: categories,
    });
  } catch {
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