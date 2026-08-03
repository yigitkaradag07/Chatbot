import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { titleModel } from "./models";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export function getLanguageModel(modelId: string) {
  return openrouter(modelId);
}

export function getTitleModel() {
  return openrouter(titleModel.id);
}
