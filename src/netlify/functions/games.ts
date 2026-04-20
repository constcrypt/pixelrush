import type { Handler } from "@netlify/functions";
import * as cheerio from "cheerio";
import { SOURCE_BASE, fetchHtml, uniqLower, guessTagsFromText } from "./_shared";

let cache: any = null;

export const handler: Handler = async () => {
  try {
    if (cache && Date.now() < cache.expires) {
      return json(cache.data);
    }

    const html = await fetchHtml(`${SOURCE_BASE}/All-Games`);
    const $ = cheerio.load(html);

    const games = $("ul.games li a")
      .toArray()
      .map((el) => {
        const href = $(el).attr("href") || "";
        const id = href.split("/").pop() || "";

        return {
          id,
          title: $(el).find(".name").text().trim(),
          thumbnail: $(el).find("img").attr("src") || "",
          pageUrl: `${SOURCE_BASE}${href}`,
          tags: uniqLower(guessTagsFromText($(el).text())),
        };
      });

    cache = {
      data: { games },
      expires: Date.now() + 15 * 60 * 1000,
    };

    return json(cache.data);
  } catch {
    return json({ error: "failed" }, 500);
  }
};

function json(data: any, status = 200) {
  return {
    statusCode: status,
    body: JSON.stringify(data),
  };
}