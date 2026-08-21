import { NextRequest, NextResponse } from "next/server"

const BACKEND_API_BASE_URL = process.env.BACKEND_API_BASE_URL || "http://localhost:8080/api/v1"

type BackendResponse<T> = {
  status?: number
  message?: string
  data?: T
  timestamp?: string
}

type Specialty = {
  id: number
  name: string
}

type Doctor = {
  id: number
  specialty_id?: number
  doctor_schedules?: unknown[]
}

function getAuthHeaders(request: NextRequest) {
  const headers = new Headers({ Accept: "application/json" })
  const accessToken = request.cookies.get("accessToken")?.value
  const authorization = request.headers.get("authorization")

  if (authorization) {
    headers.set("Authorization", authorization)
  }
  if (accessToken) {
    headers.set("Cookie", `accessToken=${accessToken}`)
  }

  return headers
}

async function parseBackendResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type")
  const payload = contentType?.includes("application/json")
    ? ((await response.json()) as BackendResponse<T> | T)
    : ({ message: await response.text() } as BackendResponse<T>)

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload && "message" in payload
        ? String((payload as BackendResponse<T>).message || `Máy chủ trả lỗi ${response.status}`)
        : `Máy chủ trả lỗi ${response.status}`
    throw new Error(message)
  }

  if (typeof payload === "object" && payload && "data" in payload) {
    return (payload as BackendResponse<T>).data as T
  }

  return payload as T
}

export async function GET(request: NextRequest) {
  try {
    const requestedDate = request.nextUrl.searchParams.get("date")
    const requestedSpecialtyId = request.nextUrl.searchParams.get("specialtyId")

    if (!requestedDate) {
      return NextResponse.json({ error: "Missing date" }, { status: 400 })
    }

    const headers = getAuthHeaders(request)
    const specialtyIds = requestedSpecialtyId
      ? [Number(requestedSpecialtyId)]
      : (await parseBackendResponse<Specialty[]>(
          await fetch(`${BACKEND_API_BASE_URL}/specialties`, { headers, cache: "no-store" })
        )).map(specialty => specialty.id)

    const doctorsBySpecialty = await Promise.all(
      specialtyIds.map(async specialtyId =>
        parseBackendResponse<Doctor[]>(
          await fetch(
            `${BACKEND_API_BASE_URL}/doctors/specialty/${encodeURIComponent(String(specialtyId))}/available?date=${encodeURIComponent(requestedDate)}`,
            { headers, cache: "no-store" }
          )
        )
      )
    )

    return NextResponse.json(doctorsBySpecialty.flat())
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch doctors" },
      { status: 500 }
    )
  }
}
