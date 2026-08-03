import { google } from "@ai-sdk/google";
import { generateText, tool } from "ai";
import { z } from "zod";

const SUMMARY_PROMPT = `Watch this YouTube video and summarize it. Respond in the same language the video is in. Structure your response as:

**TL;DR** — one or two sentences.

**Key points** — 3-6 bullet points covering the main content.

**Notable moments** — 1-3 specific moments or quotes worth calling out, with approximate timestamps if you can tell them.

Be accurate and specific to what's actually in the video. Don't pad with generic filler.`;

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtube\.com\/shorts\/|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
}

export const summarizeYouTube = tool({
  description:
    "Watch a YouTube video and produce an accurate summary of its content, given its URL.",
  execute: async ({ url }) => {
    const videoId = extractVideoId(url);
    if (!videoId) {
      return {
        error: "That doesn't look like a valid YouTube video URL.",
      };
    }

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return {
        error:
          "YouTube summarization isn't configured (missing Gemini API key).",
      };
    }

    try {
      const { text } = await generateText({
        messages: [
          {
            content: [
              { text: SUMMARY_PROMPT, type: "text" },
              {
                data: `https://www.youtube.com/watch?v=${videoId}`,
                mediaType: "video/mp4",
                type: "file",
              },
            ],
            role: "user",
          },
        ],
        model: google("gemini-3.6-flash"),
        maxOutputTokens: 1500,
      });

      return {
        summary: text,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        videoId,
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      };
    } catch (error) {
      console.error("[summarize-youtube] Gemini request failed:", error);
      return {
        error:
          "Couldn't watch that video. It may be private, age-restricted, or unavailable.",
      };
    }
  },
  inputSchema: z.object({
    url: z.string().describe("The YouTube video URL"),
  }),
});
