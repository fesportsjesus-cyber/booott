import type { LiveSignal, SignalCategory } from "@/lib/types"

// Generate mock signals for demonstration
export function generateMockSignals(category: SignalCategory, handle?: string): LiveSignal[] {
  const mockSignals: Record<SignalCategory, LiveSignal[]> = {
    Following: [
      {
        id: `following-${Date.now()}-1`,
        author: "Elon Musk",
        handle: "elonmusk",
        content: "The future of AI is both exciting and concerning. We need to ensure it benefits humanity while managing the risks. What do you think?",
        category: "Following",
        timestamp: Date.now(),
        reach: 15000000,
        timeLabel: "2m",
        isNew: true,
      },
      {
        id: `following-${Date.now()}-2`,
        author: "Naval",
        handle: "naval",
        content: "Wealth is having assets that earn while you sleep. Build systems, not just skills.",
        category: "Following",
        timestamp: Date.now() - 300000,
        reach: 500000,
        timeLabel: "5m",
      },
    ],
    "For You": [
      {
        id: `foryou-${Date.now()}-1`,
        author: "Paul Graham",
        handle: "paulg",
        content: "The best founders are relentlessly resourceful. They find a way when there seems to be no way.",
        category: "For You",
        timestamp: Date.now(),
        reach: 800000,
        timeLabel: "1m",
        isNew: true,
      },
      {
        id: `foryou-${Date.now()}-2`,
        author: "Sahil Lavingia",
        handle: "shl",
        content: "The best time to start was yesterday. The second best time is now. Stop planning, start doing.",
        category: "For You",
        timestamp: Date.now() - 600000,
        reach: 200000,
        timeLabel: "10m",
      },
    ],
    "Crypto Alpha": [
      {
        id: `crypto-${Date.now()}-1`,
        author: "Cobie",
        handle: "coaborner",
        content: "Thread incoming on the latest DeFi protocol launch. This could be massive.",
        category: "Crypto Alpha",
        timestamp: Date.now(),
        reach: 300000,
        timeLabel: "30s",
        isThread: true,
        isNew: true,
      },
      {
        id: `crypto-${Date.now()}-2`,
        author: "Hsaka",
        handle: "HsakaTrades",
        content: "Market structure looking bullish. Key levels to watch: support at 42k, resistance at 48k. Let's see how this plays out.",
        category: "Crypto Alpha",
        timestamp: Date.now() - 180000,
        reach: 150000,
        timeLabel: "3m",
      },
    ],
    Trending: [
      {
        id: `trending-${Date.now()}-1`,
        author: "Reuters",
        handle: "Reuters",
        content: "BREAKING: Major policy announcement expected tomorrow. Markets watching closely for potential impact on tech sector.",
        category: "Trending",
        timestamp: Date.now(),
        reach: 5000000,
        timeLabel: "JUST IN",
        isNew: true,
      },
      {
        id: `trending-${Date.now()}-2`,
        author: "WSJ",
        handle: "WSJ",
        content: "Global markets rally as economic indicators show stronger than expected growth. Analysts remain cautiously optimistic.",
        category: "Trending",
        timestamp: Date.now() - 900000,
        reach: 2000000,
        timeLabel: "15m",
      },
    ],
  }

  return mockSignals[category] || []
}

// Generate post variations
export function generatePostVariations(content: string, source: string): string[] {
  const styles = [
    "Professional and insightful",
    "Casual and engaging",
    "Provocative thought leader",
  ]

  // In production, this would call an AI API
  // For now, return variations based on the content
  return styles.map((style, index) => {
    const baseContent = content.slice(0, 200)
    switch (index) {
      case 0:
        return `Key insight from ${source}: ${baseContent}... What are your thoughts on this development?`
      case 1:
        return `Just came across this gem - ${baseContent}... This hits different.`
      case 2:
        return `Hot take: ${baseContent}... Most people aren't ready for this conversation.`
      default:
        return content
    }
  })
}
