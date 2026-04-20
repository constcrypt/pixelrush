import type { Handler } from "@netlify/functions";
import { getCatalog } from "../../src/scraper";

export const handler: Handler = async (event) => {
  const { games } = await getCatalog();

  const q = (event.queryStringParameters?.q || "").toLowerCase();

  const filtered = q
    ? games.filter((g) => g.title.toLowerCase().includes(q))
    : games;

  return {
    statusCode: 200,
    body: JSON.stringify(filtered.slice(0, 100)),
  };
};