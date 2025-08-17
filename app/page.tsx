"use client"

import type React from "react"
import { Settings } from "lucide-react" // Import the Settings icon

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Send,
  Paperclip,
  Bot,
  User,
  Sparkles,
  Code,
  FileText,
  ImageIcon,
  Zap,
  Plus,
  Copy,
  Download,
  Play,
  BarChart3,
  FileCode,
  Palette,
  Search,
  Moon,
  Sun,
  ImportIcon as Export,
  Bookmark,
  Heart,
  ThumbsUp,
  X,
} from "lucide-react"

interface Artifact {
  id: string
  type: "code" | "component" | "chart" | "document" | "image"
  title: string
  content: string
  language?: string
  framework?: string
  data?: any
}

interface Message {
  id: string
  content: string
  sender: "user" | "assistant"
  timestamp: Date
  type?: "text" | "tool" | "artifact"
  toolName?: string
  artifactType?: string
  artifacts?: Artifact[]
  bookmarked?: boolean
  reactions?: { type: string; count: number }[]
}

interface Tool {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  active: boolean
}

const CodeArtifact: React.FC<{ artifact: Artifact }> = ({ artifact }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(artifact.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between bg-muted px-4 py-2">
        <div className="flex items-center gap-2">
          <FileCode className="h-4 w-4" />
          <span className="text-sm font-medium">{artifact.title}</span>
          {artifact.language && (
            <Badge variant="secondary" className="text-xs">
              {artifact.language}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            {copied ? <span className="text-xs">Copied!</span> : <Copy className="h-3 w-3" />}
          </Button>
          <Button variant="ghost" size="sm">
            <Download className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <pre className="p-4 text-sm bg-card overflow-x-auto">
        <code>{artifact.content}</code>
      </pre>
    </div>
  )
}

const ComponentArtifact: React.FC<{ artifact: Artifact }> = ({ artifact }) => (
  <div className="border border-border rounded-lg overflow-hidden">
    <div className="flex items-center justify-between bg-muted px-4 py-2">
      <div className="flex items-center gap-2">
        <Palette className="h-4 w-4" />
        <span className="text-sm font-medium">{artifact.title}</span>
        {artifact.framework && (
          <Badge variant="secondary" className="text-xs">
            {artifact.framework}
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm">
          <Play className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="sm">
          <Copy className="h-3 w-3" />
        </Button>
      </div>
    </div>
    <div className="p-4 bg-card">
      <div className="border border-dashed border-border rounded-lg p-8 text-center">
        <div className="text-muted-foreground">
          <Palette className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">Interactive Component Preview</p>
          <p className="text-xs mt-1">{artifact.title}</p>
        </div>
      </div>
    </div>
  </div>
)

const ChartArtifact: React.FC<{ artifact: Artifact }> = ({ artifact }) => (
  <div className="border border-border rounded-lg overflow-hidden">
    <div className="flex items-center justify-between bg-muted px-4 py-2">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4" />
        <span className="text-sm font-medium">{artifact.title}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm">
          <Download className="h-3 w-3" />
        </Button>
      </div>
    </div>
    <div className="p-4 bg-card">
      <div className="border border-dashed border-border rounded-lg p-8 text-center">
        <div className="text-muted-foreground">
          <BarChart3 className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">Chart Visualization</p>
          <p className="text-xs mt-1">{artifact.title}</p>
        </div>
      </div>
    </div>
  </div>
)

const DocumentArtifact: React.FC<{ artifact: Artifact }> = ({ artifact }) => (
  <div className="border border-border rounded-lg overflow-hidden">
    <div className="flex items-center justify-between bg-muted px-4 py-2">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4" />
        <span className="text-sm font-medium">{artifact.title}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm">
          <Copy className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="sm">
          <Download className="h-3 w-3" />
        </Button>
      </div>
    </div>
    <div className="p-4 bg-card">
      <div className="prose prose-sm max-w-none">
        <div className="whitespace-pre-wrap text-sm leading-relaxed">{artifact.content}</div>
      </div>
    </div>
  </div>
)

const ArtifactDisplay: React.FC<{ artifacts: Artifact[] }> = ({ artifacts }) => {
  if (artifacts.length === 0) return null

  if (artifacts.length === 1) {
    const artifact = artifacts[0]
    switch (artifact.type) {
      case "code":
        return <CodeArtifact artifact={artifact} />
      case "component":
        return <ComponentArtifact artifact={artifact} />
      case "chart":
        return <ChartArtifact artifact={artifact} />
      case "document":
        return <DocumentArtifact artifact={artifact} />
      default:
        return null
    }
  }

  return (
    <Tabs defaultValue={artifacts[0].id} className="w-full">
      <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {artifacts.map((artifact) => (
          <TabsTrigger key={artifact.id} value={artifact.id} className="text-xs">
            {artifact.title}
          </TabsTrigger>
        ))}
      </TabsList>
      {artifacts.map((artifact) => (
        <TabsContent key={artifact.id} value={artifact.id} className="mt-4">
          {artifact.type === "code" && <CodeArtifact artifact={artifact} />}
          {artifact.type === "component" && <ComponentArtifact artifact={artifact} />}
          {artifact.type === "chart" && <ChartArtifact artifact={artifact} />}
          {artifact.type === "document" && <DocumentArtifact artifact={artifact} />}
        </TabsContent>
      ))}
    </Tabs>
  )
}

const SettingsDialog: React.FC<{
  settings: any
  onSettingsChange: (settings: any) => void
}> = ({ settings, onSettingsChange }) => {
  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Settings</DialogTitle>
      </DialogHeader>
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="theme">Theme</Label>
            <div className="flex items-center gap-2">
              <Button
                variant={settings.theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => onSettingsChange({ ...settings, theme: "light" })}
              >
                <Sun className="h-4 w-4" />
              </Button>
              <Button
                variant={settings.theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => onSettingsChange({ ...settings, theme: "dark" })}
              >
                <Moon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="auto-scroll">Auto-scroll to new messages</Label>
            <Switch
              id="auto-scroll"
              checked={settings.autoScroll}
              onCheckedChange={(checked) => onSettingsChange({ ...settings, autoScroll: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="timestamps">Show timestamps</Label>
            <Switch
              id="timestamps"
              checked={settings.showTimestamps}
              onCheckedChange={(checked) => onSettingsChange({ ...settings, showTimestamps: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="sounds">Enable notification sounds</Label>
            <Switch
              id="sounds"
              checked={settings.enableSounds}
              onCheckedChange={(checked) => onSettingsChange({ ...settings, enableSounds: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="compact">Compact mode</Label>
            <Switch
              id="compact"
              checked={settings.compactMode}
              onCheckedChange={(checked) => onSettingsChange({ ...settings, compactMode: checked })}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Keyboard Shortcuts</h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Send message</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Enter</kbd>
            </div>
            <div className="flex justify-between">
              <span>New line</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Shift + Enter</kbd>
            </div>
            <div className="flex justify-between">
              <span>Search messages</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl + F</kbd>
            </div>
            <div className="flex justify-between">
              <span>Export conversation</span>
              <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl + E</kbd>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  )
}

const SearchBar: React.FC<{
  searchQuery: string
  onSearchChange: (query: string) => void
  onClose: () => void
}> = ({ searchQuery, onSearchChange, onClose }) => {
  return (
    <div className="border-b border-border bg-card p-4">
      <div className="max-w-4xl mx-auto flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search messages..."
            className="pl-10"
            autoFocus
          />
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default function ChatInterface() {
  const [messages, setMessages] = useState([
    {
      id: "1",
      content:
        "Hello! I'm your advanced AI assistant. I can help you with code generation, file analysis, web searches, and much more. What would you like to work on today?",
      sender: "assistant",
      timestamp: new Date(),
      type: "text",
    },
    {
      id: "2",
      content:
        "Here's an example of what I can create for you - interactive artifacts that showcase code, components, charts, and documents:",
      sender: "assistant",
      timestamp: new Date(),
      type: "artifact",
      artifacts: [
        {
          id: "sample-code",
          type: "code",
          title: "React Component",
          content: `import React, { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function Counter() {
  const [count, setCount] = useState(0)
  
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Counter: {count}</h2>
      <div className="space-x-2">
        <Button onClick={() => setCount(count + 1)}>
          Increment
        </Button>
        <Button variant="outline" onClick={() => setCount(0)}>
          Reset
        </Button>
      </div>
    </div>
  )
}`,
          language: "tsx",
          framework: "React",
        },
        {
          id: "sample-chart",
          type: "chart",
          title: "Sales Dashboard",
          data: { type: "bar", values: [10, 20, 30, 40] },
        },
      ],
    },
  ])

  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [settings, setSettings] = useState({
    theme: "light",
    autoScroll: true,
    showTimestamps: true,
    enableSounds: false,
    compactMode: false,
  })

  const fileInputRef = useRef(null)
  const messagesEndRef = useRef(null)

  const [availableTools] = useState([
    {
      id: "code-gen",
      name: "Code Generation",
      description: "Generate and edit code",
      icon: <Code className="h-4 w-4" />,
      active: true,
    },
    {
      id: "web-search",
      name: "Web Search",
      description: "Search the web for information",
      icon: <Zap className="h-4 w-4" />,
      active: true,
    },
    {
      id: "file-analysis",
      name: "File Analysis",
      description: "Analyze uploaded files",
      icon: <FileText className="h-4 w-4" />,
      active: true,
    },
    {
      id: "image-gen",
      name: "Image Generation",
      description: "Create and edit images",
      icon: <ImageIcon className="h-4 w-4" />,
      active: false,
    },
  ])

  const scrollToBottom = useCallback(() => {
    if (settings.autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [settings.autoScroll])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "f":
            e.preventDefault()
            setShowSearch(true)
            break
          case "e":
            e.preventDefault()
            exportConversation()
            break
        }
      }
      if (e.key === "Escape" && showSearch) {
        setShowSearch(false)
        setSearchQuery("")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [showSearch])

  const exportConversation = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      messages: messages.map((msg) => ({
        content: msg.content,
        sender: msg.sender,
        timestamp: msg.timestamp.toISOString(),
        type: msg.type,
        artifacts: msg.artifacts?.map((artifact) => ({
          title: artifact.title,
          type: artifact.type,
          content: artifact.content,
        })),
      })),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `chat-export-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const filteredMessages = searchQuery
    ? messages.filter((message) => message.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages

  const toggleBookmark = (messageId) => {
    setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, bookmarked: !msg.bookmarked } : msg)))
  }

  const addReaction = (messageId, reactionType) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          const reactions = msg.reactions || []
          const existingReaction = reactions.find((r) => r.type === reactionType)
          if (existingReaction) {
            return {
              ...msg,
              reactions: reactions.map((r) => (r.type === reactionType ? { ...r, count: r.count + 1 } : r)),
            }
          } else {
            return {
              ...msg,
              reactions: [...reactions, { type: reactionType, count: 1 }],
            }
          }
        }
        return msg
      }),
    )
  }

  const generateSampleArtifacts = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase()

    if (lowerMessage.includes("code") || lowerMessage.includes("component")) {
      return [
        {
          id: `artifact-${Date.now()}`,
          type: "code",
          title: "Generated Component",
          content: `// Generated based on your request
import React from 'react'

export default function GeneratedComponent() {
  return (
    <div className="p-6 bg-card rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Your Component</h2>
      <p className="text-muted-foreground">
        This component was generated based on your request: "${userMessage}"
      </p>
    </div>
  )
}`,
          language: "tsx",
          framework: "React",
        },
      ]
    }

    if (lowerMessage.includes("chart") || lowerMessage.includes("graph")) {
      return [
        {
          id: `artifact-${Date.now()}`,
          type: "chart",
          title: "Data Visualization",
          data: { type: "line", values: [5, 10, 15, 20, 25] },
        },
      ]
    }

    if (lowerMessage.includes("document") || lowerMessage.includes("write")) {
      return [
        {
          id: `artifact-${Date.now()}`,
          type: "document",
          title: "Generated Document",
          content: `# Generated Document

Based on your request: "${userMessage}"

## Overview
This document was automatically generated to address your needs.

## Key Points
- Comprehensive analysis
- Detailed explanations
- Actionable insights

## Conclusion
The generated content provides a solid foundation for your project.`,
        },
      ]
    }

    return []
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() && selectedFiles.length === 0) return

    const newMessage = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
      type: "text",
    }

    setMessages((prev) => [...prev, newMessage])
    const currentInput = inputValue
    setInputValue("")
    setIsTyping(true)

    // Simulate AI response with artifact generation
    setTimeout(() => {
      const artifacts = generateSampleArtifacts(currentInput)
      const hasArtifacts = artifacts.length > 0

      const responses = hasArtifacts
        ? [
            "I've generated the requested artifact for you. You can view, copy, and download the content using the controls above.",
            "Here's what I've created based on your request. The artifact includes all the functionality you asked for.",
            "Perfect! I've generated the artifact with the specifications you provided. Feel free to modify or extend it as needed.",
          ]
        : [
            "I understand you'd like me to help with that. Let me process your request and generate the appropriate response.",
            "Great question! I'll use my available tools to provide you with a comprehensive answer.",
            "I can help you with that. Let me analyze your request and create the necessary artifacts.",
          ]

      const aiResponse = {
        id: (Date.now() + 1).toString(),
        content: responses[Math.floor(Math.random() * responses.length)],
        sender: "assistant",
        timestamp: new Date(),
        type: hasArtifacts ? "artifact" : Math.random() > 0.7 ? "tool" : "text",
        toolName: Math.random() > 0.7 ? "Code Generation" : undefined,
        artifacts: artifacts,
      }

      setMessages((prev) => [...prev, aiResponse])
      setIsTyping(false)
    }, 1500)

    setSelectedFiles([])
  }

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files || [])
    setSelectedFiles((prev) => [...prev, ...files])
  }

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className={`flex h-screen bg-background ${settings.theme === "dark" ? "dark" : ""}`}>
      {/* Sidebar */}
      <div className="w-80 border-r border-border bg-sidebar">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary rounded-lg">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-sidebar-foreground">AI Chat Pro</h1>
              <p className="text-sm text-muted-foreground">Advanced AI Assistant</p>
            </div>
          </div>

          <Separator className="mb-6" />

          <div className="space-y-4">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowSearch(true)} className="flex-1">
                <Search className="h-3 w-3 mr-2" />
                Search
              </Button>
              <Button variant="outline" size="sm" onClick={exportConversation}>
                <Export className="h-3 w-3" />
              </Button>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-sidebar-foreground mb-3">Active Tools</h3>
              <div className="space-y-2">
                {availableTools
                  .filter((tool) => tool.active)
                  .map((tool) => (
                    <div key={tool.id} className="flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent">
                      {tool.icon}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-sidebar-accent-foreground">{tool.name}</p>
                        <p className="text-xs text-muted-foreground">{tool.description}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Active
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-semibold text-sidebar-foreground mb-3">Available Tools</h3>
              <div className="space-y-2">
                {availableTools
                  .filter((tool) => !tool.active)
                  .map((tool) => (
                    <div
                      key={tool.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-sidebar-border hover:bg-sidebar-accent/50 cursor-pointer transition-colors"
                    >
                      {tool.icon}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-sidebar-foreground">{tool.name}</p>
                        <p className="text-xs text-muted-foreground">{tool.description}</p>
                      </div>
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src="/ai-assistant-avatar.png" />
                <AvatarFallback>
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold text-card-foreground">AI Assistant</h2>
                <p className="text-sm text-muted-foreground">Online • Ready to help</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setShowSearch(true)}>
                <Search className="h-4 w-4" />
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <SettingsDialog settings={settings} onSettingsChange={setSettings} />
              </Dialog>
            </div>
          </div>
        </div>

        {showSearch && (
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClose={() => {
              setShowSearch(false)
              setSearchQuery("")
            }}
          />
        )}

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className={`space-y-4 max-w-4xl mx-auto ${settings.compactMode ? "space-y-2" : ""}`}>
            {filteredMessages.map((message) => (
              <div key={message.id} className="space-y-3">
                <div className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                  {message.sender === "assistant" && (
                    <Avatar className={settings.compactMode ? "h-6 w-6" : "h-8 w-8"}>
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div className={`max-w-[70%] ${message.sender === "user" ? "order-first" : ""} group`}>
                    <Card
                      className={`${
                        message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-card"
                      } ${message.bookmarked ? "ring-2 ring-yellow-400" : ""}`}
                    >
                      <CardContent className={settings.compactMode ? "p-3" : "p-4"}>
                        {message.type === "tool" && message.toolName && (
                          <div className="flex items-center gap-2 mb-2 text-sm opacity-75">
                            <Zap className="h-3 w-3" />
                            <span>Using {message.toolName}</span>
                          </div>
                        )}
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <div className="flex items-center justify-between mt-2">
                          {settings.showTimestamps && (
                            <p className="text-xs opacity-60">{message.timestamp.toLocaleTimeString()}</p>
                          )}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleBookmark(message.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Bookmark
                                className={`h-3 w-3 ${message.bookmarked ? "fill-current text-yellow-500" : ""}`}
                              />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <Heart className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => addReaction(message.id, "like")}>
                                  <ThumbsUp className="h-3 w-3 mr-2" />
                                  Like
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => addReaction(message.id, "heart")}>
                                  <Heart className="h-3 w-3 mr-2" />
                                  Love
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        {message.reactions && message.reactions.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {message.reactions.map((reaction) => (
                              <Badge key={reaction.type} variant="secondary" className="text-xs">
                                {reaction.type === "like" ? "👍" : "❤️"} {reaction.count}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {message.sender === "user" && (
                    <Avatar className={settings.compactMode ? "h-6 w-6" : "h-8 w-8"}>
                      <AvatarFallback className="bg-secondary text-secondary-foreground">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>

                {message.artifacts && message.artifacts.length > 0 && (
                  <div className="max-w-4xl mx-auto">
                    <ArtifactDisplay artifacts={message.artifacts} />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 justify-start">
                <Avatar className={settings.compactMode ? "h-6 w-6" : "h-8 w-8"}>
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <Card className="bg-card">
                  <CardContent className={settings.compactMode ? "p-3" : "p-4"}>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                        <div
                          className="w-2 h-2 bg-primary rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        />
                        <div
                          className="w-2 h-2 bg-primary rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">AI is thinking...</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* File Upload Area */}
        {selectedFiles.length > 0 && (
          <div className="border-t border-border bg-card p-4">
            <div className="max-w-4xl mx-auto">
              <h4 className="text-sm font-medium text-card-foreground mb-2">Attached Files</h4>
              <div className="flex flex-wrap gap-2">
                {selectedFiles.map((file, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-2">
                    <FileText className="h-3 w-3" />
                    <span className="text-xs">{file.name}</span>
                    <button onClick={() => removeFile(index)} className="ml-1 hover:text-destructive">
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-border bg-card p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message... (Shift+Enter for new line)"
                  className="min-h-[44px] max-h-32 resize-none"
                  rows={1}
                />
              </div>

              <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} className="hidden" />

              <Button variant="outline" size="icon" onClick={() => fileInputRef.current?.click()} className="h-11 w-11">
                <Paperclip className="h-4 w-4" />
              </Button>

              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() && selectedFiles.length === 0}
                className="h-11 px-6"
              >
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
