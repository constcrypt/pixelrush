import type { Handler } from "@netlify/functions";
import { getCatalog } from "../../src/scraper";

export const handler: Handler = async (event) => {
  try {
    const { games, fetchedAt } = await getCatalog();

    const q = (event.queryStringParameters?.q || "").toLowerCase();
    const tag = (event.queryStringParameters?.tag || "").toLowerCase();
    const limit = Math.min(Number(event.queryStringParameters?.limit || 600), 800);

    let list = games;

    if (q) list = list.filter((g) => g.title.toLowerCase().includes(q));
    if (tag) list = list.filter((g) => g.tags.includes(tag));

    return {
      statusCode: 200,
      headers: { "Cache-Control": "public, max-age=60" },
      body: JSON.stringify({
        fetchedAt,
        total: list.length,
        games: list.slice(0, limit),
      }),
    };
  } catch (e) {
    return { statusCode: 500, body: "catalog_failed" };
  }
};