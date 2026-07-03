import { apiFetch } from "@/lib/api"

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

export function sendAiChat(input: AiChatRequest) {
  return apiFetch<AiChatResponse>("/ai/chat", {
    method: "POST",
    body: JSON.stringify(input),
  })
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
