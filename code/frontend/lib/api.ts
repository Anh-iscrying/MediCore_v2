const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api/backend"

export type ApiResponse<T> = {
  status: number
  message: string
  data: T
  timestamp?: string
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  })

  const contentType = response.headers.get("content-type")
  const payload = contentType?.includes("application/json")
    ? ((await response.json()) as ApiResponse<T>)
    : null

  if (!response.ok) {
    throw new ApiError(payload?.message || `Máy chủ trả lỗi ${response.status}`, response.status)
  }

  return payload?.data as T
}
