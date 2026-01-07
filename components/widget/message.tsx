"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Message as MessageType } from "@/types"
import { Bot } from "lucide-react"

interface MessageProps {
  message: MessageType
  onQuickReply?: (value: string, label: string) => void
  primaryColor?: string
}

export function Message({ message, onQuickReply, primaryColor = '#2563eb' }: MessageProps) {
  const isBot = message.role === "bot"

  return (
    <div
      className={cn(
        "flex mb-4 animate-slide-up",
        isBot ? "justify-start" : "justify-end"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-lg p-3",
          isBot
            ? "bg-gray-100 text-gray-900"
            : "text-white"
        )}
        style={!isBot ? { backgroundColor: primaryColor } : undefined}
      >
        {isBot && (
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: primaryColor }}
            >
              <Bot className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-medium text-gray-600">
              Assistente
            </span>
          </div>
        )}

        <p className="text-sm whitespace-pre-wrap leading-relaxed">
          {message.text}
        </p>

        {message.quickReplies && message.quickReplies.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-3">
            {message.quickReplies.map((reply, idx) => (
              <button
                key={idx}
                onClick={() => onQuickReply?.(reply.value, reply.label)}
                className="text-xs px-3 py-2 border rounded-lg text-center bg-white text-gray-900 hover:opacity-80 transition-colors font-medium"
                style={{ borderColor: `${primaryColor}40` }}
              >
                {reply.label}
              </button>
            ))}
          </div>
        )}

        <p className={cn("text-xs mt-2", isBot ? "text-gray-500" : "text-white/70")}>
          {new Date(message.timestamp).toLocaleTimeString("it-IT", {
            hour: "2-digit",
            minute: "2-digit"
          })}
        </p>
      </div>
    </div>
  )
}
