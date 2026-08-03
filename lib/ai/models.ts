export const DEFAULT_CHAT_MODEL = "google/gemini-2.5-flash";

export const titleModel = {
  id: "google/gemini-2.5-flash-lite",
  name: "Gemini 2.5 Flash Lite",
};

export type ModelCapabilities = {
  tools: boolean;
  vision: boolean;
  reasoning: boolean;
};

export type ChatModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
};

// Every model here supports both tool use and vision, so image input and
// the feature tools (news, LinkedIn, YouTube, weather) work no matter which
// one the user picks.
export const chatModels: ChatModel[] = [
  {
    description: "Fast, well-rounded default with vision and tool use",
    id: "google/gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "google",
  },
  {
    description: "OpenAI's compact multimodal model",
    id: "openai/gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "openai",
  },
  {
    description: "OpenAI's smallest, fastest reasoning-capable model",
    id: "openai/gpt-5-nano",
    name: "GPT-5 Nano",
    provider: "openai",
  },
  {
    description: "Anthropic's fast, capable model",
    id: "anthropic/claude-haiku-4.5",
    name: "Claude Haiku 4.5",
    provider: "anthropic",
  },
  {
    description: "Meta's open-weight multimodal model",
    id: "meta-llama/llama-4-scout",
    name: "Llama 4 Scout",
    provider: "meta-llama",
  },
];

const staticCapabilities: ModelCapabilities = {
  reasoning: false,
  tools: true,
  vision: true,
};

export function getCapabilities(): Record<string, ModelCapabilities> {
  return Object.fromEntries(
    chatModels.map((model) => [model.id, staticCapabilities])
  );
}

export function getActiveModels(): ChatModel[] {
  return chatModels;
}

export const allowedModelIds = new Set(chatModels.map((m) => m.id));

export const modelsByProvider = chatModels.reduce(
  (acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  },
  {} as Record<string, ChatModel[]>
);
