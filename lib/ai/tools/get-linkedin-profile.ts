import { tool } from "ai";
import Exa from "exa-js";
import { z } from "zod";

let exaClient: Exa | null = null;
function getExa() {
  exaClient ??= new Exa(process.env.EXA_API_KEY);
  return exaClient;
}

const AUTHWALL_MARKERS = [
  "join linkedin",
  "sign in to linkedin",
  "authwall",
  "agree & join",
];
const MIN_VALID_LENGTH = 200;
const MAX_CONTENT_LENGTH = 4000;

async function tryJinaReader(url: string): Promise<string | null> {
  try {
    const headers: Record<string, string> = {};
    if (process.env.JINA_API_KEY) {
      headers.Authorization = `Bearer ${process.env.JINA_API_KEY}`;
    }

    const res = await fetch(`https://r.jina.ai/${url}`, { headers });
    if (!res.ok) {
      return null;
    }

    const text = await res.text();
    if (text.length < MIN_VALID_LENGTH) {
      return null;
    }

    const lower = text.toLowerCase();
    if (AUTHWALL_MARKERS.some((marker) => lower.includes(marker))) {
      return null;
    }

    return text.slice(0, MAX_CONTENT_LENGTH);
  } catch (error) {
    console.error("[get-linkedin-profile] Jina reader failed:", error);
    return null;
  }
}

export const getLinkedInProfile = tool({
  description:
    "Look up a person's LinkedIn profile, either by their full name or by a linkedin.com/in/... URL.",
  execute: async ({ nameOrUrl }) => {
    const isUrl = /linkedin\.com\/in\//i.test(nameOrUrl);

    if (isUrl) {
      const url = nameOrUrl.startsWith("http")
        ? nameOrUrl
        : `https://${nameOrUrl}`;

      const jinaText = await tryJinaReader(url);
      if (jinaText) {
        return { content: jinaText, name: null, source: "jina", url };
      }

      try {
        const { results } = await getExa().getContents([url], {
          summary: true,
          text: { maxCharacters: MAX_CONTENT_LENGTH },
        });
        const [result] = results;
        if (result) {
          return {
            content: result.summary || result.text || null,
            name: result.title ?? null,
            source: "exa",
            url,
          };
        }
      } catch (error) {
        console.error(
          "[get-linkedin-profile] Exa getContents failed:",
          error
        );
        // fall through to error below
      }

      return {
        error: `Couldn't retrieve the LinkedIn profile at ${url}. It may be private or blocked.`,
      };
    }

    try {
      const { results } = await getExa().search(nameOrUrl, {
        category: "people",
        contents: {
          summary: true,
          text: { maxCharacters: MAX_CONTENT_LENGTH },
        },
        numResults: 3,
        type: "auto",
      });

      const [top] = results;
      if (!top) {
        return { error: `No LinkedIn profile found for "${nameOrUrl}".` };
      }

      return {
        content: top.summary || top.text || null,
        name: top.title ?? nameOrUrl,
        source: "exa",
        url: top.url,
      };
    } catch (error) {
      console.error("[get-linkedin-profile] Exa search failed:", error);
      return { error: `Failed to search for "${nameOrUrl}".` };
    }
  },
  inputSchema: z.object({
    nameOrUrl: z
      .string()
      .describe("A person's full name, or a linkedin.com/in/... profile URL"),
  }),
});
