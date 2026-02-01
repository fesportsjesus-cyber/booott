"use client"

import { useState } from "react"
import { LinkIcon, CheckIcon, RefreshIcon, UserIcon } from "@/components/icons"
import type { XConnection } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ConnectionsTabProps {
  xConnection: XConnection
  setXConnection: (fn: (prev: XConnection) => XConnection) => void
  isConnecting: boolean
  onConnect: () => void
}

export function ConnectionsTab({
  xConnection,
  setXConnection,
  isConnecting,
  onConnect,
}: ConnectionsTabProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const hasAllKeys =
    xConnection.credentials?.apiKey &&
    xConnection.credentials?.apiSecret &&
    xConnection.credentials?.accessToken &&
    xConnection.credentials?.accessSecret

  return (
    <div className="max-w-3xl mx-auto py-12">
      <div className="bg-card border border-border rounded-[48px] p-12 shadow-3xl flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        <div
          className={cn(
            "w-24 h-24 rounded-[32px] mb-8 flex items-center justify-center relative shadow-inner",
            xConnection.isConnected
              ? "bg-primary/10 text-primary"
              : "bg-secondary text-muted-foreground"
          )}
        >
          {xConnection.isConnected && xConnection.profileImageUrl ? (
            <img
              src={xConnection.profileImageUrl}
              alt={xConnection.handle}
              className="w-full h-full object-cover rounded-[32px]"
            />
          ) : (
            <LinkIcon className="w-10 h-10" />
          )}

          {hasAllKeys && (
            <div className="absolute -bottom-2 -right-2 bg-accent text-accent-foreground rounded-full p-2 shadow-lg ring-4 ring-card">
              <CheckIcon className="w-4 h-4 stroke-[4px]" />
            </div>
          )}
        </div>

        <h3 className="text-3xl font-black mb-4 tracking-tighter">
          Identity Authorization
        </h3>
        <p className="text-muted-foreground mb-10 text-sm max-w-md font-medium">
          Store your keys to enable autonomous 24/7 alpha hunting.
        </p>

        <div className="w-full space-y-6 text-left">
          <div>
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block ml-1">
              X User Handle
            </label>
            <input
              type="text"
              value={xConnection.handle}
              onChange={(e) =>
                setXConnection((prev) => ({ ...prev, handle: e.target.value }))
              }
              placeholder="@yourhandle"
              className="w-full bg-background border border-border rounded-2xl px-6 py-4 outline-none focus:border-primary transition-all font-mono"
            />
          </div>

          <div className="bg-secondary/40 rounded-3xl border border-border p-6 space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                Security Secrets
              </span>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-primary text-[10px] font-black hover:underline uppercase tracking-tighter"
              >
                {showAdvanced ? "Seal" : "Configure"}
              </button>
            </div>

            {showAdvanced && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <input
                  type="text"
                  value={xConnection.credentials?.apiKey || ""}
                  onChange={(e) =>
                    setXConnection((prev) => ({
                      ...prev,
                      credentials: {
                        ...prev.credentials,
                        apiKey: e.target.value,
                      },
                    }))
                  }
                  placeholder="Consumer Key"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-primary transition-all"
                />
                <input
                  type="password"
                  value={xConnection.credentials?.apiSecret || ""}
                  onChange={(e) =>
                    setXConnection((prev) => ({
                      ...prev,
                      credentials: {
                        ...prev.credentials,
                        apiSecret: e.target.value,
                      },
                    }))
                  }
                  placeholder="Consumer Secret"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-primary transition-all"
                />
                <input
                  type="text"
                  value={xConnection.credentials?.accessToken || ""}
                  onChange={(e) =>
                    setXConnection((prev) => ({
                      ...prev,
                      credentials: {
                        ...prev.credentials,
                        accessToken: e.target.value,
                      },
                    }))
                  }
                  placeholder="Access Token"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-primary transition-all"
                />
                <input
                  type="password"
                  value={xConnection.credentials?.accessSecret || ""}
                  onChange={(e) =>
                    setXConnection((prev) => ({
                      ...prev,
                      credentials: {
                        ...prev.credentials,
                        accessSecret: e.target.value,
                      },
                    }))
                  }
                  placeholder="Access Token Secret"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-primary transition-all"
                />
                <input
                  type="password"
                  value={xConnection.credentials?.bearerToken || ""}
                  onChange={(e) =>
                    setXConnection((prev) => ({
                      ...prev,
                      credentials: {
                        ...prev.credentials,
                        bearerToken: e.target.value,
                      },
                    }))
                  }
                  placeholder="Bearer Token"
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-primary transition-all"
                />
              </div>
            )}
          </div>

          <button
            onClick={onConnect}
            disabled={isConnecting || !xConnection.handle.trim()}
            className="w-full bg-foreground text-background font-black py-5 rounded-2xl hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? (
              <RefreshIcon className="w-5 h-5 animate-spin" />
            ) : (
              <CheckIcon className="w-5 h-5" />
            )}
            {xConnection.isConnected
              ? "REFRESH BRIDGE"
              : "ESTABLISH NETWORK BRIDGE"}
          </button>
        </div>
      </div>
    </div>
  )
}
