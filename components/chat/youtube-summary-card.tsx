"use client";

import { PlayIcon } from "lucide-react";
import { MessageResponse } from "../ai-elements/message";

type YouTubeResult = {
  summary: string;
  thumbnailUrl: string;
  videoId: string;
  videoUrl: string;
};

export function YouTubeSummaryCard({ result }: { result: YouTubeResult }) {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-border/30 bg-card/40">
      <a
        className="group relative block aspect-video w-full overflow-hidden bg-muted/40"
        href={result.videoUrl}
        rel="noopener noreferrer"
        target="_blank"
      >
        {/* biome-ignore lint/performance/noImgElement: external YouTube thumbnail */}
        <img
          alt=""
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          src={result.thumbnailUrl}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex size-12 items-center justify-center rounded-full bg-white/90 text-black shadow-lg">
            <PlayIcon className="ml-0.5 size-5 fill-current" />
          </div>
        </div>
      </a>
      <div className="px-4 py-3 text-[13px] leading-relaxed">
        <MessageResponse>{result.summary}</MessageResponse>
      </div>
    </div>
  );
}
