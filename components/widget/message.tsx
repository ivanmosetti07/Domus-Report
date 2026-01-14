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
          "max-w-[85%] rounded-lg",
          isBot
            ? "bg-gray-100 text-gray-900"
            : "text-white"
        )}
        style={{
          ...(!isBot ? { backgroundColor: primaryColor } : undefined),
          padding: '12px 14px'
        }}
      >
        {isBot && (
          <div className="flex items-center gap-2 mb-2">
            <div
              className="rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: primaryColor,
                width: '24px',
                height: '24px'
              }}
            >
              <Bot style={{ width: '14px', height: '14px', color: 'white' }} />
            </div>
            <span style={{ fontSize: '12px', fontWeight: 500 }} className="text-gray-600">
              Assistente
            </span>
          </div>
        )}

        <p style={{
          fontSize: '15px',
          lineHeight: '1.5',
          whiteSpace: 'pre-wrap'
        }}>
          {message.text}
        </p>

        {message.quickReplies && message.quickReplies.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-3">
            {message.quickReplies.map((reply, idx) => (
              <button
                key={idx}
                onClick={() => onQuickReply?.(reply.value, reply.label)}
                className="border rounded-lg text-center bg-white text-gray-900 hover:opacity-80 transition-colors font-medium"
                style={{
                  borderColor: `${primaryColor}40`,
                  padding: '10px 12px',
                  fontSize: '14px',
                  minHeight: '44px'
                }}
              >
                {reply.label}
              </button>
            ))}
          </div>
        )}

        <p className={cn("mt-2", isBot ? "text-gray-500" : "text-white/70")} style={{ fontSize: '11px' }}>
          {new Date(message.timestamp).toLocaleTimeString("it-IT", {
            hour: "2-digit",
            minute: "2-digit"
          })}
        </p>
      </div>
    </div>
  )
}
