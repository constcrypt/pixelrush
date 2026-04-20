import type { Handler } from "@netlify/functions";

const ALLOWED = new Set(["play.famobi.com"]);

export const handler: Handler = async (event) => {
  try {
    const url = event.queryStringParameters?.url;
    if (!url) return { statusCode: 400, body: "missing_url" };

    const u = new URL(url);
    if (!ALLOWED.has(u.host)) {
      return { statusCode: 403, body: "blocked" };
    }

    const res = await fetch(u.toString());
    const html = await res.text();

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/html" },
      body: html,
    };
  } catch {
    return { statusCode: 500, body: "embed_failed" };
  }
};