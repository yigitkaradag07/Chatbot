"use client";
import type { UseChatHelpers } from "@ai-sdk/react";
import type { Vote } from "@/lib/db/schema";
import type { ChatMessage } from "@/lib/types";
import { cn, sanitizeText } from "@/lib/utils";
import { MessageContent, MessageResponse } from "../ai-elements/message";
import { Shimmer } from "../ai-elements/shimmer";
import { Tool, ToolContent, ToolHeader, ToolInput } from "../ai-elements/tool";
import { useDataStream } from "./data-stream-provider";
import { SparklesIcon } from "./icons";
import { LinkedInCard } from "./linkedin-card";
import { MessageActions } from "./message-actions";
import { MessageReasoning } from "./message-reasoning";
import { NewsCards } from "./news-cards";
import { PreviewAttachment } from "./preview-attachment";
import { Weather } from "./weather";
import { YouTubeSummaryCard } from "./youtube-summary-card";

function WaitingText() {
  const { waitingStatus } = useDataStream();
  const waitingText = waitingStatus?.message ?? "Waiting...";

  return (
    <div className="flex min-h-[calc(13px*1.65)] min-w-0 items-center text-[13px] leading-[1.65]">
      <Shimmer
        as="span"
        className="font-medium whitespace-normal break-words"
        duration={1}
      >
        {waitingText}
      </Shimmer>
    </div>
  );
}

