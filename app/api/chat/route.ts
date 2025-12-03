import { NextRequest, NextResponse } from "next/server"
import { sendMessageToOpenAI, convertMessagesToOpenAI } from "@/lib/openai"
import { Message } from "@/types"

export const runtime = "edge"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages, widgetId } = body as {
      messages: Message[]
      widgetId: string
    }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      )
    }

    if (!widgetId) {
      return NextResponse.json(
        { error: "Widget ID is required" },
        { status: 400 }
      )
    }

    // Convert our messages to OpenAI format
    const openAIMessages = convertMessagesToOpenAI(messages)

    // Get response from OpenAI
    const response = await sendMessageToOpenAI(openAIMessages)

    return NextResponse.json({
      message: response,
      success: true,
    })
  } catch (error) {
    console.error("Chat API error:", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
        success: false,
      },
      { status: 500 }
    )
  }
}
