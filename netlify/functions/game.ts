import type { Handler } from "@netlify/functions";
import { getGameDetails } from "../../src/scraper";

export const handler: Handler = async (event) => {
  try {
    const id = event.path.split("/").pop() || "";

    const game = await getGameDetails(id);

    return {
      statusCode: 200,
      headers: { "Cache-Control": "public, max-age=300" },
      body: JSON.stringify(game),
    };
  } catch {
    return { statusCode: 404, body: "not_found" };
  }
};