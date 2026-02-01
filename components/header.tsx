"use client"

import { XIcon, RefreshIcon, SearchIcon } from "@/components/icons"
import type { TabType } from "@/lib/types"
import { cn } from "@/lib/utils"

interface HeaderProps {
  activeTab: TabType
  searchTerm: string
  setSearchTerm: (term: string) => void
  countdown: number
  isScanning: boolean
  isCoolingDown: boolean
  cooldownTime: number
  onScan: () => void
}

export function Header({
  activeTab,
  searchTerm,
  setSearchTerm,
  countdown,
  isScanning,
  isCoolingDown,
  cooldownTime,
  onScan,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border px-8 py-6">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-2xl font-black tracking-tight capitalize">
            {activeTab}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.3em]">
              {activeTab === "scanner"
                ? "Intelligence Dashboard"
                : "Ghostwriting Engine"}
            </p>
            {activeTab === "scanner" && (
              <div className="flex items-center gap-1 bg-accent/10 px-2 py-0.5 rounded-full ring-1 ring-accent/20">
                <div className="w-1 h-1 rounded-full bg-accent animate-pulse" />
                <span className="text-[8px] text-accent font-black uppercase tracking-tighter">
                  ULTRA-FAST NICHE SCAN
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter by keyword..."
            className="w-full bg-card border border-border rounded-full pl-10 pr-10 py-2.5 text-xs font-medium outline-none focus:border-primary transition-all placeholder-muted-foreground"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <XIcon className="w-3 h-3" />
            </button>
          )}
        </div>

        {activeTab === "scanner" && (
          <div className="flex items-center gap-4">
            <div className="text-right hidden lg:block">
              <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">
                Next Network Scan
              </p>
              <p className="text-[10px] font-mono font-black text-primary">
                00:{countdown.toString().padStart(2, "0")}
              </p>
            </div>
            <button
              onClick={onScan}
              disabled={isScanning || isCoolingDown}
              className={cn(
                "flex items-center gap-3 px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-50 active:scale-95 shadow-lg relative overflow-hidden",
                isCoolingDown
                  ? "bg-destructive text-destructive-foreground"
                  : "bg-foreground text-background hover:bg-primary hover:text-primary-foreground"
              )}
            >
              {isCoolingDown ? (
                <>
                  <XIcon className="w-3 h-3" />
                  COOLDOWN {cooldownTime}s
                </>
              ) : (
                <>
                  <RefreshIcon
                    className={cn("w-3 h-3", isScanning && "animate-spin")}
                  />
                  {isScanning ? "HUNTING..." : "SCAN ALPHA"}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
