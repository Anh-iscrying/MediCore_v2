import { apiFetch, ApiError } from "./api"

export type AiChatMessage = {
  role: "user" | "assistant"
  content: string
}

export type AiChatRequest = {
  message: string
  history: AiChatMessage[]
}

export type AiChatWithImagesRequest = {
  message: string
  history: AiChatMessage[]
  images: File[]
}

export type AiChatResponse = {
  reply: string
  consultationLogId?: number | null
  createdAt?: string | null
}

type StreamEvent = {
  event?: string
  data?: string
}

export function sendAiChat(input: AiChatRequest) {
  return apiFetch<AiChatResponse>("/ai/chat", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function sendAiChatStream(
  input: AiChatRequest,
  onChunk: (chunk: string) => void
): Promise<Pick<AiChatResponse, "consultationLogId" | "createdAt">> {
  const response = await fetch("/api/backend/ai/chat/stream", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    credentials: "include",
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    throw new ApiError(`Máy chủ trả lỗi ${response.status}`, response.status)
  }
  if (!response.body) {
    throw new ApiError("Máy chủ không hỗ trợ phản hồi dạng stream", response.status)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""
  let metadata: Pick<AiChatResponse, "consultationLogId" | "createdAt"> = {}

  const handleEvent = (event: StreamEvent) => {
    if (!event.data) return
    const payload = JSON.parse(event.data)
    if (event.event === "chunk") {
      onChunk(String(payload.content || ""))
      return
    }
    if (event.event === "done") {
      metadata = {
        consultationLogId: payload.consultationLogId ?? null,
        createdAt: payload.createdAt ?? null,
      }
      return
    }
    if (event.event === "error") {
      throw new Error(payload.message || "AI đang bận. Vui lòng thử lại sau.")
    }
  }

  const parseFrame = (frame: string): StreamEvent => {
    const event: StreamEvent = {}
    for (const line of frame.split("\n")) {
      if (line.startsWith("event:")) {
        event.event = line.slice(6).trim()
      } else if (line.startsWith("data:")) {
        event.data = `${event.data ? `${event.data}\n` : ""}${line.slice(5).trimStart()}`
      }
    }
    return event
  }

  while (true) {
    const { done, value } = await reader.read()
    buffer += decoder.decode(value || new Uint8Array(), { stream: !done }).replace(/\r\n/g, "\n")

    let boundaryIndex = buffer.indexOf("\n\n")
    while (boundaryIndex !== -1) {
      const frame = buffer.slice(0, boundaryIndex).trimEnd()
      buffer = buffer.slice(boundaryIndex + 2)
      if (frame) handleEvent(parseFrame(frame))
      boundaryIndex = buffer.indexOf("\n\n")
    }

    if (done) break
  }

  const remaining = buffer.trim()
  if (remaining) handleEvent(parseFrame(remaining))

  return metadata
}

export function sendAiChatWithImages(input: AiChatWithImagesRequest) {
  const formData = new FormData()
  formData.append("message", input.message)
  formData.append("history", JSON.stringify(input.history))
  input.images.forEach((image) => {
    formData.append("images", image)
  })

  return apiFetch<AiChatResponse>("/ai/chat", {
    method: "POST",
    body: formData,
  })
}
