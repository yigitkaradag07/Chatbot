"use client";

import { ExternalLinkIcon, NewspaperIcon } from "lucide-react";

type NewsItem = {
  title: string;
  url: string;
  publishedDate: string | null;
  image: string | null;
  favicon: string | null;
  snippet: string | null;
};

function relativeTime(dateString: string | null): string {
  if (!dateString) {
    return "";
  }
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) {
    return "just now";
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function NewsCard({ item }: { item: NewsItem }) {
  return (
    <a
      className="group flex flex-col overflow-hidden rounded-xl border border-border/30 bg-card/40 transition-all duration-200 hover:border-border/60 hover:bg-card/70"
      href={item.url}
      rel="noopener noreferrer"
      target="_blank"
    >
      {item.image ? (
        <div className="aspect-[16/9] w-full overflow-hidden bg-muted/40">
          {/* biome-ignore lint/performance/noImgElement: external, unpredictable news thumbnails */}
          <img
            alt=""
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            src={item.image}
          />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
          {item.favicon ? (
            // biome-ignore lint/performance/noImgElement: small external favicon
            <img alt="" className="size-3.5 rounded-sm" src={item.favicon} />
          ) : (
            <NewspaperIcon className="size-3.5" />
          )}
          <span>{relativeTime(item.publishedDate)}</span>
        </div>
        <h3 className="line-clamp-3 font-medium text-[13px] leading-snug text-foreground">
          {item.title}
        </h3>
        {item.snippet ? (
          <p className="line-clamp-2 text-[12px] text-muted-foreground/80 leading-relaxed">
            {item.snippet}
          </p>
        ) : null}
        <div className="mt-auto flex items-center gap-1 pt-1 text-[11px] text-muted-foreground/50 opacity-0 transition-opacity group-hover:opacity-100">
          Read more <ExternalLinkIcon className="size-3" />
        </div>
      </div>
    </a>
  );
}

export function NewsCards({
  result,
}: {
  result: { domain: string; publisherName: string; items: NewsItem[] };
}) {
  return (
    <div className="w-full space-y-2.5 rounded-2xl border border-border/30 bg-card/20 p-3.5">
      <div className="flex items-center gap-2 px-0.5 text-[12px] text-muted-foreground">
        <NewspaperIcon className="size-3.5" />
        <span>
          Latest from{" "}
          <span className="font-medium text-foreground/80">
            {result.publisherName}
          </span>
        </span>
      </div>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {result.items.map((item) => (
          <NewsCard item={item} key={item.url} />
        ))}
      </div>
    </div>
  );
}
