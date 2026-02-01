"use client"

import { XIcon, TrendingIcon, CryptoIcon } from "@/components/icons"
import { SignalCard } from "@/components/signal-card"
import type { LiveSignal, SignalCategory, XConnection } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ScannerTabProps {
  signals: LiveSignal[]
  activeSignalTab: SignalCategory
  setActiveSignalTab: (tab: SignalCategory) => void
  xConnection: XConnection
  searchTerm: string
  isCoolingDown: boolean
  onGenerate: (content: string, source: string) => void
}

const categories: SignalCategory[] = ["Following", "For You", "Crypto Alpha", "Trending"]

function getTabLabel(cat: string) {
  switch (cat) {
    case "Crypto Alpha":
      return "Memecoins & KOLs"
    case "Trending":
      return "News & Politics"
    default:
      return cat
  }
}

export function ScannerTab({
  signals,
  activeSignalTab,
  setActiveSignalTab,
  xConnection,
  searchTerm,
  isCoolingDown,
  onGenerate,
}: ScannerTabProps) {
  const filteredSignals = signals
    .filter((s) => s.category === activeSignalTab)
    .filter((s) => {
      if (!searchTerm) return true
      const lower = searchTerm.toLowerCase()
      return (
        s.content.toLowerCase().includes(lower) ||
        s.author.toLowerCase().includes(lower) ||
        s.handle.toLowerCase().includes(lower)
      )
    })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
        <div className="flex gap-2 p-1 bg-card border border-border rounded-2xl w-fit overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveSignalTab(cat)}
              className={cn(
                "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                activeSignalTab === cat
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {getTabLabel(cat)}
            </button>
          ))}
        </div>
        <div className="text-[9px] font-black text-accent/80 uppercase tracking-[0.2em] flex items-center gap-3 bg-accent/5 px-4 py-2 rounded-full border border-accent/10">
          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
          {activeSignalTab === "Following" && xConnection.isConnected
            ? `Syncing @${xConnection.handle}'s network`
            : "Real-time network sync"}
        </div>
      </div>

      <div className="space-y-4 overflow-y-auto max-h-[75vh] pr-2 custom-scrollbar">
        {filteredSignals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 bg-card/30 border border-border rounded-[40px] border-dashed">
            <div className="relative mb-6">
              {searchTerm ? (
                <XIcon className="w-12 h-12 text-muted-foreground opacity-40" />
              ) : activeSignalTab === "Trending" ? (
                <TrendingIcon className="w-12 h-12 text-primary opacity-40 animate-pulse" />
              ) : (
                <CryptoIcon className="w-12 h-12 animate-pulse text-accent opacity-40" />
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
              </div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">
              {searchTerm
                ? "No matches found"
                : `Hunting ${getTabLabel(activeSignalTab)} Intelligence...`}
            </span>
          </div>
        ) : (
          filteredSignals.map((signal) => (
            <SignalCard
              key={signal.id}
              signal={signal}
              onGenerate={onGenerate}
              disabled={isCoolingDown}
            />
          ))
        )}
      </div>
    </div>
  )
}
