"use client"

import { useState } from "react"
import { CopyIcon, TrashIcon, UserIcon } from "@/components/icons"
import type { Post } from "@/lib/types"
import { cn } from "@/lib/utils"

interface PostCardProps {
  post: Post
  userHandle?: string
  userProfileUrl?: string
  onDelete: (id: string) => void
  onUpdate: (post: Post) => void
}

export function PostCard({
  post,
  userHandle,
  userProfileUrl,
  onDelete,
  onUpdate,
}: PostCardProps) {
  const [copied, setCopied] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(post.content)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(post.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = () => {
    onUpdate({ ...post, content: editContent })
    setIsEditing(false)
  }

  const charCount = post.content.length
  const isOverLimit = charCount > 280

  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-xl group hover:border-primary/30 transition-all">
      <div className="flex gap-4">
        <div className="flex-none">
          <div
            className={cn(
              "w-12 h-12 rounded-full overflow-hidden flex items-center justify-center",
              userProfileUrl ? "bg-primary" : "bg-secondary"
            )}
          >
            {userProfileUrl ? (
              <img
                src={userProfileUrl}
                alt={userHandle || "User"}
                className="w-full h-full object-cover"
              />
            ) : (
              <UserIcon className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-black text-sm">
              {userHandle ? userHandle.charAt(0).toUpperCase() + userHandle.slice(1) : "Guest"}
            </span>
            <span className="text-muted-foreground text-xs font-mono">
              @{userHandle || "guest"}
            </span>
            <span className="text-muted-foreground text-xs">
              {new Date(post.timestamp).toLocaleDateString()}
            </span>
          </div>

          {isEditing ? (
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full bg-secondary/50 border border-border rounded-xl p-4 text-sm resize-none min-h-[100px] focus:outline-none focus:border-primary"
              autoFocus
            />
          ) : (
            <p
              className="text-foreground text-[15px] leading-relaxed whitespace-pre-wrap cursor-pointer hover:bg-secondary/30 rounded-lg p-2 -m-2 transition-colors"
              onClick={() => setIsEditing(true)}
            >
              {post.content}
            </p>
          )}

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center gap-4">
              <span
                className={cn(
                  "text-[10px] font-black uppercase tracking-widest",
                  isOverLimit ? "text-destructive" : "text-muted-foreground"
                )}
              >
                {charCount}/280
              </span>
              <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest px-2 py-1 bg-primary/10 rounded-full">
                {post.status}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setEditContent(post.content)
                    }}
                    className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-colors"
                  >
                    Save
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-xl hover:bg-secondary transition-colors group/btn"
                    title="Copy to clipboard"
                  >
                    <CopyIcon className={cn(
                      "w-4 h-4 transition-colors",
                      copied ? "text-accent" : "text-muted-foreground group-hover/btn:text-foreground"
                    )} />
                  </button>
                  <button
                    onClick={() => onDelete(post.id)}
                    className="p-2 rounded-xl hover:bg-destructive/10 transition-colors group/btn"
                    title="Delete post"
                  >
                    <TrashIcon className="w-4 h-4 text-muted-foreground group-hover/btn:text-destructive transition-colors" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
