"use client"

interface Message {
  role: "bot" | "user"
  text: string
  timestamp: string | Date
}

interface ConversationViewProps {
  messages: Message[]
}

export function ConversationView({ messages }: ConversationViewProps) {
  if (!messages || messages.length === 0) {
    return (
      <p className="text-center text-foreground-muted py-8">
        Nessun messaggio nella conversazione
      </p>
    )
  }

  return (
    <div className="max-h-[500px] overflow-y-auto pr-4 space-y-4">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex ${
            message.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-[80%] ${
              message.role === "bot"
                ? "bg-surface text-foreground"
                : "bg-primary/10 text-foreground"
            } rounded-lg p-3`}
          >
            {message.role === "bot" && (
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-white">🤖</span>
                </div>
                <span className="text-xs font-medium text-foreground-muted">Bot</span>
              </div>
            )}
            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
            <p className="text-xs text-foreground-muted mt-2">
              {new Date(message.timestamp).toLocaleTimeString("it-IT", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
