"use client"

import { ZapIcon, LinkIcon } from "@/components/icons"
import type { LiveSignal } from "@/lib/types"
import { cn } from "@/lib/utils"

interface SignalCardProps {
  signal: LiveSignal
  onGenerate: (content: string, source: string) => void
  disabled?: boolean
}

export function SignalCard({ signal, onGenerate, disabled }: SignalCardProps) {
  const getCategoryStyle = (category: string) => {
    switch (category) {
      case "Crypto Alpha":
        return "bg-accent/10 text-accent"
      case "Trending":
        return "bg-primary/10 text-primary"
      case "Following":
        return "bg-purple-500/10 text-purple-500"
      default:
        return "bg-secondary text-muted-foreground"
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "Crypto Alpha":
        return "CRYPTO ALPHA"
      case "Trending":
        return "NEWS / POLITICS"
      case "Following":
        return "NETWORK PICK"
      default:
        return category.toUpperCase()
    }
  }

  return (
    <div className="bg-card border border-border rounded-3xl p-6 flex gap-6 hover:border-primary/40 transition-all group shadow-xl relative overflow-hidden">
      {signal.isThread && (
        <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-[7px] font-black px-3 py-1 uppercase tracking-widest rounded-bl-xl shadow-lg">
          THREAD DETECTED
        </div>
      )}

      <div
        className={cn(
          "absolute top-0 left-0 text-[6px] font-black px-3 py-1 uppercase tracking-widest rounded-br-xl",
          getCategoryStyle(signal.category)
        )}
      >
        {getCategoryLabel(signal.category)}
      </div>

      <div className="flex-none pt-4">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-secondary border border-border shadow-inner">
          <img
            src={`https://unavatar.io/twitter/${signal.handle}`}
            alt={signal.handle}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
          />
        </div>
      </div>

      <div className="flex-1 pt-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex flex-col">
            <span className="text-sm font-black text-foreground group-hover:text-primary transition-colors">
              {signal.author}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground uppercase">
              @{signal.handle}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5 bg-primary/20 border border-primary/40 px-3 py-1 rounded-full shadow-[0_0_15px_rgba(29,155,240,0.2)] ring-1 ring-primary/30">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-mono font-black text-foreground uppercase whitespace-nowrap tracking-tighter">
                {signal.timeLabel || "LIVE"}
              </span>
            </div>
          </div>
        </div>

        <p
          className={cn(
            "text-muted-foreground text-[15px] leading-relaxed mb-5 font-medium",
            signal.isThread && "border-l-2 border-primary/20 pl-4"
          )}
        >
          {signal.content}
        </p>

        <div className="flex justify-between items-center pt-4 border-t border-border/50">
          <div className="flex gap-4">
            <span className="text-[9px] font-black text-accent/60 uppercase tracking-widest flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-accent/60" />
              Real-Time Link
            </span>
            {signal.sourceUrl && (
              <a
                href={signal.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[9px] font-black text-muted-foreground hover:text-foreground uppercase tracking-widest flex items-center gap-1.5 transition-colors"
              >
                <LinkIcon className="w-2.5 h-2.5" />
                Source
              </a>
            )}
          </div>
          <button
            onClick={() => onGenerate(signal.content, `@${signal.handle}'s Signal`)}
            disabled={disabled}
            className="bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-primary/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ZapIcon className="w-3 h-3 fill-current" />
            {signal.isThread ? "Rewrite Thread" : "Draft Ghost-Post"}
          </button>
        </div>
      </div>
    </div>
  )
}
