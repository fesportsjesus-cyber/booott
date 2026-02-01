"use client"

import { ZapIcon, RefreshIcon, UserIcon } from "@/components/icons"
import { PostCard } from "@/components/post-card"
import type { Post, XConnection } from "@/lib/types"

interface DashboardTabProps {
  posts: Post[]
  xConnection: XConnection
  inputText: string
  setInputText: (text: string) => void
  isGenerating: boolean
  isCoolingDown: boolean
  onGenerate: (content: string, source: string) => void
  onDeletePost: (id: string) => void
  onUpdatePost: (post: Post) => void
}

export function DashboardTab({
  posts,
  xConnection,
  inputText,
  setInputText,
  isGenerating,
  isCoolingDown,
  onGenerate,
  onDeletePost,
  onUpdatePost,
}: DashboardTabProps) {
  return (
    <div className="space-y-12">
      <section className="bg-card rounded-[32px] p-8 border border-border shadow-2xl relative overflow-hidden group">
        <div className="flex items-start gap-6 mb-6">
          <div
            className={`w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center ${
              xConnection.isConnected ? "bg-primary" : "bg-secondary"
            }`}
          >
            {xConnection.isConnected && xConnection.profileImageUrl ? (
              <img
                src={xConnection.profileImageUrl}
                alt={xConnection.handle}
                className="w-full h-full object-cover"
              />
            ) : (
              <UserIcon className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste crypto alpha or news to rewrite..."
              className="w-full bg-transparent border-none focus:ring-0 text-xl font-medium resize-none placeholder-muted min-h-[120px] mt-2 outline-none"
            />
          </div>
        </div>
        <div className="flex justify-between items-center pt-6 border-t border-border/50">
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-accent" />
              Alpha Mode: Active
            </span>
          </div>
          <button
            disabled={isGenerating || !inputText.trim() || isCoolingDown}
            onClick={() => onGenerate(inputText, "Manual Signal")}
            className="bg-foreground text-background hover:bg-primary hover:text-primary-foreground disabled:opacity-20 font-black py-4 px-12 rounded-2xl transition-all flex items-center gap-3 shadow-xl active:scale-95"
          >
            {isGenerating ? (
              <RefreshIcon className="w-5 h-5 animate-spin" />
            ) : (
              <ZapIcon className="w-5 h-5 fill-current" />
            )}
            <span>{isGenerating ? "DECODING..." : "REWRITE SIGNAL"}</span>
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-8">
        {posts.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-border rounded-3xl">
            <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">
              No drafts match your filter
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              userHandle={xConnection.handle}
              userProfileUrl={xConnection.profileImageUrl}
              onDelete={onDeletePost}
              onUpdate={onUpdatePost}
            />
          ))
        )}
      </section>
    </div>
  )
}
