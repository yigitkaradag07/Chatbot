import { tool } from "ai";
import Exa from "exa-js";
import { z } from "zod";

let exaClient: Exa | null = null;
function getExa() {
  exaClient ??= new Exa(process.env.EXA_API_KEY);
  return exaClient;
}

const RESULTS_TO_FETCH = 8;
const RESULTS_TO_RETURN = 5;
const RECENT_WINDOW_DAYS = 7;
const WIDE_WINDOW_DAYS = 30;
const MAX_CHARACTERS = 1000;

type NewsItem = {
  title: string;
  url: string;
  publishedDate: string | null;
  image: string | null;
  favicon: string | null;
  snippet: string | null;
};

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

async function searchNews(domain: string, startPublishedDate: string) {
  const { results } = await getExa().search(`latest news from ${domain}`, {
    category: "news",
    contents: { text: { maxCharacters: MAX_CHARACTERS } },
    includeDomains: [domain],
    numResults: RESULTS_TO_FETCH,
    startPublishedDate,
    type: "auto",
  });
  return results;
}

export const getNews = tool({
  description:
    "Get the latest news stories published by a specific news outlet or publisher. Resolve the publisher name to its main website domain first (e.g. 'BBC' -> 'bbc.com', 'Hürriyet' -> 'hurriyet.com.tr').",
  execute: async ({ publisherDomain, publisherName }) => {
    const [domain] = publisherDomain
      .trim()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/");

    try {
      let results = await searchNews(domain, daysAgoIso(RECENT_WINDOW_DAYS));

      if (results.length < RESULTS_TO_RETURN) {
        results = await searchNews(domain, daysAgoIso(WIDE_WINDOW_DAYS));
      }

      const items: NewsItem[] = results
        .slice()
        .sort((a, b) => {
          const aTime = a.publishedDate ? Date.parse(a.publishedDate) : 0;
          const bTime = b.publishedDate ? Date.parse(b.publishedDate) : 0;
          return bTime - aTime;
        })
        .slice(0, RESULTS_TO_RETURN)
        .map((r) => ({
          favicon: r.favicon ?? null,
          image: r.image ?? null,
          publishedDate: r.publishedDate ?? null,
          snippet: r.text ? r.text.slice(0, MAX_CHARACTERS) : null,
          title: r.title ?? "Untitled",
          url: r.url,
        }));

      if (items.length === 0) {
        return {
          error: `Couldn't find recent news from ${domain}. Double-check the publisher's domain.`,
        };
      }

      return { domain, items, publisherName: publisherName ?? domain };
    } catch (error) {
      console.error("[get-news] Exa search failed:", error);
      return { error: `Failed to fetch news from ${domain}.` };
    }
  },
  inputSchema: z.object({
    publisherDomain: z
      .string()
      .describe(
        "The publisher's main website domain, e.g. 'bbc.com', 'cnn.com', 'hurriyet.com.tr'"
      ),
    publisherName: z
      .string()
      .optional()
      .describe("The publisher's display name, e.g. 'BBC News'"),
  }),
});
