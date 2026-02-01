"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { DashboardTab } from "@/components/dashboard-tab"
import { ScannerTab } from "@/components/scanner-tab"
import { ConnectionsTab } from "@/components/connections-tab"
import { XIcon } from "@/components/icons"
import { generateMockSignals, generatePostVariations } from "@/lib/ai-service"
import type { Post, XConnection, LiveSignal, TabType, SignalCategory } from "@/lib/types"

export default function GhostApp() {
  const [posts, setPosts] = useState<Post[]>([])
  const [liveSignals, setLiveSignals] = useState<LiveSignal[]>([])
  const [activeSignalTab, setActiveSignalTab] = useState<SignalCategory>("Following")
  const [searchTerm, setSearchTerm] = useState("")
  const [xConnection, setXConnection] = useState<XConnection>({
    username: "",
    handle: "",
    isConnected: false,
    lastSync: 0,
    credentials: {
      apiKey: "",
      apiSecret: "",
      bearerToken: "",
      accessToken: "",
      accessSecret: "",
    },
  })

  const [isScanning, setIsScanning] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [inputText, setInputText] = useState("")
  const [activeTab, setActiveTab] = useState<TabType>("dashboard")
  const [countdown, setCountdown] = useState(60)
  const [errorStatus, setErrorStatus] = useState<string | null>(null)
  const [isCoolingDown, setIsCoolingDown] = useState(false)
  const [cooldownTime, setCooldownTime] = useState(0)

  const signalIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const cooldownIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Load saved data from localStorage
  useEffect(() => {
    const savedPosts = localStorage.getItem("x-bot-posts")
    const savedConn = localStorage.getItem("x-bot-connection")
    if (savedPosts) {
      try {
        setPosts(JSON.parse(savedPosts))
      } catch (e) {
        console.error("Failed to parse saved posts", e)
      }
    }
    if (savedConn) {
      try {
        setXConnection((prev) => ({ ...prev, ...JSON.parse(savedConn) }))
      } catch (e) {
        console.error("Failed to parse saved connection", e)
      }
    }
  }, [])

  const triggerCooldown = useCallback(() => {
    setIsCoolingDown(true)
    setCooldownTime(30)
    setErrorStatus("API Rate Limit Hit. Cool-down active.")
    if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current)
    cooldownIntervalRef.current = setInterval(() => {
      setCooldownTime((prev) => {
        if (prev <= 1) {
          if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current)
          setIsCoolingDown(false)
          setErrorStatus(null)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  const pollSignals = useCallback(
    async (isManual = false) => {
      if (isCoolingDown) return
      setIsScanning(true)
      setErrorStatus(null)
      setCountdown(60)
      if (isManual) setLiveSignals([])

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const newBatch = generateMockSignals(
        activeSignalTab,
        xConnection.isConnected ? xConnection.handle : undefined
      )
      setIsScanning(false)

      if (newBatch && newBatch.length > 0) {
        setLiveSignals((prev) => {
          const existingIds = new Set(prev.map((p) => p.id))
          const uniqueNew = newBatch
            .filter((s) => !existingIds.has(s.id))
            .map((s) => ({
              ...s,
              timestamp: Date.now(),
              isNew: true,
            }))
          return [...uniqueNew, ...prev].slice(0, 50)
        })
        setTimeout(
          () => setLiveSignals((prev) => prev.map((s) => ({ ...s, isNew: false }))),
          4000
        )
        setXConnection((prev) => ({ ...prev, lastSync: Date.now() }))
      }
    },
    [xConnection.handle, xConnection.isConnected, isCoolingDown, activeSignalTab]
  )

  // Auto-poll signals when on scanner tab
  useEffect(() => {
    if (activeTab === "scanner") {
      pollSignals()
      signalIntervalRef.current = setInterval(() => pollSignals(), 60000)
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => (prev <= 1 ? 60 : prev - 1))
      }, 1000)
    } else {
      if (signalIntervalRef.current) clearInterval(signalIntervalRef.current)
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
    }
    return () => {
      if (signalIntervalRef.current) clearInterval(signalIntervalRef.current)
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
    }
  }, [activeTab, pollSignals])

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem("x-bot-posts", JSON.stringify(posts))
  }, [posts])

  useEffect(() => {
    localStorage.setItem("x-bot-connection", JSON.stringify(xConnection))
  }, [xConnection])

  const handleConnectX = () => {
    if (!xConnection.handle.trim()) return
    setIsConnecting(true)
    setTimeout(() => {
      setXConnection((prev) => ({
        ...prev,
        username: prev.handle.charAt(0).toUpperCase() + prev.handle.slice(1),
        profileImageUrl: `https://unavatar.io/twitter/${prev.handle.toLowerCase()}`,
        isConnected: true,
        lastSync: Date.now(),
      }))
      setIsConnecting(false)
      setActiveTab("scanner")
    }, 1500)
  }

  const handleGenerate = async (contentToProcess: string, source: string) => {
    if (!contentToProcess.trim() || isCoolingDown) return
    setIsGenerating(true)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const variations = generatePostVariations(contentToProcess, source)
    const newPosts: Post[] = variations.map((content) => ({
      id: Math.random().toString(36).substring(2, 11),
      content,
      sourceType: "article" as const,
      timestamp: Date.now(),
      status: "draft" as const,
    }))

    setPosts((prev) => [...newPosts, ...prev])
    setIsGenerating(false)
    setInputText("")
    setActiveTab("dashboard")
  }

  const filteredPosts = posts
    .sort((a, b) => b.timestamp - a.timestamp)
    .filter((p) => {
      if (!searchTerm) return true
      return p.content.toLowerCase().includes(searchTerm.toLowerCase())
    })

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground selection:bg-primary/40">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        xConnection={xConnection}
        setSearchTerm={setSearchTerm}
      />

      <main className="flex-1 bg-background min-h-screen flex flex-col">
        <Header
          activeTab={activeTab}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          countdown={countdown}
          isScanning={isScanning}
          isCoolingDown={isCoolingDown}
          cooldownTime={cooldownTime}
          onScan={() => pollSignals(true)}
        />

        <div className="max-w-5xl mx-auto p-8 w-full flex-1">
          {errorStatus && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl flex items-center justify-between animate-pulse">
              <span className="text-[11px] font-black text-destructive uppercase tracking-widest flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-destructive" />
                {errorStatus}
              </span>
              {isCoolingDown && (
                <span className="text-[10px] font-black text-destructive-foreground uppercase bg-destructive px-3 py-1 rounded-full">
                  UNLOCKING IN {cooldownTime}S
                </span>
              )}
            </div>
          )}

          {activeTab === "dashboard" && (
            <DashboardTab
              posts={filteredPosts}
              xConnection={xConnection}
              inputText={inputText}
              setInputText={setInputText}
              isGenerating={isGenerating}
              isCoolingDown={isCoolingDown}
              onGenerate={handleGenerate}
              onDeletePost={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))}
              onUpdatePost={(updated) =>
                setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
              }
            />
          )}

          {activeTab === "scanner" && (
            <ScannerTab
              signals={liveSignals}
              activeSignalTab={activeSignalTab}
              setActiveSignalTab={setActiveSignalTab}
              xConnection={xConnection}
              searchTerm={searchTerm}
              isCoolingDown={isCoolingDown}
              onGenerate={handleGenerate}
            />
          )}

          {activeTab === "connections" && (
            <ConnectionsTab
              xConnection={xConnection}
              setXConnection={setXConnection}
              isConnecting={isConnecting}
              onConnect={handleConnectX}
            />
          )}
        </div>
      </main>
    </div>
  )
}
