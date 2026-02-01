"use client"

import { ZapIcon, RefreshIcon, LinkIcon, XIcon, UserIcon } from "@/components/icons"
import type { TabType, XConnection } from "@/lib/types"
import { cn } from "@/lib/utils"

interface SidebarProps {
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
  xConnection: XConnection
  setSearchTerm: (term: string) => void
}

const navItems: { id: TabType; label: string; icon: typeof ZapIcon }[] = [
  { id: "dashboard", label: "Drafts", icon: ZapIcon },
  { id: "scanner", label: "Hyper-Feed", icon: RefreshIcon },
  { id: "connections", label: "Auth Vault", icon: LinkIcon },
]

export function Sidebar({
  activeTab,
  setActiveTab,
  xConnection,
  setSearchTerm,
}: SidebarProps) {
  return (
    <aside className="w-full md:w-72 bg-background border-b md:border-b-0 md:border-r border-border p-8 flex flex-col sticky top-0 md:h-screen z-20">
      <div className="flex items-center gap-4 mb-12">
        <div className="w-12 h-12 bg-foreground rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.15)]">
          <XIcon className="text-background w-7 h-7" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-2xl font-black tracking-tighter italic leading-none">
            GHOST
          </h1>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-1 h-1 rounded-full bg-accent animate-pulse" />
            <span className="text-[7px] font-black text-accent uppercase tracking-[0.4em]">
              ALPHA HUNTER active
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-3">
        {navItems.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id)
              setSearchTerm("")
            }}
            className={cn(
              "w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all",
              activeTab === tab.id
                ? "bg-primary/10 text-primary font-black shadow-[inset_0_0_20px_rgba(29,155,240,0.05)]"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-8 border-t border-border/50">
        <div className="bg-card/50 p-4 rounded-2xl border border-border flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center font-black",
              xConnection.isConnected
                ? "bg-primary shadow-lg shadow-primary/20"
                : "bg-secondary"
            )}
          >
            {xConnection.isConnected && xConnection.profileImageUrl ? (
              <img
                src={xConnection.profileImageUrl}
                alt={xConnection.handle}
                className="w-full h-full object-cover"
              />
            ) : (
              <UserIcon className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-black truncate">
              {xConnection.isConnected ? xConnection.username : "Guest"}
            </span>
            <span className="text-[9px] font-mono text-muted-foreground truncate uppercase">
              {xConnection.isConnected ? `@${xConnection.handle}` : "OFFLINE"}
            </span>
          </div>
        </div>
      </div>
    </aside>
  )
}