const PurePreviewMessage = ({
  chatId,
  message,
  vote,
  isLoading,
  setMessages: _setMessages,
  regenerate: _regenerate,
  isReadonly,
  requiresScrollPadding: _requiresScrollPadding,
  onEdit,
}: {
  chatId: string;
  message: ChatMessage;
  vote: Vote | undefined;
  isLoading: boolean;
  setMessages: UseChatHelpers<ChatMessage>["setMessages"];
  regenerate: UseChatHelpers<ChatMessage>["regenerate"];
  isReadonly: boolean;
  requiresScrollPadding: boolean;
  onEdit?: (message: ChatMessage) => void;
}) => {
  const attachmentsFromMessage = message.parts.filter(
    (part) => part.type === "file"
  );

  useDataStream();

  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  const hasAnyContent = message.parts?.some(
    (part) =>
      (part.type === "text" && part.text?.trim().length > 0) ||
      (part.type === "reasoning" &&
        "text" in part &&
        part.text?.trim().length > 0) ||
      part.type.startsWith("tool-")
  );
  const isThinking = isAssistant && isLoading && !hasAnyContent;

  const attachments = attachmentsFromMessage.length > 0 && (
    <div
      className="flex flex-row justify-end gap-2"
      data-testid={"message-attachments"}
    >
      {attachmentsFromMessage.map((attachment) => (
        <PreviewAttachment
          attachment={{
            contentType: attachment.mediaType,
            name: attachment.filename ?? "file",
            url: attachment.url,
          }}
          key={attachment.url}
        />
      ))}
    </div>
  );

  const mergedReasoning = message.parts?.reduce(
    (acc, part) => {
      if (part.type === "reasoning" && part.text?.trim().length > 0) {
        return {
          isStreaming: "state" in part ? part.state === "streaming" : false,
          rendered: false,
          text: acc.text ? `${acc.text}\n\n${part.text}` : part.text,
        };
      }
      return acc;
    },
    { isStreaming: false, rendered: false, text: "" }
  ) ?? { isStreaming: false, rendered: false, text: "" };

  const parts = message.parts?.map((part, index) => {
    const { type } = part;
    const key = `message-${message.id}-part-${index}`;

    if (type === "reasoning") {
      if (!mergedReasoning.rendered && mergedReasoning.text) {
        mergedReasoning.rendered = true;
        return (
          <MessageReasoning
            isLoading={isLoading || mergedReasoning.isStreaming}
            key={key}
            reasoning={mergedReasoning.text}
          />
        );
      }
      return null;
    }

    if (type === "text") {
      return (
        <MessageContent
          className={cn("text-[13px] leading-[1.65]", {
            "w-fit max-w-[min(80%,56ch)] overflow-hidden break-words rounded-2xl rounded-br-lg border border-border/30 bg-gradient-to-br from-secondary to-muted px-3.5 py-2 shadow-[var(--shadow-card)]":
              message.role === "user",
          })}
          data-testid="message-content"
          key={key}
        >
          <MessageResponse>{sanitizeText(part.text)}</MessageResponse>
        </MessageContent>
      );
    }

    if (type === "tool-getWeather") {
      const { toolCallId, state } = part;
      const widthClass = "w-[min(100%,450px)]";

      if (state === "output-available") {
        return (
          <div className={widthClass} key={toolCallId}>
            <Weather weatherAtLocation={part.output} />
          </div>
        );
      }

      return (
        <div className={widthClass} key={toolCallId}>
          <Tool className="w-full" defaultOpen={true}>
            <ToolHeader state={state} type="tool-getWeather" />
            <ToolContent>
              {state === "input-available" && <ToolInput input={part.input} />}
            </ToolContent>
          </Tool>
        </div>
      );
    }

    if (type === "tool-getNews") {
      const { toolCallId, state } = part;

      if (state === "output-available") {
        if ("error" in part.output) {
          return (
            <div
              className="w-[min(100%,600px)] rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-destructive text-sm"
              key={toolCallId}
            >
              {String(part.output.error)}
            </div>
          );
        }
        return (
          <div className="w-full" key={toolCallId}>
            <NewsCards result={part.output} />
          </div>
        );
      }

      return (
        <div className="w-[min(100%,450px)]" key={toolCallId}>
          <Tool className="w-full" defaultOpen={false}>
            <ToolHeader state={state} type="tool-getNews" />
            <ToolContent>
              {state === "input-available" && <ToolInput input={part.input} />}
            </ToolContent>
          </Tool>
        </div>
      );
    }

    if (type === "tool-getLinkedInProfile") {
      const { toolCallId, state } = part;

      if (state === "output-available") {
        if ("error" in part.output) {
          return (
            <div
              className="w-[min(100%,600px)] rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-destructive text-sm"
              key={toolCallId}
            >
              {String(part.output.error)}
            </div>
          );
        }
        return (
          <div className="w-[min(100%,480px)]" key={toolCallId}>
            <LinkedInCard result={part.output} />
          </div>
        );
      }

      return (
        <div className="w-[min(100%,450px)]" key={toolCallId}>
          <Tool className="w-full" defaultOpen={false}>
            <ToolHeader state={state} type="tool-getLinkedInProfile" />
            <ToolContent>
              {state === "input-available" && <ToolInput input={part.input} />}
            </ToolContent>
          </Tool>
        </div>
      );
    }

    if (type === "tool-summarizeYouTube") {
      const { toolCallId, state } = part;

      if (state === "output-available") {
        if ("error" in part.output) {
          return (
            <div
              className="w-[min(100%,600px)] rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-destructive text-sm"
              key={toolCallId}
            >
              {String(part.output.error)}
            </div>
          );
        }
        return (
          <div className="w-[min(100%,560px)]" key={toolCallId}>
            <YouTubeSummaryCard result={part.output} />
          </div>
        );
      }

      return (
        <div className="w-[min(100%,450px)]" key={toolCallId}>
          <Tool className="w-full" defaultOpen={false}>
            <ToolHeader state={state} type="tool-summarizeYouTube" />
            <ToolContent>
              {state === "input-available" && <ToolInput input={part.input} />}
            </ToolContent>
          </Tool>
        </div>
      );
    }

    return null;
  });

  const actions = !isReadonly && (
    <MessageActions
      chatId={chatId}
      isLoading={isLoading}
      key={`action-${message.id}`}
      message={message}
      onEdit={onEdit ? () => onEdit(message) : undefined}
      vote={vote}
    />
  );

  const content = isThinking ? (
    <WaitingText />
  ) : (
    <>
      {attachments}
      {parts}
      {actions}
    </>
  );

  return (
    <div
      className={cn(
        "group/message w-full",
        !isAssistant && "animate-[fade-up_0.25s_cubic-bezier(0.22,1,0.36,1)]"
      )}
      data-role={message.role}
      data-testid={`message-${message.role}`}
    >
      <div
        className={cn(
          isUser ? "flex flex-col items-end gap-2" : "flex items-start gap-3"
        )}
      >
        {isAssistant && (
          <div className="flex h-[calc(13px*1.65)] shrink-0 items-center">
            <div className="flex size-7 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground ring-1 ring-border/50">
              <SparklesIcon size={13} />
            </div>
          </div>
        )}
        {isAssistant ? (
          <div className="flex min-w-0 flex-1 flex-col gap-2">{content}</div>
        ) : (
          content
        )}
      </div>
    </div>
  );
};

export const PreviewMessage = PurePreviewMessage;

export const ThinkingMessage = () => (
  <div
    className="group/message w-full"
    data-role="assistant"
    data-testid="message-assistant-loading"
  >
    <div className="flex items-start gap-3">
      <div className="flex h-[calc(13px*1.65)] shrink-0 items-center">
        <div className="flex size-7 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground ring-1 ring-border/50">
          <SparklesIcon size={13} />
        </div>
      </div>

      <WaitingText />
    </div>
  </div>
);
