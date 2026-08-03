"use client";

import { ExternalLinkIcon, Linkedin } from "lucide-react";

type LinkedInResult = {
  content: string | null;
  name: string | null;
  source: string;
  url: string;
};

export function LinkedInCard({ result }: { result: LinkedInResult }) {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-border/30 bg-card/40">
      <div className="flex items-center gap-2.5 border-border/20 border-b bg-gradient-to-br from-[#0a66c2]/10 to-transparent px-4 py-3">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#0a66c2] text-white">
          <Linkedin className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-[13px] text-foreground">
            {result.name ?? "LinkedIn Profile"}
          </div>
        </div>
        <a
          className="flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground/70 transition-colors hover:text-foreground"
          href={result.url}
          rel="noopener noreferrer"
          target="_blank"
        >
          View <ExternalLinkIcon className="size-3" />
        </a>
      </div>
      {result.content ? (
        <div className="max-h-64 overflow-y-auto px-4 py-3 text-[12px] text-muted-foreground/90 leading-relaxed whitespace-pre-line">
          {result.content}
        </div>
      ) : (
        <div className="px-4 py-3 text-[12px] text-muted-foreground/60">
          No further details were available.
        </div>
      )}
    </div>
  );
}
