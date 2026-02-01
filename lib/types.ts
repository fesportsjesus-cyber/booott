export interface Post {
  id: string
  content: string
  sourceType: "article" | "tweet" | "thought" | "form"
  sourceUrl?: string
  imageUrl?: string
  isGeneratingImage?: boolean
  timestamp: number
  status: "draft" | "published" | "scheduled"
}

export interface XConnection {
  username: string
  handle: string
  profileImageUrl?: string
  isConnected: boolean
  lastSync: number
  credentials?: {
    apiKey?: string
    apiSecret?: string
    bearerToken?: string
    accessToken?: string
    accessSecret?: string
  }
}

export interface LiveSignal {
  id: string
  author: string
  handle: string
  content: string
  category: "Following" | "For You" | "Crypto Alpha" | "Trending"
  timestamp: number
  reach: number
  sourceUrl?: string
  isNew?: boolean
  isThread?: boolean
  timeLabel?: string
}

export type SignalCategory = "Following" | "For You" | "Crypto Alpha" | "Trending"
export type TabType = "dashboard" | "scanner" | "connections"
