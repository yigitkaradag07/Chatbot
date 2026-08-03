import type { InferUITool, UIMessage } from "ai";
import { z } from "zod";
import type { getLinkedInProfile } from "./ai/tools/get-linkedin-profile";
import type { getNews } from "./ai/tools/get-news";
import type { getWeather } from "./ai/tools/get-weather";
import type { summarizeYouTube } from "./ai/tools/summarize-youtube";

export const messageMetadataSchema = z.object({
  createdAt: z.string(),
});

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;

type weatherTool = InferUITool<typeof getWeather>;
type newsTool = InferUITool<typeof getNews>;
type linkedInTool = InferUITool<typeof getLinkedInProfile>;
type youtubeTool = InferUITool<typeof summarizeYouTube>;

export type ChatTools = {
  getWeather: weatherTool;
  getNews: newsTool;
  getLinkedInProfile: linkedInTool;
  summarizeYouTube: youtubeTool;
};

export type WaitingStatusData = {
  phase: "waiting" | "thinking";
  message: string;
  modelId: string;
  modelName: string;
};

export type CustomUIDataTypes = {
  appendMessage: string;
  "chat-title": string;
  "waiting-status": WaitingStatusData;
};

export type ChatMessage = UIMessage<
  MessageMetadata,
  CustomUIDataTypes,
  ChatTools
>;

export type Attachment = {
  name: string;
  url: string;
  contentType: string;
};
