import type { Handler } from "@netlify/functions";
import {
  fetchHtml,
  isAllowedEmbedUrl,
  rewriteEmbedHtml,
  normalizeUrl,
} from "./_shared";

export const handler: Handler = async (event) => {
  try {
    const url = event.queryStringParameters?.url;
    if (!url) return { statusCode: 400, body: "missing url" };

    const finalUrl = new URL(normalizeUrl(url, "https://html5games.com"));

    if (!isAllowedEmbedUrl(finalUrl)) {
      return { statusCode: 403, body: "blocked" };
    }

    const html = await fetchHtml(finalUrl.toString());
    const rewritten = rewriteEmbedHtml(html, finalUrl.toString());

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/html" },
      body: rewritten,
    };
  } catch {
    return { statusCode: 500, body: "embed failed" };
  }
};